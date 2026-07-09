# Afterhours — Build Plan

**File:** `plan-afterhours.md` · **Status:** authoritative · **Design reference:** the "Afterhours" direction artifact (9 annotated screen mockups)

Afterhours is a mobile-first ticketing app for Gen Z and millennials in Dhaka: event discovery, a wallet where the ticket is a trophy, **Crews** (plan-the-night squads, replacing the old Cliques feed concept), and **Backstage** (a two-sided creator ↔ event marketplace). It is a **new codebase** — it shares no code with the existing "Connect" app on `main`. This branch (`claude/ticketing-app-redesign-premium-uyshva`) is its home; to move it to its own repository later: `git push <new-remote> claude/ticketing-app-redesign-premium-uyshva:main`.

---

## §0 — Instructions to the executing model

You (the executor) are expected to produce work indistinguishable from a senior product team. That quality does not come from talent; it comes from **obeying this document literally**. Follow these rules:

1. **Read §2 (Quality Bar) and §3 (Design System) in full before every phase.** Not once — before *every* phase. Drift happens between phases.
2. **Never invent a design value.** Every color, radius, duration, easing, font size, and spacing step in the app must be traceable to a token in §3. If you need a value that doesn't exist, derive it from the scale (e.g. the next spacing step), add it to the token file, and log one line in `DECISIONS.md` explaining it. If you find yourself typing a hex code or `ms` value inline in a component, stop — you are making a mistake.
3. **One phase per commit series, in order.** Do not start phase N+1 until phase N's acceptance checklist passes. Do not merge phases. Each phase ends with: run the verification script, fix what fails, commit with message `Phase N: <summary>`, push.
4. **Build with real content.** Seed data (§5.1) exists so no screen is ever empty or lorem-filled during development. If a screen looks bad with seed data, the screen is wrong, not the data.
5. **When the plan is ambiguous, choose the option that removes UI, motion, or copy — never the one that adds it.** Premium is subtraction. Log the choice in `DECISIONS.md`.
6. **Do not add libraries beyond §4.2.** Every dependency you add is a decision the design team didn't make. If something seems to require a new package, first check whether ≤50 lines of code replaces it.
7. **Copy is code.** Every user-facing string must pass the voice rules in §3.7. Never ship placeholder copy ("Lorem", "TODO", "Welcome to our app!").
8. **Verify visually.** After any UI phase, render the affected screens at 390×844 (iPhone-class viewport) and compare against §7's per-phase screen specs. If you cannot screenshot, describe the render from the DOM and re-check each acceptance item honestly. Do not check items you have not verified.
9. **TypeScript strict, zero `any`, zero `@ts-ignore`.** Zod-validate every API boundary. Server components by default; `"use client"` only where interaction demands it.
10. **Ask the user only when blocked** on credentials, payment-provider access, or a product contradiction. Everything else in this plan is decided.

---

## §1 — Product summary

| Surface | What it is | Phase |
|---|---|---|
| **Tonight** (home) | Time-aware discovery feed for your city; editorial hero + compact rows; friends-going proof | 2 |
| **Event page** | Poster-first; when/where/who; lineup chips; single CTA with price inside | 2 |
| **Checkout** | Bottom sheet over the event; tier select, up-front flat fee, pay; identity collected *after* payment | 4 |
| **Tickets** (wallet) | Holo-gradient trophy ticket: QR, tilt sheen, transfer, share card, Add to Wallet | 4 |
| **Crews** | One squad per event: checklist (tickets 4/6 + nudge, ride, meet-point vote, room split), thin chat, post-event photo dump | 5 |
| **Backstage** | Creator mode only. Events post briefs (deliverables + reach + comp), creators apply / get invited, deal room with escrowed payout | 6 |
| **You** (profile) | Identity, not admin: stats, memories strip, creator-mode switch, settings | 3 |
| **Gate** | Organizer-side QR scanning, brightness-boost handshake | 4 |

Five-tab shell: **Tonight · Search · Tickets · Crews · You**. Creator mode swaps *Tickets → Backstage* (the pass lives inside Backstage for creators).

