import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { shopifyQuery } from "@/lib/shopify";

/**
 * GET /api/health
 * Returns system health status.
 */
export const GET = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    const start = Date.now();
    
    // 1. Check Shopify (Lightweight Ping)
    const pingQuery = `{ shop { name } }`;
    let shopifyLatency = -1;
    let shopifyStatus: "healthy" | "unhealthy" = "unhealthy";
    
    try {
      await shopifyQuery(shop_domain, pingQuery);
      shopifyLatency = Date.now() - start;
      shopifyStatus = "healthy";
    } catch (err: unknown) {
      logger.error({ err, shop_domain }, "Health check: Shopify ping failed");
    }

    // 2. Check Database & Get Stats
    const { count: inventoryCount, error: invError } = await supabaseAdmin
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store_id);

    const { count: stagedCount, error: stagedError } = await supabaseAdmin
      .from('staged_updates')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store_id)
      .eq('status', 'pending');
    
    return NextResponse.json({
      success: true,
      status: (shopifyStatus === "healthy" && !invError) ? "healthy" : "degraded",
      metrics: {
        shopify_latency_ms: shopifyLatency,
        inventory_items: inventoryCount || 0,
        pending_updates: stagedCount || 0,
      },
      services: {
        database: invError ? "unhealthy" : "healthy",
        shopify: shopifyStatus,
        sync_engine: "configured"
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "System health check failed");
    return NextResponse.json({ success: false, status: "degraded", error: err.message }, { status: 500 });
  }
});
