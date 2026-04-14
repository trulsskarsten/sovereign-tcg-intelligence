import { logger } from "../logger";
import * as cheerio from "cheerio";

export interface ScrapedProduct {
  name: string;
  price: number;
  source: string;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
}

/**
 * Scraper for Pokepris.no
 */
export async function scrapePokepris(query: string): Promise<ScrapedProduct[]> {
  const baseUrl = `https://www.pokepris.no/?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(baseUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    const results: ScrapedProduct[] = [];

    // Select product cards based on reconnaissance (div.group is the wrapper)
    $("div.group").each((_, el) => {
      const name = $(el).find("h3").text().trim();
      // Price is in a span, often contains 'kr' or ',-'
      const priceText = $(el).find("span").filter((_, span) => {
        const text = $(span).text();
        return text.includes("kr") || text.includes(",-");
      }).first().text().trim();

      const urlSuffix = $(el).find("a").attr("href");
      const productUrl = urlSuffix ? (urlSuffix.startsWith("http") ? urlSuffix : `https://www.pokepris.no${urlSuffix}`) : "";
      
      const stockText = $(el).text();

      if (name && priceText) {
        // Handle Norwegian price format: 339.00 kr or 339.00,-
        const price = parseFloat(priceText.replace(/[^\d,.]/g, "").replace(",", "."));
        const stockStatus = stockText.includes("Utsolgt") ? "OUT_OF_STOCK" : "IN_STOCK";

        results.push({
          name,
          price,
          source: "pokepris.no",
          stockStatus
        });
      }
    });
    
    return results;
  } catch (err: unknown) {
    logger.error({ query, err }, "Pokepris scrap error");
    return [];
  }
}

/**
 * Scraper for Pokevarsler.no
 */
export async function scrapePokevarsler(query: string): Promise<ScrapedProduct[]> {
  const url = `https://pokevarsler.no/produkter?search=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results: ScrapedProduct[] = [];
    
    // Select each product link/card
    $("a.card-name").each((_, el) => {
      const name = $(el).text().trim();
      
      // Pokevarsler lists multiple stores per product card
      // We need to find the specific store row that is NOT empty (tomt)
      const card = $(el).closest(".card-container");
      const firstInStockRow = card.find(".store-row:not(.store-row-tomt)").first();
      
      const priceText = firstInStockRow.find("span:nth-child(2)").text().trim();
      
      if (name && priceText) {
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
        results.push({
          name,
          price,
          source: "pokevarsler.no",
          stockStatus: "IN_STOCK"
        });
      }
    });
    
    return results;
  } catch (err: unknown) {
    logger.error({ query, err }, "Pokevarsler scrap error");
    return [];
  }
}

/**
 * Scraper for Outland.no
 */
export async function scrapeOutland(query: string): Promise<ScrapedProduct[]> {
  const url = `https://www.outland.no/catalogsearch/result/?q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results: ScrapedProduct[] = [];
    
    // Outland uses .product-item-info for their product cards
    $(".product-item-info").each((_, el) => {
      const name = $(el).find(".product-item-link").text().trim();
      const priceText = $(el).find(".price").first().text().trim();
      const isOutOfStock = $(el).find(".stock.unavailable").length > 0;
      
      if (name && priceText) {
        // Handle Norwegian price format (e.g., 499,00 kr)
        const price = parseFloat(priceText.replace(/[^\d,]/g, "").replace(",", "."));
        
        results.push({
          name,
          price,
          source: "outland.no",
          stockStatus: isOutOfStock ? "OUT_OF_STOCK" : "IN_STOCK"
        });
      }
    });
    
    return results;
  } catch (err: unknown) {
    logger.error({ query, err }, "Outland scrap error");
    return [];
  }
}

/**
 * Consensus logic to calculate Market stats from multiple sources
 */
export function calculateConsensus(allResults: ScrapedProduct[]) {
  if (allResults.length === 0) return null;
  
  const inStock = allResults.filter(r => r.stockStatus === "IN_STOCK");
  if (inStock.length === 0) return null;
  
  const prices = inStock.map(r => r.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  // Simple median calculation
  const sorted = [...prices].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 
    : sorted[Math.floor(sorted.length / 2)];

  return { lowest, highest, average, median, count: prices.length };
}