Audience: Gen Z / young millennial, Dhaka first. Currency: BDT (৳). Payments: bKash primary, card/Nagad secondary — behind one adapter interface (§7 Phase 4).

---

## §2 — The Quality Bar (non-negotiable)

These rules are what "looks expensive" means. Violating any of them fails the phase.

### 2.1 Restraint rules
- **One signature-magenta object per screen, maximum.** It marks the single most important action. If a screen has two magenta elements, demote one to bone or ghost style.
- **The holo gradient appears only on ticket cards.** Never on buttons, headers, backgrounds, or borders elsewhere.
- **No drop shadows for depth** except: the phone-primary CTA glow (`--shadow-cta`) and the ticket (`--shadow-ticket`). Depth = surface tone + 1px `--line` borders.
- **Film grain overlay only on hero/poster art** (3% opacity). Nowhere else.
- **No emoji in UI chrome** (labels, buttons, headers, empty states). Emoji may appear only in user-generated chat content.
- **No decorative icons.** An icon appears only when it is tappable or disambiguates a row. Icon set: Lucide, 1.7px stroke, never filled.

### 2.2 Banned outright
- Spinners of any kind → skeletons (shimmer 1.2s) only.
- Toast/snackbar libraries → state changes show in place (button becomes its result).
- Confetti, badges with counts >9, gradient text, glassmorphism panels, carousels with dots.
- `alert()`, browser `confirm()`, default focus outlines removed without replacement.
- Horizontal page slides between tabs; layout shift on image load; FOUT (font flash).
- Empty states that say "Nothing here yet" — every empty state names the action that fills it and renders it beautifully (§3.7).
- Centered body text; more than 2 font weights on one screen element.

### 2.3 Definition of done, per screen
- Renders correctly at 360px and 430px widths; no horizontal scroll of the page body.
- Interactive elements ≥44px hit area; visible `:focus-visible` state (2px `--sig` outline, 3px offset).
- Every image/poster has an explicit aspect ratio box before load (no CLS).
- Every list has a skeleton state, an empty state, and an error state — designed, not defaulted.
- `prefers-reduced-motion` collapses all motion to 150ms opacity fades.
- Copy passes §3.7. Digits in columns use `font-variant-numeric: tabular-nums`.

---

## §3 — Design system spec

Single source of truth. Implemented **once** in Phase 1 as CSS custom properties + Tailwind v4 `@theme` tokens in `src/app/globals.css`, then consumed everywhere by name.

### 3.1 Color

| Token | Value | Use |
|---|---|---|
| `--void` | `#070709` | App ground. Body background. |
| `--panel` | `#0F0F14` | Cards, sheets. One step of lift. |
| `--elev` | `#16161D` | Inputs, chips, pressed states. |
| `--line` | `#232330` | 1px borders. Row dividers at 55% opacity. |
| `--bone` | `#ECE9E2` | Primary text; primary (non-signature) buttons. |
| `--dim` | `#8B8894` | Secondary text. Violet-biased grey — do not "correct" it to neutral. |
| `--faint` | `#55525E` | Tertiary: micro-caps, timestamps, disabled. |
| `--sig` | `#FF3FC2` | Signature. One use per screen. P3 override: `color(display-p3 0.918 0.149 0.694)` under `@media (color-gamut: p3)`. |
| `--sig-soft` | `rgba(255,63,194,.14)` | Selected-state fills only. |
| `--money` | `#B8E986` | Semantic: comp/payout amounts, success. Never decorative. |
| `--holo` | `linear-gradient(115deg,#6EE7F0 0%,#FF3FC2 45%,#FFC46B 100%)` | Ticket cards only (1.5px border wrap + sheen). |

Dark, single-theme app by design — do not build a light theme.

### 3.2 Typography

Three roles. Self-host all fonts as woff2 in `src/fonts/` via `next/font/local` (no CDN); subset Latin + Bengali fallback chain for ৳ and mixed-script names: `"Noto Sans Bengali", sans-serif` appended to each stack.

