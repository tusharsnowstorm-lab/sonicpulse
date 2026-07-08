# PLAN-backend-wiring — Replace the mock store with real Supabase data (Phase 04)

**Rank: 2 of 5. Do after PLAN-mobile-auth.** This converts every "Partial" feature into real, persistent behavior: registrations reviewed by an actual admin instead of a 3.5-second timer, cliques/invites that survive restarts and exist across users, reservations with real state. It is the single biggest truth-upgrade in the app.

## Repo conventions
Same as PLAN-mobile-auth (branch `claude/dhaka-festival-ticket-app-guhiwm`, `mobile/` alias `@/*`, AppText/theme tokens, verification = `npx tsc --noEmit` + `CI=1 npx expo export --platform web` from `mobile/`).

**Prime directive of this plan: `mobile/store/AppStore.tsx` keeps its exact public hook API.** Every screen already consumes `useAppStore()` — `profile, hasOnboarded, completeOnboarding, updateProfile, registrations, registerForEvent, toggleShuttle, payTicket, reservations, reserveAccommodation, payReservation, cliques, invites, createClique, sendInvite, isInvited, removeMember, leaveClique, respondInvite` plus helpers `getRegistration`/`getReservation`. Swap the internals; do not rename or re-shape anything the screens import, and zero screen files should need edits except where noted.

## Goal
When `isSupabaseConfigured` (from PLAN-mobile-auth), the store reads/writes Supabase with RLS; when not configured, it falls back to today's seeded in-memory behavior so demos, CI, and the web export keep working. Admin approval continues to happen on the website's existing dashboard.

## Schema — append to `supabase-schema.sql` (idempotent, `create table if not exists` style)
```sql
-- Cliques (Phase 06)
create table if not exists public.cliques (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  creator_id uuid not null references auth.users(id) on delete cascade,
  hero_photo_path text,
  created_at timestamptz default now()
);
create table if not exists public.clique_members (
  clique_id uuid references public.cliques(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  color_hex text not null,
  joined_at timestamptz default now(),
  primary key (clique_id, user_id)
);
create table if not exists public.clique_invites (
  id uuid primary key default gen_random_uuid(),
  clique_id uuid not null references public.cliques(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz default now()
);
create unique index if not exists one_pending_invite
  on public.clique_invites (clique_id, invitee_id) where (status = 'pending');

-- Accommodation (Phase 08) — keyed by event_id from day one
create table if not exists public.accommodation_reservations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  tier text not null default 'shared',
  price integer not null,
  reference_code text unique not null,
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

-- Membership check WITHOUT recursive RLS (see edge cases)
create or replace function public.is_clique_member(cid uuid)
returns boolean language sql security definer set search_path = public as
$$ select exists (select 1 from clique_members where clique_id = cid and user_id = auth.uid()) $$;
```
RLS: enable on all four. Policies —
- `cliques`: select where `creator_id = auth.uid() or is_clique_member(id)`; insert where `creator_id = auth.uid()`; delete where `creator_id = auth.uid()`.
- `clique_members`: select where `is_clique_member(clique_id)`; insert where `user_id = auth.uid()` and an accepted invite exists, OR `auth.uid() = (select creator_id from cliques where id = clique_id)` (creator seeds own row); delete where `user_id = auth.uid()` (leave) or caller is creator (remove).
- `clique_invites`: select where `inviter_id = auth.uid() or invitee_id = auth.uid()`; insert where `inviter_id = auth.uid()` and inviter is creator of that clique; update (status only) where `invitee_id = auth.uid()`.
- `accommodation_reservations`: select/insert own rows (`user_id = auth.uid()`); update restricted to service role (admin approves via website).
Also: `alter publication supabase_realtime add table public.user_tickets, public.accommodation_reservations, public.clique_invites, public.clique_members;` (needed for live status flips; wrap each in a DO block catching duplicate_object).

## Exact files
Create:
- `mobile/lib/api.ts` — every Supabase query in one place (typed functions: `fetchMyCliques`, `createCliqueRemote`, `sendInviteRemote`, `respondInviteRemote`, `removeMemberRemote`, `leaveCliqueRemote`, `fetchMyRegistration`, `submitRegistration`, `setShuttle`, `fetchMyReservation`, `submitReservation`, `searchUsersRemote`)
Modify:
- `mobile/store/AppStore.tsx` — branch on `isSupabaseConfigured`: configured path calls `lib/api.ts`, seeds path stays byte-for-byte what it is now (extract current logic into a `useLocalStore()` internal hook first so the diff is reviewable)
- `mobile/data/users.ts` — `searchUsers` becomes the local fallback; remote search queries `user_profiles` by `ilike` on `full_name` and `instagram_handle`
- `supabase-schema.sql` — DDL above
- `mobile/app/(tabs)/tickets.tsx` — reference code: render the real `reference_code` from the registration row instead of the `SP-4F82A1C9` constant (keep constant as fallback in demo mode)

