import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * GET /api/stats/roi
 * Calculates ROI (Profit Margin) per ABC Class
 */
export const GET = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    // We want to calculate weighted average ROI per ABC class
    // ROI = (Price - Cost) / Cost
    const { data: items, error } = await supabaseAdmin
      .from('inventory')
      .select('abc_class, price, cost, stock')
      .eq('store_id', store_id)
      .gt('cost', 0); // Only items with cost

    if (error) throw error;

    const roiByClass: Record<string, { totalProfit: number; totalCost: number; count: number }> = {
      'A': { totalProfit: 0, totalCost: 0, count: 0 },
      'B': { totalProfit: 0, totalCost: 0, count: 0 },
      'C': { totalProfit: 0, totalCost: 0, count: 0 },
      'U': { totalProfit: 0, totalCost: 0, count: 0 } // Unknown/Unclassified
    };

    items.forEach(item => {
      const cls = item.abc_class || 'U';
      const stock = item.stock;

      // Items with no stock have no capital at risk — exclude from ROI
      if (!stock || stock <= 0) return;

      const costBasis = item.cost * stock;
      const profit = (item.price - item.cost) * stock;

      if (!roiByClass[cls]) {
        roiByClass[cls] = { totalProfit: 0, totalCost: 0, count: 0 };
      }

      roiByClass[cls].totalProfit += profit;
      roiByClass[cls].totalCost += costBasis;
      roiByClass[cls].count += 1;
    });

    const result = Object.entries(roiByClass).map(([className, stats]) => ({
      name: `Klasse ${className}`,
      roi: stats.totalCost > 0 ? (stats.totalProfit / stats.totalCost) * 100 : 0,
      count: stats.count
    })).filter(r => r.count > 0);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "ROI Stats error");
    return NextResponse.json({ error: "Klarte ikke å hente ROI-statistikk" }, { status: 500 });
  }
});
