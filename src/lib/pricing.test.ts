import { describe, it, expect } from 'vitest';
import { formatPrice, calculateROI, getMVAAmount, MVA_RATE } from './pricing';

describe('Pricing & VAT Engine', () => {
  it('should format price correctly in gross and net mode', () => {
    const grossPrice = 125;
    expect(formatPrice(grossPrice, 'gross')).toBe(125);
    expect(formatPrice(grossPrice, 'net')).toBe(100);
  });

  it('should calculate ROI correctly in gross mode', () => {
    const cost = 100;
    const sale = 200;
    // 200 - 100 = 100
    expect(calculateROI(cost, sale, 'gross')).toBe(100);
  });

  it('should calculate ROI correctly in net mode', () => {
    const cost = 125; // net 100
    const sale = 250; // net 200
    // 200 - 100 = 100
    expect(calculateROI(cost, sale, 'net')).toBe(100);
  });

  it('should calculate MVA amount correctly', () => {
    const gross = 125;
    expect(getMVAAmount(gross)).toBe(25);
  });

  it('should handle zero gracefully', () => {
    expect(formatPrice(0, 'net')).toBe(0);
    expect(calculateROI(0, 0, 'gross')).toBe(0);
    expect(getMVAAmount(0)).toBe(0);
  });
});
