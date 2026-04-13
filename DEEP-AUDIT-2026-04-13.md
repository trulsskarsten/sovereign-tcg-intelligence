# Deep Audit Report — Sovereign TCG Intelligence
**Date**: 2026-04-13  
**Auditor**: Claude Opus  
**Scope**: Full codebase, runtime analysis, deployment diagnostics, project status  

---

## 1. BLANK SCREEN DIAGNOSIS

### The deployed code (commit `9999e9e`) ≠ the local code

**102 files are modified locally but never pushed to GitHub.** Vercel builds from `main` at commit `9999e9e`. All Phase 3 fixes, catch-type corrections, data contract alignment, and the new AppBridgeProvider hardening — none of it is deployed.

### Root Cause Chain (deployed version)

The blank screen occurs because the client-side React tree crashes during hydration. Here's the exact sequence:

1. **Server renders HTML** — sends the Suspense fallback (`<div class="flex-1 bg-white"/>`) because `AppBridgeProvider` calls `useSearchParams()` which triggers `BAILOUT_TO_CLIENT_SIDE_RENDERING`.

2. **Client JS loads and begins hydration** — React takes over.

3. **`AppBridgeProvider` renders** — checks for `?host=` search parameter. When accessing the URL directly (not from Shopify admin), there's no `host` param, so it renders `<>{children}</>` without the Shopify `<Provider>` wrapper.

4. **`AutoActivator` renders** — calls `useAppBridge()` unconditionally. With no `<Provider>` ancestor, this **throws**:
   ```
   Error: No AppBridge context provided. Your component must be wrapped 
   in the <Provider> component from App Bridge React.
   ```

5. **React error boundary (`error.tsx`) should catch this** — but the user perceives a blank/broken screen because the initial server HTML is a white div and the crash prevents any meaningful content from rendering.

### Additional Issues in Deployed Code

| Issue | Impact |
|-------|--------|
| `/api/health` called without auth token by DashboardShell | Always returns 401 → permanent demo mode |
| `@shopify/app-bridge-react@3.7.11` peer dep is `react ^16‖^17‖^18` | Running on React 19.2.4 — unsupported, potential runtime incompatibilities |
| `supabase.ts` uses non-null assertions (`!`) on env vars | If any Supabase env var is missing on Vercel, crashes at import time |

### Issues in Local (Uncommitted) Code

| Issue | Impact |
|-------|--------|
| `AppBridgeProvider.tsx` uses `<Suspense>` without importing it | **Confirmed by `tsc --noEmit`**: `TS2304: Cannot find name 'Suspense'`. At runtime, `Suspense` is `undefined` → React crashes. Turbopack skips this check during `next build` but the client JS still breaks. |
| No `global-error.tsx` exists | Errors in root layout (where AppBridgeProvider lives) are uncatchable — user sees permanent white screen |

---

## 2. WHAT HAS BEEN DONE

### Phase 0: Foundation — COMPLETE
- 5 critical bugs fixed (billing GraphQL, USER_AGENTS, JWT verification, inventory sync, QStash)
- Pino logger implemented, GitHub CI workflow created
- Test infrastructure: vitest configured, 22 test cases passing
- Database: 10 Supabase tables verified on project `omxqbognenqzeeiazjzy`

### Phase 1: Core Loop — COMPLETE (code exists)
- Shopify auth: token exchange, session token validation, AES-256 encryption
- Inventory sync: cursor-based GraphQL pagination, search/filtering
- Widget dashboard: react-grid-layout bento grid, 5 widgets, layout persistence
- Staged updates: full CRUD, approve/reject/bulk/execute flows, dry-run support
- All pages wired to real APIs (not hardcoded)

### Phase 2: Intelligence — PARTIALLY BUILT
- Scraper code exists (424 LOC across 4 files: adapters, cardmarket, norway, sovereign)
- Pricing engine modules exist (426 LOC: floor, spread, tiers, profit, ABC, autopilot)
- WAC calculation exists (113 LOC)
- Recommendations engine exists (103 LOC)
- **Not wired to production flows** — scrapers have no live cron, recommendations only have Rule 1

### Phase 3: Launch Prep — COMPLETE (code exists, locally)
- Shopify billing: subscription mutation, test mode via env var
- GDPR: cascading deletion, webhook replay protection, 3 mandatory webhooks
- Security: rate limiting (Upstash), Zod validation, CORS, encrypted tokens, CSP headers
- Polish: empty states, loading skeletons, Norwegian translations, privacy policy
- `catch (err: any)` → `catch (err: unknown)` across 34 files (0 remaining)
- SalesIntelligence data contracts aligned to real API responses

