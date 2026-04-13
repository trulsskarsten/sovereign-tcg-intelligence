import { NextRequest, NextResponse } from "next/server";
import { verifyShopifyJwt } from "./shopify-verify";
import { supabaseAdmin } from "../supabase";
import { logger } from "../logger";
import { applyRateLimit } from "../rate-limit";

export interface AuthContext {
  store_id: string;
  shop_domain: string;
}

/**
 * Higher-order function to protect API routes.
 * Validates the Authorization: Bearer <session_token> header.
 */
export function withAuth(handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // CORS — only allow Shopify admin origins in production
      const origin = req.headers.get("origin") || "";
      const isShopifyOrigin =
        origin.endsWith(".myshopify.com") ||
        origin === "https://admin.shopify.com" ||
        process.env.NODE_ENV !== "production";

      if (!isShopifyOrigin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Rate limiting
      const rateLimitResponse = await applyRateLimit(req);
      if (rateLimitResponse) return rateLimitResponse;

      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
      }

      const token = authHeader.split(" ")[1];
      const payload = await verifyShopifyJwt(token);

      if (!payload) {
        return NextResponse.json({ error: "Unauthorized: Invalid or expired session token" }, { status: 401 });
      }

      const shopDomain = payload.shop;

      // Get store_id from Supabase
      const { data: store, error } = await supabaseAdmin
        .from("stores")
        .select("id")
        .eq("shop_domain", shopDomain)
        .single();

      if (error || !store) {
        logger.error({ shopDomain, error }, "Store not found for authenticated request");
        return NextResponse.json({ error: "Store not registered" }, { status: 403 });
      }

      return await handler(req, {
        store_id: store.id,
        shop_domain: shopDomain
      });
    } catch (err: unknown) {
      logger.error({ err }, "Auth middleware error");
      return NextResponse.json({ error: "Internal authentication error" }, { status: 500 });
    }
  };
}
