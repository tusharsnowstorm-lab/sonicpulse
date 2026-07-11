# Sonic Pulse — "Gallery Minimal" Redesign Plan

End-to-end build plan for redesigning the Sonic Pulse website in Direction A
(approved by owner). Written to be executed by an AI agent (Sonnet 5) with
minimal owner intervention, at the highest quality bar.

Approved mockup reference: https://claude.ai/code/artifact/fcc13c46-d148-4544-9a3f-065a8148b76e

---

## 0. Non-negotiable requirements (from owner)

1. **Feel**: Expensive, posh, Apple-Store. Users should feel they are on a premium
   platform built by specialists. Restraint over decoration.
2. **Mobile**: ALL code must work on Android and iOS. Every interactive element
   gets `touchAction: 'manipulation'`. Use `100svh` not `100vh`, respect
   `env(safe-area-inset-*)`, `-webkit-appearance: none` on styled form controls.
3. **Influencers removed**: Delete `/influencers` pages and related API routes.
   Influencers are onboarded in the Afterhours app now.
4. **Pricing**: Web prices ৳5,500 / ৳6,500 / ৳7,500. In the Afterhours app each
   tier is ৳1,000 less (৳4,500 / ৳5,500 / ৳6,500). The discount is promoted
   throughout the site.
5. **Imagery**: Rich photography — artists, stage, experience — but images always
   sit behind dark gradients with type on top. Never let an image fight the type.
6. **Color**: Magenta `#FF3FC2` is the ONLY accent, used sparingly (eyebrows,
   app-price lines, one featured-tier border). P3 override stays:
   `color(display-p3 0.918 0.149 0.694)`.
7. **Event facts**: 25 September 2026, 4:00 PM Friday → 9:00 AM Saturday,
   17 hours, 2 stages, 800 capacity, Dhaka. Tickets non-refundable; if event is
   cancelled for external factors, tickets carry to the next edition.

---

## 1. Design system (build this FIRST — everything derives from it)

### 1.1 Design tokens (`src/app/globals.css` — rewrite)

```css
:root {
  /* Canvas */
  --bg-void: #000000;          /* page canvas — pure black */
  --bg-elevated: #0A0A0A;      /* cards */
  --bg-surface: #101010;       /* inputs, nested surfaces */

  /* Text */
  --text-primary: #FFFFFF;
  --text-dim: rgba(255,255,255,0.55);   /* ledes, body */
  --text-muted: rgba(255,255,255,0.35); /* labels, captions */

  /* Accent — the only color */
  --accent-magenta: #FF3FC2;
  --accent-soft: rgba(255,63,194,0.4);  /* featured borders */
  --accent-faint: rgba(255,63,194,0.08);/* tinted fills */

  /* Hairlines */
  --border: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.2);

  /* Radii — two values only */
  --radius-pill: 999px;   /* buttons */
  --radius-card: 24px;    /* cards, panels */

  /* Type scale (clamp-based, mobile-first) */
  --text-display: clamp(52px, 8.5vw, 92px);  /* h1 only */
  --text-title: clamp(34px, 5vw, 52px);      /* h2 section titles */
  --text-lede: 17px;
  --text-body: 14px;
  --text-caption: 12px;
  --text-label: 11px;  /* uppercase tracked labels */
}
@media (color-gamut: p3) {
  :root { --accent-magenta: color(display-p3 0.918 0.149 0.694); }
}
```

Keep the existing font setup: Montserrat is the single family
(`--font-montserrat`); all legacy aliases (`--font-inter`,
`--font-space-grotesk`, `--font-jetbrains-mono`) continue mapping to it.

### 1.2 Typography rules

