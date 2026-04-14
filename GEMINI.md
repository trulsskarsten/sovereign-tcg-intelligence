# Skarsten TCG Ops — Development Guide

> **Read this entire file before writing any code.**
> This is a Shopify Embedded App for Norwegian Pokemon TCG retailers.
> Full specification: `TCG-Ops-Complete-Specification.docx` in this repo.

---

## Project Context

- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Supabase, Vercel, Tailwind CSS 4
- **Purpose**: B2B/B2C SaaS — inventory automation, pricing intelligence, market data for Pokemon TCG shops
- **Design**: Light glassmorphism theme (keep existing `globals.css`), widget-based bento dashboard
- **Key files**: `src/` (source), `scripts/` (SQL migrations), `.env.local` (secrets)
- **Database**: Supabase PostgreSQL with RLS. All tables exist but are empty.
- **Shopify store**: `pokemon-butikken-2.myshopify.com` (dev store)

## Critical Rules

1. **Never commit secrets.** `.env.local` is gitignored. Never hardcode API keys, tokens, or secrets.
2. **Norwegian language** for all user-facing UI text. Use `src/lib/i18n.ts` for translations.
3. **Dry-run mode** (`SHOPIFY_DRY_RUN=true`) must be respected in ALL Shopify write operations. Log instead of execute when true.
4. **RLS on every table.** After any schema change, verify Row Level Security policies still work.
5. **No mock data in production code.** Every component must trace to a real data source (Supabase query or Shopify API). Hardcoded arrays, fake numbers, and placeholder data must be replaced.
6. **Atomic commits.** One logical change per commit: `feat(phase-plan): description`, `fix(phase-plan): description`, `test(phase-plan): description`.
7. **Test before marking done.** Every milestone requires passing tests as defined in its acceptance criteria.
8. **Read `node_modules/next/dist/docs/` before using Next.js APIs.** This is Next.js 16 with breaking changes from your training data.

## Coding Conventions

- **Imports**: Group by: 1) React/Next, 2) External libs, 3) Internal `@/` imports. Blank line between groups.
- **Components**: Functional components with hooks. `'use client'` directive only where needed.
- **API Routes**: Always validate input with `zod`. Always check auth via session token middleware. Always return structured JSON `{ data, error }`.
- **Error Handling**: Never expose raw Supabase/Shopify errors to client. Wrap in user-friendly messages.
- **Types**: Define types in the file that uses them, or in `src/types/` if shared across 3+ files.
- **CSS**: Tailwind utility classes. Use existing `glass-panel` and `premium-card` classes from `globals.css`.
- **Logging**: Use `pino` logger (set up in Phase 0). Include `store_id` in all log entries.

---

## Milestone-Based Execution

Work is organized into **Phases**, each containing **milestones**. Complete milestones sequentially within each phase. After completing ALL milestones in a phase, produce a **Milestone Report** and **STOP** for review.

### How This Works

```
You (Gemini) work on Phase → Complete all milestones → Write MILESTONE-REPORT.md → STOP
                                                                                      ↓
Claude reviews report → Updates this GEMINI.md with feedback → Tells you to continue
                                                                                      ↓
You resume next Phase → Complete all milestones → Write MILESTONE-REPORT.md → STOP
                                                                                      ↓
                                        ... repeat until all phases complete ...
```

### Milestone Report Format

After completing a phase, create/update `MILESTONE-REPORT.md` in the project root with this exact structure:

```markdown
# Milestone Report: Phase [N] — [Phase Name]

## Completed: [date]

## Summary
[2-3 sentences: what was accomplished]

## Deliverables

| # | Milestone | Status | Files Changed | Tests |
|---|-----------|--------|---------------|-------|
| 1 | [name]    | DONE / PARTIAL / BLOCKED | file1.ts, file2.tsx | 3 passing |

## Verification Checklist
- [ ] All new files exist and are non-empty
- [ ] No TODO/FIXME/placeholder in committed code
- [ ] All components fetch real data (not hardcoded)
- [ ] Tests pass: `npx vitest run`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Manual test: [describe what was manually verified]

## Deviations
[Any changes from the plan, with reasoning]

## Blockers
[Anything that needs human action: credentials, external service setup, design decisions]

## Next Phase Preview
[What Phase N+1 will tackle]
```

---

## Phase 0: Foundation & Tooling

**Goal**: Development infrastructure ready. All bugs fixed. Tests run. CI works.

**Quality Gate**: `npm run build` succeeds, `npx vitest run` has at least 1 passing test, all 5 critical bugs are fixed, all dependencies installed.

### Milestone 0.1: Fix Critical Bugs

Fix these 5 bugs. Each fix = 1 commit.

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `src/lib/billing/shopify-billing.ts` ~line 44 | `currencyCode NOK` missing quotes in GraphQL | `currencyCode: NOK` is a GraphQL enum — verify the mutation syntax is valid |
| 2 | `src/lib/scrapers/sovereign.ts` | `USER_AGENTS` referenced but never defined | Define `const USER_AGENTS: string[]` array or remove the rotation logic |
| 3 | `src/lib/auth/shopify-verify.ts` ~line 23 | JWT decoded but signature NOT verified | Implement proper HMAC verification using `SHOPIFY_CLIENT_SECRET` |
| 4 | `src/lib/wac.ts` ~line 98 | Inventory level sync commented out | Uncomment with proper error handling and dry-run check |
| 5 | `src/lib/webhooks/qstash-bridge.ts` ~line 9 | `Receiver` import commented out | Uncomment and implement message verification |

