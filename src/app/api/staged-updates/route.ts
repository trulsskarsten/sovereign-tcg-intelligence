import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { z } from "zod";

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  status: z.enum(['pending', 'approved', 'rejected', 'executed']).default('pending'),
});

const CreateSchema = z.object({
  product_id: z.string(),
  field_name: z.string(),
  original_value: z.string().optional(),
  suggested_value: z.string(),
  reason: z.string().optional(),
});

/**
 * GET /api/staged-updates
 * List staged updates for the store.
 */
export const GET = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    const url = new URL(req.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const result = QuerySchema.safeParse(searchParams);

    if (!result.success) {
      return NextResponse.json({ error: "Ugyldige parametere" }, { status: 400 });
    }

    const { page, limit, status } = result.data;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from('staged_updates')
      .select('*', { count: 'exact' })
      .eq('store_id', store_id)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        page,
        limit
      }
    });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Failed to fetch staged updates");
    return NextResponse.json({ error: "Klarte ikke å hente oppdateringer" }, { status: 500 });
  }
});

/**
 * POST /api/staged-updates
 * Create a new staged update.
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    const body = await req.json();
    const result = CreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Ugyldige data", details: result.error.format() }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('staged_updates')
      .insert({
        ...result.data,
        store_id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Failed to create staged update");
    return NextResponse.json({ error: "Klarte ikke å lagre oppdatering" }, { status: 500 });
  }
});
