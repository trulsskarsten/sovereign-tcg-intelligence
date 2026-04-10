/**
 * Professional Pricing & VAT (MVA) Engine
 */

export const MVA_RATE = 0.25;

export type PriceMode = "net" | "gross";

/**
 * Transforms a value based on the current price mode.
 * Assumes the input value is GROSS (Inkl. MVA) by default as per retail standards.
 */
export function formatPrice(amount: number, mode: PriceMode = "gross"): number {
  if (mode === "net") {
    return amount / (1 + MVA_RATE);
  }
  return amount;
}

/**
 * Calculates ROI based on MVA status.
 */
export function calculateROI(cost: number, salePrice: number, mode: PriceMode = "gross"): number {
  const netCost = cost / (1 + MVA_RATE);
  const netSale = salePrice / (1 + MVA_RATE);

  if (mode === "net") {
    // Professional B2B Profit
    return netSale - netCost;
  }

  // Consumer/Private Profit
  return salePrice - cost;
}

/**
 * Returns the MVA amount for a gross price.
 */
export function getMVAAmount(grossAmount: number): number {
  return grossAmount - (grossAmount / (1 + MVA_RATE));
}
