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

## 8. Phase 8 — New Chapters (added 28 Jul 2026, owner-approved)

Owner approved the full direction on 28 Jul 2026 (mockup artifact:
https://claude.ai/code/artifact/bc8515ba-e0af-4634-ae2d-79a672f46d82).
Everything in this phase uses the Gallery Minimal system from §1 unchanged.
All names, lore and copy below are FINAL and owner-approved — use verbatim,
do not rename or rewrite. Assets are already committed under `public/images/`
(artists/, echoes/, activities/, brand/) — no external fetching needed.

### 8.0 Global fact change — event now ends 9:30 AM

The event runs 25 Sep 2026, 4:00 PM Friday → **9:30 AM Saturday, 17.5 hours**
(was 9:00 AM / 17 hours; §0.7 is superseded on this one point). Grep the whole
of `src/` for `9:00 AM`, `9 AM`, `9AM`, `17 hours`, `17-hour`, `17H` and update
every user-facing mention: hero, StatsBar, schedule page, tickets page, FAQ,
policy, any metadata/OG descriptions. Nothing else in §0 changes.

### 8.1 Brand — logo option 5 site-wide

`public/images/brand/logo.webp` (1024px) and `logo-512.png` are the new logo
(circular badge: hand pressing through a glowing membrane + SONICPULSE
wordmark). Use it in: Navbar (replacing the text wordmark IF it reads cleanly
at 32–40px height next to nav links — otherwise logo mark + keep text), the
Footer, `favicon.ico` (regenerate from logo-512.png), and OG/social card
images. Keep the gate scanner's text wordmark (§7.3) as-is.

### 8.2 Lineup page rebuild (`/lineup`) — posters, bios, slider, set times

Assets per artist in `public/images/artists/`: `{slug}-poster.webp` (1200w)
and `{slug}-bio.webp` (1080w) for slugs: `psytaraa`, `vampbetch`, `izhaqo`,
`drip`, `rii`.

Build a full-width **artist slider** (scroll-snap horizontal, arrow buttons +
dot indicators, touch swipe; `touchAction: 'manipulation'` on all controls):
each slide = poster image left (5/12 cols), body right (7/12): set-time chip,
artist name, one-line hook (magenta, uppercase), text bio, and a "View bio
card" toggle revealing the bio-card image (`{slug}-bio.webp`). Mobile: stacks
vertically, poster on top (min-height ~340px, object-fit cover).

Below the slider, a bordered **timetable** listing the night in order.
Chronology and copy (verbatim):

| Time | Act | Tag |
|---|---|---|
| 4:00 – 7:00 PM | First Pulse ×2 — Two rising acts from the open call | Opening |
| 7:00 – 8:30 PM | Fly on the Wall | Dusk |
| 8:30 – 10:00 PM | Izhaqo | Night |
| 10:00 – 11:30 PM | Vampbetch | Night |
| 11:30 PM – 3:00 AM | Night Rituals — Ember Rites peak · The Great Burn at midnight · resident selectors between | Ritual |
| 3:00 – 4:30 AM | Psytaraa | Peak |
| 4:30 – 6:30 AM | Starside Hours — Guided stargazing over an ambient bridge set · Cloud Nine at its best | Drift |
| 6:30 – 8:00 AM | Drip | Sunrise |
| 8:00 – 9:30 AM | Rii | Closing |

Artist hooks + text bios (verbatim; transcribed from the owner's bio cards):

- **PSYTARAA** (3:00–4:30 AM · Peak) — hook "There can be no pulse without him".
  Bio: "As the chief architect of Bangladesh's underground, his peak-time
  techno and psytrance textures don't just move a crowd — they pull it into
  another dimension entirely."
- **VAMPBETCH** (10:00–11:30 PM) — hook "The one and only". Bio: "Sound exists
  in a space between the unknown and the euphoric. Progressive house, acid
  techno and tech house woven into sets that are dark, dynamic and deeply
  immersive. She doesn't just perform for a crowd — she absorbs them whole,
  leaving behind nothing but the frequency."
- **IZHAQO** (8:30–10:00 PM) — hook "None other than". Bio: "His sound exists
  at the intersection of memory and movement. Two worlds — the Middle East and
  the Bay of Bengal — compressed into leftfield grooves, braindance textures
  and bass-driven rhythms that build the way tides do. Gradually. Inevitably.
  Until the room has no choice but to surrender."
- **DRIP** (6:30–8:00 AM · Sunrise) — hook "He built the room he plays to".
  Bio: "Before Drip played his first set, he had already shaped the culture
  around it. Community first, performance second — in that order, always.
  Underground house, deep tech and minimal selections built from the same
  authenticity that created some of Dhaka's most beloved underground spaces.
  What he plays is an extension of what he built."
- **RII** (8:00–9:30 AM · Closing) — hook "Some DJs read the room. She scores
  it". Bio: "A violinist before she was a DJ, her ear was trained on melody,
  dynamics and emotion long before she ever touched a deck. That foundation
  bleeds into everything — hypnotic techno, progressive textures and deep
  organic house that feel less like sets and more like compositions. The pulse
  has never been played quite like this."
- **FLY ON THE WALL** (7:00–8:30 PM) — no assets yet. Styled placeholder slide
  (dark gradient, name + "Poster & bio pending"); owner will supply content
  later. Hook "The early current".
- **FIRST PULSE ×2** (4:00–7:00 PM · Opening) — placeholder slide linking to
  `/first-pulse`: "The first three hours of Sonic Pulse belong to two artists
  chosen from the open First Pulse call. Their posters get made in the same
  treatment as the headliners — same sky, same constellation, same stage."

Update the home `ArtistTeaser` to feature the new posters and link `/lineup`;
update `/schedule` (Timetable/SetRow) to the table above.

### 8.3 Activities — dedicated section, equal billing with artists

New page **`/activities`** plus a home-page section teaser (3 featured cards →
link to page). Card grid (auto-fill minmax ~310px), each card: photo
(16/11 crop), category kicker, NAME · tail (name uppercase 800, tail magenta),
one-line hook, and a "Read more" expander (`<details>`, styled summary) with
the extended copy. Images in `public/images/activities/`. All copy verbatim:

1. **EMBER RITES · Dancers of Flame** (fire show; `ember-rites.webp`) — Hook:
   "Fire dancers rewrite the dark in ropes of live spark — held close enough
   to feel on your face." Extended: "Performances run in waves through the
   night at the ritual ground beneath the glyph wall. Spinners, breathers and
   whip artists trace the Signal's loops in flame while the far stage bleeds
   bass across the field. Stand inside the drum circle's edge — close enough
   for heat, behind the ember line. Final rite leads the crowd to the Great
   Burn."
2. **THE GREAT BURN · Night of Release** (bonfire; `great-burn.webp`) — Hook:
   "One match. Twelve feet of lore. The whole night's weight, released at
   once." Extended: "All night, Icarus — the giant kite (Echo IX) — collects
   paper ribbons where guests write the thing they came to let go of. Then the
   drums stop, the field goes dark, and the kite takes its only flight: as
   fire. A minute of silence, then the heaviest drop of the night. This is the
   moment people will describe badly to their friends for a year." Caption
   line: "Midnight, inside the Night Rituals block."
3. **WARPAINT · Skin of Light** (glow painting; `warpaint.webp`) — Hook: "UV
   artists mark you in the Signal's own handwriting. Your crew, one
   constellation." Extended: "The glyphs burned into the gate, the boats and
   the feast stalls have an alphabet — and the paint station is where it gets
   written on skin. Pick a line of the lore or let the artist read you and
   improvise. The paint blazes under the stage UV rigs and washes off in the
   morning. What it says doesn't."
4. **NEON LAGOON · Water That Glows Back** (poolside; `neon-lagoon.webp`) —
   Hook: "A pool that glows back. Float in color while the bass rolls across
   the water." Extended: "The pool deck is tiled in lit glyphs and the water
   runs cyan-to-magenta all night. Loungers, towels and a slow poolside
   selector who never rushes anyone anywhere. At dawn it turns into the best
   seat in the house: Drip and Rii's sunrise sets carry across the water.
   Bring shorts, leave dignity — the 7 AM swim is a rite."
5. **STARSIDE · The Whisper Hour** (stargazing; no photo — styled starfield
   placeholder, CSS gradient + dot stars) — Hook: "Lights face down; eyes go
   up. The delta sky, narrated — you're looking at where the Signal came
   from." Extended: "In the quiet hours a guide sets up scopes on the dark
   side of the grounds, away from the rigs. Star maps, a laser pointer, and
   the version of the lore where every constellation the artists wear on their
   skin is real and overhead. Best paired with the Cloud Nine nets next door."
6. **STYX · The Silent Ferry** (boating; `styx.webp`) — Hook: "Glide black
   water in a glowing boat between carved stone lanterns. The quietest set of
   the night is out here." Extended: "Circuit-lit boats, two to four seekers
   each, drifting a channel of carved stone lanterns. Mist on the water, the
   far stage reduced to a heartbeat. The route passes under Event Horizon, the
   bridge of light (Echo III) — and boat crews swear the water under the
   bridge plays a note nothing on land does."
7. **BAZAAR OF ECHOES · Trades of Wonder** (marketplace;
   `bazaar-of-echoes.webp`) — Hook: "A night bazaar of makers — wearables,
   prints, and oddities that glow in the temple lanes." Extended: "Designers,
   UV jewellers, print artists and the installation crews selling miniatures
   of the Nine Echoes. Everything under strings of neon in the temple lanes.
   At 3 AM the bazaar runs a barter hour — money down, trades only — which is
   exactly as chaotic and beautiful as it sounds."
8. **FEAST QUARTER · Fire and Ice** (food stalls; `feast-quarter.webp`) —
   Hook: "Eating as ceremony. Open flame on one side, iced chai and cold
   treats on the other — until the last beat, and a while after." Extended:
   "Stone counters, open flame, glyphs glowing under the woks — and across the
   lane, the cold side: iced chai, kulfi and frozen treats for the
   sweat-drenched. Street classics next to late-night biryani, a full
   vegetarian line, and hot chai at sunrise poured for whoever's still
   standing. The quarter never closes while the music plays — refuelling is
   part of the ritual, not a break from it."
9. **CLOUD NINE · The Star Nets** (net platforms; reuse
   `echoes/cloud-nine.webp`) — Hook: "Raised star-nets over the grass. Sit,
   sprawl, sink — the mesh hums with the far stage's bass." Extended: "A hive
   of lit nets stretched between bamboo pillars, raised off the grass — nine
   bays around a floating center. Shoes off, climb in, lie back. The netting
   carries the sub-bass like a slow heartbeat and the sky does the rest.
   Doubles as Echo VIII in the lore. Best hours: 4 to 6 AM, between the peak
   and the sunrise sets. The only place on the grounds where doing nothing is
   doing everything."

### 8.4 Art installations — "The Nine Echoes" (`/echoes`)

New page **`/echoes`** plus a home-page section teaser. Opens with the
founding myth in a bordered intro panel (verbatim):

> **Before language, there was frequency.**
> Long before this city had a name, something crossed the sky over the delta
> and fell into the wetlands. It didn't die. It scattered — into nine echoes
> that sank into the grass, the water and the trees, and waited. The glyphs
> you'll find burned into stone and steel across the grounds are its
> handwriting.
> One night a year, when eight hundred heartbeats land in the same field, the
> echoes wake. For seventeen hours this place remembers what it is: a landing
> ground. Walk all nine before sunrise and the Loop closes with you inside it.
> **You don't attend Sonic Pulse. You're received by it.**

Then nine alternating image/text panels (image left/right alternating on
desktop, stacked on mobile). Numbering is the trail order (gate → burn), shown
as "ECHO I · THE GATE" style eyebrows. Images in `public/images/echoes/`.
All copy verbatim:

- **ECHO I · THE GATE — COILGATE · The First Loop** (`coilgate.webp`; main
  entrance — the first thing every guest sees). Lore: "The serpent that
  swallowed the first sound and has circled it ever since. You enter the night
  through its coil, and inside, time runs on BPM instead of clocks. Meet its
  eye on the way in — it will already be looking at you." On site: ember-lit
  scales, teal glass eye, kites and jellies visible through the arch. The
  oldest symbol of the loop — every set, every night, every year feeding back
  into itself.
- **ECHO II · THE WALKWAY — GLOWTIDE · The Migration of Dreams**
  (`glowtide.webp`; from the gate into the heart of the grounds). Lore: "The
  current that pulls every wanderer inward — gently, and without asking. The
  jellies overhead migrate along it all night, feeding on bass and lantern
  light. Walk it slowly: arrival isn't a race, it's a descent into deeper
  water." On site: glowing jellyfish avenue between lit poles and lanterns —
  the festival's bloodstream, gate to heart.
- **ECHO III · THE BRIDGE — EVENT HORIZON · Bridge of Light** (NO photo —
  styled placeholder: dark gradient + glowing arch motif + "No photo yet";
  the short bridge across the lake, into the alcove). Lore: "A bridge strung
  with so much light it stops being a bridge. Cross it with a question and the
  alcove on the other side answers quietly. Everyone comes back across the
  Horizon a little lighter than they went." On site: tunnel-of-light dressing
  over the existing bridge; the Styx boats pass beneath.
- **ECHO IV · OVERHEAD — MYCELIA · Dream of the Forest Floor**
  (`mycelia.webp`; hanging above the grove — soft light, fairy weather).
  Lore: "The forest has always talked underground — root to root, a
  whisper-web beneath the grass. On the night the Signal fell, the network
  dreamed for the first time, and its dream floated up: soft-lit blooms
  hanging overhead. Stand beneath them and you're inside the forest's dream."
  On site: giant lit mushroom-medusa canopies hanging overhead among the
  trees — half coral, half toadstool, all glow.
- **ECHO V · THE KEEPER — EMBERHART · Keeper of the Wilds** (`emberhart.webp`;
  standing watch over the open field, fully lit). Lore: "The antlered keeper
  walked out of the floodplain on the first night, antlers tuned like
  antennae, eyes lit with embers of the first burn. It hasn't moved since.
  Regulars insist it does — but only when nobody's watching." On site:
  monumental metal beast, red inner glow, antlers catching the rigs. "Hart" —
  the old word for a crowned stag; ember for the eyes.
- **ECHO VI · THE CLIMB — CHROMA · Beast of Broken Light** (`chroma.webp`;
  climbable — stairs up the mane to the crown). Lore: "A creature assembled
  from every wish that was ever dismissed as childish. Each stair up its mane
  is a wish somebody gave up on; climb them and give those wishes somewhere to
  go. From the crown, the whole dreamscape is yours." On site: iridescent
  glass-panel beast, lit stair spiralling up the mane, horn throwing a beam
  that splits the night into color.
- **ECHO VII · THE OVERLOOK — THE EMPTY THRONE · Seat of No King**
  (`empty-throne.webp`; climbable — stand on the seat and see the whole
  field). Lore: "A throne built for whoever runs the night. Nobody runs the
  night. So it stands empty — which means, for one climb, it's yours. Reign
  for a minute. Survey your kingdom. Come down humble." On site: oversized
  chair in warm neon trim, twin flame torches, guests allowed up for the
  view — the grounds' highest legal vantage point.
- **ECHO VIII · THE REST — CLOUD NINE · The Star Nets** (`cloud-nine.webp`;
  the raised nets over the grass — lie down, look up). Lore: "Woven to catch
  falling stars, the nets caught dreamers instead. Lie back and the mesh hums
  with the far stage's bass like a slow heartbeat. The only place on the
  grounds where doing nothing is doing everything." On site: nine
  bamboo-framed net bays with warm edge light, radiating from a floating
  center — the name is literal. Doubles as the activity of the same name.
- **ECHO IX · THE FINALE — ICARUS · The Last Transmission** (`icarus.webp`;
  the ritual ground — burned at the Great Burn). Lore: "Every festival ends.
  Ours transmits. Icarus is a giant kite of bamboo and woven light that spends
  the night collecting what the crowd wants to release — then flies the only
  way a message that heavy can: as fire. They said don't fly too close to the
  sun. Icarus brings the sun to the field instead. The sparks that rise are
  the reply." On site: monumental kite, psychedelic lit panels, braided tail;
  ribbon-writing station beside it all night until the burn.

Close the page with the trail note: "Enter the Loop (I), ride the tide (II),
cross the horizon (III), walk the forest's dream (IV), meet the keeper (V),
climb (VI), reign (VII), rest (VIII), release (IX). Nine stations, one arc —
gate to burn."

### 8.5 First Pulse — new-artist platform (`/first-pulse`)

Program name: **First Pulse** ("the first signal of the Pulse"). New page with
two halves — manifesto left, registration form right (stack on mobile).

Manifesto copy (verbatim): "Every artist on our poster played to an empty room
once. Somebody gave them a stage anyway. Sonic Pulse runs on the underground,
and undergrounds only survive when the next wave gets a way in — so we're
holding the door open ourselves. The call is open worldwide: if you can get to
Dhaka on 25 September, you can play." / "Two artists from this open call will
open Sonic Pulse 2026: a three-hour window, the main rig, eight hundred people
arriving curious. Same stage as the headliners, same poster treatment, same
sky." Three bullet points: **A real slot, not a side tent** (4:00–7:00 PM on
the main stage, full production) · **The full treatment** (your own
cosmic-constellation poster and bio card, made like the headliners') ·
**Heard by the right ears** (sets reviewed by the Sonic Pulse artists;
selected names announced on the event page).

Form fields → `public.artist_applications` (table SQL in
`supabase-first-pulse.sql`, repo root — owner runs it in the Supabase SQL
editor; assume it exists): full name*, email*, stage name*, city & country*,
sound & genres*, bio* (≤1000 chars, show live counter), example set/mix link
(optional, validate URL), Instagram/socials (optional), years behind the decks
(optional integer, "0 is a valid answer"), anything else (optional). CTA:
"Send your First Pulse →".

API route `src/app/api/first-pulse/route.ts` modeled on `api/register`:
service-role Supabase client, server-side validation, reference code
`FP-XXXXXXXX` (same generator alphabet), duplicate-email returns a friendly
"You've already applied — we have your application" (unique index on
lower(email) raises a 23505), Resend confirmation email in the existing dark
template style ("Application received — First Pulse"), success state on the
page shows the reference code. No file uploads in v1 — mix links only.

Admin: add a "First Pulse" tab in `src/app/admin/AdminClient.tsx` listing
applications (name, stage name, city, genres, mix link as clickable,
created_at) with status transitions pending → shortlisted/accepted/rejected
(reuse the registrations tab's patterns + an api/admin route with the service
role, matching existing admin API conventions).

Navigation: add "First Pulse" to Navbar + MobileMenu + Footer. Link the
lineup's First Pulse slide and the timetable's opening row to `/first-pulse`.

### 8.6 Nav & information architecture

Final top nav: Home · Lineup · Activities · Echoes · Tickets · First Pulse ·
FAQ · Contact (Schedule folds into Lineup's timetable if nav gets crowded on
mobile — builder's call, but every page must remain reachable). Home page adds
two new sections after the artist teaser: Activities teaser (3 cards) and
Nine Echoes teaser (founding-myth pull-quote + 3 echo images) linking to the
new pages.

### 8.7 Execution order & verification

Order: 8.0 facts → 8.1 brand → 8.2 lineup → 8.3 activities → 8.4 echoes →
8.5 first-pulse (page, then API, then admin tab) → 8.6 nav → full test pass.
Per §4 protocol after each sub-phase: `npm run build` + lint clean, screenshot
home/lineup/activities/echoes/first-pulse at 1280×800 and 375×812, §7.2
contrast floor applies to all new text, all interactive elements get
`touchAction: 'manipulation'`, images always behind dark gradients with type
on top (§0.5), magenta stays the only accent (§0.6). The First Pulse form must
degrade gracefully if the `artist_applications` table doesn't exist yet
(catch the DB error, show "Applications open soon" state) — the owner runs the
SQL separately.

### 8.8 Home-page trims (added 29 Jul 2026, owner-requested)

Owner reviewed the live home page on mobile and cut two things:

1. **Stage-break image removed.** `poster-2.webp` had "SONIC PULSE / HOLD
   BACK THE VOID" text baked into the artwork, which collided with the
   overlaid statement copy. `StageBreak` is now a pure typographic band —
   hairline top/bottom borders, black canvas, the statement + caption only.
   The copy ("The biggest sound system ever assembled in Dhaka." / "MAIN
   STAGE · 400,000 WATTS") is unchanged. Do not reintroduce imagery here
   unless the owner supplies clean art with no baked-in text.
2. **Experience section deleted.** `ExperienceGrid` (The lounge / The
   sunrise set / Midnight kitchen / Shuttle service) is gone from the home
   page and the component is deleted — its content was superseded by the
   Activities section (§8.3). §3 Phase 2's "Experience grid" spec and the
   §5 experience copy lines are obsolete.

Asset cleanup that followed: `poster-2.png/webp` and `hero-poster.png/webp`
had no remaining references and were deleted (hero-poster.png alone was
17 MB). `hero-visual.jpg` stays — the home hero uses it.

Home page section order is now: Hero → StatsBar → ArtistTeaser →
ActivitiesTeaser → EchoesTeaser → StageBreak → TicketsTeaser → FAQTeaser.

### 8.9 Ticket surfaces hidden behind a flag (added 29 Jul 2026, owner-requested)

Prices, buying CTAs and ticket registration are **temporarily hidden, not
removed** — the owner will bring them back later. Everything is gated on one
switch: `TICKETS_LIVE` in `src/data/tickets.ts` (currently `false`). To
restore all ticket surfaces, flip it to `true` — nothing else should need
touching.

What the flag gates when `false`:
- Home: `TicketsTeaser` (tier cards + AppPromoBand) renders nothing.
- Hero CTAs: "Get tickets" → primary becomes "See the lineup", ghost becomes
  "Explore the grounds →" (/activities).
- Navbar: "Tickets" nav link and the "Get tickets" pill hidden.
- MobileMenu: "Tickets" link and "Get tickets" button hidden.
- Footer: "Tickets" link hidden.
- Dashboard quick-nav: "Tickets" link hidden.
- `/tickets`: renders a "Tickets open soon" holding page instead of
  `TicketsGate` (the component is untouched, just not routed to).
- Dashboard: "Add ticket" button + `AddTicketForm` hidden; empty-state copy
  says registration opens soon. Existing tickets still display normally.
- Server-side: POST `/api/tickets` and POST `/api/register` return 503 while
  the flag is off, so registration can't happen via direct API calls either.

Untouched by the flag: First Pulse (artist applications stay open), the
admin panel, verify/gate flows, and existing approved tickets in dashboards.

### 8.10 Concept-art disclaimer on activities & echoes imagery (added 29 Jul 2026, owner-requested)

All activity and installation images are AI-generated concept renders. Until
real photography replaces them, a **small, discreet asterisk note** must
accompany that imagery: the real builds follow the renders closely, but may
vary. This is temporary — when real photos land, a future amendment removes
it — so it is gated on one flag for a one-line off-switch.

**Scope fences.** Only the four surfaces below. The lineup/artist posters,
brand logo, First Pulse, nav, footer and all other pages are untouched — the
owner scoped this to activities and installations only. No route changes, no
new assets, no database.

**Files: two creates, four edits.**

1. **Create `src/data/concept-art.ts`:**

```ts
/**
 * The activities and Nine Echoes imagery are AI-generated concept renders.
 * This note discloses that until real photography replaces them, at which
 * point flip the flag to false (or remove the component in a later
 * amendment). See REDESIGN_PLAN.md §8.10.
 */
export const CONCEPT_ART_NOTE_LIVE = true

export const CONCEPT_ART_NOTE =
  '*Concept renders — the real installations and activities follow these images closely, but the night may vary.'
```

2. **Create `src/components/ui/ConceptArtNote.tsx`** (server component, no
'use client'):

```tsx
import { CONCEPT_ART_NOTE, CONCEPT_ART_NOTE_LIVE } from '@/data/concept-art'

/** Discreet footnote for AI-generated concept imagery — see §8.10. */
export default function ConceptArtNote({ centered = false }: { centered?: boolean }) {
  if (!CONCEPT_ART_NOTE_LIVE) return null
  return (
    <p
      style={{
        fontSize: 11.5,
        lineHeight: 1.6,
        color: 'var(--text-label-muted)',
        marginTop: 18,
        maxWidth: 560,
        textAlign: centered ? 'center' : 'left',
        marginLeft: centered ? 'auto' : 0,
        marginRight: centered ? 'auto' : 0,
      }}
    >
      {CONCEPT_ART_NOTE}
    </p>
  )
}
```

3. **Edit `src/app/(main)/activities/page.tsx`:** import `ConceptArtNote`
and `CONCEPT_ART_NOTE_LIVE`. The PageHeader `sub` becomes a template string
so the marker disappears with the flag:
`sub={`Nine rituals around the music — as much the show as the artists themselves.${CONCEPT_ART_NOTE_LIVE ? '*' : ''}`}`.
Render `<ConceptArtNote />` directly after the closing tag of the card grid
`<div>` (left-aligned, bottom of page content).

4. **Edit `src/app/(main)/echoes/page.tsx`:** same pattern —
`sub={`Nine installations, one lore — walk them all before sunrise.${CONCEPT_ART_NOTE_LIVE ? '*' : ''}`}`,
and `<ConceptArtNote />` rendered after the existing closing trail-note
paragraph ("Enter the Loop (I)…"), as the last element before the wrapper
closes.

5. **Edit `src/components/home/ActivitiesTeaser.tsx`:** render
`<ConceptArtNote centered />` immediately after the closing `</PillLink>`
("All nine activities →"), still inside the `<Section>`.

6. **Edit `src/components/home/EchoesTeaser.tsx`:** render
`<ConceptArtNote centered />` immediately after the closing `</PillLink>`
("Walk all nine echoes →"), still inside the `<Section>`.

**Copy is locked.** The note text is exactly the `CONCEPT_ART_NOTE` string
above — one sentence, leading asterisk included, no heading, no emphasis, no
magenta. 11.5px at `--text-label-muted` (0.55 alpha) is the deliberate
"discreet" size: legible per §7.2 but subordinate to everything around it.

**Failure/empty states.** None reachable — static data. With
`CONCEPT_ART_NOTE_LIVE = false` the component returns null and the two
PageHeader subs render without the trailing asterisk, so no dangling `*`
survives the off-switch.

**Reversibility.** Flip `CONCEPT_ART_NOTE_LIVE` to `false` in
`src/data/concept-art.ts` — all four surfaces clear at once. When real
photography replaces the renders, a future amendment deletes the component,
the data file and the two template-string markers outright.

**Verification gates.**
- §4.1: `npx tsc --noEmit`, `npm run lint` (only pre-existing failures
  allowed), `npm run build`.
- Dev server: `curl -s localhost:3000/activities | grep -c "Concept renders"`
  → 1; same for `/echoes` → 1; `curl -s localhost:3000/ | grep -c "Concept renders"`
  → 2 (both teasers).
- The asterisk marker renders at the end of both page subs:
  `curl -s localhost:3000/activities | grep -c "artists themselves.\*"` → ≥1,
  `curl -s localhost:3000/echoes | grep -c "before sunrise.\*"` → ≥1.
- Flag check: set `CONCEPT_ART_NOTE_LIVE = false`, confirm all three pages
  build and render with zero "Concept renders" hits and zero trailing
  asterisks, then restore `true` before committing.
- Playwright at 1280×800 and 375×812 on `/`, `/activities`, `/echoes`:
  `scrollWidth - clientWidth === 0`.
- Scope grep, zero hits: `grep -rn "ConceptArtNote\|concept-art" src/components/lineup src/components/layout src/app/\(main\)/lineup`.

### 8.11 Remove the stage-break section + make the mobile-menu logo link home (added 29 Jul 2026, owner-requested)

Two small landing-page fixes from the owner's mobile review. Independent of
§8.10 (no shared files) — the two amendments can be executed in either order
or together.

**A. Delete the stage-break section — permanent.**

The typographic band ("The biggest sound system ever assembled in Dhaka." /
"MAIN STAGE · 400,000 WATTS") that §8.8 kept after removing its image is now
removed entirely. This is a delete, not a flag: the owner cut the section
outright.

1. Delete `src/components/home/StageBreak.tsx`.
2. Edit `src/app/(main)/page.tsx`: remove the `StageBreak` import and the
   `<StageBreak />` element. Home section order becomes:
   Hero → StatsBar → ArtistTeaser → ActivitiesTeaser → EchoesTeaser →
   TicketsTeaser → FAQTeaser. (§8.8's order list is superseded; with
   `TICKETS_LIVE = false` per §8.9, TicketsTeaser renders null, so the page
   visibly flows Echoes teaser → FAQ teaser.)
3. Superseded plan text: §3 Phase 2's "Stage break" spec and the §5 copy-bank
   lines "The biggest sound system ever assembled in Dhaka." / "MAIN STAGE ·
   400,000 WATTS" are obsolete — do not reintroduce this copy anywhere.

**B. Mobile-menu logo returns to the landing page.**

In `src/components/layout/MobileMenu.tsx`, the header's logo + wordmark is
currently a plain `<span className="flex items-center gap-2.5">…</span>`.
Replace that outer `<span>` with:

```tsx
<Link href="/" onClick={onClose} className="flex items-center gap-2.5">
```

keeping the inner `<Image>` and wordmark `<span>` exactly as they are.
`Link` is already imported in this file. `onClick={onClose}` is required so
tapping the logo while already on the home page still closes the overlay
instead of doing nothing. No explicit `touchAction` needed — the global rule
in `globals.css` covers all `a` elements. The desktop Navbar logo already
links to `/`; do not touch it, the Footer, or the dashboard/admin top bars.

**Failure/empty states.** None — both changes are structural.

**Reversibility.** A is a permanent delete (re-adding would be a new
amendment). B is trivially revertible but is intended as permanent UX.

**Verification gates.**
- §4.1: `npx tsc --noEmit`, `npm run lint` (only pre-existing failures
  allowed), `npm run build`.
- Greps, zero hits: `grep -rn "StageBreak" src` and
  `grep -rn "biggest sound system\|400,000" src`.
- Dev server: `curl -s localhost:3000/ | grep -c "biggest sound system"` → 0.
- Playwright at 375×812 on `/`: tap the burger (aria-label "Open menu"), tap
  the "SONIC PULSE" logo link in the overlay header — the overlay must close
  and the URL must be `/`. Repeat starting from `/lineup` — tapping the menu
  logo must navigate to `/`. `scrollWidth - clientWidth === 0` on `/` at both
  1280×800 and 375×812.

### 8.12 Stage operating hours — sequential, not simultaneous (added 29 Jul 2026, owner-requested)

The owner corrected the stage model: the two stages run **in sequence**, not
simultaneously. Owner's statement: Main Stage 4 PM – 4 AM, second stage
4:30 AM – 9:30 AM. Two planner resolutions applied (both flagged to the owner
for veto before execution):

1. **Main Stage close is recorded as 4:30 AM, not 4:00 AM.** Psytaraa's
   owner-approved set (§8.2 timetable) runs 3:00 – 4:30 AM on the main stage,
   and the second stage starts at 4:30 — a 4:00 close would orphan the last
   half hour of an announced set and leave a dead 4:00–4:30 gap. If the owner
   confirms Main truly ends 4:00 AM, a follow-up amendment must shorten
   Psytaraa to 3:00 – 4:00 AM instead; do not execute that variant without
   owner confirmation.
2. **The second stage keeps its established public name, "Sunrise Stage"**
   (already live in the FAQ 'stages' answer; its 4:30 – 9:30 AM window spans
   sunrise). The owner's phrase "Second Stage" is treated as a description,
   not a rename.

Canonical stage facts from this amendment forward: **Main Stage 4:00 PM –
4:30 AM · Sunrise Stage 4:30 AM – 9:30 AM · one continuous night, sequential
handover at 4:30 AM.** The FAQ claim "Both stages operate simultaneously"
(written in §8.0's sweep) is superseded. "2 Stages" stats, "Two stages"
ledes, and "Every tier includes both stages" remain true and untouched.

**Files: three edits.**

1. **Edit `src/data/faq.ts`** — two answers, replaced verbatim:
   - `id: 'event-hours'` answer becomes exactly:
     "Yes. Doors open at 4 PM on Friday and the event runs through the night
     until 9:30 AM Saturday morning — 17.5 hours of music. The Main Stage
     runs from 4 PM to 4:30 AM, then the Sunrise Stage takes over through to
     9:30 AM."
   - `id: 'stages'` answer becomes exactly:
     "Two stages, running in sequence: the Main Stage (4 PM – 4:30 AM —
     peak-hour techno and house, full production lighting and sound) and the
     Sunrise Stage (4:30 – 9:30 AM — intimate, melodic, facing east for the
     sunrise). A site map will be included in your ticket email."

2. **Edit `src/components/lineup/NightTimetable.tsx`** — the component
   currently returns a single bordered `<div>`. Wrap the return in a fragment
   and append, after that bordered div, exactly:

```tsx
<p style={{ marginTop: 12, fontSize: 12.5, color: 'var(--text-label-muted)', lineHeight: 1.6 }}>
  One continuous night — the Main Stage runs until 4:30 AM, then the Sunrise Stage carries it through to 9:30 AM.
</p>
```

   This caption renders on both `/lineup` and `/schedule` (shared component —
   intended). No row times change; the 4:30 AM boundary already aligns with
   the Psytaraa → Starside Hours handover.

3. **Edit `src/app/layout.tsx`** — adjacent fact fix in the same sweep: both
   metadata description strings say "Dawn till dusk." — backwards for a
   sunset-to-sunrise festival. Replace "Dawn till dusk." with
   "Dusk till dawn." in `metadata.description` and
   `metadata.openGraph.description`. No other metadata changes.

**Scope fences.** Do not touch `src/data/lineup.ts` (set times stay as
approved), tickets copy, StatsBar, hero, emails, policy, or the gate/admin
surfaces. No component or route changes beyond the caption in
NightTimetable.

**Failure/empty states.** None — static copy.

**Reversibility.** Plain copy edits; reverting is a new amendment.

**Verification gates.**
- §4.1: `npx tsc --noEmit`, `npm run lint` (only pre-existing failures
  allowed), `npm run build`.
- Grep, zero hits: `grep -rn "simultaneous" src` and
  `grep -rn "Dawn till dusk" src`.
- Dev server (count occurrences with `grep -o … | wc -l`, not `grep -c` —
  Next.js inlines a duplicate hydration payload on one line, §8.10 execution
  note): `/faq` contains "then the Sunrise Stage takes over" ≥1 and
  "running in sequence" ≥1; `/lineup` and `/schedule` each contain
  "carries it through to 9:30 AM" ≥1.
- Playwright `scrollWidth - clientWidth === 0` on `/faq`, `/lineup`,
  `/schedule` at 1280×800 and 375×812.

### 8.13 Apple sign-in + one account across web and the Afterhours app (added 30 Jul 2026, owner-requested)

Owner wants (a) "Continue with Apple" alongside Google on the sign-in
surfaces, and (b) accounts created on the website to exist in the Afterhours
app too, with both providers usable there.

**Architecture decision (canonical).** Shared accounts are achieved by both
clients using the **same Supabase project** — one `auth.users` pool. The
website already does; the Afterhours app must be pointed at the same project
URL + anon key by the app team. No sync code, webhooks, or API bridges are to
be built in this repo — same project = same accounts, automatically. Google
and Apple both become usable in the app once the app registers its native
OAuth clients against that same Supabase project.

**Gating (both default OFF at execution).** Apple sign-in cannot work until
the owner configures Apple + Supabase (below), and the cross-app account
claim isn't true until the app team switches projects. A dead button and a
false promise are both failure modes, so execution ships the code dark:

1. **Create `src/data/auth.ts`:**

```ts
/**
 * Sign-in feature flags — see REDESIGN_PLAN.md §8.13.
 *
 * APPLE_SIGNIN_LIVE: flip to true ONLY after the Apple provider is
 * configured and verified in the Supabase dashboard (Authentication →
 * Providers → Apple). Until then the Apple button stays hidden.
 *
 * AFTERHOURS_SHARED_ACCOUNT_LIVE: flip to true ONLY after the Afterhours
 * app authenticates against this same Supabase project. Until then the
 * one-account copy line stays hidden.
 */
export const APPLE_SIGNIN_LIVE = false
export const AFTERHOURS_SHARED_ACCOUNT_LIVE = false
```

**Files: one create (above), two edits.**

2. **Edit `src/app/login/LoginClient.tsx`:**
   - Import both flags from `@/data/auth`.
   - Add an `AppleIcon` component beside the existing `GoogleIcon` (this
     file and TicketsGate already each carry their own GoogleIcon — follow
     that convention, duplicate rather than abstract):

```tsx
function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.031 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702"/>
    </svg>
  )
}
```

   - Add `handleAppleSignIn`, identical to `handleGoogleSignIn` but
     `provider: 'apple'` (same `redirectTo`).
   - Directly below the Google button, render (flag-gated):

```tsx
{APPLE_SIGNIN_LIVE && (
  <button
    onClick={handleAppleSignIn}
    className="w-full flex items-center justify-center gap-3 rounded-full px-4 py-3.5 text-sm font-semibold transition-all duration-150 mt-3"
    style={{ background: '#fff', color: '#000', touchAction: 'manipulation' }}
  >
    <AppleIcon />
    Continue with Apple
  </button>
)}
```

     (Same white pill as Google — a matched pair; Google stays first: the
     audience is overwhelmingly Android.)
   - The card's sub copy becomes flag-aware. Replace the static paragraph
     text with:

```tsx
Create your account to register for tickets and manage your bookings.
{AFTERHOURS_SHARED_ACCOUNT_LIVE && ' One account works across the website and the Afterhours app.'}
```

3. **Edit `src/app/(main)/tickets/TicketsGate.tsx`:** same treatment —
   import `APPLE_SIGNIN_LIVE`, add the identical `AppleIcon` component, and
   add `handleAppleSignIn` (`provider: 'apple'`, keeping this file's
   existing `redirectTo` with `?next=/dashboard`). Insert the flag-gated
   Apple button between the Google button and the "Already have an
   account?" paragraph, exactly:

```tsx
{APPLE_SIGNIN_LIVE && (
  <button
    onClick={handleAppleSignIn}
    className="w-full flex items-center justify-center gap-3 rounded-full px-5 py-4 text-sm font-semibold transition-all duration-150 mb-4 cursor-pointer"
    style={{ background: '#fff', color: '#000', touchAction: 'manipulation', marginTop: -6 }}
  >
    <AppleIcon />
    Continue with Apple
  </button>
)}
```

   (This page is currently unreachable while `TICKETS_LIVE = false` — §8.9
   — but must be ready when tickets return.)

**Scope fences.** `auth/callback/route.ts` is provider-agnostic — do not
touch it. Gate-staff email/password login, dashboard, admin, First Pulse,
and the §8.9 ticket gating are untouched. No Supabase dashboard changes are
made by the executor — configuration is owner work.

**Failure/empty states.** Both flags false → site renders exactly as today
(execution is a visual no-op). If Apple is flipped on without Supabase
configuration, Supabase returns a provider-disabled error on tap — which is
why the flag must only be flipped after the owner confirms configuration.

**Reversibility.** Both features are one-line flags; the code is inert
while they are false.

**Owner to-dos (blocking each flag, in order):**
1. *Apple (blocks `APPLE_SIGNIN_LIVE`):* Apple Developer Program account →
   create an App ID and a Services ID with "Sign in with Apple" enabled →
   register the Supabase callback URL
   (`https://<project-ref>.supabase.co/auth/v1/callback`) → generate the
   Sign in with Apple key (.p8) → in Supabase Dashboard → Authentication →
   Providers → Apple, enter Services ID, Team ID, Key ID and the key. Note:
   Apple client secrets expire every 6 months and must be rotated.
2. *Afterhours app (blocks `AFTERHOURS_SHARED_ACCOUNT_LIVE`):* the app team
   points the app's auth at this same Supabase project (same URL + anon
   key) and registers the app's native Google OAuth client and Apple App ID
   under the same Supabase providers. Existing and future website accounts
   then work in the app with no migration.

**Verification gates.**
- §4.1: `npx tsc --noEmit`, `npm run lint` (only pre-existing failures
  allowed), `npm run build`.
- Flags-off (the shipping state): `curl -s localhost:3000/login` →
  "Continue with Apple" occurrences 0 and "Afterhours app" occurrences 0
  (count with `grep -o … | wc -l`).
- Flag-on smoke (local only, revert before commit): set
  `APPLE_SIGNIN_LIVE = true` → "Continue with Apple" ≥1 on `/login`; set
  `AFTERHOURS_SHARED_ACCOUNT_LIVE = true` → "One account works across" ≥1
  on `/login`. Restore both to `false` before committing.
- Playwright `scrollWidth - clientWidth === 0` on `/login` at 1280×800 and
  375×812 (run with both flags true locally, then revert — the wider state
  is the risk).
- Scope grep, zero hits: `grep -rn "APPLE_SIGNIN_LIVE\|AppleIcon" src/app/auth src/app/gate src/app/admin`.

### 8.14 Apple sign-in, corrected against the Afterhours repo (added 30 Jul 2026, owner-directed)

The owner attached the Afterhours repo (`tusharsnowstorm-lab/afterhours`,
cloned at `/workspace/afterhours`) and directed a read of its plan files.
Findings that amend §8.13 — **§8.13's code spec is unchanged and this
section adds no new executor work**; what changes is the architecture
record and the owner to-do list.

**Finding 1 — the §8.13 code pattern is confirmed.** Afterhours signs in
with the identical call (`supabase.auth.signInWithOAuth({ provider:
'apple' | 'google', options: { redirectTo } })` — see
`/workspace/afterhours/src/components/auth/AuthSheet.tsx`), and its code
comments confirm a disabled provider only errors after Supabase's hosted
redirect, not client-side — which is exactly why `APPLE_SIGNIN_LIVE` stays
false until configuration is verified. No changes to §8.13's buttons,
icon, or handlers.

**Finding 2 — the projects are separate; §8.13's architecture paragraph is
superseded.** §8.13 assumed both products already share one Supabase
project. They do not: Afterhours runs its own Supabase Pro project (its
own `supabase/migrations/`, events/orders/crews schema, Apple + Google
providers enabled); Sonic Pulse web runs a different project
(registrations/user_tickets/artist_applications). Therefore:
- "One account across web and app" is NOT achieved by app-side
  configuration as §8.13 claimed. It requires unifying the two products
  onto one auth backend — a real migration (schemas, RLS, storage buckets,
  admin/gate emails) that must be its own future amendment if the owner
  wants it. `AFTERHOURS_SHARED_ACCOUNT_LIVE` stays `false` until that
  amendment ships; it is no longer unblocked by a mere config change.
- In §8.13's `src/data/auth.ts` spec, the comment block for
  `AFTERHOURS_SHARED_ACCOUNT_LIVE` is replaced verbatim with:

```ts
/**
 * AFTERHOURS_SHARED_ACCOUNT_LIVE: the website and the Afterhours app
 * currently run SEPARATE Supabase projects (confirmed 30 Jul 2026 —
 * REDESIGN_PLAN.md §8.14). Flip to true only after a future amendment
 * unifies both products onto one auth backend. Until then the
 * one-account copy line stays hidden.
 */
```

**Finding 3 — the Apple owner to-do collapses to ~15 minutes.** §8.13's
to-do assumed Apple enrollment from zero. The Afterhours launch work
(plan-launch.md L0, App Store guide Parts 0–1) already produced: an
enrolled Apple Developer account, a "Sign in with Apple" key (.p8), and a
working Services ID pointed at the Afterhours Supabase callback. Apple
allows one Services ID to carry multiple return URLs, so §8.13's owner
to-do item 1 is replaced with:

1. *Apple (blocks `APPLE_SIGNIN_LIVE`):* in the Apple Developer portal,
   open the existing Sign in with Apple **Services ID** (the one created
   for Afterhours) → Configure → add the Sonic Pulse Supabase domain and
   return URL: `https://<sonicpulse-project-ref>.supabase.co/auth/v1/callback`
   (the project ref is shown in the Sonic Pulse project's Supabase
   dashboard → Project Settings → API). Then in the **Sonic Pulse**
   Supabase project → Authentication → Providers → Apple: enter the same
   Services ID as client ID and generate the secret from the same Team
   ID, Key ID and .p8 already used for Afterhours. No new Apple accounts,
   keys, or Services IDs are needed. The 6-month secret rotation noted in
   §8.13 now applies to both Supabase projects.

Owner to-do 2 from §8.13 (app-side) is superseded by Finding 2 — there is
nothing for the app team to configure until a unification amendment
exists.

**Executor invocation is unchanged:** "execute §8.13 of REDESIGN_PLAN.md"
builds the code (reading §8.13 together with this section for the amended
`auth.ts` comment). All §8.13 verification gates apply as written.

### 8.15 Sign-in turned off behind a flag (added 30 Jul 2026, owner-requested)

The owner is closing public sign-in "for now — live again later". Same
philosophy as §8.9 (tickets): **hide, don't delete**, one flag, one-line
restoration. Two deliberate exceptions, both flagged to the owner:

- **Gate staff login stays live.** It is an operations tool (email +
  password on `/login`), not public sign-in. It keeps working.
- **Already-signed-in users are not evicted.** Their sessions, the navbar
  "Account" link, and `/dashboard` keep working. This closes the door; it
  does not log anyone out.

This is a soft switch, not a security boundary — someone hand-crafting the
Supabase OAuth URL could still authenticate. That is acceptable for a
"not open yet" state; nothing sensitive is reachable by merely having an
account.

**Files: one create (superseding §8.13's file spec), four edits.**

1. **Create `src/data/auth.ts`** — this is now the canonical spec for the
   file, superseding §8.13's item 1 (three flags, not two). If §8.13
   executes after this section, it skips its own file creation:

```ts
/**
 * Sign-in feature flags — see REDESIGN_PLAN.md §8.13–§8.15.
 *
 * SIGNIN_LIVE: master switch for PUBLIC sign-in (owner request, 30 Jul
 * 2026 — §8.15). false = the attendee sign-in card, and every "Sign in"
 * link in nav/menu/footer, are hidden. Gate-staff login and existing
 * signed-in sessions are unaffected. Flip to true to restore.
 *
 * APPLE_SIGNIN_LIVE: flip to true ONLY after the Apple provider is
 * configured and verified in the Supabase dashboard (Authentication →
 * Providers → Apple) — see §8.14 for the short path via the existing
 * Afterhours Services ID.
 *
 * AFTERHOURS_SHARED_ACCOUNT_LIVE: the website and the Afterhours app
 * currently run SEPARATE Supabase projects (confirmed 30 Jul 2026 —
 * REDESIGN_PLAN.md §8.14). Flip to true only after a future amendment
 * unifies both products onto one auth backend. Until then the
 * one-account copy line stays hidden.
 */
export const SIGNIN_LIVE = false
export const APPLE_SIGNIN_LIVE = false
export const AFTERHOURS_SHARED_ACCOUNT_LIVE = false
```

2. **Edit `src/app/login/LoginClient.tsx`:**
   - Import `SIGNIN_LIVE` from `@/data/auth`.
   - Add an owner escape hatch so admins can still reach Google sign-in
     without a redeploy (client-only state, no hydration mismatch):

```tsx
const [signinOverride, setSigninOverride] = useState(false)
useEffect(() => {
  if (new URLSearchParams(window.location.search).has('open')) setSigninOverride(true)
}, [])
```

     (`useEffect` joins the existing `useState` import.)
   - Compute `const signinOpen = SIGNIN_LIVE || signinOverride`.
   - In the attendee card, when `signinOpen` is false: keep the "Sign in"
     heading, and replace the sub-copy paragraph, the Google button (and
     §8.13's Apple button, if built) and the terms line with a single
     paragraph, verbatim, styled like the existing sub-copy
     (`className="text-sm"`, `style={{ color: 'rgba(255,255,255,0.65)' }}`):
     "Sign-in isn't open yet — accounts and ticket registration go live
     closer to the event. Follow @sonicpulsefestival for the word."
     When `signinOpen` is true, the card renders exactly as before.
   - The gate-staff section below the card is untouched.

3. **Edit `src/components/layout/Navbar.tsx`:** import `SIGNIN_LIVE` from
   `@/data/auth`. The desktop nav's account slot currently renders
   `user ? <Account link> : <Sign in link>`. Change the false branch to
   render the Sign-in link only when `SIGNIN_LIVE`; with the flag off and
   no user, render nothing in that slot.

4. **Edit `src/components/layout/MobileMenu.tsx`:** same rule — the
   bottom-CTA area renders the Account pill when `user` exists; the
   Sign-in pill only when `SIGNIN_LIVE`. Flag off + signed out = neither
   pill (the "Get tickets" pill there is already gated by §8.9; the date
   caption stays).

5. **Edit `src/components/layout/Footer.tsx`:** import `SIGNIN_LIVE`.
   When the flag is false, do not render the "Account" `LinkColumn` at
   all (both "Sign in" and "Dashboard" links go — a dashboard link that
   dead-ends at a closed login card is a broken promise; signed-in users
   reach the dashboard from the navbar Account link).

**Scope fences.** `TicketsGate.tsx` needs no edit — it is unreachable
while `TICKETS_LIVE = false` (§8.9); if tickets are re-enabled while
sign-in is still off, that re-enable must be its own amendment and
reconcile the two flags. Auth callback route, dashboard, admin, gate
scanner, First Pulse (its form is email-fields, not auth) — all
untouched.

**Failure/empty states.** Flag off: `/login` shows the closed card +
gate-staff toggle; nav/menu/footer simply omit sign-in entries; visiting
`/dashboard` signed-out still redirects to `/login` and lands on the
closed card — acceptable. `/login?open=1` shows the full sign-in card
(the escape hatch; leave undocumented on-site).

**Reversibility.** Flip `SIGNIN_LIVE` to `true` — every surface returns.

**Verification gates.**
- §4.1: `npx tsc --noEmit`, `npm run lint` (only pre-existing failures
  allowed), `npm run build`.
- Flags-off (shipping state), counting with `grep -o … | wc -l`:
  `/login` → "Continue with Google" 0, "isn't open yet" ≥1,
  "Gate staff login" ≥1; `/` → ">Sign in<" 0; footer has no
  "Dashboard" link (`grep -o '>Dashboard<' | wc -l` → 0 on `/`).
- Escape hatch (Playwright, not curl — it renders client-side after an
  effect): goto `/login?open=1`, expect visible text "Continue with
  Google".
- Flag-on smoke (local only, revert before commit): `SIGNIN_LIVE = true`
  → `/login` shows "Continue with Google" ≥1 and `/` shows ">Sign in<"
  ≥1.
- Playwright `scrollWidth - clientWidth === 0` on `/` and `/login` at
  1280×800 and 375×812.

### 8.16 First Pulse form: production insert failure + submission hardening (added 31 Jul 2026, artist-reported)

An artist (Mishū, @mishuwski) reported a persistent form error on the
First Pulse form and emailed her submission to
hello@sonicpulsefestival.com instead. Diagnosis, run against production
on 31 Jul 2026:

- `POST /api/first-pulse` with a fully valid payload → **HTTP 500**
  `{"error":"Something went wrong. Please try again."}` — the `dbError`
  catch-all branch in `src/app/api/first-pulse/route.ts`. Every
  submission fails; a duplicate-email retry also 500s (it never reaches
  the dedup check).
- A **direct REST insert into `artist_applications`** using this
  environment's `SUPABASE_SERVICE_ROLE_KEY` (new-format `sb_secret_…`)
  → **HTTP 201**. Table, schema, and RLS are all fine; the key in this
  environment is valid. (Test row deleted immediately.)
- The `artist_applications` table contains **zero rows** — no
  application has ever been stored in production. Mishū is the one who
  flagged it; anyone else who tried is silently lost.
- The 500 is the `dbError` branch, not the outer catch ("An unexpected
  error occurred.") — so `SUPABASE_SERVICE_ROLE_KEY` **exists** in the
  production environment but Supabase **rejects** it. If it were absent,
  `createClient` would throw before the insert.

**Root cause: the service-role key stored in Vercel is stale or
mispasted** — most likely a legacy JWT-format (`eyJ…`) service_role key
that stopped working when the new-format API keys (`sb_secret_…` /
`sb_publishable_…`) were issued for the project, or a paste with
whitespace. The code, the table, and the current dashboard keys are all
correct — the fix is repasting env values, plus code hardening below so
the next failure is not silent and scheme-less mix links stop bouncing.

**A. Owner actions (blocking — the env fix alone unbreaks the form).**

1. **Fix the Vercel env (~5 min).** Vercel → sonicpulse project →
   Settings → Environment Variables. Open the Supabase dashboard in a
   second tab (Sonic Pulse project → Project Settings → API Keys) and
   re-paste, for Production (and Preview):
   - `SUPABASE_SERVICE_ROLE_KEY` = the `sb_secret_…` secret key
   - `NEXT_PUBLIC_SUPABASE_URL` = the project URL (verify it matches)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the `sb_publishable_…` key
   Watch for trailing spaces/newlines. While there, confirm
   `RESEND_API_KEY` exists (confirmation emails). Then **redeploy**
   (Deployments → ⋯ on the latest → Redeploy) — env edits do not apply
   until a redeploy.
2. **Verify:** submit the live form once yourself (any real-looking
   data). Expect the "Signal sent." card with a reference code. Tell the
   executor session the test email used so the row can be removed — or
   leave it; status stays `pending` and is harmless.
3. **Mishū's submission.** hello@sonicpulsefestival.com is the published
   contact address on /contact — confirm that mailbox actually exists
   and is being read, and pull her email out of it (check spam). Once
   the form is fixed, either ask her to resubmit through the form
   (recommended — she gets a reference code and the confirmation email)
   or have the admin enter it manually. Suggested DM reply, voice-rules
   clean: "Hey — thanks for flagging this. You caught a real bug on our
   end and it's fixed now. We have your email; if you resubmit through
   the form you'll get a reference code and a confirmation. Either way
   you're in the pool."
4. **Veto item — FAQ email mismatch.** `src/data/faq.ts` tells ticket
   holders to email support@sonicpulsedhaka.com; every other surface
   uses hello@sonicpulsefestival.com. Item B5 below unifies the FAQ onto
   hello@ — veto it if support@sonicpulsedhaka.com is the real staffed
   mailbox.

**B. Code changes (executor — independent of A; ship now).**

1. **`src/app/api/first-pulse/route.ts` — normalize scheme-less mix
   links.** Artists paste "soundcloud.com/name/mix"; today that is
   rejected. Add above `isValidUrl`:

```ts
function normalizeMixLink(value: string): string {
  if (!value) return value
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value) ? value : `https://${value}`
}
```

   and change the `mixLink` parse line to
   `const mixLink = normalizeMixLink((body.mixLink ?? '').trim())`.
   `isValidUrl` and everything downstream are unchanged — genuinely
   malformed values still 400, now with clearer copy (verbatim):
   "That link doesn't look right — paste the full link from SoundCloud,
   Mixcloud, or YouTube."

2. **Same file — error copy with an escape hatch.** The 500 body
   currently says "Something went wrong. Please try again." (which also
   violates the §5 no-"please" rule). Replace with, verbatim:
   "Something went wrong on our end. Try again in a minute, or email
   your application to hello@sonicpulsefestival.com." Update the 409
   body to, verbatim: "You've already applied — the application we have
   on file is the one that counts."

3. **Same file — diagnosable logging.** Replace the single
   `console.error('First Pulse DB insert error:', dbError)` with:

```ts
console.error('First Pulse DB insert error:', dbError.code, dbError.message, dbError.details)
if (/api key|jwt|authoriz/i.test(dbError.message ?? '')) {
  console.error('First Pulse: Supabase rejected the server credentials — re-paste SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) in Vercel env, then redeploy. See REDESIGN_PLAN.md §8.16.')
}
```

4. **`src/components/first-pulse/FirstPulseForm.tsx` — two changes.**
   - The mix-link input: `type="url"` → `type="text"` and add
     `inputMode="url"`. (Browser-native `type="url"` validation blocks
     scheme-less links before the server ever sees them; the server now
     normalizes, so stop pre-blocking. `inputMode` keeps the URL
     keyboard on phones.)
   - Treat 409 as a calm state, not a red error. Add
     `'already_applied'` to the `Status` union; in `handleSubmit`,
     after the `not_open` check add:

```ts
if (res.status === 409) {
  setStatus('already_applied')
  return
}
```

     and render it exactly like the `not_open` card (same container
     styles — `var(--border)` border, not the error red), with heading
     (verbatim) "You've already applied." and body (verbatim) "The
     application we have on file is the one that counts. Questions?
     Email hello@sonicpulsefestival.com." Also update the client-side
     catch/fallback error string to match B2's 500 copy, verbatim.

5. **`src/data/faq.ts`** — change support@sonicpulsedhaka.com to
   hello@sonicpulsefestival.com in the lost-ticket answer (see owner
   veto item A4).

**Scope fences.** No schema changes; `supabase-first-pulse.sql`
untouched. The admin route/tab, register route, Resend email template,
and `EMAIL_FROM` config are untouched. No retry/queue machinery — the
env fix is the cure; the code changes are UX and observability.

**Failure/empty states.** If the env is still broken after B ships,
users now get the hello@ escape hatch instead of a dead end, and Vercel
logs name the exact env var to fix. Duplicate applications now land on
a calm confirmation instead of an alarming red line.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`, `npm run lint` (only the pre-existing
  baseline — 7 errors / 9 warnings — allowed), `npm run build`.
- Local dev on port 3100 (local env holds valid keys, so the API works
  against the real production table — clean up after):
  - POST valid payload, email `fp-verify-8p16@example.com`, mixLink
    `soundcloud.com/fp-verify/mix` (no scheme) → 201 + referenceCode.
  - Same email again → 409 with the B2 copy.
  - mixLink `not a real link` → 400 with the B1 copy.
  - Playwright 375×812: fill + submit the form → "Signal sent." card;
    resubmit same email → "You've already applied." card rendered in
    the calm style; `scrollWidth - clientWidth === 0` on `/first-pulse`.
  - **Cleanup (mandatory):** delete the test row via Supabase REST
    (`DELETE /rest/v1/artist_applications?email=eq.fp-verify-8p16@example.com`
    with the service key; never print the key), then GET to confirm 0
    rows for that email.
- Live, only after owner action A1: POST one test application to
  production, expect 201, then delete its row the same way.

### 8.17 Post-fix verification: Vercel points at the wrong Supabase project; hello@ forwarding is dead (added 31 Jul 2026, owner-requested)

The owner completed §8.16 A1 (env repaste + redeploy) and asked for a
verification test. Ran against production on 31 Jul 2026, after the
redeploy (deployment id changed `dpl_FTd3barc…` → `dpl_4GYonaDT…`, so
the redeploy definitely happened):

- `POST /api/first-pulse` (note: apex 308-redirects to www; the test
  followed it) → **still HTTP 500**, same `dbError` branch. Not fixed.
- The deployed client bundle inlines
  `https://ytgwocaresxghgyiwikr.supabase.co` and a publishable key
  starting `sb_publishable_iGiffW`. The project that actually holds
  `artist_applications` — the one the owner ran
  `supabase-first-pulse.sql` in, where a direct insert succeeds — is
  **`https://pjstgctrmgfrkooeeyrl.supabase.co`** (publishable key
  starting `sb_publishable_Ytjl4zE`).

**§8.16's root-cause wording is superseded on one point:** it is not a
stale service key — **Vercel's entire Supabase env triplet points at a
different Supabase project** (`ytgwocaresxghgyiwikr`; possibly the
Afterhours project or an older setup — the owner will recognize it).
Any key repasted from the correct project's dashboard is rejected by
the wrong project's URL, so the 500 survives the repaste. §8.16 B (code
hardening) is unchanged and still to execute.

**A. Owner action — the actual env fix (~5 min).**

1. Supabase dashboard → open the project whose ref is
   **pjstgctrmgfrkooeeyrl** (check the URL bar; if the dashboard shows a
   different ref, you are in the wrong project — this is exactly how the
   first repaste went sideways). Project Settings → API Keys.
2. Vercel → sonicpulse project → Settings → Environment Variables — set
   **all three**, Production and Preview, from that project:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://pjstgctrmgfrkooeeyrl.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the `sb_publishable_Ytjl4zE…` key
   - `SUPABASE_SERVICE_ROLE_KEY` = the `sb_secret_…` key from the same
     API Keys page
3. Redeploy. Verify by submitting the live form once — expect the
   "Signal sent." card with a reference code. If it still fails, the
   Vercel function logs now matter: Deployments → the deployment →
   Functions → `/api/first-pulse` shows the logged Supabase error.
4. Nothing changes in the `ytgwocaresxghgyiwikr` project — the website
   simply must not point at it (§8.14: the products keep separate
   projects).

**B. Owner action — hello@ email forwarding (registrar-side, no code).**

Diagnosis: Mishū's email to hello@sonicpulsefestival.com **bounced**
(Gmail: "the remote server is misconfigured") — her submission is
definitively lost and exists nowhere. The domain's DNS is on Namecheap
(`dns1/dns2.registrar-servers.com`); MX records point at Namecheap's
free email-forwarding relays (`eforward1–5.registrar-servers.com`), but
no forwarding rule is active for the address, so the relays reject
inbound mail. Outbound (Resend via `send.sonicpulsefestival.com`) is a
separate path and is unaffected.

1. Namecheap dashboard → Domain List → sonicpulsefestival.com →
   Manage → **Redirect Email** (email forwarding). Add:
   - `hello` → the inbox the team actually reads
   - `press` → same or the press inbox (it is published on /contact)
   - optionally a Catch-All to the same inbox so nothing bounces.
2. Save; allow up to ~30 minutes. Test by emailing
   hello@sonicpulsefestival.com from a personal account and confirming
   arrival.
3. Known limit, accepted for now: forwarding is inbound-only — replies
   go out from the personal address. A real mailbox (Google Workspace,
   Zoho) is a future owner decision, deliberately not planned here.
4. §8.16 A4's veto item hardens: support@sonicpulsedhaka.com is on a
   different domain entirely and is almost certainly also dead. §8.16
   B5 (FAQ unifies onto hello@) stands.

**C. DM reply to Mishū** — supersedes §8.16 A3's draft (her email did
not arrive, so "we have your email" is no longer true). Verbatim, send
only after A and B are both verified:
"Hey — thanks for flagging this. You caught a real bug on our end and
it's fixed now. Heads up that your email bounced before it reached us,
so nothing was lost on your side but we don't have a copy — resubmit
through the form and you'll get a reference code and a confirmation
email straight away."

**D. Code changes: none in this section.** §8.16 B is the outstanding
code work; "execute §8.16 of REDESIGN_PLAN.md" remains the executor
invocation, and its live verification gate applies after A above is
done.

### 8.18 Mailbox addresses finalised: hello@, press@, support@ (added 31 Jul 2026, owner-requested)

The owner set up Namecheap Redirect Email and hit an incomplete-row
error: the alias field accepted `hello` but the row would not save. The
second field in a Namecheap forwarder row is the **destination** — it
needs a full email address (`name@gmail.com`), not an alias. Recorded
here because it is the same trap on every future forwarder.

**Supersedes §8.16 B5 and §8.17 B4 on the FAQ address.** Those unified
the FAQ's lost-ticket answer onto hello@; the owner has chosen a
dedicated ticket-support address instead. `src/data/faq.ts` now reads
"Email us at support@sonicpulsefestival.com with your reference number.
We will reissue your ticket." (support@sonicpulsedhaka.com — a dead
address on a different domain — is gone from the codebase entirely.)

**The site's full address surface, after this change** — three
addresses, all on sonicpulsefestival.com, each needing a forwarder:

| Address | Used on |
| --- | --- |
| hello@ | /contact "General Inquiries"; the First Pulse 500-error copy and duplicate-application card (§8.16 B2/B4) |
| press@ | /contact "Press & Media" |
| support@ | /faq lost-ticket answer |

Any future amendment that introduces a fourth address must add the
matching forwarder in the same breath, or it ships a bounce.

**Owner action — Namecheap forwarders (replaces §8.17 B1).** Domain
List → sonicpulsefestival.com → Manage → Redirect Email. Each row has
two fields: **left = alias only** (`hello`, no @domain), **right =
full destination address**. Fill both, then click the ✓ to save the
row — an unsaved row shows the red dashed underline and warning
triangle. Add three rows (Add Forwarder for each): `hello`, `press`,
`support`, all pointing to the inbox actually read. Optionally Add
Catch-All to the same inbox so a typo'd address never bounces.

DNS is already correct — MX points at Namecheap's forwarding relays
(`eforward1–5.registrar-servers.com`), so no DNS edit is needed and no
propagation wait beyond ~30 minutes for the rule itself. Outbound mail
(Resend on `send.sonicpulsefestival.com`) is a separate path, unchanged.

**Verification (owner).** Email each of the three addresses from a
personal account and confirm arrival. Port 25 is blocked from the build
container, so inbound mail cannot be tested from a session — this gate
is owner-only.

**Known limit, accepted.** Forwarding is inbound-only: replies leave
from the personal address, not from @sonicpulsefestival.com. A real
mailbox (Namecheap Private Email, Google Workspace, Zoho) is a future
owner decision, deliberately not planned here.

**Code changes in this section: one line** — the `faq.ts` answer above.
No other file changes; §8.16's shipped code is unaffected.

### 8.19 First Pulse root cause, corrected: the table is in the wrong Supabase project (added 31 Jul 2026)

The owner updated the Vercel env and asked for verification. Production
still returns HTTP 500 on a valid submission. Probing both Supabase
projects settled what §8.16 and §8.17 each got wrong.

**Two projects exist, and they are not interchangeable:**

| Project ref | What it holds | Role |
| --- | --- | --- |
| `ytgwocaresxghgyiwikr` | `user_profiles` (5 real users), `user_tickets`, `influencer_applications`. **No `artist_applications`.** | The live Sonic Pulse production project — what Vercel points at |
| `pjstgctrmgfrkooeeyrl` | `artist_applications`, `creator_profiles`, `tickets`. No `user_profiles`. | A separate project — where this session's env points, and where `supabase-first-pulse.sql` was run |

**Root cause: `supabase-first-pulse.sql` was run in the wrong project.**
The table the First Pulse API writes to does not exist in the project
production actually uses. Every submission has always failed.

**Both earlier diagnoses are superseded:**
- **§8.16's "stale/mispasted service-role key" is wrong.** The key was
  never the problem.
- **§8.17's "Vercel points at the wrong project" is wrong, and its
  owner instruction A was actively harmful.** It told the owner to
  repoint Vercel at `pjstgctrmgfrkooeeyrl`. Doing so would have pointed
  the live site at a project with no `user_profiles` table, breaking
  auth and the dashboard for the 5 existing users. **Vercel was correct
  all along and must keep pointing at `ytgwocaresxghgyiwikr`.**
- The misreading came from this session's env pointing at the *other*
  project: direct REST inserts succeeded there, which looked like proof
  the table was fine and the deployment was at fault. **Lesson for
  future diagnosis: confirm the session env and the deployment target
  are the same project before drawing conclusions from a direct query.**

**Why a missing table produced a 500 instead of the designed 503.** The
route degrades gracefully on `dbError.code === '42P01'` (§8.5). But
PostgREST reports a missing table as **`PGRST205`**; the raw Postgres
`42P01` only surfaces through direct SQL. The graceful branch never
fired, so a missing table fell through to the catch-all 500 — which is
what made this look like a credentials failure for two rounds.

**Code changes (executed in this section, two lines).**
1. `src/app/api/first-pulse/route.ts` — the missing-table branch now
   matches `'42P01' || 'PGRST205'`, so a missing table returns the
   "Applications open soon." card instead of an error.
2. `src/app/api/admin/first-pulse/route.ts` — identical fix; the admin
   tab's `notReady` empty state had the same dead check.

**Owner actions.**
1. **Run the SQL in the correct project.** Supabase → the project whose
   ref is **`ytgwocaresxghgyiwikr`** (verify: it has `user_profiles`
   with your real users). SQL Editor → New query → paste all of
   `supabase-first-pulse.sql` from the repo root → Run. It is
   `create table if not exists`, so it is safe.
2. **Leave the Vercel Supabase env pointing at `ytgwocaresxghgyiwikr`.**
   If anything was repasted from the other project while following
   §8.17 — the URL, the publishable key, or the secret key — set all
   three back to `ytgwocaresxghgyiwikr`'s values and redeploy. A
   mismatched URL/key pair fails exactly like a bad key.
3. Nothing needs to change in `pjstgctrmgfrkooeeyrl`. Its
   `artist_applications` table is empty and can be ignored or dropped.

**Verification, once step 1 is done.** POST a test application to
production expecting 201 + reference code, then delete the row. No
redeploy is needed for step 1 alone — the table appears to the running
deployment as soon as the SQL runs.

### 8.20 Organiser attribution — Dhaka Music Festival credited site-wide, with Instagram tags (added 3 Aug 2026, owner-requested)

Context, so the intent survives: the organiser's Instagram account
(@dhakamusicfestival) was restricted by Meta under fraud/scams after
creator outreach DMs pattern-matched brand-impersonation scams. Making
the organiser publicly verifiable — named on the website and linked to
its Instagram, with the website linked back — is both correct
attribution and direct evidence for the Meta review. Handles: festival
account **@sonicpulsefestival**, organiser account
**@dhakamusicfestival**; organiser links point to
`https://instagram.com/dhakamusicfestival`.

**Already attributed — do not touch:** the FAQ "what is Sonic Pulse"
answer says "organised by Dhaka Music Festival" (extended below, not
replaced); footer blurb says "Presented by Dhaka Music Festival"
(linked below); meta description in `src/app/layout.tsx`; the ICS
summary in `ScheduleActions.tsx`; the ticket card sub-line in
`TicketCard.tsx`; the @dhakamusicfestival follow-request copy in
`AddTicketForm.tsx`.

**Files: eight edits, no creates. All copy verbatim.**

1. **`src/components/layout/Footer.tsx`** — in the blurb paragraph,
   turn the existing words "Dhaka Music Festival" into a link, keeping
   the sentence otherwise identical:

```tsx
Bangladesh&apos;s first sunset-to-sunrise music festival. Presented by{' '}
<a
  href="https://instagram.com/dhakamusicfestival"
  target="_blank"
  rel="noopener noreferrer"
  style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'underline', textUnderlineOffset: 3 }}
>
  Dhaka Music Festival
</a>
.
```

2. **`src/components/contact/ContactDetails.tsx`** — add a fourth
   block after the Instagram block (same structure and classes as the
   existing blocks), exactly:

```tsx
<div>
  <h3 className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--text-muted)' }}>
    Organiser
  </h3>
  <p className="text-sm" style={{ color: 'var(--text-primary)', marginBottom: 6 }}>Dhaka Music Festival</p>
  <a
    href="https://instagram.com/dhakamusicfestival"
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm transition-colors"
    style={{ color: 'var(--accent-magenta)' }}
  >
    @dhakamusicfestival →
  </a>
  <p className="mt-1 text-xs text-[var(--text-muted)]">Sonic Pulse is organised and promoted by Dhaka Music Festival.</p>
</div>
```

3. **`src/data/faq.ts`** — the `what-is-sonic-pulse` answer becomes,
   verbatim: "Sonic Pulse is a large-scale outdoor music festival
   organised by Dhaka Music Festival — @dhakamusicfestival on
   Instagram. Two stages, 800+ festival-goers, and music from dusk
   till dawn."

4. **`src/app/(main)/policy/page.tsx`** — the closing caption line
   becomes (only the text changes; the date expression stays):
   `Sonic Pulse · Organised by Dhaka Music Festival · Last updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`

5. **`src/app/layout.tsx`** — `openGraph.description` becomes,
   verbatim: "Two stages. 800+ festival-goers. Dusk till dawn.
   Presented by Dhaka Music Festival."

6. **`src/lib/email.ts`** — in the shared `wrap()` footer (covers all
   five templates in this file), the footer paragraph becomes:

```html
<strong style="color:#666;">Sonic Pulse 2026</strong><br>
25 September 2026 · Organised by Dhaka Music Festival<br>
<a href="https://sonicpulsefestival.com" style="color:#999;text-decoration:underline;">sonicpulsefestival.com</a> · <a href="https://instagram.com/dhakamusicfestival" style="color:#999;text-decoration:underline;">@dhakamusicfestival</a>
```

7. **`src/app/api/first-pulse/route.ts`** — the confirmation email's
   closing `<p>` text becomes, verbatim: "Selected names will be
   announced on the event page. Questions? Reply to this email or
   message us on Instagram @sonicpulsefestival. Sonic Pulse is
   organised by Dhaka Music Festival — @dhakamusicfestival."

8. **`src/app/api/register/route.ts`** — same pattern; its closing
   `<p>` text becomes, verbatim: "Questions? Reply to this email or
   message us on Instagram @sonicpulsefestival. Sonic Pulse is
   organised by Dhaka Music Festival — @dhakamusicfestival."

**Plus one structured-data addition (ninth edit).**
**`src/app/(main)/page.tsx`** — add organiser-bearing JSON-LD to the
home page. Immediately inside the fragment, before `<Hero />`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MusicEvent',
      name: 'Sonic Pulse',
      startDate: '2026-09-25T16:00:00+06:00',
      endDate: '2026-09-26T09:30:00+06:00',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'Venue announced to ticket holders', address: { '@type': 'PostalAddress', addressLocality: 'Dhaka', addressCountry: 'BD' } },
      organizer: { '@type': 'Organization', name: 'Dhaka Music Festival', url: 'https://sonicpulsefestival.com', sameAs: ['https://instagram.com/dhakamusicfestival', 'https://instagram.com/sonicpulsefestival'] },
      image: 'https://sonicpulsefestival.com/images/brand/logo-512.png',
      description: "Bangladesh's first sunset-to-sunrise music festival. Two stages, 800+ festival-goers, dusk till dawn. Presented by Dhaka Music Festival.',
    }),
  }}
