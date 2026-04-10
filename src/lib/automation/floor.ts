/**
 * Hard-Floor Margin Protection
 * 
 * Ensures every automated price update maintains a minimum profit margin.
 * Formulas include Norwegian VAT (25%) and a safety buffer (5%).
 */

export interface MarginConfig {
  vatRate: number;    // e.g. 1.25
  safetyBuffer: number; // e.g. 1.05 (5%)
}

const DEFAULT_CONFIG: MarginConfig = {
  vatRate: 1.25,
  safetyBuffer: 1.05
};

/**
 * Calculates the absolute minimum price a product can be sold for.
 */
export function calculateHardFloor(unitCost: number, config = DEFAULT_CONFIG): number {
  if (!unitCost || unitCost <= 0) return 0;
  
  // Base cost + 25% VAT + 5% Profit Margin
  return unitCost * config.vatRate * config.safetyBuffer;
}

/**
 * Validates if the proposed price is above the hard floor.
 */
export function isAboveFloor(proposedPrice: number, unitCost: number): { 
  valid: boolean; 
  floorPrice: number;
} {
  const floorPrice = calculateHardFloor(unitCost);
  
  return {
    valid: proposedPrice >= floorPrice,
    floorPrice: Math.ceil(floorPrice) // Round up for safety
  };
}