Registration writes `user_tickets` (NOT the public `registrations` table) so the website's existing gate scanner, verify page, and admin dashboard all see app registrations with zero website changes: insert `{user_id, user_email, full_name, phone, nid_number, nid_file_path, ticket_tier: 'phase1', status: 'pending', reference_code}`. `nid_file_path` comes from the onboarding upload (PLAN-mobile-auth step 8). Generate `reference_code` client-side with the same charset as `src/app/api/admin/influencers/route.ts` (`'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'`, prefix `SP-`, 8 chars); retry once on unique violation.

## Steps in order
1. Append schema to `supabase-schema.sql`; run it in Supabase SQL editor (idempotent).
2. Refactor `AppStore.tsx`: extract existing implementation into `useLocalStore()`; add `useRemoteStore()` skeleton returning the same shape; top-level provider picks one. Typecheck after this step alone — screens must compile unchanged.
3. Implement `lib/api.ts` reads: cliques (join members + a profile-name lookup), invites addressed to me, my registration for `sonic-pulse`, my reservation. Map DB rows into the exact existing TS types (`Clique`, `CliqueMember`, `Registration`, `Reservation`). `CliqueMember.slug` becomes the member's `user_id`; `initial` = first letter of name; `color` = `color_hex`; keep `distanceMeters/bearingDeg` from seeds/randoms for now (WYA live data is PLAN-wya-live).
4. Implement writes with optimistic updates: update React state immediately, fire the query, roll back on error (keep a `console.warn`, show no toast infra — a simple revert is enough).
5. `respondInvite(accept)`: update invite status; on accept also insert own `clique_members` row with `color_hex = cliquePalette[memberCount % 6]`.
6. `registerForEvent`: **delete the fake 3.5s approval timer** in the remote path (keep it in `useLocalStore` for demo). Subscribe: `supabase.channel('me').on('postgres_changes', {event:'UPDATE', schema:'public', table:'user_tickets', filter:`user_id=eq.${uid}`}, refetch)`, plus a refetch in `useFocusEffect` (import from `expo-router`) on the Tickets and Events screens' data via a store-exposed `refresh()` — simplest: store subscribes once, screens untouched.
7. Same pattern for `accommodation_reservations`.
8. Full verification pass (below), both modes.

## Edge cases a weaker model would miss
- **Recursive RLS (Postgres error 42P17).** A `clique_members` select policy that itself selects `clique_members` recurses infinitely. That is why `is_clique_member()` is `security definer` — it bypasses RLS inside the function. Do not inline it back into the policy.
- **Realtime respects RLS via WALRUS** — if a table isn't in the `supabase_realtime` publication, `postgres_changes` silently delivers nothing. No error. The publication alteration is load-bearing.
- **`user_tickets.nid_file_path` is `not null`** in the existing schema. Registration must refuse (with a friendly screen message routing to Profile) if the user skipped the ID upload — never insert `''` to sneak past it; the admin actually opens these files.
- **The 3.5s timer must survive in demo mode.** CI/Playwright flows (see repo history: `/tmp/flow4.js` pattern) depend on auto-approval to reach the payment screen. Only the remote path drops it.
- **`CURRENT_USER_ID = 'me'` in `mobile/data/users.ts`** is baked into seeds and invite filtering. In remote mode every comparison must use `session.user.id`; grep for `CURRENT_USER_ID` and audit each of its ~6 usages individually rather than aliasing it.
- **Color assignment races**: two simultaneous invite-accepts can pick the same palette index. Acceptable (colors may repeat past 6 anyway); note it in a comment rather than building a lock.
- **Optimistic `toggleShuttle` + slow network** can interleave; make `setShuttle` write the absolute boolean, not a DB-side NOT.
- **Do not add `@supabase/ssr` to mobile** — that package is for the website. Mobile uses plain `@supabase/supabase-js`.

## Acceptance criteria
Without secrets:
1. `npx tsc --noEmit` clean; `CI=1 npx expo export --platform web` succeeds.
2. Playwright demo-mode run: onboarding → register → (timer) approved → shuttle toggle → pay → ticket, and cliques accept/expand/create/invite flows — all identical to the pre-change screenshots in repo history.
With secrets (staging Supabase):
3. Register in the app → row appears in `user_tickets` with status `pending`; approve it in the website admin dashboard → app flips to APPROVED without reinstalling (realtime or refocus).
4. Create a clique on account A, invite account B by name search, accept on B → both accounts see the same member list after app restarts.
5. RLS probe: with account B's anon-key session, `select * from cliques` returns only cliques B belongs to; direct select of A's private clique returns zero rows (not an error).
