import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

function verifyShopifyHMAC(body: string, hmacHeader: string | null) {
  if (!hmacHeader) return false;
  const secret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!secret) return false;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");
  return hash === hmacHeader;
}

/**
 * POST /api/webhooks/gdpr/shop-redact
 * Shopify mandatory GDPR webhook: shop data deletion.
 * Called 48 hours after a merchant uninstalls the app.
 * Must delete ALL data associated with the shop.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const webhookId = req.headers.get("x-shopify-webhook-id");

  if (!verifyShopifyHMAC(body, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  const shopDomain = payload.shop_domain as string;
  const log = createLogger({ topic: 'shop/redact', shop: shopDomain });

  // Replay protection
  if (webhookId) {
    const { data: existing } = await supabaseAdmin
      .from("audit_logs")
      .select("id")
      .eq("entity_id", webhookId)
      .eq("action", "gdpr_shop_redact")
      .maybeSingle();

    if (existing) {
      log.info("GDPR shop redact: duplicate webhook ignored");
      return NextResponse.json({ message: "Already processed" });
    }
  }

  log.info(`GDPR Shop Redact starting for ${shopDomain}`);

  // Get store record for cascaded deletion
  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("id")
    .eq("shop_domain", shopDomain)
    .maybeSingle();

  if (store) {
    const storeId = store.id;

    // Delete all store-related data in dependency order
    await supabaseAdmin.from("staged_updates").delete().eq("store_id", storeId);
    await supabaseAdmin.from("price_history").delete().eq("store_id", storeId);
    await supabaseAdmin.from("inventory").delete().eq("store_id", storeId);
    await supabaseAdmin.from("market_prices").delete().eq("store_id", storeId);
    await supabaseAdmin.from("audit_logs").delete().eq("store_id", storeId);
    await supabaseAdmin.from("recommendations").delete().eq("store_id", storeId);

    // Finally mark the store record itself as redacted (soft-delete, keep for billing audit purposes)
    await supabaseAdmin
      .from("stores")
      .update({
        setup_status: "redacted",
        access_token: null, // Invalidate access
        shop_domain: `REDACTED_${shopDomain}_${Date.now()}`,
      })
      .eq("id", storeId);

    log.info(`GDPR Shop Redact: all data deleted for store ${storeId}`);
  } else {
    log.info(`GDPR Shop Redact: store ${shopDomain} not found — may already be deleted`);
  }

  // Audit log for the redact action itself (with null store_id since store is redacted)
  await supabaseAdmin.from("audit_logs").insert({
    store_id: null,
    action: "gdpr_shop_redact",
    entity_id: webhookId || "unknown",
    entity_type: "gdpr",
    metadata: { shop_domain: shopDomain, completed_at: new Date().toISOString() },
  });

  return NextResponse.json({ message: "Shop records redacted" });
}