/>
```

   Note for the executor: the description value above must use
   double-quoted JS string with an escaped apostrophe or a template
   literal — ship it as
   `description: "Bangladesh's first sunset-to-sunrise music festival. Two stages, 800+ festival-goers, dusk till dawn. Presented by Dhaka Music Festival."`
   (the trailing quote in the block above is a typo; this line is
   canonical).

**Deliberately skipped, owner may veto:** the home Hero gets no
"presented by" line — the owner has twice trimmed the home page
(§8.8, §8.11), the footer credit renders on every page including
home, and the JSON-LD now carries the organiser for machines. If the
owner wants it visible in the hero, that is its own amendment.

**Scope fences.** `AddTicketForm.tsx`, `TicketCard.tsx`,
`ScheduleActions.tsx`, the admin pages, gate scanner, and the meta
`description` in `layout.tsx` are untouched. No nav or footer-column
changes — this is attribution, not IA.

**Failure/empty states.** None introduced — all edits are static copy,
one static script tag, and email template text.

**Reversibility.** Pure copy edits; revert by removing the added
words/links. The JSON-LD block is one self-contained element.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline
  only — 7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100, counting with `grep -o … | wc -l`:
  - `/contact` → `dhakamusicfestival` ≥ 2, `Organiser` ≥ 1
  - `/` → `application/ld+json` ≥ 1, `Dhaka Music Festival` ≥ 2
    (footer + JSON-LD), `instagram.com/dhakamusicfestival` ≥ 2
    (footer link + JSON-LD)
  - `/policy` → `Organised by Dhaka Music Festival` ≥ 1
  - `/faq` → `@dhakamusicfestival` ≥ 1
- JSON-LD validity: extract the script content from the rendered page
  and `JSON.parse` it in node — must parse, and
  `organizer.name === 'Dhaka Music Festival'`.
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/`, `/contact`, `/policy`.
- No email smoke test (Resend sends real mail); the two route-template
  edits are verified by grep in the source after edit:
  `grep -c 'dhakamusicfestival' src/app/api/first-pulse/route.ts` → 1,
  same for `src/app/api/register/route.ts` → 1, and
  `grep -c 'dhakamusicfestival' src/lib/email.ts` → 1.

