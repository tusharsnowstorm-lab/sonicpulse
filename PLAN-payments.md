# PLAN-payments — Real bKash + SSLCommerz checkout (Phase 08)

**Rank: 3 of 5. Requires PLAN-mobile-auth and PLAN-backend-wiring first.** ⚠️ **Start the merchant applications TODAY regardless of code order** — production bKash and SSLCommerz accounts need a registered Bangladeshi business (trade license) and approval can take longer than the build. Sandbox credentials are free and instant; all code below works against sandbox.

## Repo conventions
Branch `claude/dhaka-festival-ticket-app-guhiwm`. Server code goes in the **website** (`src/app/api/...`, Next.js route handlers — follow the existing style of `src/app/api/register/route.ts`: `NextRequest/NextResponse`, service client via `SUPABASE_SERVICE_ROLE_KEY`). App code in `mobile/` under the conventions in the other plans. Website verification: `npm run lint && npm run build` from repo root (build fails at prerender without Supabase envs in sandboxes — TypeScript phase passing is the bar there, as established in repo history). Mobile verification: `npx tsc --noEmit` + `CI=1 npx expo export --platform web`.

## Goal
"Pay with bKash" / "Pay with Card" in the app open a real hosted checkout; the server — never the client — confirms payment and marks the ticket or reservation paid. The app's current mock (`payTicket`/`payReservation` flipping a local flag) remains the demo-mode fallback.

## Environment contract (names only; never commit values)
`BKASH_BASE_URL` (sandbox `https://tokenized.sandbox.bka.sh/v1.2.0-beta`), `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`, `SSLCZ_BASE_URL` (sandbox `https://sandbox.sslcommerz.com`), `SSLCZ_STORE_ID`, `SSLCZ_STORE_PASSWD`, `PUBLIC_SITE_URL` (the deployed https origin — gateways call back here, so end-to-end tests need the deployed site, not localhost).

## Schema — append to `supabase-schema.sql`
```sql
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.user_tickets(id) on delete set null,
  reservation_id uuid references public.accommodation_reservations(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('bkash','sslcommerz')),
  provider_txn_id text unique,
  amount integer not null,           -- whole BDT, integer. Never float.
  currency text not null default 'BDT',
  status text not null default 'initiated' check (status in ('initiated','success','failed','refunded')),
  includes_shuttle boolean not null default false,
  raw_payload jsonb,
  created_at timestamptz default now(),
  check (num_nonnulls(ticket_id, reservation_id) = 1)   -- XOR: a payment settles exactly one thing
);
alter table public.payments enable row level security;
create policy "own payments readable" on public.payments for select using (auth.uid() = user_id);
-- inserts/updates: service role only (no user policy) — all writes go through the API routes.
```

## Exact files
Create (website):
- `src/lib/payments/bkash.ts` — token cache + `createPayment`, `executePayment`, `queryPayment`
- `src/lib/payments/sslcommerz.ts` — `createSession`, `validateTransaction`
- `src/app/api/payments/create/route.ts` — POST `{kind:'ticket'|'reservation', provider}` (auth: `getUser()` from `src/lib/supabase-server.ts`); computes amount **server-side from DB** (ticket: 4500 + 800 if `includes_shuttle` requested and recorded; reservation: its `price` column); inserts `payments` row status `initiated`; returns the gateway redirect URL
- `src/app/api/payments/bkash/callback/route.ts` — GET (bKash redirects here with `paymentID` + `status`); on `status=success` → `executePayment`, verify `transactionStatus === 'Completed'` AND amount matches; update row; then redirect to `poshh://payment/result?ref=<payment id>`
- `src/app/api/payments/sslcommerz/ipn/route.ts` — POST (server-to-server); validate `val_id` via validator API; idempotent upsert
- `src/app/api/payments/status/route.ts` — GET `?id=` returns `{status}` for the authed owner (the app polls this)
Modify:
- `supabase-schema.sql` (DDL above)
- `mobile/store/AppStore.tsx` — remote-mode `payTicket`/`payReservation` become `startPayment(kind, provider)`: call `create`, open URL via `WebBrowser.openAuthSessionAsync(url, 'poshh://payment/result')`, then poll `status` every 2s up to 90s
- `mobile/app/(tabs)/tickets.tsx` + `mobile/app/(tabs)/events/accommodation.tsx` — a small "Confirming payment…" pending state while polling (reuse `StatusPill` with tone `pending`); no other layout changes