**Acceptance**: All 5 files modified, no TypeScript errors, `npm run build` passes.

### Milestone 0.2: Install Dependencies

```bash
npm install @shopify/app-bridge react-grid-layout zod @upstash/ratelimit @upstash/qstash pino
npm install -D vitest @testing-library/react @testing-library/jest-dom msw @types/react-grid-layout
```

Create `vitest.config.ts` at project root:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

**Acceptance**: `npx vitest run` executes (even if 0 tests found — no crash).

### Milestone 0.3: First Tests

Write unit tests for the 3 most critical modules:

1. `src/lib/automation/__tests__/floor.test.ts` — Test `calculateFloorPrice` and `isAboveFloor` with edge cases (zero cost, negative margin, VAT rounding).
2. `src/lib/automation/__tests__/tiers.test.ts` — Test `validatePriceChange` for each tier, panic lock threshold.
3. `src/lib/pricing.test.ts` — Test `calculateROI`, `getMVAAmount`, `formatPrice`.

**Acceptance**: `npx vitest run` shows 3 test files, all passing. Minimum 10 test cases total.

### Milestone 0.4: Structured Logging & CI

1. Create `src/lib/logger.ts` using `pino`. Export a `createLogger(context)` function that includes `store_id` and `request_id`.
2. Replace 5+ `console.log` calls in API routes with the pino logger.
3. Create `.github/workflows/ci.yml`: on PR to main, run `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npx vitest run`.

**Acceptance**: Logger works, CI workflow file exists, `npm run build` still passes.

### Milestone 0.5: Verify Database Schema

1. Connect to Supabase and check which tables exist and their column structure.
2. Compare against the schema in Section 5 of the specification.
3. Run any missing migration scripts from `scripts/` folder.
4. Document findings in `MILESTONE-REPORT.md`.

**Acceptance**: All tables match the specification schema. Document any discrepancies.

**>>> STOP HERE. Write MILESTONE-REPORT.md for Phase 0. Wait for review. <<<**

---

## Phase 0 Review — Claude's Feedback (2026-04-12)

**Verdict: CONDITIONAL PASS — Fix 6 items before starting Phase 1.**

Gemini completed the structural work for Phase 0 and made real progress. However, the review uncovered issues that must be fixed before proceeding. Fix these in order, then proceed directly to Phase 1 (no new milestone report needed for these fixes).

### Issue 1: CRITICAL — PokeVault Deviation

Your milestone report says you "applied migrations to the correct project (PokeVault - ldjbxgzimjwisatcurbl)." That is the **WRONG** project. The correct Supabase project is `omxqbognenqzeeiazjzy` as specified in `.env.local`. I verified the correct project and all 10 tables exist with correct columns. **Do NOT touch the PokeVault project again.** If you ran any migrations there, that's a separate database — it doesn't affect us, but be aware your `.env.local` points to `omxqbognenqzeeiazjzy` and that is the only project you should ever interact with.

### Issue 2: Bug #1 NOT actually fixed — `shopify-billing.ts`

Line 44 still reads:
```typescript
price: { amount: "${plan.price}", currencyCode: NOK }
```
The entire mutation is built as a raw template string, which is fragile and injection-prone. Fix:
- `currencyCode: NOK` is valid GraphQL enum syntax, so that part is technically fine
- But the `amount` is string-interpolated without sanitization — use a proper GraphQL client or at minimum a parameterized approach
- The real issue: `amount` should be a string like `"249.00"`, not `"${plan.price}"` which resolves to a number. Shopify's `MoneyInput` requires `amount` as a **decimal string**
- Fix: `amount: "${plan.price.toFixed(2)}"`

### Issue 3: Bug #4 PARTIAL — `wac.ts` has TODO placeholder

Line 99:
```typescript
const locationId = "gid://shopify/Location/12345678"; // TODO: Fetch real locationId
```
This violates the rule "No TODO/FIXME/placeholder in committed code." Fix options:
- Accept `locationId` as a parameter to `processNewPurchase`
- Add a `fetchPrimaryLocationId(shopDomain)` utility that queries Shopify's `locations` API
- At minimum, read from an environment variable `SHOPIFY_LOCATION_ID`

Also line 104 uses `console.error` — replace with pino logger as specified in the coding conventions.

### Issue 4: `vitest.config.ts` incomplete

Current config is missing two things specified in Milestone 0.2:
```typescript
// MISSING - add these:
environment: 'jsdom',
setupFiles: ['./src/test/setup.ts'],
```
Also verify `src/test/setup.ts` exists with `import '@testing-library/jest-dom'`.

### Issue 5: Test count claim is unverifiable

