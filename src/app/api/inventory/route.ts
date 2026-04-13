import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { z } from "zod";

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  q: z.string().optional(),
  category: z.string().optional(),
  abc_class: z.string().optional(),
  sort_by: z.enum(['product_name', 'stock', 'price', 'last_sync']).default('product_name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * GET /api/inventory
 * Returns paginated inventory for the authenticated store.
 */
export const GET = withAuth(async (req: NextRequest, { shop_domain }) => {
  try {
    const url = new URL(req.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const result = QuerySchema.safeParse(searchParams);

    if (!result.success) {
      return NextResponse.json({ error: "Ugyldige søkeparametere", details: result.error.format() }, { status: 400 });
    }

    const { page, limit, q, category, abc_class, sort_by, sort_order } = result.data;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('inventory')
      .select('*', { count: 'exact' })
      .eq('shop_domain', shop_domain)
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    if (q) {
      query = query.ilike('product_name', `%${q}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (abc_class) {
      query = query.eq('abc_class', abc_class);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error({ error, shop_domain }, "Inventory fetch error");
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: count ? Math.ceil(count / limit) : 0
      }
    });

  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Inventory API error");
    return NextResponse.json({ error: "Klarte ikke å hente lagerbeholdning" }, { status: 500 });
  }
});
