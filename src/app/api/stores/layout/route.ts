import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * GET /api/stores/layout
 * Fetches the user's dashboard layout.
 */
export const GET = withAuth(async (req: NextRequest, { shop_domain }) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('stores')
      .select('widget_layout')
      .eq('shop_domain', shop_domain)
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, layout: data.widget_layout });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Failed to fetch layout");
    return NextResponse.json({ error: "Kunne ikke hente layout" }, { status: 500 });
  }
});

/**
 * POST /api/stores/layout
 * Saves the user's dashboard layout.
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain }) => {
  try {
    const { layout } = await req.json();
    
    const { error } = await supabaseAdmin
      .from('stores')
      .update({ widget_layout: layout })
      .eq('shop_domain', shop_domain);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Failed to save layout");
    return NextResponse.json({ error: "Kunne ikke lagre layout" }, { status: 500 });
  }
});
