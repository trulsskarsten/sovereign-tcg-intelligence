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
 * POST /api/webhooks/gdpr/customer-redact
 * Shopify mandatory GDPR webhook: customer data deletion request.
 * Sovereign stores no individual customer PII — only store-level inventory data.
 * We log the request and return 200 to confirm receipt.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const webhookId = req.headers.get("x-shopify-webhook-id");

  if (!verifyShopifyHMAC(body, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  const log = createLogger({ topic: 'customers/redact', shop: payload.shop_domain });

  // Replay protection: check if this webhook_id was already processed
  if (webhookId) {
    const { data: existing } = await supabaseAdmin
      .from("audit_logs")
      .select("id")
      .eq("entity_id", webhookId)
      .eq("action", "gdpr_customer_redact")
      .maybeSingle();

    if (existing) {
      log.info("GDPR customer redact: duplicate webhook ignored");
      return NextResponse.json({ message: "Already processed" });
    }
  }

  log.info("GDPR Customer Redact: Sovereign stores no customer PII — request acknowledged");

  // Audit the GDPR request for compliance records
  await supabaseAdmin.from("audit_logs").insert({
    store_id: null,
    action: "gdpr_customer_redact",
    entity_id: webhookId || "unknown",
    entity_type: "gdpr",
    metadata: {
      shop_domain: payload.shop_domain,
      customer_id: payload.customer?.id,
      orders_to_redact: payload.orders_to_redact,
    },
  });

  return NextResponse.json({ message: "Privacy request acknowledged" });
}
