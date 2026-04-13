import { isDryRun, generateIdempotencyKey, validatePriceChange } from "./safety";
import { logger } from "./logger";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Ensures a valid Admin API Access Token is available.
 */
async function getAccessToken(shopDomain: string): Promise<string> {
  return getShopifyAccessToken(shopDomain);
}

/**
 * Universal Shopify Auth Engine
 * Automatically handles token retrieval from DB or OAuth exchange
 */
export async function getShopifyAccessToken(shopDomain: string) {
  // 1. Check if we already have a valid token in the DB
  const { data: store, error } = await supabase
    .from('stores')
    .select('*')
    .eq('shop_domain', shopDomain)
    .single();

  if (store?.access_token) {
    return store.access_token;
  }

  // 2. If not, perform OAuth Client Credentials Handshake (from the user's Client ID/Secret)
  const clientId = store?.client_id || process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = store?.client_secret || process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(`Mangler Shopify-legitimasjon for ${shopDomain}`);
  }

  const endpoint = `https://${shopDomain}/admin/oauth/access_token`;
  
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials"
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Auth Exchange Feilet for ${shopDomain}: ${await response.text()}`);
  }

  const data = await response.json();
  const newToken = data.access_token;

  // 3. Cache the token back to the DB for next time
  await supabase
    .from('stores')
    .upsert({ 
      shop_domain: shopDomain, 
      access_token: newToken,
      setup_status: 'complete'
    });

  return newToken;
}

export async function shopifyQuery(shopDomain: string, query: string, variables = {}, idempotencyKey?: string) {
  const accessToken = await getAccessToken(shopDomain);
  const endpoint = `https://${shopDomain}/admin/api/2024-04/graphql.json`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": accessToken,
  };

  if (idempotencyKey) {
    headers["X-Shopify-Idempotency-Key"] = idempotencyKey;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error({ shopDomain, errorBody }, "Shopify API Error");
    throw new Error(`Shopify API feil: ${response.status}`);
  }

  return response.json();
}

/**
 * Update the cost per unit for an inventory item. (AUTOMATED)
 */
export async function updateInventoryCost(shopDomain: string, inventoryItemId: string, cost: number) {
  if (isDryRun()) {
    logger.info({ shopDomain, inventoryItemId, cost }, "[DRY RUN] Would update COST");
    return { dryRun: true };
  }

  const mutation = `
    mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem { id }
        userErrors { field message }
      }
    }
  `;

  return shopifyQuery(shopDomain, mutation, {
    id: inventoryItemId,
    input: { cost: cost.toString() },
  }, generateIdempotencyKey("cost", inventoryItemId));
}

/**
 * Update the inventory quantity for a specific variant.
 */
export async function updateInventoryLevel(shopDomain: string, variantId: string, locationId: string, available: number) {
  if (isDryRun()) {
    logger.info({ shopDomain, variantId, available, locationId }, "[DRY RUN] Would update QTY");
    return { dryRun: true };
  }

  const mutation = `
    mutation inventorySet($input: InventorySetInput!) {
      inventorySet(input: $input) {
        inventoryLevels { id available }
        userErrors { field message }
      }
    }
  `;

  return shopifyQuery(shopDomain, mutation, {
    input: {
      inventoryItemId: variantId, 
      locationId: locationId,
      available: available
    }
  }, generateIdempotencyKey("qty", variantId));
}

/**
 * Update the selling price. (MANUAL APPROVAL ONLY)
 */
export async function updateProductPrice(shopDomain: string, variantId: string, newPrice: number, currentPrice: number, isApproved: boolean) {
  if (!isApproved) {
    throw new Error("Sikkerhetsfeil: Prisendring må godkjennes manuelt.");
  }

  const safety = validatePriceChange(currentPrice, newPrice);
  if (!safety.isSafe) throw new Error(`Sikkerhetsfeil: ${safety.reason}`);

  if (isDryRun()) {
    logger.info({ shopDomain, variantId, newPrice }, "[DRY RUN] Would update PRICE");
    return { dryRun: true };
  }

  const mutation = `
    mutation productVariantUpdate($input: ProductVariantInput!) {
      productVariantUpdate(input: $input) {
        productVariant { id price }
        userErrors { field message }
      }
    }
  `;

  return shopifyQuery(shopDomain, mutation, {
    input: { id: variantId, price: newPrice.toString() },
  }, generateIdempotencyKey("price", variantId));
}

