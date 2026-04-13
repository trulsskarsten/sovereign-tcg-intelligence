import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * GET /api/stats
 * Returns core KPIs and optionally historical data.
 */
export const GET = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');

    if (type === 'history') {
      // Fetch price history for the last 7 days grouped by date
      const { data: history, error: historyError } = await supabaseAdmin
        .from('price_history')
        .select('created_at, new_price, old_price')
        .eq('store_id', store_id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (historyError) throw historyError;

      // Group by date for the chart
      const chartData = history.reduce((acc: any[], curr: any) => {
        const date = new Date(curr.created_at).toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit' });
        const existing = acc.find(a => a.name === date);
        if (existing) {
          existing.value = curr.new_price;
          existing.volume += 1;
        } else {
          acc.push({ name: date, value: curr.new_price, volume: 1 });
        }
        return acc;
      }, []);

      return NextResponse.json({ success: true, data: chartData });
    }

    // Default: KPIs
    const { data: items, error } = await supabaseAdmin
      .from('inventory')
      .select('cost, price, stock')
      .eq('shop_domain', shop_domain);

    if (error) throw error;

    const stats = items.reduce((acc, item) => {
      const stock = item.stock || 0;
      const cost = item.cost || 0;
      const price = item.price || 0;

      acc.totalCost += cost * stock;
      acc.totalRevenue += price * stock;
      acc.stockCount += stock;
      acc.itemCount += 1;
      
      return acc;
    }, { totalCost: 0, totalRevenue: 0, stockCount: 0, itemCount: 0 });

    const totalProfit = stats.totalRevenue - stats.totalCost;
    const avgMargin = stats.totalRevenue > 0 ? (totalProfit / stats.totalRevenue) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalValueNok: stats.totalCost,
        potentialRevenueNok: stats.totalRevenue,
        potentialProfitNok: totalProfit,
        avgMarginPercentage: avgMargin,
        stockCount: stats.stockCount,
        uniqueProducts: stats.itemCount,
        totalValueWithVat: stats.totalCost * 1.25,
        avgMarginNet: avgMargin
      }
    });

  } catch (error: unknown) {
    logger.error({ error, shop_domain }, "Stats API Error");
    return NextResponse.json({ success: false, error: "Feil ved henting av statistikk" }, { status: 500 });
  }
});
