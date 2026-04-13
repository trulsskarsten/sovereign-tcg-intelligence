# AGENT-WORKLOG.md — Sovereign TCG Intelligence

> **This file is the single source of truth for multi-agent collaboration.**
> Both Claude and Gemini MUST read this before writing any code.
> Update status fields as tasks are completed. Never delete completed tasks — mark them `[x]`.

---

## 🚨 Current Status: APP IS BROKEN IN PRODUCTION

**Last updated**: 2025-04-13 10:50 UTC+2
**Last agent**: Claude Opus (audit)
**Vercel build**: ✅ Deploying successfully (5 consecutive green builds)
**App in Shopify**: ❌ "This page couldn't load" on ALL pages

The Vercel build succeeds but the app crashes at runtime inside the Shopify iframe. The root causes are documented below.

---

## Critical Findings (Deep Audit)

### BLOCKER 1: `NEXT_PUBLIC_SHOPIFY_API_KEY` not set → App Bridge fails → entire app crashes

**Root cause of "This page couldn't load"**

`AppBridgeProvider.tsx` (line 58) reads:
```typescript
const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
```

The `.env.local` has `NEXT_PUBLIC_SHOPIFY_API_KEY=d0aa56b325956246e05a5b7cce5e8dfe` locally, but this env var **must also be set in Vercel** as a `NEXT_PUBLIC_*` variable (it gets baked into the client bundle at build time).

**If this variable is missing during the Vercel build**, the `AppBridgeProvider` will render `<>{children}</>` without the `<Provider>` wrapper. Then `AutoActivator` calls `useAppBridge()` which throws because there is no Provider ancestor — **crashing the entire React tree**.

**Fix**: 
1. Verify `NEXT_PUBLIC_SHOPIFY_API_KEY` is set in Vercel Environment Variables
2. If it is set, redeploy (Vercel caches `NEXT_PUBLIC_*` vars at build time, not runtime)

**Priority**: P0 — blocks everything

---

### BLOCKER 2: `AutoActivator` crashes when AppBridge is unavailable

`AutoActivator.tsx` (line 19) calls `useAppBridge()` unconditionally. If `AppBridgeProvider` falls through to the `<>{children}</>` branch (see Blocker 1), there is **no Provider context** and `useAppBridge()` throws, killing the page.

**Fix**: Wrap `useAppBridge()` in a try-catch or conditionally render `AutoActivator` only when inside the `<Provider>`. Simplest fix: wrap the component body in an error boundary, or check `typeof window !== 'undefined'` and use optional chaining.

**Priority**: P0

---

### BLOCKER 3: `DashboardShell` health check calls `/api/health` without auth token

`DashboardShell.tsx` (line 54) does:
```typescript
const res = await fetch('/api/health');
```

But `/api/health` is wrapped in `withAuth()`, which requires a `Bearer` token. Without it, the endpoint returns 401. The health check silently fails, `isDemo` stays `true`, and the dashboard appears to be in demo mode permanently.

**Fix**: Either:
- Make the DashboardShell health check use `getSessionToken(app)` like AutoActivator does
- Or create an unauthenticated `/api/health/public` endpoint that returns just the inventory count

**Priority**: P1

---

### BLOCKER 4: Database column name mismatch — `variant_id` vs `shopify_variant_id`

The codebase has a critical split:

| Module | Column name used | Consequence |
|--------|-----------------|-------------|
| `shopify.ts` syncStoreVariants() | `variant_id` | Upserts with `onConflict: 'variant_id'` |
| `wac.ts` | `shopify_variant_id` | Queries `.eq("shopify_variant_id", ...)` |
| `webhooks/shopify/route.ts` | `shopify_variant_id` | Upserts with `onConflict: "shopify_variant_id"` |
| `mocks.ts` | `shopify_variant_id` | Uses `onConflict: "shopify_variant_id"` |
| `api/internal/seed/route.ts` | `shopify_variant_id` | Uses `onConflict: 'shopify_variant_id'` |
| `seed-data.ts` | `variant_id` | Field on the interface |
| `inventory/page.tsx` | `item.variant_id` | Renders in the UI |

