import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logTechnicalEvent } from "@/lib/discord";

/**
 * Handle Shopify Webhooks (products/update and inventory_levels/update)
 */
export async function POST(req: NextRequest) {
  const topic = req.headers.get("x-shopify-topic");
  const shop = req.headers.get("x-shopify-shop-domain");
  const payload = await req.json();

  try {
    if (topic === "products/update") {
      await handleProductUpdate(payload);
    } else if (topic === "inventory_levels/update") {
      await handleInventoryUpdate(payload);
    }

    await logTechnicalEvent("Webhook Received", { topic, shop, success: true });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    await logTechnicalEvent("Webhook Failed", { topic, shop, error: err.message });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function handleProductUpdate(product: any) {
  for (const variant of product.variants) {
    const { error } = await supabaseAdmin
      .from("inventory")
      .upsert({
        shopify_variant_id: `gid://shopify/ProductVariant/${variant.id}`,
        name: `${product.title} - ${variant.title}`,
        sku: variant.sku,
        shopify_price: parseFloat(variant.price),
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: "shopify_variant_id"
      });

    if (error) throw error;
  }
}

async function handleInventoryUpdate(inventory: any) {
  const { error } = await supabaseAdmin
    .from("inventory")
    .update({
      current_qty: inventory.available,
      last_synced_at: new Date().toISOString(),
    })
    .eq("shopify_variant_id", `gid://shopify/ProductVariant/${inventory.inventory_item_id}`); // This is a simplification; mapping varies by API version

  if (error) throw error;
}
