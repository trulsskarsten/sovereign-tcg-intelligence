/**
 * Profit & ROI Engine for TCG Ops
 * 
 * Logic to calculate real-world profitability based on:
 * - Current Shopify Price
 * - Purchase Cost (Actual)
 * - VAT (MVA @ 25%)
 */

export interface ProfitMetrics {
  marginNok: number;
  roiPercentage: number;
  isProfitable: boolean;
}

export function calculateProfitability(
  currentPrice: number,
  purchaseCost: number,
  priceMode: 'net' | 'gross' = 'net'
): ProfitMetrics {
  // If price is gross (with VAT), we strip it to find the real income
  const priceExVat = priceMode === 'gross' ? currentPrice / 1.25 : currentPrice;
  
  // Real Profit = Net Price - Purchase Cost
  const marginNok = priceExVat - purchaseCost;
  
  // ROI = (Margin / Purchase Cost) * 100
  // Handle division by zero for gifts/promos
  const roiPercentage = purchaseCost > 0 ? (marginNok / purchaseCost) * 100 : 0;
  
  return {
    marginNok: Math.round(marginNok * 100) / 100,
    roiPercentage: Math.round(roiPercentage * 100) / 100,
    isProfitable: marginNok > 0
  };
}

/**
 * Calculates the total shift in unrealized inventory value
 */
export function calculateInventoryDelta(
  oldPrice: number,
  newPrice: number,
  quantity: number = 1
): number {
  return (newPrice - oldPrice) * quantity;
}
