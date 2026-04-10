/**
 * Norwegian TCG Retailer Scraper (Pokepris, Pokevarsler adapters)
 */

export interface ScraperResult {
  source: string;
  price: number;
  inStock: boolean;
  url: string;
}

/**
 * Focused exclusively on Norwegian retailers as per user request.
 */
export async function scrapeNorwegianPrices(sku: string): Promise<ScraperResult[]> {
  const results: ScraperResult[] = [];
  
  try {
    // 1. Mock Pokepris Sync
    results.push({
      source: "Pokepris.no",
      price: 549,
      inStock: true,
      url: `https://pokepris.no/search?q=${sku}`
    });

    // 2. Mock Pokevarsler Sync
    results.push({
      source: "Pokevarsler.no",
      price: 599,
      inStock: true,
      url: `https://pokevarsler.no/product/${sku}`
    });

    // 3. Mock generic Norwegian Retailer
    results.push({
      source: "Outland.no",
      price: 529,
      inStock: false,
      url: "https://outland.no"
    });
  } catch (err) {
    console.error("Scraper Error:", err);
  }

  return results;
}

/**
 * Calculates a consensus price based on Norwegian market median.
 */
export function calculateConsensusPrice(results: ScraperResult[]): number {
  const validPrices = results
    .filter(r => r.inStock)
    .map(r => r.price)
    .sort((a, b) => a - b);

  if (validPrices.length === 0) return 0;
  
  // Return the median price for stability
  const mid = Math.floor(validPrices.length / 2);
  return validPrices.length % 2 !== 0 
    ? validPrices[mid] 
    : (validPrices[mid - 1] + validPrices[mid]) / 2;
}
