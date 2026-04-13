import { describe, it, expect } from 'vitest';
import { calculateHardFloor, isAboveFloor } from '../floor';

describe('Hard-Floor Margin Protection', () => {
  it('should calculate floor price correctly with default config', () => {
    const cost = 100;
    // 100 * 1.25 (VAT) * 1.05 (Safety) = 131.25
    expect(calculateHardFloor(cost)).toBe(131.25);
  });

  it('should return 0 for zero or negative cost', () => {
    expect(calculateHardFloor(0)).toBe(0);
    expect(calculateHardFloor(-10)).toBe(0);
  });

  it('should validate proposed price correctly', () => {
    const cost = 100; // floor is 131.25
    
    expect(isAboveFloor(140, cost).valid).toBe(true);
    expect(isAboveFloor(131.25, cost).valid).toBe(true);
    expect(isAboveFloor(131, cost).valid).toBe(false);
  });

  it('should round up the floor price in the response', () => {
    const cost = 100; // 131.25
    expect(isAboveFloor(140, cost).floorPrice).toBe(132);
  });
});