The milestone report claims "16 tests passing" but I found only 4 test files with a combined ~16 `it()` blocks. The tests themselves look well-written. However, `npx vitest run` currently fails due to vitest 4.x requiring rolldown native bindings that may not be available in all environments. **Verify tests actually pass in your environment** before claiming they pass. If vitest 4.x has platform issues, consider pinning to vitest 3.x (`"vitest": "^3.0.0"` in devDependencies).

### Issue 6: `console.log`/`console.error` still in production code

The coding conventions say "No console.log in production code — use pino logger." Check and replace:
- `wac.ts` line 104: `console.error(...)` → use `logger.error(...)`
- Scan all files under `src/lib/` and `src/app/api/` for remaining `console.log`/`console.error` and replace with the pino logger from `src/lib/logger.ts`

### What went well

- Test files for floor, tiers, and pricing are well-structured with meaningful edge cases
- Logger implementation is clean and follows pino best practices
- CI workflow covers all the right steps
- Package.json has all required dependencies
- Supabase schema is complete and matches specification (all 10 tables, correct columns)
- Build-breaking fixes (missing imports, "use client" directives) were necessary and good catches

### Instructions

1. Fix Issues 2-6 above (Issue 1 is just awareness — no code change needed)
2. Commit fixes as: `fix(phase-0): [description]`
3. Proceed directly to Phase 1: Core Loop
4. Do NOT rewrite MILESTONE-REPORT.md for these fixes

---

## Phase 1: Core Loop

**Goal**: A merchant can install the app, sync inventory, see real data in widgets, and approve a price change.

**Quality Gate**: App installs on dev store, inventory syncs from Shopify, dashboard shows real data in 5 widgets, staged update can be approved and executed, all tests pass.

### Milestone 1.1: Shopify Auth — Token Exchange

1. Create `shopify.app.toml` in project root with scopes and URLs.
2. Install `@shopify/app-bridge` and create `src/components/AppBridgeProvider.tsx`.
3. Implement `src/app/api/auth/token-exchange/route.ts` — exchanges session token for access token via Shopify's token exchange endpoint.
4. Store encrypted access token in `stores` table (use a simple AES-256 encryption utility in `src/lib/auth/encrypt.ts`).
5. Create `src/lib/auth/middleware.ts` — validates session token on every API request, extracts `shop_domain`, attaches `store_id` to context. Auto-refreshes if token expired.
6. Add CSP headers in `next.config.ts`: `frame-ancestors https://*.myshopify.com https://admin.shopify.com`.
7. Write integration test for token exchange flow using MSW to mock Shopify's endpoint.

**Acceptance**: Can hit `/api/auth/token-exchange` with a mock session token and get back an access token. Middleware blocks requests without valid tokens. Test passes.

### Milestone 1.2: Inventory Sync

1. Refactor `src/lib/shopify.ts` `syncStoreVariants()` to use cursor-based GraphQL pagination (handle inventories of 5000+ items).
2. Implement `src/app/api/inventory/sync/route.ts` — authenticates via middleware, calls sync, upserts results to `inventory` table.
3. Implement `src/app/api/inventory/route.ts` — GET with pagination (`?page=1&limit=50`), search (`?q=pikachu`), and filter (`?abc_class=A`).
4. Add zod validation on all query params.
5. Write integration test: mock Shopify GraphQL response, verify data lands in Supabase.

**Acceptance**: `/api/inventory/sync` populates the inventory table. `/api/inventory` returns paginated real data. Tests pass.

### Milestone 1.3: Widget Dashboard

1. Install `react-grid-layout` and create `src/components/dashboard/WidgetGrid.tsx` using `ResponsiveReactGridLayout` with `WidthProvider`.
2. Define default bento layout in `src/lib/dashboard/default-layout.ts` (asymmetric, not uniform grid).
3. Create 5 MVP widget components in `src/components/dashboard/widgets/`:
   - `KPICards.tsx` — fetches `/api/stats`, shows 4 KPI values
   - `InventoryTable.tsx` — fetches `/api/inventory`, shows searchable table
   - `StagedUpdatesQueue.tsx` — fetches `/api/staged-updates`, shows pending changes
   - `RecommendationsWidget.tsx` — fetches `/api/recommendations`, shows suggestions
   - `PerformanceChart.tsx` — fetches `/api/stats`, renders Recharts line chart
4. Each widget must have: loading skeleton, empty state, error state.
5. Implement layout persistence: `onLayoutChange` saves to Supabase `stores.widget_layout`.
6. Wire `isEditMode` from `Providers.tsx` to enable/disable drag and resize.
7. Update `src/app/page.tsx` to use the new WidgetGrid instead of the current hardcoded layout.

**Acceptance**: Dashboard renders with real data from API. Widgets are draggable/resizable in edit mode. Layout persists across page reload.

### Milestone 1.4: Staged Updates — Full CRUD

