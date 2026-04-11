import { NextResponse } from "next/server";
import { syncStoreVariants } from "@/lib/shopify";

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
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
