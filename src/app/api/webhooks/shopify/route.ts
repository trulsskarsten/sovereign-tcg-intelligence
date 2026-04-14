import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendDiscordAlert } from "@/lib/discord";
import { logger } from "@/lib/logger";

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

    await sendDiscordAlert(`Webhook Received: ${topic} for ${shop}`, "INFO");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    logger.error({ err }, "Webhook Error");
    await sendDiscordAlert(`Webhook Failed: ${topic} for ${shop}. Error: ${message}`, "ERROR");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleProductUpdate(product: Record<string, unknown>) {
  const productTyped = product as { title: string; variants: Array<{ id: string | number; sku: string; price: string; title: string }> };
  for (const variant of productTyped.variants) {
    const { error } = await supabaseAdmin
      .from("inventory")
      .upsert({
        variant_id: `gid://shopify/ProductVariant/${variant.id}`,
        product_name: `${productTyped.title} - ${variant.title}`,
        sku: variant.sku,
        price: parseFloat(variant.price),
        last_sync: new Date().toISOString(),
      }, {
        onConflict: "variant_id"
      });

    if (error) throw error;
  }
}

async function handleInventoryUpdate(inventory: Record<string, unknown>) {
  const inventoryTyped = inventory as { available: number; inventory_item_id: string | number };
  const { error } = await supabaseAdmin
    .from("inventory")
    .update({
      stock: inventoryTyped.available,
      last_sync: new Date().toISOString(),
    })
    .eq("variant_id", `gid://shopify/ProductVariant/${inventoryTyped.inventory_item_id}`); 

  if (error) throw error;
}
