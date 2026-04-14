import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { shopifyQuery } from "@/lib/shopify";
import { BILLING_PLANS, generateSubscriptionMutation } from "@/lib/billing/shopify-billing";
import { z } from "zod";

const SubscribeSchema = z.object({
  plan_name: z.enum(["Hobbyist (Free)", "Pro Merchant", "Enterprise Wholesaler"]),
});

/**
 * POST /api/billing/subscribe
 * Creates a Shopify AppSubscription and returns a confirmation URL.
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    const body = SubscribeSchema.parse(await req.json());
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      logger.error("NEXT_PUBLIC_APP_URL not configured");
      return NextResponse.json({ error: "App URL ikke konfigurert — kontakt support" }, { status: 500 });
    }
    const returnUrl = `${appUrl}/settings/billing?confirmed=true`;

    // Free plan — no Shopify charge needed
    if (body.plan_name === BILLING_PLANS.HOBBYIST.name) {
      const { error } = await supabaseAdmin
        .from("stores")
        .update({ plan_tier: "hobbyist" })
        .eq("id", store_id);

      if (error) throw error;

      logger.info({ store_id, plan: "hobbyist" }, "Store set to free plan");
      return NextResponse.json({ success: true, confirmationUrl: null, plan: "hobbyist" });
    }

    const mutation = generateSubscriptionMutation(body.plan_name, shop_domain, returnUrl);
    const result = await shopifyQuery(shop_domain, mutation);

    if (result?.data?.appSubscriptionCreate?.userErrors?.length > 0) {
      const errs = result.data.appSubscriptionCreate.userErrors;
      logger.error({ errs, store_id }, "Billing subscription userErrors");
      return NextResponse.json({ error: "Abonnement feilet: " + errs[0].message }, { status: 422 });
    }

    const confirmationUrl = result?.data?.appSubscriptionCreate?.confirmationUrl;
    const subscriptionId = result?.data?.appSubscriptionCreate?.appSubscription?.id;

    if (!confirmationUrl) {
      return NextResponse.json({ error: "Ingen bekreftelse-URL mottatt" }, { status: 502 });
    }

    const planTier = body.plan_name.includes("Enterprise") ? "enterprise" : "pro";

    // Tentatively store subscription ID; plan_tier confirmed when merchant returns from billing page
    await supabaseAdmin
      .from("stores")
      .update({ plan_tier: `${planTier}_pending` })
      .eq("id", store_id);

    logger.info({ store_id, subscriptionId, planTier }, "Billing subscription created");

    return NextResponse.json({ success: true, confirmationUrl, subscriptionId });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Ugyldig planvalg" }, { status: 400 });
    }
    logger.error({ err, shop_domain }, "Billing subscribe error");
    return NextResponse.json({ error: "Fakturering feilet" }, { status: 500 });
  }
});
