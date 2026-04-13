import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * GET /api/billing/status
 * Returns the current billing plan for this store.
 */
export const GET = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    const { data: store, error } = await supabaseAdmin
      .from("stores")
      .select("plan_tier, setup_status")
      .eq("id", store_id)
      .single();

    if (error || !store) {
      return NextResponse.json({ error: "Butikk ikke funnet" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      plan_tier: store.plan_tier || "hobbyist",
    });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Billing status error");
    return NextResponse.json({ error: "Klarte ikke hente abonnement" }, { status: 500 });
  }
});

/**
 * POST /api/billing/status
 * Called when merchant returns from Shopify confirmation URL (?confirmed=true).
 * Activates the pending plan tier.
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    const { data: store, error } = await supabaseAdmin
      .from("stores")
      .select("plan_tier")
      .eq("id", store_id)
      .single();

    if (error || !store) {
      return NextResponse.json({ error: "Butikk ikke funnet" }, { status: 404 });
    }

    let activePlan = store.plan_tier;

    // Activate pending plan
    if (activePlan?.endsWith("_pending")) {
      activePlan = activePlan.replace("_pending", "");
      await supabaseAdmin
        .from("stores")
        .update({ plan_tier: activePlan })
        .eq("id", store_id);

      logger.info({ store_id, activePlan }, "Billing plan activated after confirmation");
    }

    return NextResponse.json({ success: true, plan_tier: activePlan });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Billing confirmation error");
    return NextResponse.json({ error: "Fakturering bekreftelse feilet" }, { status: 500 });
  }
});
