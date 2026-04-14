import { scrapePokepris, scrapePokevarsler, scrapeOutland } from "./adapters";
import { logger } from "../logger";

export interface ScraperResult {
  source: string;
  price: number;
  inStock: boolean;
  url: string;
}

/**
 * Aggregates prices from multiple Norwegian retailers using real scrapers.
 */
export async function scrapeNorwegianPrices(skuOrName: string): Promise<ScraperResult[]> {
  const results: ScraperResult[] = [];
  
  try {
    // Parallel scraping for efficiency
    const [pp, pv, ol] = await Promise.all([
      scrapePokepris(skuOrName),
      scrapePokevarsler(skuOrName),
      scrapeOutland(skuOrName)
    ]);

    const allScraped = [...pp, ...pv, ...ol];

    allScraped.forEach(item => {
      results.push({
        source: item.source,
        price: item.price,
        inStock: item.stockStatus === "IN_STOCK",
        url: "" // adapters.ts currently doesn't return URL for all, would need extension
      });
    });

  } catch (err) {
    logger.error({ skuOrName, err }, "Scraper aggregation error");
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
  
  const mid = Math.floor(validPrices.length / 2);
  return validPrices.length % 2 !== 0 
    ? validPrices[mid] 
    : (validPrices[mid - 1] + validPrices[mid]) / 2;
}