### 8.21 EVENT_CONTEXT.md — reusable physical-event brief (added 5 Aug 2026, owner-requested)

The owner increasingly briefs other sessions (vendor contracts, quote
evaluations — today: a videography quotation) and needs the physical
event described once, canonically, instead of reassembled from chat
memory each time. This amendment creates **`EVENT_CONTEXT.md` at the
repo root** — a self-contained brief on the physical event, written to
be pasted or attached into any session with zero repo access.

Planner executed its own plan in the same pass (the file's substance is
entirely planner judgment; a spec would contain the file verbatim).
Content decisions of note, all sourced from locked data files and this
plan rather than invented: the Great Burn is fixed at midnight inside
Night Rituals (per `activities.ts`); the two stages run in sequence,
never in parallel; ~14 of 17.5 hours are darkness; the no-live-streaming
policy and attendee pro-camera ban are stated as constraints any media
vendor must plan around; drone permission and venue address are recorded
as open items, not assumptions. A closing "scale implications" section
states what full coverage spans — deliberately factual, so a session
evaluating a quote draws its own conclusion against real scope.

**Maintenance rule:** any future amendment that changes the physical
event (set times, installations, activities, venue lock, policies) must
also update `EVENT_CONTEXT.md` in the same execution, or explicitly
state why not. A stale canonical brief is worse than none.

