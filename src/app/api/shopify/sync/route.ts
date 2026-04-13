import { NextResponse } from "next/server";
import { syncStoreVariants } from "@/lib/shopify";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const shopDomain = process.env.SHOPIFY_SHOP_NAME;
    if (!shopDomain) throw new Error("Missing shop domain");

    const result = await syncStoreVariants(shopDomain);
    
    return NextResponse.json({ 
      success: true, 
      synced: result.totalSynced,
      message: `${result.totalSynced} variabler synkronisert.`
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sync Error";
    logger.error({ error }, "Sync Error");
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