| Role | Face | Weights | Used for | Rules |
|---|---|---|---|---|
| Display | **Clash Display** (Fontshare, free) | 600, 700 | Headlines, event names, big dates, prices on heroes | Tracking −0.025em to −0.035em; `text-wrap: balance`; never below 17px |
| Body | **General Sans** (Fontshare, free) | 400, 500, 600 | Reading text, labels, buttons | Line-height 1.55–1.7; body ≤65ch |
| Data | **Azeret Mono** (Google, free) | 500, 700 | Prices in breakdowns, ticket codes, countdowns, stats, micro-caps | Always `tabular-nums` |

Type scale (px): 11 (micro-caps, +0.18em tracking, uppercase, mono) · 13 · 15 (body default) · 17 · 21 · 26 · 34 (screen title) · 44 (moments only). No sizes off-scale.

### 3.3 Space, radius, borders
- Spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64. Sibling spacing via flex/grid `gap`, not margins.
- Radius scale: **12** chips/inputs · **18** cards · **24** sheets/tickets · **999** pills. Nothing else.
- Screen padding: 20px horizontal. Cards: 16–20px internal.

### 3.4 Motion (implement as `src/lib/motion.ts` constants + Motion library)

One spring family: `spring(stiffness 280, damping 26)` ≈ CSS `linear()` equivalent — export both.

| Token | Value | Use |
|---|---|---|
| `press` | scale 0.97, 90ms ease-out | Every tappable (Pressable primitive) |
| `tabSwitch` | 160ms crossfade | Tab content; icon springs |
| `push` | 320ms spring, shared-element | Card → detail (View Transitions API) |
| `sheet` | 380ms spring | Present/dismiss; drag-to-dismiss with velocity |
| `select` | 200ms spring ring | Tier/option selection |
| `celebrate` | 600ms spring flip | Payment success ticket reveal — the app's only celebration |
| `stagger` | 24px rise, 40ms/item, first 6 only | List entrances |
| `shimmer` | 1.2s linear loop | Skeletons |
| `shake` | 4px x-shake, 260ms | Inline errors |

Haptics (native shell later; ship as a no-op web adapter now — `src/lib/haptics.ts` with `light() medium() success() selection() rigid()`): light = tap; selection = tier/stepper ticks; medium = add/join; success = payment; rigid = error.

### 3.5 Component primitives (Phase 1 builds these; nothing else may reimplement them)
`Pressable` (press motion + haptic), `PillButton` (variants: `solid` bone / `brand` sig+glow / `ghost` line), `Chip` (+ `on` state), `Sheet` (drag-dismiss), `Card`, `Row` (icon glyph + text + trailing), `Avatar` + `AvatarStack` (5 gradient pairs from §3.6, initials, −8px overlap), `Skeleton`, `MicroCaps`, `TabBar`, `Poster` (gradient art + scrim + grain + aspect box), `EmptyState`, `Stepper` (quantity), `TaskRow` (tick done/open), `HoloCard` (Phase 4).

### 3.6 Poster/avatar gradient pairs (for events/users without photos)
A: `#FFC46B→#FF7A59` · B: `#6EE7F0→#5B8CFF` · C: `#FF3FC2→#9D5CFF` · D: `#B8E986→#4FBF8B` · E: `#ECE9E2→#B9B4C6`. Poster art = radial accent (one pair, ≤0.5 alpha) over `linear-gradient(160deg, near-void tints)` + bottom scrim + grain. Deterministic pick: hash of entity id.

### 3.7 Copy voice
- Short, lowercase-energy, zero exclamation marks, zero "!", no "Welcome", no "Oops".
- Buttons say what happens: "Get tickets", "Nudge 2", "Apply", "Pay with bKash" — then become their result ("Paid ✓" pattern, no toast).
- Errors say the fix: "Card declined — try bKash or another card", never "Something went wrong".
- Time-aware headlines: after 17:00 "Tonight.", before 12:00 "This week.", else "Coming up."
- Empty states sell: Crews empty → "Nights are better planned together." + "Start a crew" button.
- Numbers speak scarcity plainly: "34 applied · closes in 6 days", "4 of 6 secured".

---

## §4 — Architecture & stack

