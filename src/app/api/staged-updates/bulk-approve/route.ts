import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * POST /api/staged-updates/bulk-approve
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Ingen IDer lastet" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('staged_updates')
      .update({ status: 'approved' })
      .in('id', ids)
      .eq('store_id', store_id);

    if (error) throw error;

    return NextResponse.json({ success: true, count: ids.length });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Failed to bulk approve");
    return NextResponse.json({ error: "Masse-godkjenning feilet" }, { status: 500 });
  }
});