- **Display (h1)**: 700 weight, `letter-spacing: -0.035em`, `line-height: 1.0`.
  Two-line pattern with second line at `rgba(255,255,255,0.35)` ("One night. /
  Seventeen hours.").
- **Section titles (h2)**: 700, `-0.03em`, centered.
- **Eyebrow labels**: 11–12px, `letter-spacing: 0.3em–0.45em`, uppercase,
  magenta OR `--text-muted` — magenta only for the hero eyebrow and tier names
  on featured cards.
- **Body**: max-width 440px for ledes, `line-height: 1.65`.
- NO font-black (900) anywhere. 700 is the heaviest weight. Poshness = restraint.

### 1.3 Component vocabulary

| Component | Spec |
|---|---|
| Primary CTA | White pill: `background:#fff; color:#000; border-radius:999px; padding:15px 38px; font-weight:600; font-size:14px` |
| Ghost CTA | Text-only white, or 1px `--border-strong` pill outline |
| Card | `#0A0A0A`, 1px `--border`, `border-radius:24px` |
| Featured card | Same + border `--accent-soft`, extra vertical padding |
| Section | `padding: 110px 6vw` desktop, `80px 24px` mobile, centered |
| Stat | 30px/700 number over 11px uppercase tracked label |
| Hairline divider | 1px `--border`, full-bleed |
| Input | `#101010` bg, 1px `--border`, `border-radius:12px`, 15px text, focus ring `--accent-soft`, `-webkit-appearance:none` |
| Photo card | `aspect-ratio` fixed, image `object-fit:cover`, overlay `linear-gradient(0deg, rgba(0,0,0,0.85), transparent 45%)`, meta text bottom-left |
| Image hover | `transform: scale(1.04)` over 0.6s `cubic-bezier(0.2,0.8,0.2,1)` — desktop only (`@media (hover:hover)`) |

### 1.4 Motion rules

- Transitions: opacity and transform ONLY (compositor-friendly = smooth on mobile).
- Scroll reveals: single `IntersectionObserver` utility → `opacity 0→1` +
  `translateY(24px→0)`, 0.7s, staggered 80ms for grid children. Once, not looping.
- `@media (prefers-reduced-motion: reduce)` disables all of it.
- NO parallax, NO scroll-jacking, NO marquees, NO glow/neon animations.
  Delete the existing scanline/glow/pulse keyframes from globals.css.

### 1.5 Imagery treatment

- All photos get a dark scrim before type goes on top.
- Artist portraits: 3:4 ratio. Experience cards: 4:3. Hero + stage break: full-bleed.
- Use existing assets in `public/images/` (hero-visual.jpg, artists/*.svg) as
  placeholders; structure code so a real photo drop-in later needs zero code
  changes (all images referenced via the data files).
- `next/image` everywhere with proper `sizes` attr; `priority` on hero only.

---

## 2. Architecture changes

### 2.1 Deletions
- `src/app/influencers/` (page, transfer/)
- `src/app/api/influencers/` (route, lookup/, transfer/)
- `src/components/dashboard/ProfileCompletionBanner.tsx` (already unused)
- Any nav/footer links to influencers.
- Do NOT drop the Supabase `influencer_applications` table (owner may still have
  data; just remove the web surface). Keep `src/app/api/admin/influencers/`
  and the admin Influencers tab REMOVED from the UI but leave the API file in
  place, commented at top: kept for potential data export.
  — Correction: remove the admin influencers tab from AdminClient.tsx entirely;
  leave the API route file untouched.

### 2.2 Pricing update (`src/data/tickets.ts`)
```ts
export const TIERS = [
  { id: 'pulse',     name: 'PULSE',     price: 5500, appPrice: 4500,
    perks: ['General entry', 'Both stages', 'Rest zones'] },
  { id: 'rhythm',    name: 'RHYTHM',    price: 6500, appPrice: 5500, featured: true,
    perks: ['Priority entry', 'Lounge access', 'Complimentary drink'] },
  { id: 'crescendo', name: 'CRESCENDO', price: 7500, appPrice: 6500,
    perks: ['VIP entry', 'Stage-side deck', 'Dedicated bar'] },
]
export const APP_DISCOUNT = 1000
export const APP_NAME = 'Afterhours'
```
Grep the whole repo for old prices (4500/5500/6500 as web prices) and tier names;
update everywhere including RegistrationForm, TicketCard print template, FAQ.

### 2.3 New shared components (`src/components/ui/`)
- `Section.tsx` — section wrapper (padding, optional title/sub, centered)
- `Eyebrow.tsx` — tracked uppercase label
- `PillButton.tsx` — primary/ghost variants (replaces Button.tsx usage on public pages)
- `PhotoCard.tsx` — image + scrim + meta (used by lineup + experience)
- `Reveal.tsx` — IntersectionObserver scroll-reveal wrapper
- `AppPromoBand.tsx` — the "Save ৳1,000" band with phone mockup (used on home + tickets)

Keep `Button.tsx`, `Accordion.tsx`, `Badge.tsx`, `FileUpload.tsx`,
`ImageCropModal.tsx` for dashboard/admin surfaces; restyle their tokens only.

---

## 3. Page-by-page build spec

Build in this order. Each page ships in its own commit.

### Phase 1 — Foundation
**Commit 1: tokens + shared components**
- Rewrite `globals.css` per §1.1. Delete legacy neon/glow/scanline utilities and
  the volt/electric/pulse accent variables (keep magenta + P3).
- Build the six shared components (§2.3).
- Update `src/data/tickets.ts` (§2.2).
- Gate: `npm run build` passes; no page imports a deleted CSS class
  (grep for `glow-border`, `scanline`, `accent-volt`, `accent-electric`,
  `accent-pulse` → zero hits in src).

**Commit 2: Navbar + Footer + MobileMenu**
- Navbar: transparent over hero, gains `rgba(0,0,0,0.8)` + `backdrop-filter:
  blur(20px)` + bottom hairline after 40px scroll. Logo left (13px, 700,
  `letter-spacing:0.32em`, "SONIC PULSE"). Links right: Lineup, Schedule,
  Tickets, FAQ, Contact, then "Sign in" in white. No magenta in nav.
- MobileMenu: full-screen black overlay, links as 28px/700 list, staggered
  fade-in, close X top-right. Safe-area padded.
- Footer: single hairline top, two rows — logo + one-line description; link
  columns (Event: Lineup/Schedule/Tickets · Support: FAQ/Contact/Policy ·
  Account: Sign in/Dashboard). Bottom row: © 2026 Sonic Pulse · social links.
  All 11.5px, `--text-muted`.

### Phase 2 — Home (`src/app/(main)/page.tsx` + `src/components/home/`)
**Commit 3: Hero + StatsBar**
- Hero: full-viewport (`min-height:100svh`), hero-visual.jpg full-bleed behind
  a bottom-heavy black gradient. Content bottom-left on desktop, bottom-center
  mobile. Eyebrow "25 SEPTEMBER 2026 · DHAKA" (magenta) → display headline
  "One night. / Seventeen hours." (second line dimmed) → lede → white pill
  "Get tickets" + ghost "See the lineup →".
- StatsBar → hairline strip: 17 Hours · 2 Stages · 12 Artists · 800 Capacity.
- Delete HoldBackTheVoid.tsx (off-brand for new direction).

**Commit 4: Lineup teaser + stage break + experience + tickets teaser + app band**
- ArtistTeaser → 4-artist PhotoCard grid (3:4), names bottom-left, times as
  tracked caption. "Full lineup →" ghost pill below.
- Stage break: full-bleed image section (60vh) with single statement
  "The biggest sound system ever assembled in Dhaka." + caption
  "MAIN STAGE · 400,000 WATTS". Top/bottom black fades.
- Experience grid: 4 PhotoCards (4:3) — The lounge / The sunrise set /
  Midnight kitchen / Shuttle service. Copy from mockup.
- TicketsTeaser → three tier cards (§1.3), middle featured, app-price line in
  magenta under each price.
- AppPromoBand at the bottom (before footer).
- FAQTeaser: cut to 3 questions, restyled accordion (hairlines, no cards).

### Phase 3 — Public pages
**Commit 5: Lineup page** — full artist grid (all artists from
`src/data/artists.ts`) as PhotoCards, stage filter as two ghost pills
(All / Main stage / Pulse stage). Artist detail stays inline (no modal).

**Commit 6: Schedule page** — restyle Timetable: hairline rows, time in tracked
caption left, artist 20px/600, stage tag right. Keep ICS download as ghost pill
(times already 16:00 → 09:00). Day toggle as pills.

**Commit 7: Tickets page** — hero-less: Section title "Choose your night" +
three tier cards + AppPromoBand + RegistrationForm restyled (inputs per §1.3,
white pill submit, shuttle add-on card in the new card style). Keep all existing
form logic/validation/API wiring EXACTLY as-is — this is a reskin, not a rewrite.

**Commit 8: FAQ + Policy + Contact**
- FAQ: search input (§1.3 input), category as tracked eyebrow dividers,
  accordions as hairline rows (question 16px/600, answer `--text-dim`).
- Policy: prose page, max-width 640px, h2s as tracked eyebrows, includes the
  non-refundable + carry-over policy text.
- Contact: two-column (form left, details right), form inputs per §1.3.

### Phase 4 — Auth + user surfaces
**Commit 9: Login page** — centered card on black: logo, one-line welcome,
Google button as white pill with Google mark, legal line in `--text-muted`.

**Commit 10: Dashboard** — keep ALL logic; reskin: top bar per new Navbar
style, "My tickets" as h2 + tracked eyebrow, TicketCard restyled (24px radius,
hairlines, status as small tracked label: PENDING muted / APPROVED white /
REJECTED dimmed red), AddTicketForm + transfer modal restyled with §1.3 inputs.
Instagram modal keeps its short copy. ProfileSection + AccommodationSection same
treatment.

**Commit 11: Verify page + gate scanner** — reskin status states (approved =
white check in hairline circle, magenta only on the reference code). Gate
scanner: keep camera logic untouched; restyle chrome only.

### Phase 5 — Admin
**Commit 12: Admin panel** — remove Influencers tab + InfluencerRow + related
state/handlers from AdminClient.tsx. Reskin: tab pills, ticket rows as hairline
list rows with expand, keep gender M/F toggle and approve/reject logic exactly.

### Phase 6 — Cleanup + hardening
**Commit 13: Deletions + copy sweep**
- Delete influencer pages/APIs per §2.1.
- Grep sweep: no references to `/influencers` anywhere (nav, footer, dashboard,
  sitemap); no old prices; no old event times (16:30 / 4:30 PM);
  no 16.5-hours copy.
- Update metadata: every page gets a proper `<title>` + description
  ("Sonic Pulse — One night. Seventeen hours." pattern).

**Commit 14: Performance + a11y pass**
- All images through `next/image` with `sizes`; hero `priority`; everything else
  lazy. `next build` bundle check — no page over 200KB first-load JS beyond the
  Next.js baseline.
- Focus-visible rings on all interactive elements (white 1px offset ring —
  visible on black).
- Contrast check: `--text-muted` (35% white) is used ONLY for decorative
  labels/captions, never for essential reading copy (that's `--text-dim` 55%).
- `prefers-reduced-motion` honored (§1.4).
- Tap targets ≥44px on all mobile controls.

---

## 4. Testing protocol (run per phase, not just at the end)

### 4.1 Automated (every commit)
```bash
npm run build        # must pass with zero errors
npx tsc --noEmit     # type check
npm run lint         # eslint
```

### 4.2 Visual verification (every page commit)
Launch dev server via the browser tooling, then verify at BOTH viewports:
- Desktop 1280×800 and mobile 375×812.
- Checklist per page: no horizontal scroll; nav/footer render; hero type not
  clipped; images cover without distortion; buttons ≥44px on mobile;
  text over images legible; magenta appears only in sanctioned spots.
- Screenshot each page at both sizes; eyeball against the approved mockup.

### 4.3 Flow tests (Phase 4+, manual via browser tooling)
- Registration: fill form → shuttle toggle → submit reaches API (expect
  success or a clean validation error — no unstyled failures).
- Dashboard: sign-in redirect works, tickets list renders, add-ticket modal
  opens/closes, transfer modal opens.
- Verify page renders all three status states (use a known reference code if
  available; otherwise verify the invalid-code state renders cleanly).
- Admin: tab switching, ticket expand, approve/reject buttons render
  (do NOT actually approve/reject live data).
- Gate: page loads, camera permission prompt appears (don't need a live scan).

### 4.4 Regression greps (Phase 6)
```bash
grep -rn "influencer" src --include="*.tsx" --include="*.ts"  # only admin API file allowed
grep -rn "4:30\|16:30\|16.5" src                              # zero hits
grep -rn "accent-volt\|accent-electric\|CCFF00\|00F0FF" src   # zero hits
```

### 4.5 Owner intervention points (only these)
1. Approve final screenshots of home + tickets before Phase 6 push (single
   review message).
2. Provide real photography when available (drop-in, no code changes).
3. Supabase is untouched by this redesign — no SQL needed.

Everything else proceeds without asking. Push to `main` after every passing
phase (build + visual checks green).

---

## 5. Copy bank (use verbatim; owner-approved tone: confident, spare)

- Hero: eyebrow "25 SEPTEMBER 2026 · DHAKA" · h1 "One night. Seventeen hours."
  · lede "Bangladesh's first sunset-to-sunrise music festival. Two stages.
  Eight hundred people. No filler."
- Stage break: "The biggest sound system ever assembled in Dhaka." /
  "MAIN STAGE · 400,000 WATTS"
- Tickets: h2 "Choose your night" · sub "Every tier includes both stages, all
  seventeen hours." · app line under price "৳X,XXX in the app"
- App band: h3 "Save ৳1,000 on every tier." · body "Book inside the Afterhours
  app and every ticket drops by one thousand taka. Same tiers, same night." ·
  CTA "Get the app"
- Experience: The lounge — "Rest, recharge, re-enter. Open all seventeen
  hours." · The sunrise set — "The last two hours, as the sky turns. You'll
  understand when you're there." · Midnight kitchen — "Chef-led food court
  running till close." · Shuttle service — "Round-trip transport from central
  Dhaka. Add it at checkout."
- Refund policy: "All tickets are non-refundable. If the event is cancelled due
  to circumstances outside the organiser's control, your ticket carries over to
  the next edition of Sonic Pulse."

Writing rules for any copy not in the bank: sentence case, no exclamation
marks, no "amazing/epic/insane", numbers spelled as digits except in ledes,
never say "please".

---

## 6. Execution notes for the building agent

- Read `AGENTS.md` first: this Next.js version has breaking changes — check
  `node_modules/next/dist/docs/` before using any API you're not certain about.
- One phase per session-chunk; commit + push after each passing gate.
- Reskins preserve logic: when a spec says "restyle", change JSX/classNames/
  styles only — never touch handlers, API calls, or state shape.
- If a visual check fails, fix before proceeding — never stack unverified pages.
- If an ambiguity arises, resolve it by matching the approved mockup, then the
  tokens in §1, then Apple.com as tiebreaker. Do not ask the owner.

---

## 7. Phase 7 — Readability hardening + gate reskin (added 12 Jul 2026)

Owner reviewed the deployed landing page (Firefox on Windows) and flagged the
text as too thin / hard to read. Fix readability WITHOUT sacrificing the
Gallery Minimal aesthetic: the look stays black-canvas, restrained, pill-based;
what changes is weight, contrast, and scrim strength. Do not reintroduce glow,
neon, or heavy borders.

### 7.1 Diagnose the font first (do this before changing any values)

The thinness may be a font-loading failure, not a design flaw. Montserrat is
loaded via next/font with weights 400/500/600/700/900 in `src/app/layout.tsx`.
1. Run the dev server, open the home page, and confirm via DevTools
   (Computed → font-family) that the h1 actually renders Montserrat, not a
   fallback (Segoe UI Light is a common Windows fallback that looks thin).
2. Grep for any `fontWeight` below 400 and any element relying on an
   unloaded weight. If a fallback is rendering, fix the font pipeline first
   (e.g. `adjustFontFallback`, correct variable wiring) — that alone may
   resolve most of the complaint.
3. Whether or not a font bug is found, still apply §7.2 — the owner's screen
   proves current values are too low-contrast on real hardware.

### 7.2 Contrast + weight floor (apply everywhere, tokens first)

Token changes in `globals.css` (update the Gallery Minimal block):
- `--text-dim`: rgba(255,255,255,0.55) → **rgba(255,255,255,0.72)**
- `--text-label-muted`: rgba(255,255,255,0.35) → **rgba(255,255,255,0.55)**
- Any inline `rgba(255,255,255,0.45)` used for reading copy (section subs,
  card perks, footer description) → **rgba(255,255,255,0.65)**. Inline 0.35
  used for captions → **0.5**. Grep for `0.45)` and `0.35)` in src and update
  every instance that styles TEXT (leave borders/fills alone).
- Hero dimmed second line: rgba(255,255,255,0.35) → **rgba(255,255,255,0.55)**.
- New rule — minimum text contrast: no reading copy below 0.65 alpha; 0.5
  alpha only for decorative tracked labels; nothing below 0.5 ever.

Weight floor:
- Body/lede text: add `fontWeight: 500` (currently default 400).
- Nav links, footer links: 500.
- The display h1 stays 700 — but bump letter-spacing from -0.035em to
  **-0.02em** (tight negative tracking amplifies perceived thinness at
  large sizes on Windows ClearType).
- Eyebrows keep 700.

Hero scrim (image is busy — type must win):
- Strengthen the hero gradient bottom stop from rgba(0,0,0,0.95) to a taller
  ramp: `0.65 0% / 0.45 30% / 0.7 60% / 0.98 100%`, AND add a left-side
  scrim on desktop (`linear-gradient(90deg, rgba(0,0,0,0.55), transparent 55%)`)
  since hero content is bottom-left.
- PhotoCard scrim: bottom stop 0.85 → **0.92**, extend transparent stop from
  45% to **55%**.

Verification gate for §7.2: screenshot home at 1280×800 and 375×812; every
text block must be clearly legible over its background. Then run the full
build/lint/visual protocol from §4.

### 7.3 Gate scanner reskin (match new system)

Reskin `src/app/gate/GateLanding.tsx` and `src/components/gate/QrScanner.tsx`
to the Gallery Minimal system. Camera/scan logic must not change — chrome only:
- Text wordmark ("SONIC PULSE", 13px/700/0.32em) instead of logo image.
- Background `#000`; cards `--bg-elevated` + 24px radius + hairline border.
- Buttons → pill shapes (white primary, outline secondary), sentence case.
- Replace remaining `--accent-volt` refs with `--accent-magenta`, and any
  jetbrains-mono font refs with montserrat (aliases resolve anyway; tidy them).
- Status colors: keep green #22c55e for success, #e24b4a for errors.
- Apply the §7.2 contrast floor to all gate/verify text.

### 7.4 Dead code — scheduled deletion

`src/components/tickets/RegistrationForm.tsx` and
`src/components/tickets/TierCards.tsx` are unreferenced (kept at owner's
request, 12 Jul 2026). **If still unused by 12 Aug 2026, delete both** and
remove the `react-hook-form`/`zod` deps if nothing else imports them.
Check with: `grep -rln "RegistrationForm\|TierCards" src` (only their own
files should match).

---