### 4.1 Shape
Next.js App Router, mobile-first PWA (Capacitor shell is Phase 7). Server Components default; client islands for interaction. Supabase = Postgres + Auth + Storage + Realtime (crew chat). All writes through Route Handlers with Zod schemas in `src/lib/schemas/`; optimistic UI on every social write (nudge, vote, apply, message).

### 4.2 Dependencies (complete list — do not extend, see §0.6)
`next@16` `react` `typescript` `tailwindcss@4` `@supabase/ssr` `@supabase/supabase-js` `zod` `react-hook-form` `@hookform/resolvers` `motion` `lucide-react` `qrcode` `@zxing/browser` `resend`. Dev: `eslint` `@tailwindcss/postcss` `playwright` (verification screenshots).

**Note (from AGENTS.md):** this Next.js version has breaking changes — read `node_modules/next/dist/docs/` for App Router conventions, fonts, and route handlers before scaffolding. Do not trust training-data Next.js idioms.

### 4.3 Repo layout
```
src/
  app/                    # routes: (tabs)/tonight, (tabs)/search, (tabs)/tickets,
                          # (tabs)/crews, (tabs)/you, events/[slug], checkout/,
                          # backstage/, backstage/deals/[id], gate/, api/
  components/ui/          # §3.5 primitives ONLY
  components/<feature>/   # feature components composed from primitives
  lib/                    # motion.ts, haptics.ts, supabase-{browser,server}.ts,
                          # payments/ (adapter), schemas/, format.ts (৳, dates)
  fonts/                  # vendored woff2
supabase/migrations/      # SQL, one file per phase
seed/seed.ts              # §6.4 seed script
DECISIONS.md              # executor's decision log
```

---

## §5 — Data model (overview; DDL ships per-phase)

`profiles` (id=auth.uid, handle, name, city, avatar_seed, creator_mode bool, nid_verified bool) · `events` (slug, title, venue, city, starts_at, ends_at, poster_seed, organizer_id, status) · `tiers` (event_id, name, price_bdt, quota, sort, status) · `orders` (user_id, event_id, tier_id, qty, fee_bdt, total_bdt, provider, provider_ref, status) · `tickets` (order_id, owner_id, event_id, tier_id, code unique, state: valid|scanned|transferred|void) · `transfers` (ticket_id, from, to_email, accepted_at) · `crews` (event_id, name, created_by) · `crew_members` (crew_id, user_id, ticket_state cached) · `crew_tasks` (crew_id, kind: tickets|ride|meet|stay, payload jsonb, done) · `crew_votes` (task_id, user_id, choice) · `crew_messages` (crew_id, user_id, body, created_at) · `briefs` (event_id, title, wants_count, min_followers, city, comp_pass bool, comp_cash_bdt, deliverables jsonb, closes_at, status) · `applications` (brief_id, creator_id, status: applied|invited|accepted|declined) · `deals` (application_id, escrow_state: held|released|refunded, pass_ticket_id) · `deliverables` (deal_id, label, due_at, proof_url, views_cached, status: open|submitted|approved). RLS on everything: owners read/write their rows; crew members read their crew; organizers read their events' orders/briefs; gate role can update `tickets.state` only.

### 5.1 Seed data (build in Phase 0, evolve per phase)
City: Dhaka. Events: **SonicPulse Festival '26** (Hatirjheel Amphitheatre, 17–18 Apr 2026, tiers Phase 1 Early Bird ৳4,500 / Phase 2 ৳5,500 / Phase 3 ৳6,500, fee ৳120/ticket), **Static Bloom: Rooftop** (Gulshan, Fri), **Bass Culture 012** (Banani, Sat, ৳1,800). Lineup chips: KOYEL, Night Owls, DJ Mirza, Static Bloom. Users: Tushar (@tushar.wav), Ayesha, Rafi, Nishat (@nishat.films, creator), +2. Crew: "BLOCK 9" on SonicPulse, 6 members, 4 ticketed. Briefs: Main Stage (12 creators, Reels ×3 + Stories ×5, 10K+, pass + ৳15,000, 34 applied) and Bass Culture (4 creators, pass + ৳6,000).

---

## §7 — Phases

