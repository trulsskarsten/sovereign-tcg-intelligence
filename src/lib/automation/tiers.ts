/**
 * TCG Safety Matrix & Tiered Repricing Logic
 * 
 * Protects merchant margins by applying context-aware limits 
 * based on product value.
 */

export interface SafetyCriteria {
  maxPercent: number;    // e.g., 0.15 (15%)
  maxAbsolute: number;   // e.g., 200 (NOK)
}

/**
 * Tiers based on current market value.
 * Standard TCG thresholds for the Norwegian market.
 */
export const TCG_SAFETY_TIERS: Record<string, SafetyCriteria> = {
  low: { maxPercent: 0.20, maxAbsolute: 75 },    // < 500 NOK (Packs, Sleeves, Singles)
  mid: { maxPercent: 0.15, maxAbsolute: 150 },   // 500 - 1500 NOK (ETBs, Collections)
  high: { maxPercent: 0.10, maxAbsolute: 750 },  // > 1500 NOK (Booster Boxes, Cases)
};

/**
 * Checks if a proposed price change is within safety limits.
 * Returns { safe: boolean, reason?: string }
 */
export function validatePriceChange(
  currentPrice: number, 
  newPrice: number
): { safe: boolean; reason?: string } {
  const diff = Math.abs(newPrice - currentPrice);
  const percentChange = diff / currentPrice;
  
  // 1. Identify Tier
  let tier: SafetyCriteria;
  if (currentPrice < 500) {
    tier = TCG_SAFETY_TIERS.low;
  } else if (currentPrice < 1500) {
    tier = TCG_SAFETY_TIERS.mid;
  } else {
    tier = TCG_SAFETY_TIERS.high;
  }

  // 2. Check Limits
  if (percentChange > tier.maxPercent) {
    return { 
      safe: false, 
      reason: `Oversteg prosentgrense (${(tier.maxPercent * 100).toFixed(0)}%) for denne prisklassen.` 
    };
  }

  if (diff > tier.maxAbsolute) {
    return { 
      safe: false, 
      reason: `Oversteg kronegrense (${tier.maxAbsolute} kr) for denne prisklassen.` 
    };
  }

  return { safe: true };
}

/**
 * Panic Lock Logic (Circuit Breaker)
 * 
 * If a store has multiple safety violations in a short period, 
 * we pause all automation.
 */
export const PANIC_LOCK_THRESHOLD = 10; // 10 violations per hour
export const PANIC_LOCK_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export interface SafetyIncident {
  storeId: string;
  violationsCount: number;
  lastIncidentAt: string;
  isPaused: boolean;
}
