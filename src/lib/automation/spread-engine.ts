/**
 * Market Spread & Liquidity Intelligence
 * 
 * Analyzing the delta between Low and Market prices to identify 
 * Arbitrage (Flip) vs Stability (Hold).
 */

export interface MarketSpread {
  lowPrice: number;
  marketPrice: number;
  spreadPercent: number;
  sentiment: 'Flip' | 'Hold' | 'Neutral';
  liquidityScore: number; // 0-100
}

/**
 * Higher spread (>15%) often indicates a "Flipping" opportunity
 * where market fair value is significantly higher than the desperate low.
 */
export function calculateMarketSpread(low: number, market: number): MarketSpread {
  const spreadPercent = ((market - low) / market) * 100;
  
  let sentiment: 'Flip' | 'Hold' | 'Neutral' = 'Neutral';
  let liquidityScore = 50;

  if (spreadPercent > 18) {
    sentiment = 'Flip';
    liquidityScore = 30; // High spread usually means lower liquidity or desperation
  } else if (spreadPercent < 4) {
    sentiment = 'Hold';
    liquidityScore = 90; // Tight spread means high liquidity and stable price
  }

  return {
    lowPrice: low,
    marketPrice: market,
    spreadPercent: parseFloat(spreadPercent.toFixed(2)),
    sentiment,
    liquidityScore
  };
}

/**
 * Risk-Aware Price Suggestion
 * If we are "Flipping", we might want to undercut the Market slightly 
 * but stay well above the desperate Low.
 */
export function suggestStrategyPrice(spread: MarketSpread, cost: number) {
  if (spread.sentiment === 'Flip') {
    // Strategy: Target a quick exit at 5% below market
    return spread.marketPrice * 0.95;
  }
  
  // Default: Stick to Fair Market Value
  return spread.marketPrice;
}
