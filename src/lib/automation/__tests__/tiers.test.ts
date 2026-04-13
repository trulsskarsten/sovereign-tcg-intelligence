import { describe, it, expect } from 'vitest';
import { validatePriceChange, TCG_SAFETY_TIERS } from '../tiers';

describe('TCG Safety Matrix & Tiered Repricing', () => {
  it('should allow small price changes in the low tier', () => {
    const currentPrice = 100;
    const newPrice = 110; // +10% (limit 20%), +10 kr (limit 75 kr)
    expect(validatePriceChange(currentPrice, newPrice).safe).toBe(true);
  });

  it('should block excessive percent changes in the low tier', () => {
    const currentPrice = 100;
    const newPrice = 130; // +30% (limit 20%)
    const result = validatePriceChange(currentPrice, newPrice);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain('20%');
  });

  it('should allow changes within mid tier limits', () => {
    const currentPrice = 1000;
    const newPrice = 1100; // +10% (limit 15%), +100 kr (limit 150 kr)
    expect(validatePriceChange(currentPrice, newPrice).safe).toBe(true);
  });

  it('should block excessive absolute changes in the mid tier', () => {
    const currentPrice = 1400;
    const newPrice = 1560; // +160 kr (limit 150 kr), +11.4% (limit 15%)
    const result = validatePriceChange(currentPrice, newPrice);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain('150 kr');
  });

  it('should validate high tier correctly', () => {
    const currentPrice = 3000;
    const newPrice = 3500; // +500 kr (limit 750), +16% (limit 10%)
    const result = validatePriceChange(currentPrice, newPrice);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain('10%');
  });

  it('should allow large absolute changes in high tier if percent is low', () => {
    const currentPrice = 10000;
    const newPrice = 10500; // +500 kr (limit 750), +5% (limit 10%)
    expect(validatePriceChange(currentPrice, newPrice).safe).toBe(true);
  });
});
