import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeNorwegianPrices } from "@/lib/scrapers/norway";
import { CardmarketClient } from "@/lib/scrapers/cardmarket";
import { sendDiscordAlert } from "@/lib/discord";
import { logger } from "@/lib/logger";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cmClient = new CardmarketClient();

/**
 * CRON: Triggers market scraping for high-priority items.
 */
export async function POST(req: Request) {
  // 1. Auth check (Vercel Cron / QStash)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Identify focus items (Top Class A/B items)
    const { data: items, error: fetchError } = await supabase
      .from("inventory")
      .select("sku, title, id")
      .or('abc_class.eq.A,abc_class.eq.B')
      .limit(10); 

    if (fetchError) throw fetchError;
    if (!items || items.length === 0) {
      return NextResponse.json({ message: "No priority items to scrape" });
    }

    let successCount = 0;
    let failureCount = 0;

    // 3. Sequential scraping
    for (const item of items) {
      try {
        const query = item.sku || item.title;
        
        // Parallel fetch for Norway and EU
        const [noPrices, euPrices] = await Promise.all([
          scrapeNorwegianPrices(query),
          cmClient.getPriceGuide(query)
        ]);
        
        const updates = [];

        // Add Norwegian prices
        if (noPrices.length > 0) {
          updates.push(...noPrices.map(p => ({
            sku: item.sku || item.title,
            source: p.source,
            price: p.price,
            in_stock: p.inStock,
            url: p.url,
            created_at: new Date().toISOString()
          })));
        }

        // Add Cardmarket price guide
        if (euPrices) {
          updates.push({
            sku: item.sku || item.title,
            source: "cardmarket",
            price: euPrices.avgSellPrice,
            in_stock: true,
            metadata: { 
              low: euPrices.lowPrice, 
              trend: euPrices.trendPrice,
              idProduct: euPrices.idProduct
            },
            created_at: new Date().toISOString()
          });
        }

        if (updates.length > 0) {
          const { error: upsertError } = await supabase
            .from("market_prices")
            .insert(updates);
          
          if (upsertError) throw upsertError;
          successCount++;
        } else {
          failureCount++;
        }
      } catch (err: unknown) {
        logger.error({ sku: item.sku, err }, "Individual scrape error");
        failureCount++;
      }
    }

    // 4. Health Check Alerting
    if (successCount === 0 && items.length > 0) {
      await sendDiscordAlert(
        `Scraper Health Critical: 0/10 items successfully scraped for market data. Potential IP block or selector drift.`,
        "ERROR"
      );
    } else if (failureCount > successCount) {
       await sendDiscordAlert(
        `Scraper Degradation: ${failureCount} failures vs ${successCount} successes in recent run.`,
        "WARNING"
      );
    }

    return NextResponse.json({
      success: true,
      processed: items.length,
      successCount,
      failureCount
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Scraping Cron Error";
    logger.error({ err }, "Scraping Cron Error");
    await sendDiscordAlert(`Scraping Cron Failure: ${message}`, "ERROR");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