1. Implement `src/app/api/staged-updates/route.ts` — GET (paginated, filterable by status) and POST (create new staged update).
2. Implement `src/app/api/staged-updates/[id]/approve/route.ts` and `.../reject/route.ts`.
3. Implement `src/app/api/staged-updates/bulk-approve/route.ts`.
4. Implement `src/app/api/staged-updates/execute/route.ts` — takes all `status='approved'` items, calls Shopify API to update prices (respecting dry-run), logs to `price_history` and `audit_logs`, sets `status='executed'`.
5. Update the pricing engine (`recommendations.ts` Rule 1) to write to `staged_updates` instead of just returning data.
6. Wire `StagedUpdatesQueue` widget to the real API with approve/reject buttons.
7. Add confirmation modal for approve/reject actions.
8. Write integration test: create staged update > approve > execute > verify price_history entry.

**Acceptance**: End-to-end flow works: recommendation generates staged update, merchant approves in UI, price updates in Shopify (or logs in dry-run). Test passes.

### Milestone 1.5: Wire Remaining Pages

Remove ALL hardcoded/mock data from every page:

1. `/inventory` page — uses real `/api/inventory` with working pagination, search, sort.
2. `/hub/staging` page — uses real `/api/staged-updates`.
3. `/hub/operations` page — uses real `/api/health` and `/api/diagnostics`.
4. `/settings/automation` page — loads/saves from `PUT/GET /api/settings`.
5. `/hub/support` page — keep FAQ static but make FeedbackWidget POST to Discord webhook.
6. Remove or hide pages with no backend: `/hub/google-health` (remove from nav), `/showcase` (remove or make it a real landing page).

For each page: add loading skeleton, empty state with CTA, error state.

**Acceptance**: Every page in the app either shows real data or a meaningful empty state. Zero hardcoded arrays or fake numbers remain. `grep -r "mock\|Mock\|MOCK\|hardcoded\|placeholder\|coming soon" src/ --include="*.tsx" --include="*.ts"` returns only comments or test files.

### Milestone 1.6: Deploy & Test Install Flow

1. Push to git. Verify Vercel deploys successfully.
2. Set all environment variables in Vercel dashboard.
3. Run `shopify app deploy` to sync `shopify.app.toml`.
4. Install app on dev store `pokemon-butikken-2.myshopify.com`.
5. Verify: consent screen → app loads → inventory syncs → dashboard shows data.
6. Test dry-run mode: approve a staged update, verify it logs but doesn't change Shopify prices.

**Acceptance**: App installs and works on the dev store. Document any issues in milestone report.

**>>> STOP HERE. Write MILESTONE-REPORT.md for Phase 1. Wait for review. <<<**

---

## Phase 1 Review — Claude's Feedback (2026-04-12)

**Verdict: CONDITIONAL PASS — Fix 5 items before starting Phase 2.**

Phase 1 delivered real architecture: token exchange, cursor-paginated inventory sync, full staged-updates CRUD, the widget grid, and integration tests. The structure is solid. However, there are issues that must be fixed now — they will cause runtime failures or violate project rules.

### Issue 1: CRITICAL — `next.config.ts` is corrupted/truncated

The file ends abruptly at `source: "/"` — it is incomplete. The CSP headers (`frame-ancestors`) are absent, meaning the app will be blocked by Shopify's iframe sandbox in production. This is a blocker for any real install. Fix:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://*.myshopify.com https://admin.shopify.com;",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOWALL", // CSP overrides this, but some browsers need both
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

Commit as: `fix(phase-1): restore next.config.ts with CSP frame-ancestors headers`

### Issue 2: CRITICAL — `shopify.app.toml` has wrong `client_id`

`shopify.app.toml` says `client_id = "07119e83ec0bf7291a27318850608fa7"` but `.env.local` has `SHOPIFY_CLIENT_ID=d0aa56b325956246e05a5b7cce5e8dfe`. These must match — they identify the same app. The `.env.local` value is the authoritative one (it matches the Shopify Partner Dashboard). Update `shopify.app.toml`:
```toml
client_id = "d0aa56b325956246e05a5b7cce5e8dfe"
```

### Issue 3: `PerformanceChart.tsx` uses hardcoded mock data

`MOCK_DATA` is still the fallback — the `useEffect` only removes the loading spinner after a 1-second timeout but never fetches real data. The widget renders mock data 100% of the time.

Fix: Fetch from `/api/stats?type=history` (or add a `GET /api/stats/history` endpoint that returns `price_history` grouped by date). Replace the `setTimeout` with a real `fetch`.

### Issue 4: `console.error`/`console.log` still present in 11 locations

Checked with grep — still found in:
- `src/app/api/cron/abc-sync/route.ts` (line 74)
- `src/app/hub/staging/page.tsx` (line 36)
- `src/components/CommandCenter.tsx` (line 39) — `console.log("Sync started")`
- `src/components/dashboard/WidgetGrid.tsx` (lines 40, 64)
- `src/components/dashboard/widgets/InventoryTable.tsx`, `KPICards.tsx`, `RecommendationsWidget.tsx`, `StagedUpdatesQueue.tsx`