## Steps in order
1. Schema + RLS in Supabase.
2. `bkash.ts`: grant-token call (`POST /tokenized/checkout/token/grant`, headers `username`/`password`, body `app_key`/`app_secret`) — cache `{token, expiresAt}` in a module-level variable, refresh 5 min early. Then `createPayment` (mode `0011`, `payerReference` = user id, `callbackURL` = `${PUBLIC_SITE_URL}/api/payments/bkash/callback`, `merchantInvoiceNumber` = payments row id), `executePayment(paymentID)`, `queryPayment(paymentID)`.
3. `sslcommerz.ts`: `createSession` posts form-encoded to `/gwprocess/v4/api.php` with `store_id, store_passwd, total_amount, currency:'BDT', tran_id` (= payments row id), `success_url/fail_url/cancel_url` (all → a tiny GET handler that just redirects to the app deep link; the IPN is the source of truth), `ipn_url = ${PUBLIC_SITE_URL}/api/payments/sslcommerz/ipn`, plus required `cus_name/cus_email/cus_phone` and `product_*`/`shipping_method:'NO'` fields (API rejects without them). Returns `GatewayPageURL`.
4. `create/route.ts`: auth → load the target row (`user_tickets` must be `status='approved'` and unpaid; reservation must be `approved`) → compute amount → insert `payments` → call provider → return `{url, paymentId}`.
5. Callbacks: bKash callback executes + verifies; SSLCommerz IPN calls `/validator/api/validationserverAPI.php?val_id=...&store_id=...&store_passwd=...&format=json`, requires `status` in `('VALID','VALIDATED')`, `tran_id` matches an `initiated` row, and amount matches. Both write `status`, `provider_txn_id`, `raw_payload`.
6. App wiring per Exact files; demo mode (no envs) keeps the instant local flip.
7. Verify (below), then hand a written smoke checklist for sandbox creds into the PR description.

## Edge cases a weaker model would miss
- **Never trust the redirect.** A user can hand-craft `poshh://payment/result`. The app only ever renders "paid" from the `status` endpoint, which only ever reflects server-verified gateway responses. Similarly the SSLCommerz `success_url` GET carries POST data you must ignore — the IPN + validator call is authoritative.
- **Amount tampering & float traps.** Compute price server-side from the DB, never from a client-posted total. SSLCommerz validator returns amounts as decimal strings (`"4500.00"`); compare with `Math.round(parseFloat(x) * 100) === amount * 100`, never `===` on floats or strings.
- **IPN idempotency + ordering.** Gateways retry IPNs and the IPN can land *before* the user's browser redirect. The unique `provider_txn_id` index plus "only update rows currently `initiated`" makes duplicates a no-op returning 200 (returning non-200 causes infinite gateway retries).
- **bKash token expiry** (~1h): cache with early refresh; on a 401 from any call, drop cache and retry exactly once.
- **The XOR check constraint** (`num_nonnulls = 1`) prevents a payment ambiguously attached to both a ticket and a reservation — keep it; it will catch real bugs in `create/route.ts`.
- **`openAuthSessionAsync` on Android** sometimes returns `{type:'dismiss'}` even after a successful redirect — that's why the app polls `status` regardless of the browser result instead of branching on it.
- **Do not install `react-native-webview`.** `expo-web-browser` is already a dependency and is the sanctioned pattern here.
- **Website build gotcha**: root tsconfig excludes `mobile/`; don't import anything from `mobile/` into `src/` or vice versa. Shared constants (prices) stay duplicated deliberately — server is authoritative.

## Acceptance criteria
1. Repo root: `npm run lint` clean on all new files; `npm run build` passes the TypeScript phase.
2. `mobile/`: `npx tsc --noEmit` clean; `CI=1 npx expo export --platform web` succeeds; demo-mode Playwright payment flow unchanged.
3. Unit-level: a node script (`node scripts/test-payments-math.mjs`, create it) asserting the amount comparison helper on `"4500.00"`, `"4500.0000"`, `"4500.01"` → true, true, false.
4. With sandbox creds on the deployed site: bKash sandbox wallet `01770618567` / OTP `123456` / PIN `12121` completes → `payments.status='success'`, app shows CONFIRMED ticket after poll; killing the app mid-payment and reopening shows the paid state (server truth, not local).
5. Replaying the same IPN POST twice → second returns 200 with no row change (check `updated_at`/logs).
