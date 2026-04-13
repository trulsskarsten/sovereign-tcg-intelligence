import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { processNewPurchase } from "@/lib/wac";
import { logger } from "@/lib/logger";
import { z } from "zod";

const purchaseSchema = z.object({
  variant_id: z.string(),
  qty: z.number().positive(),
  unit_cost: z.number().nonnegative(),
  vendor: z.string().optional()
});

/**
 * Registrer et nytt innkjøp for en vare.
 * Dette vil automatisk oppdatere WAC og lagersaldo i både Supabase og Shopify.
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain }) => {
  try {
    const body = await req.json();
    const validated = purchaseSchema.parse(body);

    const result = await processNewPurchase(shop_domain, {
      variant_id: validated.variant_id,
      qty: validated.qty,
      unitCost: validated.unit_cost,
      vendor: validated.vendor
    });

    return NextResponse.json({
      success: true,
      message: "Innkjøp registrert og synkronisert til Shopify.",
      data: result
    });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Ugyldig input", details: err.issues }, { status: 400 });
    }

    logger.error({ err, shop_domain }, "Feil ved registrering av innkjøp");
    return NextResponse.json({ error: "Kunne ikke registrere innkjøp" }, { status: 500 });
  }
});