Not linked from the website; not part of the build. No code changes.

### 8.22 FINANCE_CONTEXT.md — finance/accounting session brief (added 5 Aug 2026, owner-requested)

Companion to §8.21's EVENT_CONTEXT.md: the owner is standing up a
dedicated Cowork session as the festival's accountant, maintaining the
Sonic Pulse budget workbook (Excel). **`FINANCE_CONTEXT.md` at the repo
root** briefs that session with a finance lens rather than a physical
one. Planner executed its own plan (same reasoning as §8.21 — the file
is pure judgment).

Core discipline encoded in the file: every figure is tagged **KNOWN**
(committed or published — ticket tiers ৳5,500/6,500/7,500 web with a
৳1,000 app discount; the installation-vendor fees ৳220,000 + ৳100,000 +
৳60,000; the 20 Sep delivery deadline; the every-4-months exclusivity
obligation through 2028) or **OPEN** (venue, materials, artist fees,
production, payment rails, videography quote, and everything else with
no committed number) — with a standing rule that the finance session
never invents a value for an OPEN line. Barter tickets (creator media
passes) are recorded as forgone revenue, not zero-cost.

**Maintenance rule (extends §8.21's):** amendments that change money —
ticket pricing, vendor terms, new contracts, tier structure — must
update `FINANCE_CONTEXT.md` in the same execution, or state why not.

Not linked from the website; no code changes.

### 8.23 OPS_CONTEXT.md — event-planner session brief (added 6 Aug 2026, owner-requested)

Third companion brief (after §8.21 EVENT_CONTEXT.md and §8.22
FINANCE_CONTEXT.md): the owner is standing up a Cowork session as the
festival's event planner / production manager, connected to their
calendar, to build the master timeline, track vendor workstreams
(light & sound, installations, venue, decor, security, housekeeping,
and more) and schedule follow-up reminders. **`OPS_CONTEXT.md` at the
repo root** briefs that session: hard dates (20 Sep installation
delivery, 2 Sep Instagram unlock, midnight Burn), twelve workstreams
with as-of-6-Aug status, the dependency chains (venue is the critical
path), how the owner works, and the division of labour between the
four sessions (website / accountant / contracts / planner). Planner
executed its own plan (same reasoning as §8.21).

**Maintenance rule (extends §8.21/§8.22):** amendments that change
dates, vendor status, or workstream facts must update `OPS_CONTEXT.md`
in the same execution, or state why not. The file itself tells the
planner session to treat its statuses as a snapshot and keep its own
tracker as the living record.

Not linked from the website; no code changes.

### 8.24 VENUE_CONTRACT_CONTEXT.md — venue contract session brief (added 9 Aug 2026, owner-requested)

Fourth companion brief (after §8.21 EVENT, §8.22 FINANCE, §8.23 OPS):
the owner's contracts session is drafting the **venue agreement**.
**`VENUE_CONTRACT_CONTEXT.md` at the repo root** briefs it. Planner
executed its own plan, as in §8.21–§8.23.

Content is derived, not restated: the venue's requirements are read
backwards out of the already-designed programme — the site features
each installation and activity presupposes (grove for Mycelia's
rigging, lake + bridge for Event Horizon and Styx, east sightline for
the Sunrise Stage, single entrance for Coilgate and NID control), the
structural disclosures that exceed a routine hire (40 ft stage, two
climbable public structures, overhead suspension over crowds,
guest-loaded netting, four forms of open flame including the midnight
Great Burn, boats and pool, overnight amplified sound to 9:30 AM), the
service split to settle, commercial terms, and permit ownership.

**Two findings the file records, both derived during the sweep:**

1. **Access-window conflict risk.** The installation vendor is bound to
   complete six installations and the Main Stage **on site by 20 Sep**.
   A venue contract granting access only on 24–25 Sep would breach that
   contract. The required number of build days is OPEN — the owner must
   confirm it with the vendor before either contract is finalised.

2. **Published alcohol contradiction (accuracy flag).** `src/data/faq.ts`
   ("Will there be food and drinks?") promises "a fully stocked bar",
   while `src/app/(main)/policy/page.tsx` bans alcohol on the premises
   under zero tolerance. Both are live on the site. This is material to
   the venue contract (licensing, security, insurance). **Owner decision
   required**; the losing side of the contradiction should be corrected
   on the website in a later amendment, which this section does not
   presume to specify.

**Maintenance rule (extends §8.21–§8.23):** amendments changing venue
status, dates, site requirements or the alcohol position must update
this file in the same execution, or state why not.

Not linked from the website; no code changes.

### 8.25 Alcohol-free event — remove the bar from all site copy (added 9 Aug 2026, owner-requested)

Owner decision: **there is no bar. No alcohol, narcotics or illegal
substances are permitted anywhere on the premises.** This resolves the
contradiction recorded in §8.24: the FAQ promised "a fully stocked bar"
while `src/app/(main)/policy/page.tsx` banned alcohol under zero
tolerance. The policy page was right and is **untouched** by this
amendment.

A sweep for `bar|drink|alcohol|intoxicat` across `src/` found three
places to change — including one the FAQ alone would have missed.

**Files: two edits. All copy verbatim.**

1. **`src/data/faq.ts`** — three changes:

   a. The `food-drinks` answer (id and question unchanged) becomes,
      verbatim: "Yes. Multiple food stalls and drink counters run
      throughout the night — street food, late-night biryani, a full
      vegetarian line, iced chai, and hot chai at sunrise. Sonic Pulse is
      an alcohol-free event: alcohol, narcotics and illegal substances
      are not permitted anywhere on the premises."

   b. The `prohibited` answer becomes, verbatim: "Professional
      cameras/recording equipment, outside food and drinks, alcohol,
      narcotics and illegal substances, weapons of any kind, and glass
      bottles. Security checks are thorough."

   c. **Insert a new FAQ item immediately after `food-drinks`**, in the
      same `At the Event` category and the same object shape:

```ts
  {
    id: 'alcohol-free',
    category: 'At the Event',
    question: 'Is alcohol served at the event?',
    answer: 'No. Sonic Pulse is an alcohol-free event. Alcohol, narcotics and illegal substances are not permitted anywhere on the premises, and anyone suspected of being intoxicated may be denied entry or removed. Gate checks are thorough.',
  },
```

2. **`src/data/tickets.ts`** — the CRESCENDO tier (`phase3`) lists
   `'Dedicated bar'` as a perk. It is currently unreachable
   (`TICKETS_LIVE = false`, §8.9) but ships the moment sales open, so it
   is fixed now. Change that single perk string to, verbatim:
   `'Dedicated drinks counter'`.

   **Decision, not an open question:** the `phase2` (RHYTHM) perk
   `'Complimentary drink'` **stays as written** — it is accurate for a
   non-alcoholic drink and needs no change.

**Scope fences.** The policy page is already correct — do not edit it.
`src/data/activities.ts` is untouched: FEAST QUARTER and NEON LAGOON
mention chai, kulfi and a "poolside selector" (a DJ, not a bar) and
contain no alcohol reference. No email templates, admin, or component
files change. This is copy only — no flags, no new components.

**Failure/empty states.** None introduced. The new FAQ item renders
through the existing accordion; the FAQ page groups by `category`, and
`At the Event` already exists, so no new grouping logic is needed.

**Reversibility.** Pure copy edits; revert by restoring the previous
strings and deleting the added FAQ item.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100, counting with `grep -o … | wc -l`:
  - `/faq` → `fully stocked` **0**, `alcohol-free event` **≥2**,
    `Is alcohol served at the event?` **≥1**
- Source greps: `grep -c 'Dedicated bar' src/data/tickets.ts` → **0**;
  `grep -c 'fully stocked' src/data/faq.ts` → **0**.
- Regression: `grep -c 'No narcotics or alcohol' "src/app/(main)/policy/page.tsx"`
  → **1** (the policy page must remain unchanged).
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/faq`.

**Companion-file note (already done by the planner, no executor action):**
`VENUE_CONTRACT_CONTEXT.md` §6 and §8 now record the alcohol-free
decision, and its §5 was rewritten after the owner confirmed on the same
date that **installations are fabricated off site and transported to the
venue on festival day** — superseding §8.24's assumption of an on-site
build. That correction moves the venue risk from a long build occupancy
to a single day-of load-in (truck access, gate and overhead clearance,
crane standing space, no slack before 4 PM gates) and leaves one item
**OPEN and urgent**: whether the 40 ft, seven-pillar Main Stage is also
day-of assembly or needs earlier on-site days.

### 8.26 CONTRACTS_CONTEXT.md — master contracts session brief (added 9 Aug 2026, owner-requested)

Fifth companion brief (§8.21 EVENT, §8.22 FINANCE, §8.23 OPS, §8.24
VENUE_CONTRACT, and now this). The owner's contracts session handles
**every** agreement, not just the venue, so
**`CONTRACTS_CONTEXT.md` at the repo root** is the master and
`VENUE_CONTRACT_CONTEXT.md` becomes its venue deep-dive — the master
points to it rather than duplicating it. Planner executed its own plan,
as in §8.21–§8.24.

Contents: an 18-row contract register with live status; full terms of
the one agreement that has agreed terms (installation vendor — scope,
৳220k/৳100k/৳60k fees, owner-borne materials, 20 Sep delivery,
exclusivity to end-2028 against work every 4 months); what each
unstarted contract must cover; the **published attendee terms** treated
as a binding consumer contract no vendor agreement may contradict; the
Bangladeshi legal environment; and a standing clause checklist.

**Findings recorded during the sweep:**

1. **The organiser's legal entity is unrecorded.** Nothing in the
   project states whether Dhaka Music Festival is a registered company,
   a partnership, or the owner trading personally. Every contract needs
   a correct contracting party — flagged as OPEN and blocking.
2. **Volunteer programme may involve minors.** The event is strictly
   18+, but "graduating students" can include under-18s. If minors
   participate, guardian consent and a safeguarding position are needed,
   and the volunteer agreement must be drafted as volunteering (no wage,
   no employment relationship) with a liability waiver and a defined
   certificate of service.
3. **Force-majeure asymmetry.** The published attendee policy carries
   tickets over to the next edition rather than refunding. Vendor and
   venue cancellation clauses should be negotiated against that, or a
   cancellation leaves the organiser paying twice.

Also carried in: the 9 Aug owner confirmations that installations are
fabricated off site and transported on festival day (making "delivered
by 20 Sep" ambiguous in the installation contract) and that the event
is alcohol-free (§8.25).

**Maintenance rule (extends §8.21–§8.24):** amendments that change
vendor terms, counterparties, published attendee terms, or contract
status must update `CONTRACTS_CONTEXT.md` in the same execution, or
state why not.

Not linked from the website; no code changes.

### 8.27 Age policy — remove the strict 18+ restriction site-wide (added 13 Aug 2026, owner-requested)

Owner decision: **the event is no longer strictly 18+; remove the age
restriction from the website entirely.** This supersedes the 18+ facts
stated in §8.0-era content and in every companion context file.

**The enabling fact, checked before planning:** Bangladesh issues NIDs at
18, so an all-ages event cannot require an NID from every attendee.
The *current* ticket flow already handles this —
`src/components/dashboard/AddTicketForm.tsx` and `ProfileSection.tsx`
already accept **NID, passport, or birth certificate**. Only the legacy
`RegistrationForm.tsx` hard-codes NID plus an 18+ date-of-birth gate.
So this amendment is copy plus one validation removal, not a rebuild.

**Files: three edits. All copy verbatim.**

1. **`src/data/faq.ts`** — four answers change:

   a. `age-limit` — the **question** becomes "Is there a minimum age to
      attend?" and the answer becomes, verbatim: "Sonic Pulse is open to
      all ages. Every attendee registers with a valid ID — a National ID,
      passport, or birth certificate — and the name on the ticket must
      match the ID presented at the gate."

   b. `why-nid` — the **question** becomes "Why do I need to provide an
      ID?" and the answer becomes, verbatim: "ID verification helps us
      keep the event safe and is required under our venue permit
      conditions. We accept a National ID, passport, or birth
      certificate. Your data is stored securely and used only for this
      event."

   c. `nid-data-protection` — the **question** becomes "How is my ID data
      stored and protected?" and the answer becomes, verbatim: "Your ID
      document is stored in a private, encrypted cloud storage — it is
      never publicly accessible. Only authorised staff can access it, and
      access is logged. We comply with Bangladesh Digital Security Act
      obligations."
      (The `id` fields of all three items stay unchanged — they are
      anchor keys, not copy.)

   d. `what-to-bring` — answer becomes, verbatim: "Your printed or
      digital ticket (QR code), your original ID matching your
      registration, comfortable clothes, ear protection (optional but
      recommended), and your energy."

2. **`src/app/(main)/tickets/TicketsGate.tsx`** — the "How it works" line
   currently reads "Register ticket with your NID". Replace that phrase
   so the sentence reads, verbatim: "Sign up → Register ticket with your
   ID → We review within 24h → Approved tickets can be downloaded with QR
   code." (Unreachable while `TICKETS_LIVE = false`, fixed now so it
   cannot ship stale.)

3. **`src/components/tickets/RegistrationForm.tsx`** — remove the 18+
   gate. The `dateOfBirth` field currently carries a `.refine(...)`
   enforcing "You must be 18 or older to attend". Delete that `.refine()`
   call so the field is `dateOfBirth: z.string()`, keeping date-of-birth
   collection itself. Leave every other field alone.

**Scope fences.** The policy page needs no edit — it never stated an age
rule, and its "matching photo ID" wording is already ID-neutral. The
dashboard ID-type system, admin, gate scanner, and the `nidNumber` field
inside the legacy `RegistrationForm.tsx` are untouched: that file is dead
code behind `TICKETS_LIVE = false`, and its NID-only field and any
deletion of the file are a separate amendment, not this one.

**Owner decisions this creates — flagged, not invented.** Removing the
age bar raises questions the website cannot answer on its own, and this
amendment deliberately writes no policy for them:
- **Are minors admitted unaccompanied?** The event runs overnight for
  17.5 hours and includes open flame, two climbable structures, boats and
  a pool. A guardian/accompaniment rule is an owner decision; once made,
  it belongs on the policy page in a follow-up amendment.
- **Does the venue's permit or insurance assume an 18+ crowd?** Both are
  still unsigned; tell the contracts session, since it changes security
  scope and liability cover (`CONTRACTS_CONTEXT.md` §5, §7).
- The event being alcohol-free (§8.25) makes an all-ages event coherent;
  that decision and this one support each other.

**Reversibility.** Pure copy plus one validation line; restore the
previous strings and the `.refine()` to revert.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100, counting with `grep -o … | wc -l`:
  - `/faq` → `18 or older` **0**, `open to all ages` **≥1**,
    `passport, or birth certificate` **≥2**
- Source greps: `grep -c '18 or older' src/components/tickets/RegistrationForm.tsx`
  → **0**; `grep -rc 'your NID' "src/app/(main)/tickets/TicketsGate.tsx"` → **0**.
- Regression: `grep -c 'Digital Security Act' src/data/faq.ts` → **1**
  (the data-protection promise must survive the rewrite).
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/faq`.

**Companion-file note (planner-done, no executor action):**
`EVENT_CONTEXT.md`, `OPS_CONTEXT.md`, `FINANCE_CONTEXT.md`,
`VENUE_CONTRACT_CONTEXT.md` and `CONTRACTS_CONTEXT.md` all stated
"strictly 18+" and are corrected in the same pass, along with their
as-of dates (several read 9 Aug; today is 13 Aug, 43 days out).

### 8.28 /wayfinder — Wayfinder volunteer programme page (added 13 Aug 2026, owner-requested)

The owner is announcing the volunteer programme on Instagram tonight, and
the poster's call to action points at the website — so the page must
exist. **WAYFINDER is a locked name** from here on, lockup
`WAYFINDER · The Volunteer Corps`; never renamed or paraphrased.

Owner answers, now settled: **50 Wayfinders**, **two 8-hour shifts**,
certificates issued by **Dhaka Music Festival alone**, eligibility is
**both final-year undergraduates and HSC/A-level finishers**.

**Planner decision — the shift arithmetic doesn't close, and here is the
resolution.** The event runs 17.5 hours; two 8-hour shifts cover 16.
Shifts are therefore defined as:
- **Shift A · Dusk — 3:00 PM to 11:00 PM** (starts an hour before gates
  for briefing), 25 Wayfinders.
- **Shift B · Dawn — 11:00 PM to 7:00 AM**, 25 Wayfinders.
This leaves **7:00–9:30 AM uncovered**. Rather than change the owner's
two-shift structure, the form carries an opt-in checkbox for staying to
the close; the owner assigns roughly ten willing Shift B volunteers to
it. This is flagged to the owner as a real gap with a chosen mitigation,
not a silent fix.

This mirrors the **First Pulse architecture exactly** (§8.5, hardened by
§8.16 and §8.19) — same flag pattern, same graceful degradation, same
error copy discipline. Build it by reading those sections alongside this
one.

**Pre-staged by the planner:** `supabase-wayfinder.sql` is committed at
the repo root. **The owner must run it in the Supabase project whose ref
is `ytgwocaresxghgyiwikr`** — the project holding `user_profiles` (see
§8.19; running it in the wrong project is exactly the failure that broke
First Pulse for weeks).

**Files: five creates, four edits.**

1. **Create `src/data/wayfinder.ts`:**

```ts
/**
 * Wayfinder volunteer programme — see REDESIGN_PLAN.md §8.28.
 *
 * WAYFINDER_LIVE: master switch for the public /wayfinder page and its
 * nav entries. Flip to false once all 50 places are filled; the page
 * then shows the closed card instead of the form.
 */
export const WAYFINDER_LIVE = true

export const WAYFINDER_TOTAL = 50

export type WayfinderShift = {
  id: 'dusk' | 'dawn'
  label: string
  time: string
  blurb: string
  places: number
}

export const wayfinderShifts: WayfinderShift[] = [
  {
    id: 'dusk',
    label: 'Shift A · Dusk',
    time: '3:00 PM – 11:00 PM',
    blurb: 'Briefing before gates, the arrival rush, sunset, and the first sets.',
    places: 25,
  },
  {
    id: 'dawn',
    label: 'Shift B · Dawn',
    time: '11:00 PM – 7:00 AM',
    blurb: 'Night Rituals, the Great Burn at midnight, the quiet hours, and sunrise.',
    places: 25,
  },
]
```

2. **Create `supabase-wayfinder.sql`** (planner has already written this
   file; executor does not author it — verify it exists and reference it
   in the owner note).

3. **Create `src/app/api/wayfinder/route.ts`** — copy the structure of
   `src/app/api/first-pulse/route.ts` exactly, including its §8.16/§8.19
   hardening, changing only:
   - table `wayfinder_applications`; reference prefix `WF-`
   - required fields: `fullName`, `email`, `phone`, `institution`,
     `level`, `shiftPreference`
   - optional: `graduationYear`, `dateOfBirth`, `instagramHandle`,
     `motivation` (≤600 chars), `emergencyContactName`,
     `emergencyContactPhone`, `stayToClose` (boolean), `notes`
   - 400 copy for over-length motivation, verbatim: "Tell us in 600
     characters or fewer."
   - the 500, 409, 503 branches and their copy are **identical in
     wording** to First Pulse's current state except the noun: 409 reads,
     verbatim, "You've already applied — the application we have on file
     is the one that counts."; 500 reads, verbatim, "Something went wrong
     on our end. Try again in a minute, or email your application to
     hello@sonicpulsefestival.com."
   - missing-table check matches `'42P01' || 'PGRST205'` (§8.19)
   - confirmation email subject, verbatim: "Application received —
     Wayfinder"; body mirrors the First Pulse template with the reference
     code block, and its closing line reads, verbatim: "We'll confirm
     shifts and briefing details closer to the event. Questions? Reply to
     this email or message us on Instagram @sonicpulsefestival. Sonic
     Pulse is organised by Dhaka Music Festival — @dhakamusicfestival."

4. **Create `src/components/wayfinder/WayfinderForm.tsx`** — clone
   `FirstPulseForm.tsx`'s structure, styles and status machine
   (`idle | submitting | success | not_open | already_applied | error`),
   with these fields in this order (labels verbatim):
   - "Full name" (required)
   - "Email" (required, `type="email"`)
   - "Phone" (required, `inputMode="tel"`)
   - "School / college / university" (required)
   - "Where you are in your studies" (required, `<select>`, options
     verbatim: "Final-year undergraduate", "HSC / A-level finisher",
     "Other")
   - "Expected graduation year" (optional, `type="number"`, min 2026,
     max 2032)
   - "Date of birth" (required, `type="date"`) — **no age validation**;
     see the owner decision below
   - "Shift preference" (required, `<select>`, options verbatim: "Shift A
     · Dusk — 3:00 PM to 11:00 PM", "Shift B · Dawn — 11:00 PM to 7:00
     AM", "Either shift works")
   - Checkbox, label verbatim: "I can stay to the close (7:00–9:30 AM)"
   - "Why you want to do this" (optional textarea, 600-char counter in
     the same style as First Pulse's bio counter)
   - "Emergency contact name" (required)
   - "Emergency contact phone" (required, `inputMode="tel"`)
   - "Instagram / socials" (optional)
   - "Anything we should know" (optional textarea — accessibility needs,
     medical notes)
   - Submit label, verbatim: "Apply to be a Wayfinder →"; submitting
     state "Sending…"
   - Fine print under the button, verbatim: "Certificates are issued by
     Dhaka Music Festival on completion of your shift."
   - **success card** — heading verbatim "You're on the list.", body
     verbatim "We'll confirm your shift and briefing details closer to
     the event.", then the reference-code block styled exactly as First
     Pulse's.
   - **not_open card** — heading verbatim "Applications open soon.", body
     verbatim "Check back shortly, or follow @sonicpulsefestival for the
     announcement."
   - **already_applied card** — heading verbatim "You've already
     applied.", body verbatim "The application we have on file is the one
     that counts. Questions? Email hello@sonicpulsefestival.com."

5. **Create `src/app/(main)/wayfinder/page.tsx`** — mirror
   `first-pulse/page.tsx`'s two-column layout.
   - `metadata`: title "Wayfinder — Sonic Pulse", description "Join the
     Wayfinder volunteer corps. Guide the night at Sonic Pulse 2026."
   - `PageHeader`: eyebrow "Volunteer programme", title "Wayfinder", sub
     "Guide the night."
   - Left column heading, verbatim: "What a Wayfinder does"
   - First paragraph, verbatim: "Eight hundred people walk into a field
     they have never seen before, in the dark, for seventeen and a half
     hours. Wayfinders are the reason none of them feel lost. You are the
     festival on the ground — the person who knows where the water is,
     which way the Sunrise Stage is, and what happens at midnight."
   - Second paragraph, verbatim: "Fifty Wayfinders work the night in two
     shifts. Bring patience, a good sense of direction, and the
     willingness to answer the same question forty times without losing
     your warmth."
   - Three points in the First Pulse arrow-list style, verbatim:
     - "A certificate that counts" / "Every Wayfinder who completes a
       shift receives a certificate of service from Dhaka Music Festival
       — written for university applications."
     - "Open to graduating students" / "Final-year undergraduates and HSC
       or A-level finishers are both welcome to apply."
     - "Inside the whole night" / "Two stages, nine art installations,
       and the Great Burn at midnight — you are in the room for all of
       it."
   - Then a shift block rendering `wayfinderShifts` — each row shows
     `label`, `time`, `blurb` and "{places} places", styled with the
     existing card tokens (`var(--bg-elevated)`, `var(--border)`,
     `var(--radius-card)`).
   - Right column: `<WayfinderForm />` when `WAYFINDER_LIVE`, otherwise a
     closed card in the not_open card's styling with heading verbatim
     "Wayfinder applications are closed." and body verbatim "All fifty
     places are filled for 2026. Follow @sonicpulsefestival for the next
     call."

6. **Create `src/app/api/admin/wayfinder/route.ts` and
   `src/app/admin/WayfinderTab.tsx`** — clone the First Pulse admin route
   and tab (`src/app/api/admin/first-pulse/route.ts`,
   `src/app/admin/FirstPulseTab.tsx`), swapping the table and fields, and
   keeping the `'42P01' || 'PGRST205'` not-ready check. Register the tab
   in the admin page beside First Pulse with the label "Wayfinder".

7. **Edit `src/components/layout/Navbar.tsx` and
   `src/components/layout/MobileMenu.tsx`** — import `WAYFINDER_LIVE`
   from `@/data/wayfinder` and add to each `navLinks` array, immediately
   after the First Pulse entry, using the same conditional-spread pattern
   already used for tickets:
   `...(WAYFINDER_LIVE ? [{ href: '/wayfinder', label: 'Wayfinder' }] : []),`

8. **Edit `src/components/layout/Footer.tsx`** — import `WAYFINDER_LIVE`
   and add the same conditional entry to `supportLinks`, after First
   Pulse.

**Owner decisions — flagged, not invented.**
- **Volunteer minimum age.** §8.27 removed the attendee 18+ bar, so the
  form deliberately carries **no age gate** — it collects date of birth
  so the owner can apply whatever rule they choose. If Wayfinders must be
  18+, or if under-18s need guardian consent, that is a follow-up
  amendment and a line of form copy.
- **The 7:00–9:30 AM coverage gap** and its opt-in mitigation, above.
- The certificate's wording and issuance process sit outside the website.

**Failure/empty states.** Table missing → 503 "Applications open soon."
card (never a 500, per §8.19). Duplicate email → the calm already-applied
card. Flag off → the closed card, and the nav entries disappear.

**Reversibility.** `WAYFINDER_LIVE = false` closes applications and hides
every nav entry in one line. Full removal means deleting the five created
files and reverting the three nav edits.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only);
  `npm run build`.
- Local dev on port 3100 (local env reaches the real project — clean up
  after), counting with `grep -o … | wc -l`:
  - `/wayfinder` → HTTP 200; `Guide the night.` **≥1**;
    `certificate of service` **≥1**; `Shift A · Dusk` **≥1**;
    `Shift B · Dawn` **≥1**
  - `/` → `>Wayfinder<` **≥1** (nav entry present)
- API, against the real table once the owner has run the SQL:
  - POST a valid payload with email `wf-verify@example.com` → **201** with
    a `WF-` reference code
  - POST the same email again → **409** with the already-applied copy
  - **Cleanup (mandatory):** delete that row via Supabase REST and
    confirm zero rows remain for that email; never print the service key.
  - If the SQL has not been run yet, the same POST must return **503**
    `not_open` — that is a pass, not a failure, and the executor should
    report which of the two outcomes occurred.
- Playwright at 1280×800 and 375×812: fill and submit the form → the
  "You're on the list." card; `scrollWidth - clientWidth === 0` on
  `/wayfinder` **and** on `/` (the nav gains a seventh item — confirm the
  desktop navbar does not overflow at 1280).
