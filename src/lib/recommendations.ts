import { logger } from "./logger";
import { supabaseAdmin } from "./supabase";
import { calculateConsensus, ScrapedProduct } from "./scrapers/adapters";

/**
 * Logic to generate price recommendations based on market data and sales velocity.
 */
export async function generateRecommendations(storeId: string, shopDomain: string, inventoryId: string) {
  // 1. Fetch current inventory item details
  const { data: item, error: fetchError } = await supabaseAdmin
    .from("inventory")
    .select("*")
    .eq("variant_id", inventoryId)
    .single();

  if (fetchError || !item) {
    logger.error({ fetchError, inventoryId }, "Failed to fetch inventory for recommendations");
    return null;
  }

  // 2. Fetch latest market benchmarks for this SKU
  const { data: marketData, error: marketError } = await supabaseAdmin
    .from("market_prices")
    .select("*")
    .eq("sku", item.sku || item.title)
    .order("created_at", { ascending: false })
    .limit(10);

  if (marketError) throw marketError;

  // Normalize market data for consensus calculation
  const normalizedData: ScrapedProduct[] = (marketData || []).map(m => ({
    name: item.title,
    price: Number(m.price),
    source: m.source,
    stockStatus: m.in_stock ? "IN_STOCK" : "OUT_OF_STOCK"
  }));

  const consensus = calculateConsensus(normalizedData);
  if (!consensus) return null;

  const currentPrice = Number(item.price);
  const cost = Number(item.cost || 0);
  const abcClass = item.abc_class || "C";
  const recommendations = [];

  // RULE 1: Price Increase (Market is higher)
  if (consensus.average > currentPrice * 1.05) {
    const suggestedPrice = Math.round(consensus.average);
    
    recommendations.push({
      type: "INCREASE",
      reason: `Markedspris (${consensus.average}kr) er betydelig høyere enn din pris (${currentPrice}kr). Foreslår justering for bedre margin.`,
      suggested_price: suggestedPrice,
      field: 'price'
    });
  }

  // RULE 2 & 3: Competitive Undercut & ABC Efficiency
  // Goal: Match or undercut median by 1 NOK, but respect Class priority and Cost Floor
  const floorPrice = cost * 1.10; // Default 10% margin floor if not in settings
  const targetPrice = Math.max(consensus.median - 1, floorPrice);

  if (targetPrice < currentPrice) {
     // Only suggest undercut if it's a significant change (> 1%)
     if (currentPrice - targetPrice > currentPrice * 0.01) {
        let reason = `Konkurransedyktig prising: Tilpasser til markedsmedian (${consensus.median}kr) med 1kr undercut.`;
        
        if (abcClass === "A") {
          reason = `ABC Klasse A optimalisering: Sikrer markedsledende pris (${targetPrice}kr) for høyvolums-vare.`;
        } else if (abcClass === "C") {
          reason = `ABC Klasse C (Slow Mover): Reduserer pris for å øke omløpshastighet mot markedssnitt.`;
        }

        recommendations.push({
          type: "DECREASE",
          reason,
          suggested_price: targetPrice,
          field: 'price'
        });
     }
  }

  // Handle staging for the first recommendation if any
  if (recommendations.length > 0) {
    const bestRec = recommendations[0];
    const { error: stageError } = await supabaseAdmin.from("staged_updates").insert({
      store_id: storeId,
      product_id: inventoryId,
      field_name: 'price',
      original_value: currentPrice.toString(),
      suggested_value: bestRec.suggested_price.toString(),
      reason: bestRec.reason,
      status: 'pending'
    });

    if (stageError) {
      logger.error({ stageError, shopDomain }, "Failed to stage price recommendation");
    }
  }

  return recommendations;
}
