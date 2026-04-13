import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * POST /api/staged-updates/[id]/reject
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const handler = withAuth(async (req, { shop_domain, store_id }) => {
    try {
      
      const { error } = await supabaseAdmin
        .from('staged_updates')
        .update({ status: 'rejected' })
        .eq('id', id)
        .eq('store_id', store_id);

      if (error) throw error;

      return NextResponse.json({ success: true });
    } catch (err: unknown) {
      logger.error({ err, shop_domain }, "Failed to reject update");
      return NextResponse.json({ error: "Avvisning feilet" }, { status: 500 });
    }
  });

  return handler(req);
}