/**
 * Bulk Syncing Logic
 * Fetches all products and variants from Shopify and updates Supabase
 */
export async function syncStoreVariants(shopDomain: string) {
  // 1. Get capacity limits from store configuration
  const { data: store } = await supabase
    .from('stores')
    .select('id, beta_flags')
    .eq('shop_domain', shopDomain)
    .single();

  if (!store) throw new Error(`Butikk ${shopDomain} ikke funnet.`);

  const variantLimit = (store.beta_flags as any)?.max_variants || 5000;
  
  // Using productVariants connection for direct variant access
  const query = `
    query getVariants($cursor: String, $first: Int!) {
      productVariants(first: $first, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          sku
          title
          price
          barcode
          inventoryQuantity
          product {
            title
            vendor
            productType
          }
          inventoryItem {
            id
            unitCost { amount }
          }
        }
      }
    }
  `;

  let hasNextPage = true;
  let cursor = null;
  let totalSynced = 0;
  let pageCount = 0;
  const MAX_PAGES = 50; // Cap at 50 pages of 100 variants (5000 total) to prevent timeouts

  logger.info({ shopDomain, variantLimit }, "Starting inventory sync with capacity limits");

  while (hasNextPage && totalSynced < variantLimit && pageCount < MAX_PAGES) {
    const response = await shopifyQuery(shopDomain, query, { 
      cursor, 
      first: Math.min(100, variantLimit - totalSynced) 
    });
    
    if (!response?.data?.productVariants) {
      logger.error({ response, shopDomain }, "Failed to fetch variants during sync");
      break;
    }

    const variants = response.data.productVariants;
    pageCount++;

    for (const variant of variants.nodes) {
      const { error } = await supabase
        .from('inventory')
        .upsert({
          store_id: store?.id,
          variant_id: variant.id,
          product_name: `${variant.product.title} - ${variant.title}`,
          sku: variant.sku || `NOSKU-${variant.id.split('/').pop()}`,
          barcode: variant.barcode || null,
          brand: variant.product.vendor || "Ukjent",
          category: variant.product.productType || "TCG",
          stock: variant.inventoryQuantity || 0,
          cost: parseFloat(variant.inventoryItem.unitCost?.amount || "0"),
          price: parseFloat(variant.price || "0"),
          last_sync: new Date().toISOString()
        }, { onConflict: 'variant_id' });

      if (error) {
        logger.error({ error, variantId: variant.id }, "Sync error for variant");
      } else {
        totalSynced++;
      }
    }

    hasNextPage = variants.pageInfo.hasNextPage;
    cursor = variants.pageInfo.endCursor;
    
    logger.info({ shopDomain, syncedSoFar: totalSynced, pageCount }, "Sync progress");
  }

  // Record stats
  await supabase.from('audit_logs').insert({
    store_id: store?.id,
    action: "Bulk Inventory Sync",
    entity_id: "system",
    entity_type: "inventory",
    metadata: { totalSynced, pageCount, limitReached: totalSynced >= variantLimit }
  });

  logger.info({ shopDomain, totalSynced }, "Sync completed with audit log");
  return { totalSynced, limitReached: totalSynced >= variantLimit };
}

/**
 * Fetches the primary location ID for a shop.
 */
export async function fetchPrimaryLocationId(shopDomain: string): Promise<string> {
  const query = `
    query {
      locations(first: 10) {
        nodes {
          id
          name
          isPrimary
        }
      }
    }
  `;

  const result = await shopifyQuery(shopDomain, query);
  const locations = result.locations?.nodes || [];
  const primary = locations.find((l: any) => l.isPrimary) || locations[0];

  if (!primary) {
    throw new Error("No locations found for shop");
  }

  return primary.id;
}

