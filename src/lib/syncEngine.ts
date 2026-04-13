import { shopifyQuery } from "./shopify";
import { logger } from "./logger";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Enterprise Sync Engine
 * Uses GraphQL source filtering to exclude non-sealed products and singles at the source.
 * Implements 'Smart Matching' logic for TCG identification.
 */
export async function syncStoreInventory(shopDomain: string) {
  // 1. Fetch store configuration (Beta flags, etc.)
  const { data: store } = await supabase
    .from('stores')
    .select('id, beta_flags')
    .eq('shop_domain', shopDomain)
    .single();

  if (!store) throw new Error(`Butikk ${shopDomain} ikke funnet i databasen.`);

  // 2. Fetch products from Shopify with High-Performance GraphQL Filters
  // Exclude 'Single', 'Gift Card', 'Enkeltkort' etc. directly in the query
  const query = `
    query($first: Int!, $after: String, $query: String) {
      products(first: $first, after: $after, query: $query) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            productType
            vendor
            tags
            variants(first: 1) {
              edges {
                node {
                  id
                  sku
                  barcode
                  price
                  inventoryQuantity
                }
              }
            }
          }
        }
      }
    }
  `;

  // Filter logic: Exclude singles, gift cards, and non-sealed patterns
  // Using Shopify's Search Syntax: NOT product_type:Single AND NOT product_type:'Gift Card'
  const filterQuery = `NOT product_type:Single AND NOT product_type:'Gift Card' AND NOT title:Singles AND NOT title:Enkeltkort AND NOT title:Gavekort`;

  try {
    const response = await shopifyQuery(shopDomain, query, {
      first: 50,
      query: filterQuery
    });

    const products = response.products.edges.map((edge: any) => edge.node);

    // 3. Process & Identify (Smart Matcher)
    for (const prod of products) {
      const variant = prod.variants.edges[0]?.node;
      if (!variant) continue;

      // Identify if Sealed or Binder
      const isSealed = identifyIsSealed(prod.title, prod.productType);
      const isBinder = prod.title.toLowerCase().includes("binder") || prod.title.toLowerCase().includes("perm");
      
      if (!isSealed && !isBinder) {
        // Skip non-sealed/non-binder products if the flag is set
        if (store.beta_flags?.show_sealed_only) continue;
      }

      // Decompose Title for Synthetic ID (Language/Set/Type)
      const tcgInfo = decomposeTcgTitle(prod.title);

      // Upsert to local inventory table
      await supabase.from('inventory').upsert({
        store_id: store.id,
        shopify_product_id: prod.id,
        title: prod.title,
        sku: variant.sku,
        gtin: variant.barcode,
        price_current: parseFloat(variant.price),
        stock_level: variant.inventoryQuantity,
        set_code: tcgInfo.set_code,
        language: tcgInfo.language,
        product_category: isSealed ? 'Sealed' : isBinder ? 'Binder' : 'Other',
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'store_id, shopify_product_id' });
    }

    return { success: true, count: products.length };
  } catch (error) {
    logger.error({ shopDomain, error }, "Sync Error");
    throw error;
  }
}

/**
 * Smart TCG Title Decomposer
 * Extracts set codes, language, and product type from raw strings.
 */
function decomposeTcgTitle(title: string) {
  const t = title.toLowerCase();
  
  // Language detection patterns
  let language = "English";
  if (t.includes("japanese") || t.includes("japansk") || t.includes("jp")) language = "Japanese";
  if (t.includes("chinese") || t.includes("kinesisk") || t.includes("cn")) language = "Chinese";
  
  // Basic Set Code extraction (e.g., SV4a, S12a, 151)
  const setMatch = title.match(/[A-Z0-9]{3,4}[a-z]?/); 
  const set_code = setMatch ? setMatch[0] : null;

  return { language, set_code };
}

/**
 * Automatic Sealed Product Detector
 */
function identifyIsSealed(title: string, type: string) {
  const sealedKeywords = ["booster", "box", "etb", "display", "case", "collection", "deck", "blister", "bundle"];
  const t = title.toLowerCase();
  
  const hasKeyword = sealedKeywords.some(kw => t.includes(kw));
  const isSealedType = type && sealedKeywords.some(kw => type.toLowerCase().includes(kw));

  return hasKeyword || isSealedType;
}
