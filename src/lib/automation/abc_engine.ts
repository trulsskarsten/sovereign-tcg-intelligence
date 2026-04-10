/**
 * Dynamic ABC Engine
 * 
 * Logic to categorize inventory based on the 80/20 rule
 * using Weighted Value (UnitPrice * Quantity).
 */

export type ABCClass = 'A' | 'B' | 'C';

export interface VelocityPolicy {
  daysUntilStale: number;
  suggestedCutPct: number;
  label: string;
  isImmortal: boolean;
}

export const VELOCITY_POLICIES: Record<ABCClass, VelocityPolicy> = {
  A: { 
    daysUntilStale: 9999, 
    suggestedCutPct: 0, 
    label: "Grail / Immortal", 
    isImmortal: true 
  },
  B: { 
    daysUntilStale: 120, 
    suggestedCutPct: 3, 
    label: "Premium / Mid-Range", 
    isImmortal: false 
  },
  C: { 
    daysUntilStale: 60, 
    suggestedCutPct: 5, 
    label: "Standard / Volume", 
    isImmortal: false 
  }
};

/**
 * Returns the policy for a given variant's class
 */
export function getVelocityPolicy(abcClass: ABCClass): VelocityPolicy {
  return VELOCITY_POLICIES[abcClass] || VELOCITY_POLICIES.C;
}

/**
 * Checks if a product should be flagged as 'Stale' based on its ABC Class
 */
export function checkStaleStatus(
  abcClass: ABCClass, 
  daysInStock: number
): boolean {
  const policy = getVelocityPolicy(abcClass);
  if (policy.isImmortal) return false;
  return daysInStock >= policy.daysUntilStale;
}
