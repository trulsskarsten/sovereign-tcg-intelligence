import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { z } from "zod";

const SettingsSchema = z.object({
  is_automation_enabled: z.boolean().optional(),
  floor_margin: z.number().min(0).max(100).optional(),
  panic_lock_threshold: z.number().min(0).max(100).optional(),
  price_auto_update: z.boolean().optional(),
  wac_auto_update: z.boolean().optional(),
  discord_alerts_enabled: z.boolean().optional(),
});

/**
 * GET /api/settings
 * Fetches store settings.
 */
export const GET = withAuth(async (req: NextRequest, { shop_domain }) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .eq('shop_domain', shop_domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Return defaults if not found
        return NextResponse.json({
          success: true,
          settings: {
            is_automation_enabled: false,
            floor_margin: 10,
            panic_lock_threshold: 20
          }
        });
      }
      throw error;
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Failed to fetch settings");
    return NextResponse.json({ error: "Kunne ikke hente innstillinger" }, { status: 500 });
  }
});

/**
 * PUT /api/settings
 * Updates store settings.
 */
export const PUT = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    const body = SettingsSchema.parse(await req.json());

    const { error } = await supabaseAdmin
      .from('store_settings')
      .upsert({
        ...body,
        id: store_id,
        shop_domain,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Ugyldig innstillingsformat", details: err.errors }, { status: 400 });
    }
    logger.error({ err, shop_domain }, "Failed to update settings");
    return NextResponse.json({ error: "Kunne ikke lagre innstillinger" }, { status: 500 });
  }
});
