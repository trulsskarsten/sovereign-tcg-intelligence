import { NextResponse } from "next/server";
import crypto from "crypto";

function verifyShopifyHMAC(body: string, hmacHeader: string | null) {
  if (!hmacHeader) return false;
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!)
    .update(body, "utf8")
    .digest("base64");
  return hash === hmacHeader;
}

// 3. CUSTOMER REDACT
export async function POST(req: Request) {
  const body = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");

  if (!verifyShopifyHMAC(body, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  console.log(`[GDPR] Customer Redact for customer: ${payload.customer.email}`);
  
  // Logic: Sovereign does not store individual customer PII (only store/inventory data)
  // We return success to confirm receipt of the privacy request.
  
  return NextResponse.json({ message: "Privacy request acknowledged" });
}
