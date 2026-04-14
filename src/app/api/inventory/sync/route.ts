import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { syncStoreVariants } from "@/lib/shopify";
import { logger } from "@/lib/logger";

/**
 * POST /api/inventory/sync
 * Triggers a full inventory sync for the authenticated store.
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain }) => {
  try {
    logger.info({ shop_domain }, "Inventory sync triggered via API");
    
    const result = await syncStoreVariants(shop_domain);
    
    return NextResponse.json({ 
      success: true, 
      ...result,
      message: `Synkronisering fullført: ${result.totalSynced} varer oppdatert.`
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Synkronisering feilet";
    logger.error({ err, shop_domain }, "Inventory sync API error");
    return NextResponse.json({
      success: false,
      error: "Synkronisering feilet",
      details: message
    }, { status: 500 });
  }
});