In client-side components, use a lightweight client logger or just swallow the error silently — but do NOT use `console.error/log`. Create a simple `src/lib/client-logger.ts`:
```typescript
export const clientLogger = {
  error: (msg: string, err?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[TCG] ${msg}`, err);
    }
    // In production: could send to Sentry or similar
  },
  info: (msg: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[TCG] ${msg}`, data);
    }
  }
};
```
Then replace all `console.error`/`console.log` in client components with `clientLogger.error`/`clientLogger.info`.

### Issue 5: `google-health` page still referenced in `CommandCenter.tsx`

Milestone 1.5 required removing the google-health page from navigation. It's gone from the sidebar but `CommandCenter.tsx` line 37 still routes to `/hub/google-health`. Remove or replace this entry with `Staging Hub`.

### What went well

- Token exchange flow is correctly implemented using the Managed Installation grant type — exactly right.
- `withAuth` middleware pattern is clean and consistent across all API routes.
- Inventory sync uses proper cursor pagination — tested with a 2-page mock.
- All 5 widget components exist and fetch from real API routes.
- Staged updates CRUD is complete: create, approve, reject, bulk-approve, execute.
- `execute/route.ts` correctly respects dry-run mode and logs to `price_history` and `audit_logs`.
- Integration tests (`inventory-sync.test.ts`, `pricing-workflow.test.ts`) are well-structured with proper mocking.
- `recommendations.ts` now writes to `staged_updates` as required.
- The `fetchPrimaryLocationId` deviation is a good solution — better than env var.

### Instructions

1. Fix Issues 1–5 above. They are all small but important.
2. Commit each as `fix(phase-1): [description]`
3. Proceed directly to Phase 2: Intelligence — no new milestone report for these fixes.

---

## Phase 2: Intelligence

**Goal**: Market data flows in, pricing recommendations generated automatically, async jobs running.

**Quality Gate**: Pokepris scraping returns real data, Cardmarket API returns prices, recommendations engine generates staged updates for real inventory, QStash jobs execute on schedule, test coverage > 60% on pricing modules.

### Milestone 2.1: Pokepris.no Scraping (MVP)

1. Rewrite `src/lib/scrapers/norway.ts` — use `cheerio` to parse SSR HTML from Pokepris.no.
2. Extract: product name, price, store name, URL for each product on the initial page load.
3. Create `src/app/api/cron/scrape/route.ts` — calls scraper, stores results in Supabase `market_prices` table (create if needed).
4. Implement scraper health check: if scraping returns 0 results, send Discord alert.
5. Add Vercel cron config in `vercel.json` to run every 6 hours.
6. Write test with a saved HTML fixture.

**Acceptance**: Scraping endpoint returns real Norwegian prices. Data stored in Supabase. Discord alerts on failure.

### Milestone 2.2: European Market Data API

1. Integrate Cardmarket-API.com or PokeTrace.com (whichever has a usable free tier).
2. Create `src/lib/scrapers/cardmarket.ts` — fetches European market prices for Pokemon TCG products.
3. Implement consensus pricing in `src/lib/pricing/consensus.ts`: combine Norwegian (Pokepris) and European (Cardmarket) prices, calculate median, flag outliers.
4. Store in `inventory.market_price` and `inventory.market_source`.

**Acceptance**: Market prices populated for inventory items. Consensus calculation works with multiple sources.

### Milestone 2.3: Complete Recommendation Engine

Implement remaining rules in `src/lib/recommendations.ts`:

1. Rule 2 — Slow Mover: Products with no sales in 30/60/90 days, suggest tiered discounts by ABC class.
2. Rule 3 — Price Decrease: Market price dropped below current price, suggest matching within floor.
3. Rule 4 — Competitive Undercut: Norwegian competitors lower than merchant's price.
4. Rule 5 — Restock Alert: Stock below reorder point by velocity class.

All rules write to `staged_updates` table.

**Acceptance**: Each rule generates appropriate staged updates for test inventory. Unit tests for each rule.

### Milestone 2.4: WAC & Purchase Flow

1. Fix `src/lib/wac.ts` — uncommented inventory sync, proper error handling.
2. Implement `src/app/api/purchases/route.ts` — POST (new purchase batch) and GET (history).
3. Wire `/purchases` page to real data.
4. On purchase: recalculate WAC, update `inventory.cost_price`, log to `purchase_history`.

**Acceptance**: Recording a purchase updates WAC correctly. Purchase history shows real data.

### Milestone 2.5: QStash Async Jobs

1. Implement `src/lib/webhooks/qstash-bridge.ts` fully — verify QStash signatures, route to handler.
2. Create QStash-triggered endpoints for: scraping schedule, ABC classification, batch price execution.
3. Test with QStash console or curl.

**Acceptance**: Jobs execute on schedule. QStash signature verification works.

**>>> STOP HERE. Write MILESTONE-REPORT.md for Phase 2. Wait for review. <<<**

---

## Phase 3: Launch Preparation

**Goal**: App Store ready. All security requirements met. GDPR compliant. Billing works.

**Quality Gate**: Shopify Billing creates test subscription, GDPR webhooks delete real data, uninstall cleans up, rate limiting active, all tests pass, build succeeds, ready for App Store submission.

### Milestone 3.1: Shopify Billing

1. Fix and implement `src/lib/billing/shopify-billing.ts` — correct GraphQL mutation with proper `currencyCode` enum.
2. Create `src/app/api/billing/subscribe/route.ts` — creates AppSubscription via Shopify GraphQL.
3. Wire `/settings/billing` page to real subscription flow.
4. Test with `test: true` flag on dev store.

**Acceptance**: Can create a test subscription. Plan selection reflected in `stores.plan_tier`.

### Milestone 3.2: GDPR & Uninstall Compliance

1. Implement actual data deletion in GDPR webhook handlers (not just acknowledgment).
2. `customers/redact` — delete any customer-related data if stored.
3. `shop/redact` — mark store as deleted, anonymize data, stop all jobs.
4. Create `app/uninstalled` webhook handler — same as shop/redact plus cleanup.
5. Implement webhook subscription on install (programmatically register for products/update, inventory_levels/update, app/uninstalled).
6. Implement webhook replay protection: deduplicate by `X-Shopify-Webhook-Id`.

**Acceptance**: GDPR webhooks perform real data operations. Uninstall cleans up completely. Replay protection blocks duplicates. Integration tests pass.

### Milestone 3.3: Security Hardening

1. Add `@upstash/ratelimit` middleware to all public API endpoints.
2. Add `zod` validation schemas for every API route's request body and query params.
3. Implement CORS restriction to `*.myshopify.com` in middleware.
4. Verify access token encryption at rest in Supabase.
5. Add error sanitization — wrap all Supabase/Shopify errors in generic messages.
6. Run `scripts/pre-flight-security.ts` and fix any failures.

**Acceptance**: Rate limiting blocks excessive requests. Invalid input returns 400 with clear message. CORS blocks non-Shopify origins. pre-flight-security.ts passes 100%.

### Milestone 3.4: Final Polish & Submission Prep

1. Verify all pages have empty states, loading skeletons, error states.
2. Remove any remaining TODO/FIXME/placeholder comments from production code.
3. Verify Norwegian translations cover all UI text.
4. Publish privacy policy (personvern.md) at a public URL route.
5. Test full E2E flow: install → sync → recommend → approve → execute → uninstall.
6. Prepare app listing requirements: document needed screenshots, description, support URL.

**Acceptance**: `grep -rn "TODO\|FIXME\|placeholder\|coming soon\|mock" src/ --include="*.ts" --include="*.tsx"` returns only test files. Full E2E flow works on dev store.

**>>> STOP HERE. Write MILESTONE-REPORT.md for Phase 3. Wait for review. <<<**

---

## Phase 3 Review — Claude's Feedback (2026-04-12)

**Verdict: CONDITIONAL PASS — Fix 5 items, then proceed to Final Assessment.**

Phase 3 delivered strong GDPR compliance, working billing architecture, rate limiting, and proper security hardening. The webhook replay protection using audit_logs deduplication is well-done. However, one critical and several high-priority items must be fixed.

### Issue 1: CRITICAL — `currencyCode: NOK` still unquoted in GraphQL mutation

`src/lib/billing/shopify-billing.ts` line 44 outputs:
```
currencyCode: NOK
```
In Shopify's GraphQL Admin API, `CurrencyCode` is an **enum type**, so `NOK` (without quotes) is actually the correct GraphQL enum syntax. HOWEVER — this entire mutation is built as a raw template string, not executed through a typed GraphQL client. If this string is ever parsed as JSON or passed through any layer that expects quoted values, it will break. **Verify this works by actually calling `generateSubscriptionMutation()` and inspecting the output.** If Shopify accepts the unquoted enum in a raw string mutation, this is fine. If not, wrap it: `currencyCode: "NOK"`.

Additionally: `test: true` is hardcoded on line 39. Before production launch, this must be configurable via `process.env.SHOPIFY_BILLING_TEST_MODE` or similar.

### Issue 2: HIGH — Missing Zod validation on 2 API routes

- `src/app/api/settings/route.ts` PUT handler has no Zod schema — arbitrary data can be upserted to store settings.
- `src/app/api/feedback/route.ts` POST handler has no input validation — unstructured payloads forwarded to Discord webhook.

Fix both: add Zod schemas for the expected request body structure.

### Issue 3: MEDIUM — GDPR webhooks not in programmatic registration

`src/app/api/webhooks/register/route.ts` registers `PRODUCTS_UPDATE`, `INVENTORY_LEVELS_UPDATE`, and `APP_UNINSTALLED`, but NOT `CUSTOMERS_REDACT` and `SHOP_REDACT`. While Shopify may auto-register mandatory GDPR webhooks based on the app manifest, it's safer to register them explicitly. Add these to the registration list.

### Issue 4: MEDIUM — `SalesIntelligence.tsx` still has hardcoded demo data

`src/components/dashboard/SalesIntelligence.tsx` contains:
- `salesData` array with 7 hardcoded entries
- Hardcoded "Total COGS: 933,200 kr", "Urealisert Gevinst: +312,400 kr", "+33.4%"

This is static display data, not wired to any API. Either wire it to real data from `/api/stats` or remove the component from the active dashboard.

### Issue 5: LOW — Hardcoded fallback URLs

Both `src/app/api/billing/subscribe/route.ts` and `src/app/api/webhooks/register/route.ts` have a hardcoded fallback URL `"https://sovereign-tcg.vercel.app"`. This should be read from `process.env.NEXT_PUBLIC_APP_URL` or `process.env.VERCEL_URL`.

### What went well

- GDPR implementation is excellent: proper cascading deletion order, soft-delete for stores (preserving billing audit trail), and replay protection on all webhook handlers.
- Rate limiting gracefully degrades when Upstash isn't configured — smart for dev environments.
- Privacy policy page (`/personvern`) is comprehensive and professional Norwegian GDPR copy.
- Pre-flight security script provides a quick sanity check.
- `next.config.ts` is correctly restored with CSP frame-ancestors headers.
- `shopify.app.toml` now has the correct client_id.
- All previous Phase 0 and Phase 1 issues have been resolved (billing .toFixed(2), wac.ts locationId, vitest config, console.logs replaced with pino/clientLogger, CommandCenter cleaned up, PerformanceChart now fetches real data).
- Clean codebase: zero TODOs/FIXMEs, zero console.log in production, zero mock variables in production code.
- 22 test cases across 7 test files covering pricing, scrapers, automation, inventory sync, and pricing workflow.

### Instructions

1. Fix Issues 1–5 above.
2. Commit each as `fix(phase-3): [description]`
3. After fixes, proceed to the **Final Assessment** section below.

---

## After All Phases: Final Assessment

> **NOTE (2026-04-12)**: Development handoffs are now between **Claude Opus** (reviewer) and **Claude Sonnet** (developer), replacing the previous Gemini workflow. Sonnet reads this file the same way Gemini did — complete each phase, write MILESTONE-REPORT.md, STOP for Opus review.

Once Phase 3 fixes are applied, perform this final comprehensive assessment:

1. **Full build verification**: `npm run build` clean with zero warnings.
2. **Test suite**: `npx vitest run` — all tests pass with coverage report. Target: 22+ test cases.
3. **Stub detection scan**: `grep -rn "TODO\|FIXME\|placeholder\|mock\|Mock\|MOCK\|hardcoded\|dummy" src/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v node_modules` — must return only HTML `placeholder=` attributes.
4. **Security audit**: Run `scripts/pre-flight-security.ts`, verify RLS on all Supabase tables, confirm no secrets in git history.
5. **Performance check**: Lighthouse audit on dashboard page (target > 80 performance score).
6. **Shopify compliance**: GDPR webhooks respond correctly, billing creates test subscription, uninstall cleans up, CSP headers present.
7. **Documentation**: Create `README.md` with setup instructions, `HANDOFF.md` with architecture overview, verify privacy policy at `/personvern`.
8. **Environment checklist**: Verify all required env vars documented and all placeholder values (`<needs real URL>`) flagged for user action.

Write the Final Assessment as `MILESTONE-REPORT.md` with results for each item above. Mark PASS/FAIL/PARTIAL for each.

**>>> STOP HERE after Final Assessment. Wait for review. <<<**

---

## Final Assessment Review — Opus Feedback (2026-04-12)

**Verdict: CONDITIONAL PASS — 2 items to fix, then the project is DONE.**

All 5 Phase 3 fixes verified as applied. Codebase is clean (no TODOs, no console.logs, no mocks in production). Security, GDPR, billing, and auth structures are solid. Two issues surfaced during review:

### Issue 1: CRITICAL — SalesIntelligence data contract mismatch

`SalesVelocityChart` fetches `/api/stats?type=history` and expects objects shaped `{ date, sales, margin }`, but the endpoint returns objects shaped `{ name, value, volume }`. The component will always show the empty state.

`UnrealizedGainTracker` fetches `/api/stats/roi` and expects `{ data: { totalCogs, unrealizedGain, gainPercent } }`, but the endpoint returns `{ data: [{ name, roi, count }] }` — an array of ROI-by-class objects, not a portfolio summary.

Fix options (pick one per component):
- **Option A**: Update the components to match the API response shapes.
- **Option B**: Update the API endpoints to return the shapes the components expect.
- **Option C**: Create a dedicated `/api/stats/portfolio` endpoint for the portfolio summary and update `SalesVelocityChart` to map `{ name → date, value → sales }`.

Either way, verify that the component actually renders real data after the fix — not just shows the loading spinner or empty state.

### Issue 2: LOW — `catch (err: any)` remaining in some handlers

The project's `.claude/rules/typescript/coding-style.md` specifies `unknown` over `any` for catch blocks. `settings/route.ts` GET handler (line 44) and `billing/subscribe/route.ts` (line 67) still use `catch (err: any)`. These should be `catch (err: unknown)` with proper narrowing.

### What passed review

- Billing test mode toggle via env var: correct and safe-default
- Zod schemas on settings and feedback: well-chosen field constraints
- GDPR webhook registration: complete with all 3 mandatory topics
- Hardcoded URL removal: explicit failures instead of silent wrong-domain behavior
- Milestone report format: correct per GEMINI.md spec
- Deviations section: honest about sandbox limitations and README/HANDOFF gap

### Instructions

1. Fix the data contract mismatch (Issue 1). This is the last real functional bug.
2. Clean up `catch (err: any)` → `catch (err: unknown)` (Issue 2).
3. After fixing, run `npm run build` and `npx vitest run` to confirm nothing broke.
4. Commit as `fix(final): align SalesIntelligence data contracts with API responses` and `fix(final): use unknown in catch blocks`.
5. **After these two fixes, the development work is complete.** Update MILESTONE-REPORT.md to reflect the fixes, then the only remaining items are the human-action blockers (env vars, Shopify Partner Dashboard, real install test).

---

## Final Assessment — Opus Sign-off (2026-04-13)

**Verdict: APPROVED ✅ — Development complete. One remaining documentation task for Gemini.**

Both items from the previous Opus review have been verified as correctly fixed:

- **SalesIntelligence data contracts**: `SalesVelocityChart` now uses `dataKey="name"` and `dataKey="value"` matching the API's `{ name, value, volume }` shape. `UnrealizedGainTracker` now fetches from `/api/stats` (default KPIs) and correctly maps `totalValueNok` → `totalCogs` and `potentialProfitNok` → `unrealizedGain`. Both components will render real data. ✅
- **`catch (err: any)` → `catch (err: unknown)`**: Zero occurrences remaining across all 34 files. Confirmed by grep. ✅

One remaining deviation from the Final Assessment spec has not been resolved and is being handed to Gemini:

### Task for Gemini: Create README.md and HANDOFF.md

The Final Assessment spec (item 7) required:
- `README.md` — setup instructions for a developer picking up this project
- `HANDOFF.md` — architecture overview for handoff

These were deferred across multiple sessions. Gemini must create both now.

**`README.md` must cover:**
1. What the app does (1 paragraph)
2. Tech stack (Next.js 16, React 19, Supabase, Shopify Embedded App, Vercel)
3. Local development setup: `git clone` → `npm install` → `.env.local` → `npm run dev`
4. All required environment variables (copy from the Reference section below) with descriptions of what each is and where to get it
5. How to run tests: `npx vitest run`
6. How to deploy: `git push` triggers Vercel, then `shopify app deploy`
7. Key directories: `src/app/api/`, `src/components/dashboard/widgets/`, `src/lib/`, `scripts/`

**`HANDOFF.md` must cover:**
1. Architecture overview: Shopify Embedded App with Managed Installation + Token Exchange
2. Database: Supabase project `omxqbognenqzeeiazjzy`, 10 tables, RLS enabled — list all tables with 1-line description each
3. Key flows: install flow, inventory sync, pricing loop (scrape → recommend → stage → approve → execute)
4. Pricing engine modules: `floor.ts`, `tiers.ts`, `spread-engine.ts`, `abc_engine.ts`, `profit.ts`, `recommendations.ts`
5. Known limitations and future work: Playwright scraping on Vercel (50MB limit), missing Zod on 3 internal routes, Upstash Redis not yet configured
6. Pre-launch blockers (copy from MILESTONE-REPORT.md Blockers section)
7. Contact: Truls — `thelegendwarior@gmail.com`

**Format**: Both files go in the project root. Write in Norwegian-friendly but technically precise English. No fluff.

**After creating both files:**
- Update `MILESTONE-REPORT.md` — change the README/HANDOFF deviation from "not created" to "DONE"
- Do NOT write a new milestone report — just update the deviation line
- The project is then fully complete

**>>> GEMINI: Create README.md and HANDOFF.md, then update MILESTONE-REPORT.md. No further review needed for this task — it is documentation only. <<<**

---

## Reference: Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://omxqbognenqzeeiazjzy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<set>
SUPABASE_SERVICE_ROLE_KEY=<set>

# Shopify
SHOPIFY_SHOP_NAME=pokemon-butikken-2.myshopify.com
SHOPIFY_CLIENT_ID=<set>
SHOPIFY_CLIENT_SECRET=<set>
SHOPIFY_DRY_RUN=true

# Discord (NEED TO CONFIGURE)
DISCORD_WEBHOOK_BUSINESS=<needs real URL>
DISCORD_WEBHOOK_TECH=<needs real URL>

# Business Logic
PRICE_AUTO_UPDATE=false
WAC_AUTO_UPDATE=true

# QStash (NEED TO CONFIGURE)
QSTASH_TOKEN=<needs token>
QSTASH_CURRENT_SIGNING_KEY=<needs key>
```

## Reference: File Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, inventory, staged-updates, cron, webhooks, etc.)
│   ├── hub/           # Admin pages (compliance, operations, staging, support)
│   ├── inventory/     # Inventory management pages
│   ├── settings/      # Settings pages (automation, assistant, billing)
│   ├── setup/         # Setup wizard
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Dashboard (will use WidgetGrid)
│   └── globals.css    # Theme (light glassmorphism — DO NOT change aesthetic)
├── components/        # React components (DashboardShell, Providers, widgets)
├── lib/               # Business logic (pricing, shopify, supabase, scrapers, automation)
└── test/              # Test setup and utilities
scripts/               # SQL migrations and security scripts
```
