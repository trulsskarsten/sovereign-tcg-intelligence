import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

// Sovereign ABC Engine API
// Performs 80/20 inventory classification based on Weighted Value (Price * Stock)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. Fetch all active inventory
    const { data: inventory, error } = await supabase
      .from("inventory")
      .select("id, price_net, stock_level");

    if (error) throw error;
    if (!inventory || inventory.length === 0) {
      return NextResponse.json({ message: "No inventory found" });
    }

    // 2. Calculate Weighted Value and Sort
    const items = inventory.map(item => ({
      id: item.id,
      weightedValue: (item.price_net || 0) * (item.stock_level || 0)
    })).sort((a, b) => b.weightedValue - a.weightedValue);

    const totalValue = items.reduce((sum, item) => sum + item.weightedValue, 0);
    let cumulativeValue = 0;

    // 3. Assign Classes (80/20 logic)
    // A: Top 70% of value
    // B: Next 20%
    // C: Remaining 10%
    const updates = items.map(item => {
      cumulativeValue += item.weightedValue;
      const pct = (cumulativeValue / totalValue) * 100;
      
      let abcClass = "C";
      if (pct <= 70) abcClass = "A";
      else if (pct <= 90) abcClass = "B";

      return {
        id: item.id,
        abc_class: abcClass,
        last_sync_at: new Date().toISOString()
      };
    });

    // 4. Bulk Update Supabase
    // Note: upsert works as long as 'id' is present
    const { error: updateError } = await supabase
      .from("inventory")
      .upsert(updates);

    if (updateError) throw updateError;

    // 5. Log the successful run
    await supabase.from("audit_logs").insert({
      event_type: "sync",
      description: `ABC Engine fullført: Kategoriserte ${items.length} produkter.`,
      payload: { totalValue, count: items.length }
    });

    return NextResponse.json({ 
      success: true, 
      count: items.length, 
      totalValue 
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ABC Engine Error";
    logger.error({ err }, "ABC Engine Error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
