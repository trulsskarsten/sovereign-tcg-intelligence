import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { POKEMON_SEED_DATA } from "@/lib/seeds/seed-data";
import { logger } from "@/lib/logger";

/**
 * POST /api/internal/seed
 * Populates the inventory with realistic Pokémon TCG data.
 * This is an internal utility to make the dashboard look "Live" immediately.
 */
export async function POST(req: Request) {
  try {
    const shop_domain = "pokemon-butikken-2.myshopify.com";
    
    // 1. Get a valid store_id (fallback to first store if not exact)
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('shop_domain', shop_domain)
      .single();

    const storeId = store?.id;
    if (!storeId) {
      return NextResponse.json({ error: "No store found to seed data into" }, { status: 400 });
    }

    // 2. Map seed data to database schema
    const inventoryUpdates = POKEMON_SEED_DATA.map(item => ({
      ...item,
      store_id: storeId,
      shop_domain,
      last_synced_at: new Date().toISOString()
    }));

    // 3. Upsert into inventory
    const { error } = await supabaseAdmin
      .from('inventory')
      .upsert(inventoryUpdates, { onConflict: 'shopify_variant_id' });

    if (error) throw error;

    logger.info({ shop_domain, count: POKEMON_SEED_DATA.length }, "Database seeded with test data");

    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${POKEMON_SEED_DATA.length} items successfully.` 
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Seeding failed";
    logger.error({ err }, "Seeding Error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
