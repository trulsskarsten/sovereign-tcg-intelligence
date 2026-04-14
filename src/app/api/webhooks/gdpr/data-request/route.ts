import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import crypto from "crypto";

// Sovereign GDPR Compliance Layer
// Ensures mandatory Shopify security protocols are met

function verifyShopifyHMAC(body: string, hmacHeader: string | null) {
  if (!hmacHeader) return false;
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!)
    .update(body, "utf8")
    .digest("base64");
  return hash === hmacHeader;
}

// 1. DATA REQUEST (Mandatory)
export async function POST(req: Request) {
  const body = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");

  if (!verifyShopifyHMAC(body, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  const log = createLogger({ customer_email: payload.customer.email, topic: 'customers/data_request' });
  log.info(`[GDPR] Data Request received`);
  
  // Logic: Queue data extraction and send to merchant email
  // For Sovereign: We don't store PII, so we return a standard 'No Data' confirmed response
  
  return NextResponse.json({ message: "Request received" });
}
