import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { shopifyQuery } from "@/lib/shopify";
import { logger } from "@/lib/logger";

const WEBHOOK_TOPICS = [
  { topic: "PRODUCTS_UPDATE", callbackUrl: "/api/webhooks/shopify" },
  { topic: "INVENTORY_LEVELS_UPDATE", callbackUrl: "/api/webhooks/shopify" },
  { topic: "APP_UNINSTALLED", callbackUrl: "/api/webhooks/shopify/uninstalled" },
  // Mandatory GDPR webhooks — required for Shopify App Store compliance
  { topic: "CUSTOMERS_REDACT", callbackUrl: "/api/webhooks/gdpr/customer-redact" },
  { topic: "SHOP_REDACT", callbackUrl: "/api/webhooks/gdpr/shop-redact" },
  { topic: "CUSTOMERS_DATA_REQUEST", callbackUrl: "/api/webhooks/gdpr/customer-redact" },
];

/**
 * POST /api/webhooks/register
 * Programmatically registers required Shopify webhooks for a store.
 * Called after successful install/auth.
 */
export const POST = withAuth(async (req: NextRequest, { shop_domain }) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    logger.error({ shop_domain }, "NEXT_PUBLIC_APP_URL not configured — cannot register webhooks");
    return NextResponse.json({ error: "App URL ikke konfigurert" }, { status: 500 });
  }
  const results: Array<{ topic: string; success: boolean; error?: string }> = [];

  for (const webhook of WEBHOOK_TOPICS) {
    const mutation = `
      mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $address: URL!) {
        webhookSubscriptionCreate(
          topic: $topic
          webhookSubscription: { callbackUrl: $address, format: JSON }
        ) {
          userErrors { field message }
          webhookSubscription { id }
        }
      }
    `;

    try {
      const result = await shopifyQuery(shop_domain, mutation, {
        topic: webhook.topic,
        address: `${appUrl}${webhook.callbackUrl}`,
      });

      const userErrors = result?.data?.webhookSubscriptionCreate?.userErrors;
      if (userErrors && userErrors.length > 0) {
        // Ignore "already registered" errors
        const nonDupeErrors = userErrors.filter(
          (e: Record<string, unknown>) => !(e as { message: string }).message.toLowerCase().includes("already")
        );
        if (nonDupeErrors.length > 0) {
          results.push({ topic: webhook.topic, success: false, error: nonDupeErrors[0].message });
          continue;
        }
      }

      results.push({ topic: webhook.topic, success: true });
      logger.info({ shop_domain, topic: webhook.topic }, "Webhook registered");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Internal Server Error";
      results.push({ topic: webhook.topic, success: false, error: message });
      logger.error({ err, shop_domain, topic: webhook.topic }, "Webhook registration failed");
    }
  }

  const allSuccessful = results.every(r => r.success);
  return NextResponse.json({ success: allSuccessful, webhooks: results });
});
