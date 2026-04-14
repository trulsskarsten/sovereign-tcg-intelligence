import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { updateProductPrice } from "@/lib/shopify";

/**
 * POST /api/staged-updates/execute
 * Executes all 'approved' staged updates.
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain, store_id }) => {
  try {
    // 1. Fetch all approved updates for this store
    const { data: approvedUpdates, error: fetchError } = await supabaseAdmin
      .from('staged_updates')
      .select('*')
      .eq('store_id', store_id)
      .eq('status', 'approved');

    if (fetchError) throw fetchError;

    if (!approvedUpdates || approvedUpdates.length === 0) {
      return NextResponse.json({ success: true, message: "Ingen godkjente endringer å utføre." });
    }

    const results = {
      success: 0,
      failed: 0,
      dryRun: 0,
    };

    logger.info({ shop_domain, count: approvedUpdates.length }, "Starting execution of staged updates");

    // 2. Process each update
    for (const update of approvedUpdates) {
      try {
        if (update.field_name === 'price') {
          const currentPrice = parseFloat(update.original_value || "0");
          const newPrice = parseFloat(update.suggested_value);

          const shopifyResult = await updateProductPrice(
            shop_domain,
            update.product_id, // This is variantId in shopify.ts context
            newPrice,
            currentPrice,
            true // Already approved in previous step
          );

          if (shopifyResult.dryRun) {
            results.dryRun++;
          } else {
            // Log to price_history using fields from migrate-audit.sql
            await supabaseAdmin.from('price_history').insert({
              variant_id: update.product_id,
              old_price_net: currentPrice,
              new_price_net: newPrice,
              old_price_gross: currentPrice * 1.25, // Fallback calculation
              new_price_gross: newPrice * 1.25,
              source: 'staged_execution',
              reason: update.reason || 'Staged execution'
            });
            results.success++;
          }
        }

        // 3. Mark as executed
        await supabaseAdmin
          .from('staged_updates')
          .update({ status: 'executed', updated_at: new Date().toISOString() })
          .eq('id', update.id);

      } catch (err: unknown) {
        logger.error({ err, updateId: update.id, shop_domain }, "Failed to execute specific update");
        results.failed++;
      }
    }

    // 4. Log to audit_logs
    await supabaseAdmin.from('audit_logs').insert({
      store_id,
      action: 'EXECUTE_STAGED_UPDATES',
      entity_type: 'STAGED_UPDATE',
      details: results,
      severity: 'info'
    });

    return NextResponse.json({
      success: true,
      execution_results: results,
      message: `Fullført: ${results.success} utført, ${results.dryRun} dry-run, ${results.failed} feilet.`
    });

  } catch (err: unknown) {
    logger.error({ err, shop_domain }, "Global execution error");
    return NextResponse.json({ error: "Klarte ikke å utføre oppdateringer" }, { status: 500 });
  }
});