Every phase: **Objective → Build → Acceptance → Verify.** Verify = `npm run lint && npx tsc --noEmit && npm run build`, plus the phase's visual checks at 390×844, plus honest checklist review. Commit `Phase N: …`, push.

---

### Phase 0 — Clean room & scaffold (~1 day)
**Objective:** this branch becomes the Afterhours codebase; Connect's code is gone from it; `npm run dev` shows a styled void-black shell.

1. On this branch only: `git rm -r` everything except `plan-afterhours.md`, then scaffold fresh Next.js (TS, App Router, Tailwind v4, ESLint) at root. Commit the removal and the scaffold separately. **Never touch `main`.**
2. Add deps (§4.2 exactly). Vendor fonts into `src/fonts/` (download Clash Display + General Sans from Fontshare, Azeret Mono + Noto Sans Bengali from Google Fonts; woff2 only).
3. `globals.css`: §3.1 tokens in `@theme` + `:root`, P3 override, base reset (tap-highlight transparent, `touch-action: manipulation` on interactives, focus-visible ring, overflow-x clip, custom scrollbar).
4. Create `AGENTS.md` (10 lines max): points to this plan §0/§2/§3 as law; keep the existing warning about reading `node_modules/next/dist/docs/`. Create empty `DECISIONS.md`. Root page: wordmark "afterhours" in Clash Display 700 on void — proves fonts + tokens.
5. Supabase project envs in `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`); `supabase/migrations/0000_profiles.sql`; `seed/seed.ts` writing §5.1 events/users to local JSON fixtures (DB seeding activates in Phase 2 when tables exist).

**Acceptance:** clean `git status`; build passes; fonts render (view-source shows no Google/Fontshare CDN); page background is `#070709` not `#000`; no Connect file remains (`git ls-files | grep -i sonicpulse` → empty except historical).

---

### Phase 1 — Foundation: primitives, shell, motion (~1 week)
**Objective:** the app's hand-feel exists before any feature does.

1. `src/lib/motion.ts` (§3.4 tokens), `src/lib/haptics.ts` (no-op web adapter, correct API), `src/lib/format.ts` (`formatBDT(4500) → "৳4,500"`, date/time helpers, time-aware headline helper).
2. Build every §3.5 primitive in `components/ui/`, each ≤150 lines, each with press/skeleton/disabled states as applicable. `Poster` takes `seed` and renders §3.6 gradient art + scrim + grain + aspect box.
3. `(tabs)` layout: 5-tab bar (Lucide icons 1.7px stroke, 9px 600 labels, active = bone + 4px sig dot), 160ms crossfade between tabs, safe-area padding. Placeholder screens per tab using real seed content, each with correct screen title type (34px Clash 700, micro-caps eyebrow above).
4. A hidden `/kitchen` route rendering every primitive in every state — this is the review surface for this phase.

**Acceptance:** `/kitchen` shows all primitives; pressing anything scales 0.97; tab switching crossfades without horizontal motion; reduced-motion collapses everything to fades; zero inline hex/ms values in components (`grep -rn "#[0-9A-Fa-f]\{6\}" src/components` → only ui tokens file, ideally empty).

---

### Phase 2 — Discovery: Tonight + event page (~2 weeks)
**Objective:** the money path's top half; the app becomes a place to find a night out.

1. Migrations: `events`, `tiers` + RLS; activate DB seeding.
2. **Tonight** (`/(tabs)/tonight`): micro-caps date+city line → time-aware headline (§3.7) → filter chips (All/Festivals/Club/Live/Day) → hero card (Poster 242px, date chip top-left in blurred panel, magenta micro-caps category, 24px Clash title, AvatarStack + "4 friends going", mono "from ৳4,500") → "THIS WEEKEND" row of 2-up compact cards. Skeleton + empty ("Quiet week. Try Festivals?" + chip) states.
3. **Event page** (`/events/[slug]`): full-bleed Poster header (218px, back/share overlay) → three `Row`s: when (with doors time), where (venue · distance · "Map" in sig 600), who (AvatarStack + names going) → LINEUP chips → 3-line truncated description with "more" → sticky bottom CTA `PillButton brand` justify-between: "Get tickets" / mono "from ৳4,500". The CTA is the screen's only magenta object — audit the screen for a second one and remove it.
4. Shared-element transition: hero poster morphs into event header via View Transitions API (name = event slug); fall back to crossfade where unsupported.
5. **Search** tab: input (elev fill, radius 12), recent chips, results reuse compact cards. Client-side filter over seeded events is enough this phase.

