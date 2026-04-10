import { supabaseAdmin } from "./supabase";

/**
 * Creates a suite of 'Simulator' products in the local database.
 * These are used to test the WAC and Pricing logic without affecting real Shopify data.
 */
export async function seedMockProducts() {
  const mockProducts = [
    {
      shopify_variant_id: "gid://shopify/ProductVariant/MOCK_001",
      name: "[MOCK] Charizard Ultra Premium Collection",
      sku: "MOCK-UPC-001",
      current_qty: 10,
      wac_price: 1200,
      shopify_price: 1599,
      manual_stock_flag: false,
    },
    {
      shopify_variant_id: "gid://shopify/ProductVariant/MOCK_002",
      name: "[MOCK] Twilight Masquerade Booster Box",
      sku: "MOCK-TM-BB",
      current_qty: 36,
      wac_price: 950,
      shopify_price: 1349,
      manual_stock_flag: false,
    },
    {
      shopify_variant_id: "gid://shopify/ProductVariant/MOCK_003",
      name: "[MOCK] Silver Tempest Pack",
      sku: "MOCK-ST-PACK",
      current_qty: 120,
      wac_price: 32,
      shopify_price: 59,
      manual_stock_flag: false,
    }
  ];

  console.log("Seeding mock products...");
  
  for (const product of mockProducts) {
    const { error } = await supabaseAdmin
      .from("inventory")
      .upsert(product, { onConflict: "shopify_variant_id" });
    
    if (error) {
      console.error(`Error seeding ${product.name}:`, error);
    } else {
      console.log(`Successfully seeded ${product.name}`);
    }
  }

  return { success: true, count: mockProducts.length };
}
