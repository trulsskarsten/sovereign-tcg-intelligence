import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { encrypt } from "@/lib/auth/encrypt";
import { logger } from "@/lib/logger";

/**
 * Shopify Token Exchange (OAuth v2 Managed Installation)
 * Ref: https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange
 */
export async function POST(req: NextRequest) {
  // LOUD DIAGNOSTIC LOG (visible in Vercel logs)
  console.log("[DEBUG] Token exchange route hit at", new Date().toISOString());

  try {
    const body = await req.json();
    let { sessionToken, shop } = body;

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
    // Grant Type for managed install: urn:ietf:params:oauth:grant-type:token-exchange
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: sessionToken,
        subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
        requested_token_type: 'urn:ietf:params:oauth:token-type:offline_access_token',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error({ data, shop }, "Shopify Token Exchange failed");
      return NextResponse.json({ error: "Token exchange failed", details: data }, { status: 500 });
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
    const message = err instanceof Error ? err.message : "Kunne ikke fullføre registrering";
    logger.error({ err }, "Token exchange route error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