**The actual database column is unknown without checking Supabase directly.** If the DB has `shopify_variant_id`, then `syncStoreVariants()` silently fails on every upsert. If the DB has `variant_id`, then WAC, webhooks, mocks, and the old seed route all fail.

**Fix**: 
1. Check the actual Supabase `inventory` table schema
2. Standardize all code to use whichever column actually exists
3. The sync function and all upserts must use the same column name

**Priority**: P0

---

### HIGH 1: `inventory/route.ts` queries by `shop_domain` but sync writes `store_id`

The inventory API (line 37) filters by:
```typescript
.eq('shop_domain', shop_domain)
```

But `syncStoreVariants()` in `shopify.ts` writes `store_id` (line 252) and does NOT write `shop_domain` to the inventory row. If the `inventory` table has no `shop_domain` column, or if synchronization never populates it, the inventory API returns 0 results even though data exists.

**Fix**: Either add `shop_domain` to the sync upsert, or change the query to filter by `store_id` (which is available from `withAuth` context).

**Priority**: P1

---

### HIGH 2: Token Exchange stores encrypted token but `getShopifyAccessToken()` reads plaintext

`token-exchange/route.ts` (line 67):
```typescript
const encryptedToken = encrypt(accessToken);
// stores encryptedToken in DB
```

But `shopify.ts` `getShopifyAccessToken()` (line 33):
```typescript
if (store?.access_token) {
    return store.access_token; // Returns the ENCRYPTED blob directly
}
```

This means all Shopify API calls use the encrypted token as-is, which Shopify will reject as invalid. The token needs to be **decrypted** before use.

**Fix**: Add `decrypt()` call in `getShopifyAccessToken()`:
```typescript
if (store?.access_token) {
    return decrypt(store.access_token);
}
```

**Priority**: P1

---

### HIGH 3: `old /api/internal/seed` route still exists and uses wrong column names

`src/app/api/internal/seed/route.ts` still exists alongside the new `shopify-seed` route. It:
- Uses `onConflict: 'shopify_variant_id'` (may not match DB schema)
- Has hardcoded `shop_domain`
- Uses `last_synced_at` instead of `last_sync`

This dead code can cause confusion. Should be deleted or consolidated.

**Priority**: P2

---

### MEDIUM 1: `mocks.ts` still in production code

`src/lib/mocks.ts` contains hardcoded `MOCK_001`, `MOCK_002`, `MOCK_003` products. This violates Rule 5 ("No mock data in production code"). Should be deleted.

**Priority**: P2

---

### MEDIUM 2: `console.error` in `AppBridgeProvider.tsx`

Line 41: `console.error('Auth Error:', error)` — violates coding convention. Should use `clientLogger`.

**Priority**: P3

---

## Phase Status Summary

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: Foundation | ✅ DONE (reviewed) | All 5 bugs fixed, tests written, CI created |
| Phase 1: Core Loop | ⚠️ PARTIAL | Architecture exists but critical integration bugs prevent runtime operation |
| Phase 2: Intelligence | ❌ NOT STARTED | Blocked by Phase 1 runtime issues |
| Phase 3: Launch Prep | ⚠️ CODE EXISTS | GDPR, billing, rate-limiting code written but untested at runtime |

---

## Task Queue

### 🔴 P0 — Must fix before anything else works

- [ ] **TASK-001**: Verify `NEXT_PUBLIC_SHOPIFY_API_KEY` is set in Vercel env vars. If not, set it to `d0aa56b325956246e05a5b7cce5e8dfe` and redeploy.
- [ ] **TASK-002**: Make `AutoActivator` safe when AppBridge is unavailable. Either wrap in error boundary, or move `useAppBridge()` into a child component that only mounts when Provider is present.
- [ ] **TASK-003**: Determine actual inventory table column name in Supabase (`variant_id` or `shopify_variant_id`). Standardize ALL code to use the real column. Files to update: `shopify.ts`, `wac.ts`, `webhooks/shopify/route.ts`, `mocks.ts`, `seed/route.ts`, `seed-data.ts`, `inventory/page.tsx`, `InventoryTable.tsx`, `purchases/route.ts`.
- [ ] **TASK-004**: Fix `getShopifyAccessToken()` to decrypt the access token before returning it.

