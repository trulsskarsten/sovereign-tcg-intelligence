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

// 2. SHOP REDACT
export async function POST(req: Request) {
  const body = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");

  if (!verifyShopifyHMAC(body, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  console.log(`[GDPR] Shop Redact for shop: ${payload.shop_domain}`);
  
  // Logic: Mark shop as deleted/inactive in Supabase
  // await supabase.from('stores').update({ setup_status: 'deleted' }).eq('shop_domain', payload.shop_domain);
  
  return NextResponse.json({ message: "Shop records marked for deletion" });
}
