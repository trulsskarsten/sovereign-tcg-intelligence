import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { encrypt } from "@/lib/auth/encrypt";
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

/**
 * Shopify Token Exchange (OAuth v2 Managed Installation)
 * Ref: https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange
 */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}

export async function POST(req: NextRequest) {
  // LOUD DIAGNOSTIC LOG (visible in Vercel logs)
  console.log("[DEBUG] Token exchange route hit at", new Date().toISOString());

  // [ULTRA DIAGNOSTIC] Check Environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      error: `[DATABASE-CONFIG-MISSING] Supabase keys are missing in environment. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}` 
    }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { sessionToken, shop: rawShop } = body;
    let shop = rawShop;

    // If shop is missing, extract it from the session token (JWT payload 'dest')
    if (!shop && sessionToken) {
      try {
        const payloadB64 = sessionToken.split('.')[1];
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
        shop = new URL(payload.dest).hostname;
      } catch (e) {
        logger.error({ e }, "Failed to extract shop from session token");
      }
    }

    // DIAGNOSTIC LOG: Confirm the API is reached (safely)
    try {
      await supabaseAdmin.from('audit_logs').insert({
        action: 'DIAGNOSTIC',
        message: `Token exchange hit for ${shop || 'unknown shop'}`,
        payload: { shop, hasToken: !!sessionToken }
      });
    } catch (dbErr) {
      console.warn("[DEBUG] Diagnostic log failed (Database likely down):", dbErr);
    }

    if (!sessionToken || !shop) {
      return NextResponse.json({ error: "Missing sessionToken or shop" }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Missing Shopify API credentials in environment");
    }

    // 1. Exchange Session Token for Access Token
    const shopifyUrl = `https://${shop}/admin/oauth/access_token`;
    console.log(`[SERVER-DEBUG] Exchanging token with Shopify at: ${shopifyUrl}`);

    let shopifyResponse;
    try {
      shopifyResponse = await fetch(shopifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          subject_token: sessionToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
          requested_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
        }),
      });
    } catch (fetchErr: unknown) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      throw new Error(`Klarte ikke å kontakte Shopify (${shop}): ${msg}`);
    }

    const responseText = await shopifyResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      throw new Error(`Shopify returnerte HTML istedenfor JSON (Status ${shopifyResponse.status}). Dette betyr vanligvis at appen ikke er riktig installert eller at domenet er feil. Preview: ${responseText.substring(0, 150).replace(/</g, '&lt;')}...`);
    }

    if (!shopifyResponse.ok) {
      logger.error({ data, shop }, "Shopify Token Exchange failed");
      return NextResponse.json({ 
        error: `Shopify avviste forespørselen: ${data.error_description || data.error || 'Ukjent feil'}`,
        details: data 
      }, { status: shopifyResponse.status });
    }

    const accessToken = data.access_token;
    const encryptedToken = encrypt(accessToken);

    // 2. Upsert Store details in Supabase
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .upsert({
        shop_domain: shop,
        access_token: encryptedToken,
        is_active: true,
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'shop_domain'
      })
      .select()
      .single();

    if (storeError) {
      logger.error({ storeError, shop }, "Failed to save store to database");
      throw storeError;
    }

    logger.info({ shop, store_id: store.id }, "Successfully exchanged token and registered store");

    return NextResponse.json({ 
      success: true, 
      store_id: store.id 
    });

  } catch (err: unknown) {
    // UNMASK ERROR: Ensure we see the real message even if it's not a standard Error instance
    const message = err instanceof Error ? err.message : (typeof err === 'object' ? JSON.stringify(err) : String(err));

    logger.error({ err }, "Token exchange route error");
    console.error("[SERVER-DEBUG] Token exchange fatal error:", message);

    return NextResponse.json({ 
      error: message === '{}' ? "Ukjent serverfeil (tomt feilobjekt)" : message 
    }, { status: 500 });
  }
}
