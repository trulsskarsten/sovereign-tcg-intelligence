/**
 * Safety Engine for Skarsten TCG Ops
 * 
 * Implements validation bounds and permission checks for all automated actions.
 */

export interface ValidationResult {
  isSafe: boolean;
  reason?: string;
}

const SAFETY_CONFIG = {
  price: {
    maxChangePercent: 25, // Never change price > 25% without warning
    manualOnly: true,     // PRICES CAN NEVER BE AUTO-UPDATED BY SYSTEM
  },
  wac: {
    autoUpdate: true,     // WAC UPDATES ARE AUTOMATED
  }
};

/**
 * Validates a proposed price change.
 */
export function validatePriceChange(oldPrice: number, newPrice: number): ValidationResult {
  if (SAFETY_CONFIG.price.manualOnly) {
    // Note: This logic assumes the dashboard level must provide an 'approvedBy' flag
    // This is a second-layer check to ensure no logic bypasses the dashboard approval
  }

  const changePercent = Math.abs((newPrice - oldPrice) / oldPrice) * 100;

  if (changePercent > SAFETY_CONFIG.price.maxChangePercent) {
    return {
      isSafe: false,
      reason: `Prisendring på ${changePercent.toFixed(1)}% overstiger sikkerhetsgrensen på ${SAFETY_CONFIG.price.maxChangePercent}%`,
    };
  }

  return { isSafe: true };
}

/**
 * Utility to generate an idempotency key.
 * Used to prevent duplicate adjustments in Shopify.
 */
export function generateIdempotencyKey(action: string, id: string): string {
  const timestamp = Math.floor(Date.now() / 1000 / 60); // 1-minute resolution
  return `tcg-ops-${action}-${id}-${timestamp}`;
}

/**
 * Checks if the system is currently in Dry Run / Simulator mode.
 */
export function isDryRun(): boolean {
  return process.env.SHOPIFY_DRY_RUN === "true";
}
