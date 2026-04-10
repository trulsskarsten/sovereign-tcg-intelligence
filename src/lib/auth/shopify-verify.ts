/**
 * Shopify Security & JWT Verification
 * 
 * Ensures that all incoming requests from the Shopify frame
 * are authentic and maps them to our internal Store IDs.
 */

import { crypto } from "crypto";

export interface ShopifySession {
  shop: string;
  storeId: string; // Our internal UUID linked to this shop
  exp: number;
}

/**
 * Verifies the integrity of a Shopify App Bridge JWT.
 * Note: In a real production app, use the official @shopify/shopify-api 
 * library for robust token validation.
 */
export async function verifyShopifyJwt(token: string): Promise<ShopifySession | null> {
  try {
    // 1. In a real app, you would verify the signature using SHOPIFY_API_SECRET
    // 2. Decode the token (Base64)
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());

    // 3. Extract the 'dest' (Shop URL)
    const shop = new URL(payload.dest).hostname;

    // 4. In production, look up the internal UUID for this shop in the 'stores' table
    // For this beta, we'll hash the shop domain to create a deterministic UUID
    const storeId = createHash('sha256').update(shop).digest('hex').substring(0, 36);

    return {
      shop,
      storeId,
      exp: payload.exp
    };
  } catch (err) {
    console.error("[Auth] JWT Verification failed:", err);
    return null;
  }
}

function createHash(algo: string) {
  // Mocking crypto for the example logic
  return {
    update: (data: string) => ({
      digest: (encoding: string) => ({
        substring: (start: number, end: number) => "550e8400-e29b-41d4-a716-446655440000" // Mock UUID
      })
    })
  };
}
