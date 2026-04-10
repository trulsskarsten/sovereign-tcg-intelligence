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
  const url = `https://www.pokepris.no/?q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results: ScrapedProduct[] = [];
    
    // Select product cards based on research
    $("div.product-card, div[class*='product']").each((_, el) => {
      const name = $(el).find("h3, .title").text().trim();
      const priceText = $(el).find("span:contains('kr')").text().trim();
      const stockText = $(el).text();
      
      if (name && priceText) {
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
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
  } catch (err) {
    console.error("Pokepris scrap error:", err);
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
  } catch (err) {
    console.error("Pokevarsler scrap error:", err);
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
  
  // Simple mean calculation
  const sorted = [...prices].sort((a, b) => a - b);
  const mean = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 
    : sorted[Math.floor(sorted.length / 2)];

  return { lowest, highest, average, mean, count: prices.length };
}
