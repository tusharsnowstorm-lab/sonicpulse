# PLAN-influencer-segment — Profile once, apply per event, free ticket on approval (Phase 14)

**Rank: 4 of 5. Requires PLAN-mobile-auth + PLAN-backend-wiring; independent of PLAN-payments** (influencer tickets skip payment entirely). This is the owner's stated growth engine: gather influencers in the app and let them pick events to promote in exchange for a free ticket. Approved mockups: artifacts `38041a24` (applicant flow, follower buckets `<1k / 1–5k / 5–10k / 10–15k / 15k+`) and `f879dad4` (review stays manual/self-reported, Instagram handle is a tap-through link — **no Instagram API, no OAuth**).

**Decision baked into this plan** (owner left it open; default chosen): application **review stays on the website's existing admin dashboard** (`src/app/admin/AdminClient.tsx`), extended minimally. The app ships only the applicant-facing side. If the owner later wants in-app review, that's a separate plan.

## Repo conventions
Branch `claude/dhaka-festival-ticket-app-guhiwm`. Website code follows `src/app/api/admin/influencers/route.ts` style; mobile follows the conventions in PLAN-mobile-auth. Verification: website `npm run lint` + `npm run build` (TS phase); mobile `npx tsc --noEmit` + `CI=1 npx expo export --platform web`.

## Schema — append to `supabase-schema.sql`
```sql
create table if not exists public.influencer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  primary_platform text not null default 'instagram'
    check (primary_platform in ('instagram','tiktok','youtube','other')),
  tiktok_handle text,
  youtube_channel text,
  follower_count text not null
    check (follower_count in ('under_1k','1k_5k','5k_10k','10k_15k','15k_plus')),
  content_type text not null
    check (content_type in ('music_nightlife','lifestyle','fashion_beauty','entertainment','general')),
  created_at timestamptz default now()
);
create table if not exists public.promotion_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reference_code text unique,
  created_at timestamptz default now(),
  unique (user_id, event_id)
);
```
RLS: enable both; users select/insert/update own `influencer_profiles` row; users select/insert own `promotion_applications`; application status updates are service-role only.
**Also fix**: `user_tickets.ticket_tier` check in `supabase-schema.sql` is `in ('phase1','phase2','phase3')` but `src/app/api/admin/influencers/route.ts` already inserts `'influencer'` — the schema file and production disagree. Add to the schema file's commented guidance block: drop and re-add the constraint as `in ('phase1','phase2','phase3','influencer')`, mirroring the existing gender-constraint guidance at the bottom of the file.

