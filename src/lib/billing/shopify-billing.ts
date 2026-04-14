/**
 * Shopify Billing & Monetization
 * 
 * Implementing tiered subscriptions for the B2B SaaS model.
 */

export const BILLING_PLANS = {
  HOBBYIST: {
    name: "Hobbyist (Free)",
    price: 0,
    limit: 100, // 100 variants
    features: ["Daglig synk", "Basis Staging", "Discord Varsler"]
  },
  PRO: {
    name: "Pro Merchant",
    price: 249, // NOK per month
    limit: 5000,
    features: ["Sanntid prissjekk", "Avansert Spread Analyse", "Prioritert Sync", "Ubegrenset Staging"]
  },
  ENTERPRISE: {
    name: "Enterprise Wholesaler",
    price: 999,
    limit: 50000,
    features: ["Custom Webhooks", "API Tilgang", "Dedi-sync motor", "Ekspertrådgivning"]
  }
};

/**
 * Generates the GraphQL mutation for creating a recurring charge.
 * NOTE: currencyCode NOK is a GraphQL enum value — no quotes per spec.
 * test mode is driven by SHOPIFY_BILLING_TEST_MODE env var (defaults true for safety).
 */
export function generateSubscriptionMutation(planName: string, shop: string, returnUrl: string) {
  const plan = Object.values(BILLING_PLANS).find(p => p.name === planName) || BILLING_PLANS.PRO;
  const isTestMode = process.env.SHOPIFY_BILLING_TEST_MODE !== 'false';

  return `
    mutation appSubscriptionCreate {
      appSubscriptionCreate(
        name: "${plan.name}",
        returnUrl: "${returnUrl}",
        test: ${isTestMode},
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: "${plan.price.toFixed(2)}", currencyCode: NOK }
                interval: EVERY_30_DAYS
              }
            }
          }
        ]
      ) {
        userErrors { field message }
        confirmationUrl
        appSubscription { id }
      }
    }
  `;
}
