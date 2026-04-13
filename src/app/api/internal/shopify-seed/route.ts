import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { POKEMON_SEED_DATA } from "@/lib/seeds/seed-data";
import { logger } from "@/lib/logger";
import { shopifyQuery, fetchPrimaryLocationId, syncStoreVariants } from "@/lib/shopify";

/**
 * POST /api/internal/shopify-seed
 * Automatically creates the 10+ premium Pokémon TCG products in the Shopify Admin.
 * Dynamic: Uses the shop_domain from the authenticated session.
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain }) => {
  try {
    logger.info({ shop_domain }, "Starting Dynamic Master Seeding process...");

    // 1. Get Primary Location
    let locationId: string;
    try {
      locationId = await fetchPrimaryLocationId(shop_domain);
    } catch (err) {
      logger.error({ err, shop_domain }, "Could not fetch Shopify location during seeding");
      return NextResponse.json({ error: "Klarte ikke å hente lokasjon fra Shopify" }, { status: 400 });
    }

    // 2. Fetch existing products to avoid duplicates
    const checkQuery = `
      query {
        products(first: 50) {
          nodes {
            title
          }
        }
      }
    `;
    const checkRes = await shopifyQuery(shop_domain, checkQuery);
    const existingTitles = new Set(checkRes.data?.products?.nodes.map((n: any) => n.title) || []);

    const createdResults = [];

    // 3. Loop through seed data and create products if they don't exist
    for (const item of POKEMON_SEED_DATA) {
      if (existingTitles.has(item.product_name)) {
        logger.info({ item: item.product_name, shop_domain }, "Product already exists, skipping.");
        continue;
      }

      try {
        const productMutation = `
          mutation productCreate($input: ProductInput!) {
            productCreate(input: $input) {
              product {
                id
                variants(first: 1) {
                  nodes {
                    id
                    inventoryItem { id }
                  }
                }
              }
              userErrors { field message }
            }
          }
        `;

        const variables = {
          input: {
            title: item.product_name,
            vendor: "Sovereign Seed",
            productType: item.category || "TCG",
            status: "ACTIVE",
            variants: [{
              sku: item.sku,
              price: item.price.toString(),
              inventoryItem: {
                tracked: true,
                cost: item.cost.toString()
              }
            }]
          }
        };

        const response = await shopifyQuery(shop_domain, productMutation, variables);
        const product = response.data?.productCreate?.product;

        if (product) {
          const variant = product.variants.nodes[0];
          const inventoryItemId = variant.inventoryItem.id;

          // Set Inventory Level
          const inventoryMutation = `
            mutation inventorySet($input: InventorySetInput!) {
              inventorySet(input: $input) {
                inventoryLevels { id available }
                userErrors { field message }
              }
            }
          `;

          await shopifyQuery(shop_domain, inventoryMutation, {
            input: {
              inventoryItemId,
              locationId,
              available: item.stock
            }
          });

          createdResults.push({ name: item.product_name, id: product.id });
        }
      } catch (itemErr) {
        logger.error({ itemErr, item: item.product_name, shop_domain }, "Fail to seed individual item");
      }
    }

    // 4. TRIGGER FINAL SYNC
    logger.info({ shop_domain, createdCount: createdResults.length }, "Seeding complete, triggering sync...");
    await syncStoreVariants(shop_domain);

    return NextResponse.json({ 
      success: true, 
      message: `Opprettet ${createdResults.length} nye produkter. Synkronisering fullført.`,
      results: createdResults
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Shopify Seeding failed";
    logger.error({ err, shop_domain }, "Global Shopify Seeding Error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
