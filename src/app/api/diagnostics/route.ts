import { NextResponse } from "next/server";
import { shopifyQuery } from "@/lib/shopify";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const shopifyStatus = { ok: false, message: "", details: {} };
  const supabaseStatus = { ok: false, message: "", details: {} };

  // 1. Test Shopify
  try {
    const data = await shopifyQuery(`{ shop { name myshopifyDomain } }`);
    shopifyStatus.ok = true;
    shopifyStatus.message = "Tilkoblet!";
    shopifyStatus.details = data.data.shop;
  } catch (err: any) {
    shopifyStatus.ok = false;
    shopifyStatus.message = "Feil ved tilkobling";
    shopifyStatus.details = { error: err.message };
  }

  // 2. Test Supabase
  try {
    const { data, error } = await supabaseAdmin.from("inventory").select("count").limit(1);
    if (error) throw error;
    supabaseStatus.ok = true;
    supabaseStatus.message = "Database klar!";
    supabaseStatus.details = { count: data.length };
  } catch (err: any) {
    supabaseStatus.ok = false;
    supabaseStatus.message = "Databasefeil (Sjekk tabell-oppsett)";
    supabaseStatus.details = { error: err.message };
  }

  return NextResponse.json({
    shopify: shopifyStatus,
    supabase: supabaseStatus,
    timestamp: new Date().toISOString(),
    env: {
      shopName: process.env.SHOPIFY_SHOP_NAME,
      dryRun: process.env.SHOPIFY_DRY_RUN,
    }
  });
}