**Acceptance:** feed → event → back feels continuous (no white flash, poster morphs); headline changes with local time; every card shows friends-going when data exists; CLS = 0 on poster loads (aspect boxes); all three list states (skeleton/empty/error) reachable and designed.

---

### Phase 3 — Auth & the "You" tab (~1 week)
**Objective:** two-tap entry; identity as a scene résumé, not a form.

1. Supabase Auth: Apple + Google OAuth + phone OTP fallback. Onboarding screen per mockup: aurora gradient (radial sig at bottom, cyan whisper right) + grain, wordmark micro-caps in sig — the product and wordmark are **"afterhours"** (lowercase), not SonicPulse — headline "The night is yours." (44px Clash 700), Apple (solid bone) / Google (ghost) / "Use phone number instead" (faint text link). No form fields. Post-auth: create `profiles` row with generated handle; land on Tonight.
2. **You** tab per mockup: 76px gradient avatar (seed), name 21px Clash, mono @handle · city, stat row (Events/Crews/Since — mono tabular), creator-mode card (sig-soft fill + switch; visible always, functional in Phase 6 — until then flipping shows "Backstage opens soon" inline, not a toast), settings `Row`s (Payments & payouts, Notifications, Privacy & ID), MEMORIES strip of past-event Posters.
3. Route protection middleware: `/checkout`, `/crews`, `/you` require session; discovery is public. NID/verification fields exist in schema but **no UI asks for them** until a flow needs them (payout in P6, gate ID in P4 transfer).

**Acceptance:** cold start → browsing events with zero taps; signed-out "Get tickets" → auth sheet → returns to the same event with sheet re-opened; profile renders fully from seed; no form appears anywhere before payment.

---

### Phase 4 — Money path: checkout, wallet, gate (~2 weeks)
**Objective:** paying feels effortless; the ticket earns a screenshot.

1. Migrations: `orders`, `tickets`, `transfers` + RLS; `src/lib/payments/` adapter interface (`createCharge`, `verifyWebhook`, `refund`) with `bkash.ts` (sandbox) + `mock.ts` (dev; auto-succeeds after 1.5s). Provider selection by env.
2. **Checkout Sheet** over the event page (not a route push): tier cards per mockup (selected = sig ring + sig-soft fill + selection haptic; sold-out visible, 45% opacity, not hidden), quantity Stepper (ticks per unit), breakdown (mono tabular right column; fee row literally labeled "Service — flat, shown up front"; total 700), then "Pay with bKash" (solid) + "Card / Nagad" (ghost). Pay → button becomes inline progress (label fades to "Confirming…", no spinner) → success.
3. **Success = the celebration:** sheet dismisses, holo ticket flips in (`celebrate` motion, success haptic). No confetti — the ticket is the confetti.
4. **HoloCard** primitive: 1.5px `--holo` border wrap, inner `#101018→#0A0A10` at radius 24, animated sheen (4.5s loop; on devices with gyro permission, sheen tracks tilt), event micro-caps in sig, holder name 17px Clash, tier caps right, real QR (`qrcode` lib, bone-white panel radius 14), mono ticket code `#SP26-XXXX-XX`, perforation row (dashed + notches), footer mono date/gate.
5. Wallet tab: HoloCard(s) + three ghost actions (Add to Wallet [stub → DECISIONS.md], Transfer, Share) + accommodation upsell `Row` (money-green shield glyph, "Stay 2 nights · rooms from ৳3,200"). **Share** renders a 1080×1920 story-grade PNG of the ticket (canvas; no QR on the share image — code redacted to "████") → native share sheet. **Transfer**: email lookup → pending state on ticket → recipient accepts in-app; ticket state machine enforced server-side (`valid→transferred`, transferred tickets show ghosted "Sent to a@…" card).
6. **Gate** (`/gate`, organizer role): fullscreen scanner (`@zxing/browser`), on-scan verdict fills the screen — money-green "GOOD · PHASE 1 · TUSHAR R." or rigid-haptic red "ALREADY SCANNED 21:14" — 4-second auto-reset. Wallet auto-boosts `screen.brightness` where the shell allows (stub + log).
7. Post-payment identity: after first purchase only, one inline card on the ticket — "Activate your ticket: add your name as on ID" → single name field. This is where Connect's up-front registration form went.

