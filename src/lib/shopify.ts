import { isDryRun, generateIdempotencyKey, validatePriceChange } from "./safety";
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
async function getAccessToken(): Promise<string> {
  const shopDomain = process.env.SHOPIFY_SHOP_NAME;
  if (!shopDomain) throw new Error("Missing SHOPIFY_SHOP_NAME env var");
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

export async function shopifyQuery(query: string, variables = {}, idempotencyKey?: string) {
  const shopName = process.env.SHOPIFY_SHOP_NAME;
  const accessToken = await getAccessToken();

  const endpoint = `https://${shopName}.myshopify.com/admin/api/2024-04/graphql.json`;

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
    console.error("Shopify API Error:", errorBody);
    throw new Error(`Shopify API feil: ${response.status}`);
  }

  return response.json();
}

/**
 * Update the cost per unit for an inventory item. (AUTOMATED)
 */
export async function updateInventoryCost(inventoryItemId: string, cost: number) {
  if (isDryRun()) {
    console.log(`[DRY RUN] Would update COST for ${inventoryItemId} to ${cost} NOK`);
    return { dryRun: true };
  }

  const mutation = `
    mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem { id unitCost }
        userErrors { field message }
      }
    }
  `;

  return shopifyQuery(mutation, {
    id: inventoryItemId,
    input: { cost: cost.toString() },
  }, generateIdempotencyKey("cost", inventoryItemId));
}

/**
 * Update the selling price. (MANUAL APPROVAL ONLY)
 */
export async function updateProductPrice(variantId: string, newPrice: number, currentPrice: number, isApproved: boolean) {
  if (!isApproved) {
    throw new Error("Sikkerhetsfeil: Prisendring må godkjennes manuelt.");
  }

  const safety = validatePriceChange(currentPrice, newPrice);
  if (!safety.isSafe) throw new Error(`Sikkerhetsfeil: ${safety.reason}`);

  if (isDryRun()) {
    console.log(`[DRY RUN] Would update PRICE for ${variantId} to ${newPrice} NOK`);
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

  return shopifyQuery(mutation, {
    input: { id: variantId, price: newPrice.toString() },
  }, generateIdempotencyKey("price", variantId));
}