### 🟠 P1 — Required for basic functionality

- [ ] **TASK-005**: Fix `DashboardShell` health check to include auth token, or create public health endpoint.
- [ ] **TASK-006**: Fix `inventory/route.ts` to filter by `store_id` instead of `shop_domain` (or ensure `shop_domain` is populated in the sync).
- [ ] **TASK-007**: Verify Vercel has ALL required env vars set (see checklist below).

### 🟡 P2 — Cleanup

- [ ] **TASK-008**: Delete `src/lib/mocks.ts` (violates Rule 5).
- [ ] **TASK-009**: Delete or consolidate `src/app/api/internal/seed/route.ts` (old, uses wrong column names).
- [ ] **TASK-010**: Replace `console.error` in `AppBridgeProvider.tsx` with `clientLogger`.
- [ ] **TASK-011**: Remove `AutoActivator` from `page.tsx` entirely (it's a development-only seeding tool, not appropriate for production).

### 🟢 P3 — Polish for Phase 2

- [ ] **TASK-012**: Wire `PerformanceChart.tsx` to real data (may still use mocks).
- [ ] **TASK-013**: Verify all widgets fetch real data and handle empty states correctly.
- [ ] **TASK-014**: Test install flow end-to-end on dev store after P0/P1 fixes.

---

## Vercel Environment Variable Checklist

All of these must be set in the Vercel dashboard for the app to function:

| Variable | Status | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ❓ CHECK | Must be set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❓ CHECK | Must be set |
| `SUPABASE_SERVICE_ROLE_KEY` | ❓ CHECK | Must be set (server-side only) |
| `NEXT_PUBLIC_SHOPIFY_API_KEY` | ❓ CHECK | **CRITICAL** — must match `d0aa56b325956246e05a5b7cce5e8dfe` |
| `SHOPIFY_CLIENT_ID` | ❓ CHECK | Same value as above |
| `SHOPIFY_CLIENT_SECRET` | ❓ CHECK | Must be set |
| `SHOPIFY_SHOP_NAME` | ❓ CHECK | `pokemon-butikken-2.myshopify.com` |
| `SHOPIFY_DRY_RUN` | ❓ CHECK | Should be `true` during testing |

---

## Architecture Quick Reference

```
Shopify Admin (iframe)
  └─ AppBridgeProvider (gets session token)
       └─ TokenExchangeHandler (exchanges for access token, saves to DB)
            └─ DashboardShell (layout, nav, demo check)
                 └─ page.tsx (AutoActivator + WidgetGrid)
                      └─ KPICards, InventoryTable, etc (fetch from /api/*)

/api/* routes
  └─ withAuth middleware (validates Bearer token → extracts shop_domain + store_id)
       └─ Business logic (queries Supabase, calls Shopify GraphQL)
```

**Key files**:
- Auth: `src/lib/auth/middleware.ts`, `src/lib/auth/shopify-verify.ts`, `src/components/AppBridgeProvider.tsx`
- Data: `src/lib/shopify.ts` (sync), `src/lib/supabase.ts` (clients)
- UI: `src/components/DashboardShell.tsx`, `src/app/page.tsx`
- Config: `shopify.app.toml`, `next.config.ts`, `.env.local`

**Database**: Supabase project `omxqbognenqzeeiazjzy` — 10 tables with RLS

---

## Agent Instructions

### Before starting work:
1. Read this file completely
2. Check the Task Queue for uncompleted P0 tasks
3. Work P0 tasks in order (TASK-001 → TASK-004)
4. After P0, work P1 tasks
5. After each task, update this file: change `[ ]` to `[x]` and add a completion note

### After completing work:
1. Run `npx tsc --noEmit` — must pass
2. Run `npm run build` — must pass  
3. Update this file with results
4. Commit with message format: `fix(recovery): TASK-XXX description`
5. Push to main

### Rules:
- **Never** hardcode shop domains — use `shop_domain` from auth context
- **Never** use `console.log` — use `logger` (server) or `clientLogger` (client)
- **Never** skip auth on API routes — use `withAuth` wrapper
- **Always** handle null/undefined in UI components — use `?.` and `?? fallback`
- **Always** test in the Shopify iframe, not standalone browser
