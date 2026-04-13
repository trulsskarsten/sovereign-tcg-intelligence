# Sovereign TCG Intelligence

Sovereign TCG Intelligence is a premium Shopify B2B SaaS platform specifically designed for Norwegian Pokémon TCG retailers. It provides an automated command center for inventory management, pricing intelligence, and market data automation. The app helps merchants maintain competitive pricing by scraping Norwegian market leaders (Pokepris, Pokevarsler, Outland) and European market trends (Cardmarket), calculating optimal pricing based on weighted average costs (WAC) and store-defined profit floors.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Shopify**: Admin API (GraphQL), App Bridge, Managed Installation
- **Jobs & Rate Limiting**: Upstash Redis (Ratelimit) & QStash
- **Infrastructure**: Vercel

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd shopify-plugin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the project root. Refer to the **Environment Variables** section below for the required keys.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Tunneling (Optional)**:
   Since this is a Shopify Embedded App, you may need a tunnel (like Cloudflare Tunnel or ngrok) to expose your local server to the Shopify Admin if testing live webhooks/auth.

## Environment Variables

The following variables must be configured in `.env.local`:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g., `https://omxqbognenqzeeiazjzy.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for admin operations).

### Shopify
- `SHOPIFY_SHOP_NAME`: Your development store (e.g., `pokemon-butikken-2.myshopify.com`).
- `SHOPIFY_CLIENT_ID`: Client ID from the Shopify Partner Dashboard.
- `SHOPIFY_CLIENT_SECRET`: Client Secret from the Shopify Partner Dashboard.
- `SHOPIFY_DRY_RUN`: Set to `true` to log price changes instead of executing them.
- `SHOPIFY_BILLING_TEST_MODE`: Set to `true` to use Shopify's test billing charges.

### Discord Webhooks
- `DISCORD_WEBHOOK_BUSINESS`: Webhook URL for business alerts (sales, syncs).
- `DISCORD_WEBHOOK_TECH`: Webhook URL for technical alerts (errors, scrapers).
- `DISCORD_SUPPORT_WEBHOOK`: Webhook URL for user feedback submissions.

### Upstash & QStash
- `UPSTASH_REDIS_REST_URL`: Upstash Redis REST URL (for rate limiting).
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis REST Token.
- `QSTASH_TOKEN`: Upstash QStash Token (for background jobs).
- `QSTASH_CURRENT_SIGNING_KEY`: QStash signing key for webhook verification.

### Business Logic
- `NEXT_PUBLIC_APP_URL`: The base URL where the app is hosted (e.g., `https://your-app.vercel.app`).
- `PRICE_AUTO_UPDATE`: Set to `true` to enable automatic execution of approved staged updates.
- `WAC_AUTO_UPDATE`: Set to `true` to automatically sync inventory levels after purchase registration.

## Testing

The project uses **Vitest** for unit and integration testing.

```bash
npx vitest run
```

Current test suite covers pricing logic, scrapers, automation guardrails, and inventory sync workflows.

## Deployment

1. **Vercel**: Push your code to a GitHub repository connected to Vercel. Configure all environment variables in the Vercel Dashboard.
2. **Shopify**: Run the following command to sync your `shopify.app.toml` configuration with the Partner Dashboard:
   ```bash
   shopify app deploy
   ```
3. **Webhooks**: Register webhooks by triggering the `/api/webhooks/register` endpoint for each shop after installation.

## Project Structure

- `src/app/api/`: All API routes (auth, inventory, stats, webhooks, billing).
- `src/app/hub/`: Admin and operational pages (staging, compliance, support).
- `src/components/dashboard/widgets/`: Modular bento widgets for the main dashboard.
- `src/lib/`: Core business logic (pricing engine, Shopify client, scrapers, automation).
- `src/test/`: Test setup and MSW handlers.
- `scripts/`: SQL migrations and pre-flight security scripts.
