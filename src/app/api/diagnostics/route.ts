import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * GET /api/diagnostics
 * Returns detailed diagnostics for the store.
 */
export const GET = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    const { count: inventoryCount } = await supabaseAdmin
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('shop_domain', shop_domain);

    const { count: updateCount } = await supabaseAdmin
      .from('staged_updates')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store_id);

    const { data: recentLogs } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('store_id', store_id)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      diagnostics: {
        inventory_items: inventoryCount,
        staged_updates: updateCount,
        recent_activity: recentLogs,
      }
    });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Diagnostics error");
    return NextResponse.json({ error: "Klarte ikke å hente diagnostikk" }, { status: 500 });
  }
});