## Exact files
Mobile — create:
- `mobile/app/(tabs)/profile/become-influencer.tsx` — profile setup screen: chips (reuse `Segmented` from `mobile/components/ui.tsx` for platform; follower buckets and content type need a small multi-row chip group — build `ChipGroup` in `mobile/components/ui.tsx` following `Segmented`'s style exactly but with `flexWrap: 'wrap'`), optional TikTok/YouTube `InputBox`es, green "already on file" note (name/phone/ID/Instagram come from onboarding), save Button
- Note: `mobile/app/(tabs)/profile.tsx` is currently a file, not a folder. Convert: `mkdir profile/`, move to `profile/index.tsx`, add `profile/_layout.tsx` (Stack, headerShown false — copy `events/_layout.tsx` verbatim), register `become-influencer` in it. Tab config in `(tabs)/_layout.tsx` needs **no change** (`name="profile"` resolves to the folder).
Mobile — modify:
- `mobile/data/profile.ts` — add `INFLUENCER_PLATFORM_OPTIONS`, `FOLLOWER_BUCKET_OPTIONS` (the five new buckets, labels `Under 1,000 / 1,000–5,000 / 5,000–10,000 / 10,000–15,000 / 15,000+`), `CONTENT_TYPE_OPTIONS`, `InfluencerProfile` type
- `mobile/store/AppStore.tsx` — add `influencerProfile: InfluencerProfile | null`, `saveInfluencerProfile()`, `promotionApplications: Record<string, 'pending'|'approved'|'rejected'>`, `applyToPromote(eventId)`; remote via supabase, demo mode in-memory like everything else
- `mobile/app/(tabs)/profile/index.tsx` — "Become an Influencer" Card (🎤 badge, copy from mockup) above the field grid when no influencer profile; a compact "Influencer · <bucket>" row once one exists
- `mobile/app/(tabs)/events/index.tsx` — when `influencerProfile` exists: second CTA "Apply to Promote" (outline variant) beside/below Register-state UI; after applying, a `StatusPill` (`PENDING` amber / `APPROVED` green). Only when `registration.status` display allows space — placement per mockup: inside the event card, under the caption
- `mobile/app/(tabs)/tickets.tsx` — when the ticket row's `ticket_tier === 'influencer'`, render the `🎤 INFLUENCER · NO CHARGE` tag (magenta-bordered pill, style like the mockup) and skip the payment section entirely
Website — modify:
- `src/app/influencers/page.tsx` — `FOLLOWER_RANGES` becomes the five new buckets (`under_1k / 1k_5k / 5k_10k / 10k_15k / 15k_plus`)
- `src/app/admin/AdminClient.tsx` — `FOLLOWER_LABELS`: **add** the five new keys, **keep** the legacy keys (`1k_5k` overlaps; keep `5k_20k`, `20k_100k`, `100k_plus` too — see edge cases)
- `src/app/api/admin/influencers/route.ts` — extend PATCH to also accept `{applicationId, status, source:'promotion'}`: approve path reads `promotion_applications` + joins `user_profiles`/`influencer_profiles`, inserts `user_tickets` (tier `influencer`, status `approved`, generated reference code — reuse the existing `generateRefCode()`), stamps the application `approved` + `reference_code`. GET gains `?source=promotion` returning pending promotion applications with joined profile fields
- `src/app/admin/AdminClient.tsx` — new "App Applications" list section rendering those rows (reuse the existing `InfluencerRow` layout; Instagram handle already renders as an `<a href="https://instagram.com/...">` tap-through — keep that pattern)

## Steps in order
1. Schema + RLS; run in Supabase.
2. Mobile data/types (`profile.ts`), then store additions with demo-mode defaults (`influencerProfile: null`, applications `{}`). Typecheck.
3. Profile folder conversion + `become-influencer.tsx` + entry card. Typecheck + export; Playwright: onboard → Profile tab → Become an Influencer → save → card state changes.
4. Events CTA + status pill + Tickets influencer tag (drive in demo mode by seeding `applyToPromote` to auto-approve after the same 3.5s pattern used for registration — demo only).
5. Website bucket realignment + admin GET/PATCH extension + admin list section. `npm run lint` + build.
6. Full acceptance pass.

## Edge cases a weaker model would miss
- **Legacy follower-bucket values live in production rows.** `influencer_applications` already contains `5k_20k`, `20k_100k`, `100k_plus`, `under_1k`, `1k_5k`. Deleting those keys from `FOLLOWER_LABELS` makes the admin render raw enum strings for every existing application. Add new labels; never remove old ones.
- **`ticket_tier` check constraint** would reject `'influencer'` if someone "helpfully" runs the schema file's `user_tickets` block against a fresh database and then approves an influencer — hence the constraint-widening guidance. Verify what production actually has before assuming.
- **Double-ticket scenario**: a user can hold a paid `phase1` ticket AND get influencer-approved for the same event → two `user_tickets` rows, two QRs, both scan as valid at the gate. Decision: allow it (Tickets tab lists both), but the admin PATCH should include the joined info so the human reviewer can see the existing ticket and decline if they care. Add one line in the admin row: "Already holds ticket: yes/no" (query `user_tickets` by email+tier≠influencer).
- **`unique (user_id, event_id)`** makes double-applying impossible at the DB level — surface the 23505 unique-violation as the button flipping to its `PENDING` state, not an error toast.
- **The profile.tsx → profile/ folder move** breaks the tab if `_layout.tsx` is forgotten (expo-router then treats the folder's children as top-level tab screens and the tab bar shows phantom entries). The `events/` folder is the working template — copy its layout file exactly.
- **Influencer CTA gating**: show "Apply to Promote" only when `influencerProfile !== null`. Do NOT gate on registration status — an influencer may apply without ever registering normally (that's the whole point: approval IS their ticket).
- **`sonicPulse.id` is the only event** — key everything by `event_id` string anyway (tables above already do); no `events` table exists yet and this plan must not invent one.

## Acceptance criteria
1. Mobile: `npx tsc --noEmit` clean; `CI=1 npx expo export --platform web` lists `/profile/become-influencer`; demo Playwright: full applicant loop (setup → apply → PENDING → auto-approve → Tickets shows 🎤 INFLUENCER · NO CHARGE, no pay buttons).
2. Website: `npm run lint` clean; build passes TS phase; admin page renders legacy applications with correct labels (spot-check `20k_100k` → "20,000 – 100,000").
3. With secrets: apply on account A in-app → row visible in website admin "App Applications" → Approve → `user_tickets` row (tier `influencer`, approved, reference code) → app Tickets tab shows the free ticket without payment ever unlocking; `/verify/<code>` on the website resolves it.
4. Applying twice on the same event from two devices → exactly one application row survives; both devices show PENDING.
