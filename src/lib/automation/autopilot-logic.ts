/**
 * Sovereign Auto-Pilot Logic
 * 
 * Permits autonomous pricing for Class C items within strict safety rails.
 */

import { calculateProfitability } from './profit';

export interface AutopilotResult {
  shouldAutoPush: boolean;
  reason: string;
}

/**
 * Validates if a price change can be pushed autonomously.
 */
export function validateAutopilotChange(
  currentPrice: number,
  suggestedPrice: number,
  cost: number,
  abcClass: string,
  vaultSettings: any
): AutopilotResult {
  
  // 1. Safety Check: Classification
  // Auto-pilot is ONLY permitted for Class C by default
  if (abcClass !== 'C') {
    return { shouldAutoPush: false, reason: "Kun Klasse C er tillatt for Autopilot." };
  }

  // 2. Safety Check: Hard Floor
  const profitability = calculateProfitability(suggestedPrice, cost);
  if (profitability.margin < (vaultSettings.minMargin || 5)) {
    return { shouldAutoPush: false, reason: "Forslag bryter minimumsmargin (Floor)." };
  }

  // 3. Safety Check: Max Daily Volatility
  const deltaPercent = Math.abs((suggestedPrice - currentPrice) / currentPrice) * 100;
  if (deltaPercent > (vaultSettings.maxDailyDelta || 5)) {
    return { shouldAutoPush: false, reason: `Volatilitet (${deltaPercent.toFixed(1)}%) overstiger dagsgrensen.` };
  }

  // 4. Verification Check: Price Direction
  // Auto-pilot is even safer if it's only raising prices
  // But for now, we allow both if within the delta.

  return { shouldAutoPush: true, reason: "Sikkerhets-rails verifisert. Auto-pilot godkjent." };
}
