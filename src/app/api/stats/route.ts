import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: items, error } = await supabase
      .from('inventory')
      .select('cost, price, stock');

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
        // Including MVA variants for the UI toggle
        totalValueWithVat: stats.totalCost * 1.25,
        avgMarginNet: avgMargin // Simplified logic for calibration
      }
    });

  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