### Documentation — COMPLETE (locally)
- README.md: setup, env vars, testing, deployment, project structure
- HANDOFF.md: architecture, database schema (corrected by Opus), known limitations, pre-launch checklist
- GEMINI.md: full development guide with phase definitions and coding conventions
- AGENT-WORKLOG.md: deep audit findings (partially stale — see Section 4)

---

## 3. WHAT NEEDS FIXING (Blocking Deployment)

### P0 — Fix Before Pushing

**3.1 Add `Suspense` import to `AppBridgeProvider.tsx`**
```typescript
// Line 3 — change:
import { useEffect, useState, ReactNode } from 'react';
// To:
import { Suspense, useEffect, useState, ReactNode } from 'react';
```
Without this, the entire app crashes at runtime. `tsc --noEmit` confirms the error.

**3.2 Create `src/app/global-error.tsx`**
The current `error.tsx` only catches errors in page segments. Layout-level errors (AppBridgeProvider, UIProvider) produce an unrecoverable blank screen. Need a `global-error.tsx` that wraps the root layout.

**3.3 Guard `AutoActivator` against missing AppBridge**
The committed version calls `useAppBridge()` unconditionally. The local version wraps it in try-catch (good), but then returns `null` silently if bridge is unavailable (could be better — show nothing, that's fine for a background activator).

**3.4 Push the 102 uncommitted files**
All Phase 3 work, catch-type fixes, data contract alignment, and AppBridgeProvider hardening exist only locally. Vercel is running stale code from commit `9999e9e`.

### P1 — Fix Before Real Users

**3.5 `@shopify/app-bridge-react` v3 incompatible with React 19**
Peer dependency: `react ^16 || ^17 || ^18`. The project uses React 19.2.4. Options:
- **Option A** (recommended): Migrate to Shopify App Bridge v4 (direct URL session tokens, no React Provider pattern, designed for modern React)
- **Option B**: Pin React to 18.x (conflicts with Next.js 16 which targets React 19)
- **Option C**: Keep as-is and monitor for breakage (risky)

**3.6 `supabase.ts` non-null assertions**
```typescript
// Current — crashes silently if env vars missing:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Should be:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
```
Same for `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. Also affects `shopify.ts`, `syncEngine.ts`, `cron/abc-sync`, `cron/scrape`.

**3.7 DashboardShell health check (committed version)**
Calls `/api/health` without auth token → always 401 → always demo mode. The local version fixes this by using `getSessionToken(app)`. But this only works when App Bridge is available (inside Shopify iframe). Need a fallback for direct URL access.

**3.8 Verify all Vercel environment variables**
These must be set in Vercel dashboard (`.env.local` is gitignored, not deployed):

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Baked into client bundle at build time |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Baked into client bundle at build time |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side only |
| `NEXT_PUBLIC_SHOPIFY_API_KEY` | Yes | Must be `d0aa56b325956246e05a5b7cce5e8dfe` |
| `SHOPIFY_CLIENT_ID` | Yes | Same as above |
| `SHOPIFY_CLIENT_SECRET` | Yes | From Shopify Partner Dashboard |
| `SHOPIFY_SHOP_NAME` | Yes | `pokemon-butikken-2.myshopify.com` |
| `SHOPIFY_DRY_RUN` | Yes | `true` during testing |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://sovereign-tcg-intelligence.vercel.app` |
| `SHOPIFY_BILLING_TEST_MODE` | Recommended | `true` until ready for real charges |
| `DISCORD_WEBHOOK_BUSINESS` | Optional | Real Discord webhook URL |
| `DISCORD_WEBHOOK_TECH` | Optional | Real Discord webhook URL |

---

## 4. WHAT NEEDS REWORK

### 4.1 Duplicate UIProvider
`layout.tsx` wraps children in `UIProvider`. Then `DashboardShell` wraps its content in ANOTHER `UIProvider`. This creates two independent state trees — state set in one won't propagate to the other. **Remove the UIProvider from DashboardShell** and rely on the one in layout.tsx.

### 4.2 `src/lib/mocks.ts` still in production
Contains hardcoded MOCK_001–003 products. Violates Rule 5 ("No mock data in production code"). Should be deleted.

### 4.3 `src/app/api/internal/seed/route.ts` — dead code
Old seed route alongside the newer `shopify-seed` route. Uses different column names. Should be deleted or consolidated.

### 4.4 `console.error` violations
3 locations in production code use `console.error` instead of logger:
- `src/app/error.tsx:15` — use `clientLogger.error`
- `src/app/hub/operations/page.tsx:36` — use `clientLogger.error`
- `src/components/AppBridgeProvider.tsx:41` — use `clientLogger.error`

### 4.5 `inventory/route.ts` queries by `shop_domain`
The `withAuth` middleware provides both `shop_domain` and `store_id`. Filtering by `store_id` would be more reliable and consistent with multi-tenancy. Currently works because `syncStoreVariants()` populates `shop_domain`, but fragile.

### 4.6 `/api/shopify/sync` route has no `withAuth`
Reads `SHOPIFY_SHOP_NAME` env var directly instead of using authenticated context. Anyone can call it. Should be protected.

---

## 5. WHAT NEEDS UPGRADES

### 5.1 Shopify App Bridge v3 → v4 Migration (HIGH priority)
App Bridge v3 is deprecated (npm warning: "Package no longer supported"). v4 uses a fundamentally different approach:
- No `<Provider>` component or `useAppBridge()` hook
- Session tokens are passed via URL params and managed by App Bridge automatically
- Direct integration with `@shopify/shopify-app-remix` or manual header-based auth
- Better React 19 compatibility

**Migration scope**: 3 files import from `@shopify/app-bridge-react` or `@shopify/app-bridge-utils`:
- `AppBridgeProvider.tsx` — complete rewrite
- `DashboardShell.tsx` — remove useAppBridge dependency
- `AutoActivator.tsx` — change to header-based auth

### 5.2 Phase 2 Intelligence Features (MEDIUM priority)
Code exists but isn't wired:
- Scrapers need live cron scheduling (Vercel cron or QStash)
- Recommendation rules 2–5 not implemented
- WAC purchase flow needs testing
- Cardmarket API integration needs API key setup

### 5.3 Non-null Assertion Cleanup (LOW priority)
13 locations across 7 files use `process.env.X!` non-null assertions. Should all be replaced with explicit checks and error messages.

### 5.4 Test Coverage Gaps
- No integration tests for auth flow
- No tests for GDPR webhook handlers
- No tests for billing subscription flow
- WidgetGrid layout persistence untested

---

## 6. RECOMMENDED ACTION PLAN

### Immediate (unblock deployment):
1. Fix `Suspense` import in `AppBridgeProvider.tsx`
2. Create `global-error.tsx`
3. Verify Vercel env vars are set
4. `git add . && git commit && git push` — deploy the 102 uncommitted files

### This week:
5. Remove duplicate UIProvider from DashboardShell
6. Delete `mocks.ts` and old `seed/route.ts`
7. Add `withAuth` to `/api/shopify/sync`
8. Replace non-null assertions in `supabase.ts` with proper checks

### Next sprint:
9. Migrate from App Bridge v3 → v4
10. Wire Phase 2 scraper crons
11. Complete recommendation rules 2–5
12. Full E2E test on dev store

---

## 7. AGENT-WORKLOG.md STATUS UPDATE

The AGENT-WORKLOG.md is stale. Here's the actual status of each task:

| Task | Worklog Status | Actual Status |
|------|---------------|---------------|
| TASK-001: Verify NEXT_PUBLIC_SHOPIFY_API_KEY on Vercel | `[ ]` | Human action required |
| TASK-002: SafeAutoActivator | `[ ]` | ✅ Fixed locally (try-catch) |
| TASK-003: variant_id standardization | `[ ]` | ✅ All files use `variant_id` |
| TASK-004: Decrypt access token | `[ ]` | ✅ Fixed locally (decrypt with fallback) |
| TASK-005: DashboardShell health check auth | `[ ]` | ✅ Fixed locally (Bearer token) |
| TASK-006: inventory filter by store_id | `[ ]` | ⚠️ Still uses shop_domain |
| TASK-007: Vercel env vars | `[ ]` | Human action required |
| TASK-008: Delete mocks.ts | `[ ]` | ❌ Still exists |
| TASK-009: Delete old seed route | `[ ]` | ❌ Still exists |
| TASK-010: console.error → clientLogger | `[ ]` | ❌ 3 locations remain |
| TASK-011: Remove AutoActivator from prod | `[ ]` | ❌ Still ships |
| TASK-012–014: Phase 2 polish | `[ ]` | ❌ Not started |
