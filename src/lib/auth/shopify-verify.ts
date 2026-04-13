/**
 * Shopify Security & JWT Verification
 * 
 * Ensures that all incoming requests from the Shopify frame
 * are authentic and maps them to our internal Store IDs.
 */

import crypto from "crypto";
import { logger } from "../logger";

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
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    if (!clientSecret) {
      throw new Error("Missing SHOPIFY_CLIENT_SECRET");
    }

    // 1. Split the token
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    
    // 2. Verify signature
    const data = `${headerB64}.${payloadB64}`;
    const expectedSignature = crypto
      .createHmac('sha256', clientSecret)
      .update(data)
      .digest('base64url');

    if (signatureB64 !== expectedSignature) {
      logger.error("[Auth] JWT Signature mismatch");
      return null;
    }

    // 3. Decode payload
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());

    // 4. Extract the 'dest' (Shop URL)
    const shop = new URL(payload.dest).hostname;

    // 5. Check expiration
    if (payload.exp < Date.now() / 1000) {
      logger.error("[Auth] JWT expired");
      return null;
    }

    // 6. Look up or generate internal UUID
    const storeId = crypto.createHash('sha256').update(shop).digest('hex').substring(0, 36);

    return {
      shop,
      storeId,
      exp: payload.exp
    };
  } catch (err) {
    logger.error({ err }, "[Auth] JWT Verification failed");
    return null;
  }
}