**Acceptance:** mock-provider e2e: browse → sheet → pay → flip → ticket in wallet, in under 60 seconds of taps; fee visible before pay button in same viewport; QR scans from a second device against `/gate`; double-scan rejects with distinct verdict; share PNG contains no scannable code; state machine rejects transferring a scanned ticket (server test).

---

### Phase 5 — Crews (~2 weeks)
**Objective:** the engagement surface nothing else offers: logistics as social glue.

1. Migrations: `crews`, `crew_members`, `crew_tasks`, `crew_votes`, `crew_messages` + RLS (members-only). Realtime channel per crew.
2. Crews tab: crew card per event (name 26px Clash caps, AvatarStack with `+N` overflow avatar). Empty state: "Nights are better planned together." + "Start a crew" (the tab's one sig object). Create flow: pick event → name (default "CREW <n>", inline-editable) → share invite link (joins via deep link, auth-gated).
3. **Checklist card** (four `TaskRow` kinds, all optimistic):
   - **tickets**: auto-computed from members' ticket ownership — "4 of 6 secured" + mono sig "NUDGE 2" → sends push/email to unticketed members ("Your crew is waiting — Phase 1 from ৳4,500"); rate-limit 1/member/day.
   - **ride**: free-text payload ("Ayesha drives, leaves Dhanmondi 3:00") + done tick.
   - **meet**: 2–4 options, tap-to-vote, live tally "4/6 VOTED", auto-done at majority + all-voted.
   - **stay**: shows per-head split (`total/members`, mono) + link into accommodation flow.
4. **Chat**: thin by design — text only, 16px-radius bubbles (them: elev, left; me: sig, right), sender name 600 leading the first bubble of a run, no reactions/threads/typing indicators (log the restraint in DECISIONS.md). Realtime + optimistic send.
5. **Post-event flip** (starts_at + 24h): checklist collapses to a summary line; crew becomes photo dump (Supabase Storage, 3-up grid of member uploads) + "Next one?" row linking upcoming events matched to crew members' city.

**Acceptance:** two seeded users in one crew see each other's votes/messages live (<1s); nudge respects rate limit (server test); checklist reflects a member's ticket purchase without refresh; chat renders 200 messages at 60fps (virtualize only if it fails); post-event state verified by faking clock.

---

### Phase 6 — Backstage marketplace (~3 weeks)
**Objective:** creators and events transact through briefs; the media pass becomes the free tier of a real market.

1. Migrations: `briefs`, `applications`, `deals`, `deliverables` + RLS. Roles: `profiles.creator_mode`; organizers = `events.organizer_id`.
2. **Creator mode switch** (You tab): flipping swaps the Tickets tab into **Backstage** (star icon) with a spring morph; passes now live inside Backstage; regular users never see any of this.
3. **Brief board** (`/backstage`): "CREATOR MODE" sig micro-caps eyebrow, chips For you / All briefs / My deals·N. Brief cards per mockup: 14.5px Clash title, dim venue·date·"wants N creators", comp chip in `--money` mono ("PASS + ৳15,000"), requirement chips mono 9.5px in elev ("REELS ×3", "10K+ FOLLOWERS", "DHAKA"), footer "34 applied · closes in 6 days" + bone "Apply" pill. Filled briefs stay visible at 55% opacity, "FILLED" chip. "For you" ranking v1: same-city + follower threshold met + recency; upgrade path noted in DECISIONS.md.
4. **Organizer console** (`/backstage/organize`, organizer-gated): 3-minute brief form (deliverables builder, reach minimum, comp pass toggle + cash amount, count, deadline); applicant list ranked by (followers, completion rate, past deals) with Accept/Decline; browse creator cards and **invite** directly (invited briefs pin to the creator's For-you top with an INVITED chip).
5. **Deal room** (`/backstage/deals/[id]`), per mockup: header (deal · event, counterpart @handle, accepted date) → 4-step Stepper (Applied ✓ Accepted ✓ **Deliver** ● Paid) → escrow card (money-green tint: "৳15,000 held · releases on approval" + "MEDIA PASS ✓") → deliverables TaskRows (approved ✓ / views-cached "41K views" / open with due date + sig "UPLOAD") → "Message organizer" ghost (reuses crew chat components 1:1).
6. **Escrow v1 (honest version):** organizer funds via payment adapter at accept; ledger state `held → released` on approval, `refunded` on cancel/expiry (auto-refund at deadline + 7d). Accepting also mints the MEDIA-tier ticket via Phase 4's pipeline — same HoloCard, "MEDIA" where the tier caps go. Payout: bKash disbursement if sandbox allows, else "Payout queued" + admin CSV export (log in DECISIONS.md). View counts: manual entry at proof submission now; oEmbed autopull is a stretch goal, not a blocker.
7. Completion: all deliverables approved → escrow releases → success haptic → stepper fully sig → creator's completion-rate stat updates (feeds the "For you" ranking from step 3 and their creator card).

**Acceptance:** full loop as two seeded users — organizer posts brief → creator applies → accept (escrow held + MEDIA pass appears in creator's Backstage) → proof submitted → approved → released, with correct money states server-tested at every transition; regular user's app shows zero Backstage surface; invited brief pins with chip; a second magenta object never appears on the board (comp chips are money-green, not sig).

---

### Phase 7 — The feel pass & shell (~1 week, then continuous)
**Objective:** the difference between "redesigned" and "expensive".

1. **Motion audit:** every interactive element uses Pressable; every duration/curve from `motion.ts` (`grep -rn "duration-\|ease-\|transition:" src/components | grep -v motion.ts` → empty); one spring family app-wide.
2. **Performance:** money path (feed→event→sheet→pay→ticket) interaction-to-paint ≤200ms on throttled 4× CPU; 60fps scroll traces on feed and chat; images lazy + blurred-placeholder; route prefetch on card press-start.
3. **PWA:** manifest (void background, afterhours wordmark icon), service worker for wallet offline (tickets render with no network — QR must work in a dead zone at the gate).
4. **Capacitor shell:** wrap; wire `haptics.ts` to `@capacitor/haptics` (mapping in §3.4); status-bar void; screen-brightness for wallet; gyro sheen permission flow.
5. **Copy & a11y sweep:** every string against §3.7; VoiceOver labels on wallet + gate verdicts announce assertively; contrast spot-checks (dim-on-panel ≥ 4.5:1 for body sizes).
6. Playwright screenshot suite: every screen in every state, 390×844, committed to `verify/` as the regression baseline.

**Acceptance:** audits above pass with evidence pasted into `DECISIONS.md`; offline wallet QR verified; reduced-motion pass on all 9 core screens.

---

## §8 — Appendix

### 8.1 Per-screen magenta audit (run at the end of every UI phase)
Tonight → hero category micro-caps **or** nothing · Event → CTA · Checkout → selected tier ring · Wallet → (holo owns it; no sig element) · Crews → NUDGE **or** Start-a-crew · Board → eyebrow · Deal room → UPLOAD · You → creator-mode card · Onboarding → wordmark micro-caps. One per screen. The list is the law; deviations go to DECISIONS.md.

### 8.2 Glossary (use these words in UI, code, and copy)
crew (not group/squad in UI), brief (not campaign/gig), deal (not collab), comp (not payment, in creator UI), pass (not media ticket), nudge (not remind), memories (not history), Tonight (the tab, capitalized).

### 8.3 What was deliberately not built
Light theme · feed of user posts (Cliques — see redesign rationale) · reactions/threads in chat · follower graphs inside Afterhours (reach is imported, not grown here) · seat maps (GA events only, v1) · multi-city (Dhaka hardcoded until events demand otherwise).
