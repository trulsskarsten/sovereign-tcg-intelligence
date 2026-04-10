import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Shopify Mandatory GDPR Webhooks
 * These endpoints are required for App Store compliance.
 * Handle data deletion and access requests for privacy.
 */

// Helper to verify Shopify HMAC signature
function verifyShopifySignature(rawBody: string, hmacHeader: string) {
  const secret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!secret) return false;

  const generatedHash = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  return generatedHash === hmacHeader;
}

export async function POST(req: NextRequest) {
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  const topic = req.headers.get("x-shopify-topic");
  const shop = req.headers.get("x-shopify-shop-domain");

  if (!hmacHeader) {
    return new NextResponse("Mangler signatur", { status: 401 });
  }

  const rawBody = await req.text();

  if (!verifyShopifySignature(rawBody, hmacHeader)) {
    console.error(`Uautorisert GDPR forespørsel fra ${shop}`);
    return new NextResponse("Ugyldig signatur", { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  console.log(`[GDPR Webhook] Mottatt emne: ${topic} for butikk: ${shop}`);

  /**
   * Topics handled:
   * customers/data_request
   * customers/redact
   * shop/redact
   */
  
  // Logic for data deletion or access would go here.
  // For a TCG utility, we typically don't store persistent PII (Personal Identifiable Info) 
  // outside of the shop domain and basic inventory logs, but we still return 200 OK as per Shopify rules.

  return new NextResponse("OK", { status: 200 });
}
