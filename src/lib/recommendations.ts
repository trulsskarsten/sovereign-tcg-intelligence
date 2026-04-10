import { supabaseAdmin } from "./supabase";
import { calculateConsensus, ScrapedProduct } from "./scrapers/adapters";

/**
 * Logic to generate price recommendations based on market data and sales velocity.
 */
export async function generateRecommendations(inventoryId: string, marketData: ScrapedProduct[]) {
  // 1. Fetch current inventory item details
  const { data: item, error: fetchError } = await supabaseAdmin
    .from("inventory")
    .select("*")
    .eq("id", inventoryId)
    .single();

  if (fetchError) throw fetchError;

  const consensus = calculateConsensus(marketData);
  if (!consensus) return null;

  const currentPrice = Number(item.shopify_price);
  const wacPrice = Number(item.wac_price);
  const recommendations = [];

  // RULE 1: Price Increase (Market is higher)
  // If market average is significantly higher than our price, and we are okay being pricer.
  if (consensus.average > currentPrice * 1.05) {
    recommendations.push({
      type: "INCREASE",
      reason: `Markedspris (${consensus.average}kr) er betydelig høyere enn din pris. Foreslår justering for bedre margin.`,
      suggested_price: Math.round(consensus.average * 1.02), // 2% above market avg
    });
  }

  // RULE 2: Slow Mover Detection
  // (Need sales history for this - assuming 30d stats)
  // Logic: If sales_velocity < 0.05 (5%) and price is high, suggest a small drop.
  
  // For now, we save these recommendations to the DB
  for (const rec of recommendations) {
    const { error: recError } = await supabaseAdmin.from("recommendations").insert({
      inventory_id: inventoryId,
      type: rec.type,
      reason: rec.reason,
      suggested_price: rec.suggested_price,
      status: "PENDING",
    });
    
    if (recError) console.error("Error saving recommendation:", recError);
  }

  return recommendations;
}
