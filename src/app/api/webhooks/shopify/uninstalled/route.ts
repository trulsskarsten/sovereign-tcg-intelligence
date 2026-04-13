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
 * POST /api/webhooks/shopify/uninstalled
 * Fires immediately when a merchant uninstalls the app.
 * Marks the store as inactive and revokes the access token.
 * Full data deletion happens 48h later via shop/redact webhook.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const webhookId = req.headers.get("x-shopify-webhook-id");

  if (!verifyShopifyHMAC(body, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  const shopDomain = payload.domain as string;
  const log = createLogger({ topic: 'app/uninstalled', shop: shopDomain });

  // Replay protection
  if (webhookId) {
    const { data: existing } = await supabaseAdmin
      .from("audit_logs")
      .select("id")
      .eq("entity_id", webhookId)
      .eq("action", "app_uninstalled")
      .maybeSingle();

    if (existing) {
      log.info("App uninstall: duplicate webhook ignored");
      return NextResponse.json({ message: "Already processed" });
    }
  }

  log.info(`App uninstalled for ${shopDomain} — marking store inactive`);

  // Revoke access token and mark store inactive
  const { error } = await supabaseAdmin
    .from("stores")
    .update({
      access_token: null,
      setup_status: "uninstalled",
    })
    .eq("shop_domain", shopDomain);

  if (error) {
    log.error({ error }, "Failed to mark store as uninstalled");
  }

  // Audit log
  await supabaseAdmin.from("audit_logs").insert({
    store_id: null,
    action: "app_uninstalled",
    entity_id: webhookId || shopDomain,
    entity_type: "store",
    metadata: { shop_domain: shopDomain, uninstalled_at: new Date().toISOString() },
  });

  return NextResponse.json({ message: "Store marked as uninstalled" });
}
