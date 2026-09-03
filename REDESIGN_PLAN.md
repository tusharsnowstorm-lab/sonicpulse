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

### 8.29 Wayfinder minimum age: 17 (added 13 Aug 2026, owner-decided)

§8.28 flagged the volunteer minimum age as an owner decision and shipped
the form with a date-of-birth field but no gate. Owner decision: **17**.

**Judgment call, flagged rather than silently assumed:** age is computed
against **today's date (application time)**, mirroring the exact pattern
the site already used for the attendee 18+ gate before §8.27 removed it
— not against the event date (25 Sep 2026). An applicant who is 16 today
but turns 17 before the festival will not pass this check. If the owner
intends age-by-event-date instead, that is a one-line change to the
comparison date in both the client and server checks below.

**Files: two edits.**

1. `src/components/wayfinder/WayfinderForm.tsx` — client-side check
   before submit, reusing the exact age-calculation arithmetic
   `RegistrationForm.tsx` used for its (now-removed) 18+ gate, adjusted
   to 17. On failure: `setErrorMsg('Wayfinders must be 17 or older to
   apply.')`, `setStatus('error')`, return before the network call.
2. `src/app/api/wayfinder/route.ts` — the same check server-side (client
   validation is never trusted alone). Also adds `dateOfBirth` to the
   required-fields check — it was marked required in the form but not
   enforced by the API, a gap from §8.28's execution, closed here.
3. `src/app/(main)/wayfinder/page.tsx` — the "Open to graduating
   students" point body becomes: "Final-year undergraduates and HSC or
   A-level finishers, 17 or older, are welcome to apply."

**Verification:** date of birth yielding age 16 → 400 "Wayfinders must
be 17 or older to apply." on both client (before submit) and server;
age exactly 17 → passes.

### 8.30 Timetable clipping on narrow phones — responsive NightTimetable rows (added 14 Aug 2026, owner-reported)

Owner screenshot from a Samsung Galaxy S25 (≈360 CSS px viewport): on
the lineup timetable, act names wrap word-per-line into a sliver column
("Fly / on / the / Wall"), tags are cut off at the right edge ("NIGH…",
"RITU…"), and there is no horizontal scroll to reach them.

**Reproduced and measured (14 Aug 2026, local dev + Playwright):**

| Viewport | Rows clipped (of 9) | Worst overhang | Page scrollWidth − clientWidth |
| --- | --- | --- | --- |
| 360 px | 4 | 29 px | 0 |
| 375 px | 1 | 15 px | 0 |
| 412 px | 0 | 0 | 0 |

**Root cause:** `src/components/lineup/NightTimetable.tsx` lays every
row as `gridTemplateColumns: '170px 1fr auto'` with `gap: 18` and
`padding: '15px 24px'`. On a 360 px viewport the fixed 170 px time
column + 48 px padding + 36 px of gaps + the tag's natural width leave
the name column ~60 px, and the row's minimum content width exceeds the
card, whose `overflow: hidden` (needed for the rounded corners) clips
the excess with no scrollbar.

**Why the §4 gates missed it:** the protocol checks
`scrollWidth - clientWidth === 0` at page level — which passed at every
width above, because the clipping happens *inside* an
`overflow: hidden` container. **Protocol note, extending §4:** mobile
gates on content inside rounded/overflow-hidden cards must also assert
element-edge visibility (rightmost child's `getBoundingClientRect().right`
≤ viewport width), not just page scroll. The verification gate below is
the template.

**The fix — one file, `src/components/lineup/NightTimetable.tsx`.**
Below `sm` (640 px) the row becomes a two-line stack: line 1 is time
(left) and tag (right), line 2 is the name with its sub-line at full
width. At `sm` and above the current three-column grid renders exactly
as today. Implemented with flex-wrap + order utilities so the same
three children serve both layouts — no duplication, no new components.

Replace the `inner` markup of `Row` with, verbatim (only classNames and
the container's style change; all text/color/font styles stay as they
are today):

```tsx
const inner = (
  <div
    className="flex flex-wrap items-baseline gap-y-1 gap-x-[18px] px-4 py-[15px] sm:grid sm:px-6"
    style={{
      gridTemplateColumns: '170px 1fr auto',
      background: row.ritual ? 'linear-gradient(90deg, var(--accent-faint), transparent 55%)' : 'transparent',
    }}
  >
    <span className="order-1 sm:order-none" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em', color: '#fff' }}>
      {row.time}
    </span>
    <span className="order-3 basis-full min-w-0 sm:order-none sm:basis-auto">
      <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{row.name}</span>
      {row.sub && (
        <span style={{ display: 'block', fontWeight: 400, fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
          {row.sub}
        </span>
      )}
    </span>
    <span
      className="order-2 ml-auto whitespace-nowrap sm:order-none sm:ml-0"
      style={{
        fontSize: 11,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontWeight: 600,
        color: row.ritual ? 'var(--accent-magenta)' : 'var(--text-label-muted)',
      }}
    >
      {row.tag}
    </span>
  </div>
)
```

How it resolves each symptom: the name gets `basis-full` on mobile (a
full-width second line — no more sliver column), the tag sits on line 1
hard-right via `ml-auto` inside the viewport (no more clipping), the
fixed 170 px column simply does not exist below `sm`, and mobile
horizontal padding drops 24→16 px for breathing room. The inline
`gridTemplateColumns` is inert below `sm` (the container is flex there)
and restores today's exact desktop layout at `sm+` where `sm:grid`
applies. The ritual-row gradient is on the container and is unaffected.

**Scope fences.** `timetableRows` data, the card wrapper, the caption
line under the table, and both consuming pages (`/lineup`,
`/schedule`) are untouched. No other component changes.

**Reversibility.** Single-component markup change; revert the one JSX
block to restore the old behaviour.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Playwright clip probe on **both** `/lineup` and `/schedule` at
  **360×800, 375×812, 412×915**: select all row containers (the divs
  whose inline `gridTemplateColumns` is `'170px 1fr auto'`) and assert
  for every row that `lastElementChild.getBoundingClientRect().right`
  ≤ `document.documentElement.clientWidth + 1` → **0 clipped rows at
  every width** (baseline before fix: 4 clipped at 360). Also
  `scrollWidth - clientWidth === 0` at each width.
- Desktop regression at 1280×800: for the same row containers assert
  `getComputedStyle(row).display === 'grid'` and 0 clipped rows —
  today's desktop layout must be pixel-equivalent in structure.
- Content greps unchanged pages: `/lineup` → `Night Rituals` ≥1,
  `Starside Hours` ≥1 (rows all render).

### 8.31 Wayfinder gender field (added 14 Aug 2026, owner-requested)

The owner asked for a gender breakdown of Wayfinder applicants; the
form never collected gender (the §8.28 spec did not include it), so no
breakdown exists. This amendment adds the field.

**Planner decisions, made now:**

- **Required select, three options** — "Female", "Male", "Prefer not to
  say" (stored as `female` / `male` / `prefer_not_to_say`). Required
  rather than optional so the breakdown has no silent blanks, with
  "Prefer not to say" as the no-disclosure escape valve — a volunteer
  sign-up must never force disclosure, but an optional field would make
  blanks and refusals indistinguishable. This deliberately differs from
  the ticket flow's required male/female binary: Wayfinder is a
  student-facing programme, and the operational need (shift balance,
  safeguarding) is served equally well with the third option.
- **Existing applications keep `gender = NULL`** ("not stated") — the
  data cannot be recovered retroactively. If the owner wants it for
  early applicants, contacting them is an off-site task, not code.
- **Deploy-order independence.** The live table needs an
  `ALTER TABLE`; the owner may run it before or after the code ships.
  If the column is missing when the API inserts, PostgREST fails with
  code `PGRST204` ("column not found" — the column sibling of §8.19's
  `PGRST205`); the API then **retries the insert without the gender
  field** so an application is never lost to a lagging migration. Same
  graceful-degradation discipline as §8.16/§8.19.

**Pre-staged by the planner:** `supabase-wayfinder-gender.sql` at the
repo root (a single additive `alter table … add column if not exists`
with a check constraint permitting NULL). **Owner runs it in the
project whose ref is `ytgwocaresxghgyiwikr`.**

**Files: three edits (the SQL file already exists).**

1. **`src/components/wayfinder/WayfinderForm.tsx`**
   - Add `gender: ''` to `initialForm`.
   - Insert a new field block between "Date of birth" and "Shift
     preference", exactly matching the existing select pattern:

```tsx
      <div>
        <label style={labelStyle} htmlFor="wf-gender">Gender <Required /></label>
        <select id="wf-gender" style={fieldStyle} required value={form.gender} onChange={set('gender')}>
          <option value="">Select one</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>
```

2. **`src/app/api/wayfinder/route.ts`**
   - Parse `const gender = (body.gender ?? '').trim()` with the other
     fields; add `!gender` to the required-fields check; add a
     constant `const GENDERS = ['female', 'male', 'prefer_not_to_say']`
     beside `LEVELS`/`SHIFTS` and include
     `!GENDERS.includes(gender)` in the enum-validation check.
   - Include `gender` in the insert payload.
   - **Missing-column fallback**, immediately after the insert and
     before the existing `if (dbError)` branches — verbatim:

```ts
    let insertError = dbError
    if (insertError && insertError.code === 'PGRST204' && /gender/.test(insertError.message ?? '')) {
      // Gender column not migrated yet (supabase-wayfinder-gender.sql
      // not run) — never lose an application to a lagging migration.
      console.error('Wayfinder: gender column missing — run supabase-wayfinder-gender.sql. Inserting without gender.')
      const retry = await supabase.from('wayfinder_applications').insert({
        full_name: fullName,
        email,
        phone,
        institution,
        level,
        graduation_year: graduationYear,
        date_of_birth: dateOfBirth || null,
        shift_preference: shiftPreference,
        stay_to_close: stayToClose,
        motivation: motivation || null,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        instagram_handle: instagramHandle || null,
        notes: notes || null,
        status: 'pending',
        reference_code: referenceCode,
      })
      insertError = retry.error
    }
```

     …and the subsequent branches test `insertError` instead of
     `dbError` (rename in place; the `42P01 || PGRST205`, `23505`,
     logging and 500 branches are otherwise unchanged).

3. **`src/app/admin/WayfinderTab.tsx`**
   - Extend the `Application` type with
     `gender: 'female' | 'male' | 'prefer_not_to_say' | null`.
   - Add a labels map beside the existing ones:
     `const GENDER_LABEL: Record<string, string> = { female: 'Female', male: 'Male', prefer_not_to_say: 'Prefer not to say' }`.
   - In the second detail grid (the `grid-cols-1 sm:grid-cols-2` block
     with Emergency contact and Date of birth), add a third cell,
     exactly in the established cell pattern, label "Gender", value
     `{app.gender ? GENDER_LABEL[app.gender] : '—'}`.

**Scope fences.** First Pulse, tickets, and the dashboard gender field
are untouched. `supabase-wayfinder.sql` is history — do not edit it;
the new column ships only via `supabase-wayfinder-gender.sql`. No
change to `wayfinder.ts` data, nav, or page copy.

**Failure/empty states.** Column missing → fallback insert without
gender (application saved, loud server log naming the SQL file); admin
shows "—" for any application without a stored gender (legacy rows and
fallback-era rows alike).

**Reversibility.** Remove the three code edits; the column can stay
(nullable, harmless) or be dropped with
`alter table public.wayfinder_applications drop column gender;`.

**For the owner's original question**, once the column is live —
breakdown SQL to run in the dashboard:

```sql
select coalesce(gender, 'not stated') as gender, count(*)
from public.wayfinder_applications
group by 1 order by 2 desc;
```

**Verification gates (executor).** Local env points at the wrong
project (§8.19), so the table is missing locally and DB-dependent
paths return 503 — that is expected and is itself a pass; validation
branches run before the DB call and are fully testable.
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100:
  - POST valid payload **without** `gender` → 400 "All required fields
    must be filled in."
  - POST with `"gender": "nonsense"` → 400 same copy.
  - POST with `"gender": "female"` and all required fields → 503
    `not_open` locally (reaches the DB call = validation passed).
- Playwright at 375×812: `/wayfinder` renders a `#wf-gender` select
  with exactly 4 options ("Select one", "Female", "Male", "Prefer not
  to say"); `scrollWidth - clientWidth === 0` at 375×812 and 1280×800.
- Source grep: `grep -c 'PGRST204' src/app/api/wayfinder/route.ts` → ≥1
  (fallback present); `grep -c 'gender' src/app/admin/WayfinderTab.tsx`
  → ≥3.
- Live, after ship **and** after the owner runs the SQL: POST a test
  application with `"gender": "prefer_not_to_say"` → 201; delete the
  row via the dashboard afterwards (this session cannot — §8.19).

### 8.32 Admin access while sign-in is off (added 14 Aug 2026, owner-requested)

Owner asked how to reach `/admin` while `SIGNIN_LIVE = false` (§8.15),
and to allow admin login for **tushar.snowstorm@gmail.com**.

**Diagnosis: no code change is needed — both mechanisms already exist.**

1. **`/admin` gating is independent of `SIGNIN_LIVE`.** `src/app/admin/page.tsx`
   checks only two things: is there a signed-in user, and is that
   user's email in the `ADMIN_EMAILS` env var. It does not read
   `SIGNIN_LIVE` at all. The flag only hides the public "Sign in" entry
   points (nav/menu/footer) and swaps the `/login` card's content
   (§8.15) — it never blocks authentication itself.
2. **The sign-in card already has an escape hatch**, built in §8.15
   specifically for this situation: `/login?open=1` shows the full
   "Continue with Google" card regardless of the flag
   (`signinOpen = SIGNIN_LIVE || signinOverride`, read client-side from
   the URL). This is intentionally undocumented on-site, not secret —
   §8.15 already recorded it as "a soft switch, not a security
   boundary."

**So reaching `/admin` is two steps, both owner-side, zero deploys:**

1. **Vercel → sonicpulse project → Settings → Environment Variables →
   `ADMIN_EMAILS`.** Add `tushar.snowstorm@gmail.com` — comma-separated
   if other admin emails already exist, e.g.
   `existing@example.com,tushar.snowstorm@gmail.com`. Apply to
   Production (and Preview if used). **Redeploy** — env edits do not
   take effect until the next deploy, same rule as every other env var
   in this project (§8.16, §8.19).
2. **Visit `sonicpulsefestival.com/login?open=1`** → "Continue with
   Google" → sign in with the Google account for
   tushar.snowstorm@gmail.com. The callback lands on `/dashboard` by
   default (`src/app/auth/callback/route.ts`, unless the email is also
   in `GATE_STAFF_EMAILS`, which sends it to `/gate` instead — keep the
   two lists mutually exclusive for this address unless gate access is
   also wanted). From there, navigate to **`/admin`** directly.

Once signed in, ordinary navigation works normally regardless of the
flag: the desktop navbar's Account link and the footer's Dashboard link
are gated on `user`, not on `SIGNIN_LIVE` (`src/components/layout/Navbar.tsx`,
`Footer.tsx` — "existing signed-in sessions are unaffected," per §8.15).
The session persists (Supabase cookie) until sign-out, so `?open=1` is
only needed once per browser/device.

**Scope fences.** No files touched. `SIGNIN_LIVE`, the closed-card copy,
and every other §8.15 behaviour are unchanged — this section is a
diagnosis plus an owner runbook, not a code amendment.

**Verification (owner, after both steps).** `/admin` loads the tickets
tab (not a redirect to `/` or `/login`) and the Wayfinder/First Pulse
tabs are reachable via the surface switcher.

### 8.33 The Three Murmurs — new installations: lore canon + creator-brief artifact (added 16 Aug 2026, owner-requested)

The owner is adding three installations: four flower-wreathed bamboo
swings, a walkable net strung across tree branches, and a bamboo
pyramid where hanging fish cast a cascade of colored light over a
water bowl. Sequence the owner set: **lore artifact first, website
changes only after the owner finalises pictures and lore** (that later
work will be its own amendment, §8.34, deliberately not written yet).

**Naming decision, proposed for owner veto — the Nine stay Nine.**
THE NINE ECHOES is a locked name; growing it to twelve would break it.
The trio therefore ships as a companion tier: **THE THREE MURMURS** —
in the lore, the Nine Echoes are what the Signal proclaimed; the
Murmurs are what it said softly. Human-scale, restful, touchable.
(Veto option B: fold them into a renamed Twelve Echoes — requires a
site-wide rename sweep and breaks a locked name; not recommended.)

**Names and lore, drafted (owner finalises; NAME · Tail lockups):**

1. **SWAYBLOOM · The Four Gardens** — the swings.
   Hook: "Four gardens that refused to stay planted."
   Lore: the night the Signal fell, everything that heard it learned to
   move. The gardens listened longest — so they became swings: four
   bamboo arches wearing wreaths of living flowers, swaying to the same
   slow rhythm the Glowtide jellies migrate to. Sit, and the garden
   takes you with it.
2. **OVERSTORY · The Woven Crossing** — the tree net.
   Hook: "Walk where only birds have opinions."
   Lore: Mycelia dreams below the grass; the Overstory is where the
   dream surfaces. The forest wove its threads into a crossing strung
   branch to branch so the ground-bound could visit. Walk it slowly —
   the trees are carrying you, and they know it.
3. **SHOAL · The School of Light** — the fish pyramid.
   Hook: "The fish that traded water for light."
   Lore: the Styx boat crews swear the water under Event Horizon plays
   a note nothing on land does. The Shoal is where that note surfaced:
   a school of fish hanging mid-air above a bowl of still water,
   swimming in the light that pours through them and casting their
   river across the ground. Stand in the cascade and you stand in the
   school.

Each Murmur deliberately interlocks with an existing Echo (Glowtide,
Mycelia, Styx/Event Horizon) so the mythology stays one web.

**The artifact.** The content-creator brief built in an earlier session
(activities + installations + lore, shareable HTML) was **never
committed to the repo** — it lived only as a session deliverable, which
is why updating it now means rebuilding it. Lesson recorded: shareable
deliverables that will need future updates must land in the repo.
When the owner finalises names, lore and pictures, the planner rebuilds
it as **`CREATOR_BRIEF.html` at the repo root** — one self-contained
dark-theme page (inline styles, festival identity) covering: the nine
activities, the Nine Echoes, the Three Murmurs, each with lockup, hook,
lore, concept image, plus the standing content rules (tag
@sonicpulsefestival, organiser credit @dhakamusicfestival, no live
streaming during the event, locked names never paraphrased). Planner
executes its own plan on finalisation (same §8.21 reasoning); mockup
images are committed under `public/images/murmurs/` as
`swaybloom.webp`, `overstory.webp`, `shoal.webp` (~1600w) at that point.

**Contract flag (owner must action before commissioning builds):** the
installation vendor's contract makes them the **exclusive
art-installation provider until end-2028** — the Three Murmurs must be
offered to that vendor (they also conveniently count toward the
every-4-months work commitment), or built with their written consent.
Tell the contracts session; `CONTRACTS_CONTEXT.md` gains this note in
§8.34. Finance (three new OPEN cost lines) and ops (workstream 2 grows)
follow in §8.34 under the companion-file maintenance rules.

**Verification for the artifact build (when it happens):** page opens
locally in a browser; every image loads from the repo path; grep counts
for all twelve lockups ≥1; no external network requests in the HTML.

### 8.34 The Twelve Echoes — build architecture (added 17 Aug 2026, owner-decided)

Owner decisions, superseding §8.33 on three points:
- **THE NINE ECHOES becomes THE TWELVE ECHOES.** The owner chose option
  B knowingly; the §8.33 "Three Murmurs" tier is dead. THE TWELVE
  ECHOES is now the locked name; every "Nine Echoes"/"nine" reference
  site-wide is renamed by this amendment.
- **`CREATOR_BRIEF.html` will not be built** — the website itself
  serves as the shareable lore reference. §8.33's artifact section is
  void; its lesson (commit shareable deliverables) stands.
- **The vendor conversation has already happened** — §8.33's contract
  flag is resolved; commercial terms remain OPEN for the finance file.

Final names (owner-locked): **SWAYBLOOM · The Four Swings**,
**OVERSTORY · The Woven Crossing**, **SHOAL · The School of Light**.

**Planner decision — trail renumbering, spatial not appended.** The
echoes are "gate to burn, in trail order"; the three new pieces sit
mid-trail (swings by the walkway, the fish-light at the lake shore
where its lore surfaces, the net in the grove canopy above Mycelia),
so appending them as X–XII would break the trail's logic. The trail
renumbers to: I COILGATE (The Gate) · II GLOWTIDE (The Walkway) ·
**III SWAYBLOOM (The Wayside)** · IV EVENT HORIZON (The Bridge) ·
**V SHOAL (The Shore)** · VI MYCELIA (Overhead) · **VII OVERSTORY (The
Canopy)** · VIII EMBERHART (The Keeper) · IX CHROMA (The Climb) ·
X THE EMPTY THRONE (The Overlook) · XI CLOUD NINE (The Rest) ·
XII ICARUS (The Finale). Ids and image filenames of existing echoes do
not change — only `roman` and array position; ICARUS ending the trail
as the twelfth that burns is the point.

**Pre-staged by the planner (already committed):**
`public/images/echoes/swaybloom.webp`, `overstory.webp`, `shoal.webp`
(928×1152 concept renders; if the owner later supplies 4k upscales,
they replace these files under the same names, no code change).

**Files: five code edits + four companion edits.**

1. **`src/data/echoes.ts`** — header comment becomes
   `/** The Twelve Echoes — gate to burn, in trail order. */`. The
   array is reordered/renumbered to the trail above: existing entries
   keep every field except `roman` and `phase` (phases keep their
   existing names; only the three new phases are new). Insert the three
   new entries at positions III, V, VII, verbatim:

```ts
  {
    id: 'swaybloom',
    roman: 'III',
    phase: 'The Wayside',
    name: 'SWAYBLOOM',
    tail: 'The Four Swings',
    where: 'Beside the Glowtide walkway — four arches in a row',
    lore: 'Four gardens that refused to stay planted. The night the Signal fell, everything that heard it learned to move — and the gardens listened longest. Now they swing: four bamboo arches wearing wreaths of living flowers, swaying to the same slow rhythm the Glowtide jellies migrate to. Sit, and the garden takes you with it.',
    onSite: 'Four bamboo arch swings wrapped in fresh flower wreaths, lantern-lit, petals loose in the air.',
    image: '/images/echoes/swaybloom.webp',
  },
```

```ts
  {
    id: 'shoal',
    roman: 'V',
    phase: 'The Shore',
    name: 'SHOAL',
    tail: 'The School of Light',
    where: 'The lake shore, past the bridge — stand inside the light',
    lore: 'The boat crews of Styx swear the water under Event Horizon plays a note nothing on land does. The Shoal is where that note surfaced: a school of fish hanging mid-air above a bowl of still water, swimming in the light that pours through them and casting their river across the ground. Stand in the cascade and you stand in the school.',
    onSite: 'A bamboo pyramid of hanging translucent fish above a water bowl — light falls through them and floods the ground in moving colour.',
    image: '/images/echoes/shoal.webp',
  },
```

```ts
  {
    id: 'overstory',
    roman: 'VII',
    phase: 'The Canopy',
    name: 'OVERSTORY',
    tail: 'The Woven Crossing',
    where: 'Strung through the grove branches — shoes off, walk up',
    lore: 'Mycelia dreams below the grass; the Overstory is where the dream surfaces. The forest wove its threads into a crossing strung branch to branch, so the ground-bound could visit. Walk it slowly — the trees are carrying you, and they know it.',
    onSite: 'A hand-woven walkable net laced through the grove canopy, edges marked in warm string light.',
    image: '/images/echoes/overstory.webp',
  },
```

   Renumbering of existing entries: EVENT HORIZON `roman: 'IV'`,
   MYCELIA `'VI'`, EMBERHART `'VIII'`, CHROMA `'IX'`, THE EMPTY THRONE
   `'X'`, CLOUD NINE `'XI'`, ICARUS `'XII'`. COILGATE and GLOWTIDE
   unchanged.

2. **`src/data/activities.ts`** — four copy touches, verbatim swaps:
   `(Echo IX)` → `(Echo XII)` (Great Burn); `Doubles as Echo VIII in
   the lore` → `Doubles as Echo XI in the lore` (Cloud Nine);
   `(Echo III)` → `(Echo IV)` (Styx); `miniatures of the Nine Echoes`
   → `miniatures of the Twelve Echoes` (Bazaar).

3. **`src/app/(main)/echoes/page.tsx`** — metadata title
   `'The Twelve Echoes — Sonic Pulse'`; metadata description
   `'Twelve installations, one lore — gate to burn.'`; PageHeader
   title `"The Twelve Echoes"`; sub becomes
   `` `Twelve installations, one lore — walk them all before sunrise.${CONCEPT_ART_NOTE_LIVE ? '*' : ''}` ``;
   in the founding-myth paragraph, `into nine echoes` → `into twelve
   echoes` (single word swap; the rest of the myth is untouched).

4. **`src/components/home/EchoesTeaser.tsx`** — `Nine towering
   installations, one founding myth.` → `Twelve towering
   installations, one founding myth.`; `Walk all nine echoes →` →
   `Walk all twelve echoes →`. (The teaser's `featured` slice logic is
   untouched — it still shows the first three with images, which after
   reordering are COILGATE, GLOWTIDE, SWAYBLOOM.)

5. **`src/data/concept-art.ts`** — comment only: `Nine Echoes` →
   `Twelve Echoes`.

6. **`EVENT_CONTEXT.md`** — three edits: "9 large-scale themed art
   installations (\"The Nine Echoes\")" → "12 large-scale themed art
   installations (\"The Twelve Echoes\")"; the section heading "The
   Nine Echoes (installation trail, gate → ritual ground)" → "The
   Twelve Echoes (installation trail, gate → ritual ground)"; the
   numbered list gains the three new pieces at positions 3, 5, 7 with
   one-line descriptions matching the data file and renumbers the rest
   to match the trail above.

7. **`VENUE_CONTRACT_CONTEXT.md`** — §1 bullet "Nine large-scale art
   installations" → "Twelve large-scale art installations"; §2 table
   gains one row: "Flat ground near walkway + grove rigging + shore
   placement | SWAYBLOOM swings, OVERSTORY canopy net, SHOAL light
   pyramid (three additional builds, vendor engaged) | Hard".
8. **`FINANCE_CONTEXT.md`** — §4 gains one line under known remaining
   scope: "Three additional Echoes — SWAYBLOOM (four swings), OVERSTORY
   (canopy net), SHOAL (fish-light pyramid): vendor engaged, terms
   **OPEN**."
9. **`OPS_CONTEXT.md`** — workstream 2 gains one sentence: "Three
   further installations (SWAYBLOOM, OVERSTORY, SHOAL) added 17 Aug —
   vendor engaged; terms, build timeline and load-in impact OPEN."

**Scope fences.** `EchoPanel.tsx` is data-driven — no edit. Emails,
admin, FAQ, JSON-LD, nav: untouched. The OVERSTORY net and CLOUD NINE
nets are different structures; no copy conflates them.

**Failure/empty states.** None new — all three entries ship with
committed images, so the no-image placeholder path isn't exercised.

**Reversibility.** Revert the five code edits and delete the three
webp files; companion edits revert with them.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only
  — 7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100, counting with `grep -o … | wc -l`:
  - `/echoes` → `The Twelve Echoes` ≥1, `SWAYBLOOM` ≥1, `OVERSTORY` ≥1,
    `SHOAL` ≥1, `The Four Swings` ≥1, `Nine Echoes` **0**
  - `/` → `twelve echoes` ≥1, `Twelve towering` ≥1
  - `/activities` → `Echo XII` ≥1, `Echo XI` ≥1, `Echo IV` ≥1,
    `Nine Echoes` **0**
- Roman order sanity: on `/echoes`, the panels render I…XII in trail
  order — assert via grep that `>III<`-adjacent markup or the rendered
  sequence includes SWAYBLOOM before EVENT HORIZON (mechanical check:
  in `src/data/echoes.ts`, `grep -n "roman"` lists I,II,III,IV,V,VI,
  VII,VIII,IX,X,XI,XII in file order).
- Images: `curl -o /dev/null -w '%{http_code}'` for
  `/images/echoes/swaybloom.webp`, `overstory.webp`, `shoal.webp` →
  200 each.
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/echoes` and `/`.

### 8.35 EVENT HORIZON tail rename: Bridge of Light → Portal of Light (added 17 Aug 2026, owner-decided)

Owner decision: the locked lockup **EVENT HORIZON · Bridge of Light**
becomes **EVENT HORIZON · Portal of Light**, everywhere on the website.
Historical plan sections are append-only and are not rewritten.

**Planner judgment calls, made now:**
- **The phase label renames too: `'The Bridge'` → `'The Portal'`.** The
  trail reads Gate → Walkway → Wayside → **Portal** → Shore …, which
  carries the owner's intent into the trail itself. (Veto to keep "The
  Bridge" if preferred; one-word revert.)
- **The lore body is deliberately untouched.** Its first line — "A
  bridge strung with so much light it stops being a bridge." — now
  lands *better* under the Portal name: the sentence explains the
  rename. The `where` and `onSite` fields describe the physical bridge
  and stay accurate; the object is a bridge, the Echo is a portal.

**Files: two code edits + four companion edits. All verbatim.**

1. **`src/data/echoes.ts`** (event-horizon entry): `tail: 'Bridge of
   Light'` → `tail: 'Portal of Light'`; `phase: 'The Bridge'` →
   `phase: 'The Portal'`. Nothing else in the entry changes.
2. **`src/data/activities.ts`** (STYX extended): `the bridge of light
   (Echo IV)` → `the portal of light (Echo IV)`. The later phrase "the
   water under the bridge" stays — it is the physical bridge.
3. **`EVENT_CONTEXT.md`** list item 4: `**EVENT HORIZON · Bridge of
   Light**` → `**EVENT HORIZON · Portal of Light**` (physical
   description after the dash unchanged).
4. **`FINANCE_CONTEXT.md`**: `EVENT HORIZON (bridge-of-light dressing)`
   → `EVENT HORIZON (portal-of-light dressing)`.
5. **`OPS_CONTEXT.md`**: `Event Horizon (bridge of light)` →
   `Event Horizon (portal of light)`.
6. **`CONTRACTS_CONTEXT.md`**: `(bridge-of-light dressing)` →
   `(portal-of-light dressing)`.

**Scope fences.** `VENUE_CONTRACT_CONTEXT.md`'s "bridge dressed as a
tunnel of light" and "lake with a short bridge" rows describe the
physical structure, not the lockup — untouched. The echoes page's
closing trail line says "cross the horizon (IV)" — no bridge word,
untouched. REDESIGN_PLAN.md history untouched.

**Reversibility.** Six string swaps; revert verbatim.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100, counting with `grep -o … | wc -l`:
  - `/echoes` → `Portal of Light` ≥1, `The Portal` ≥1,
    `Bridge of Light` **0**
  - `/activities` → `portal of light` ≥1, `bridge of light` **0**
    (case-sensitive greps; "under the bridge" may and should remain)
- Source grep: `grep -rci "bridge of light" src/` → 0 across files.
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/echoes`.

### 8.36 Creator-casting story — 4K export of the chosen "Checklist" visual (added 18 Aug 2026, owner-requested)

**Context (record, not tasks).** On 18 Aug 2026 three Instagram-story
visuals (1080×1920 concept, rendered 768×1376) were generated via the
Higgsfield MCP for the owner's creator-casting callout — recruiting
content creators to shoot the official hype reel as a collab on
@sonicpulsefestival. The owner reviewed all three and picked the
**"Checklist — GET FEATURED. GET SEEN."** variant. The other two are
recorded here in case the owner later wants them too: "Direct" =
Higgsfield job `df7042bc-5a54-40ab-92bb-aec999700477`, "Signal/Lore" =
job `91c1256d-5c54-4f8e-8aa0-6628b545edcc`. A design-canvas mock of all
three also exists as Claude artifact
`https://claude.ai/code/artifact/c1a06a13-06fe-4f0f-9ae4-a9387d556e65`
(not needed for this task).

**Task.** Produce a 4K upscale of the chosen visual and hand the file
to the owner in chat. This is a media-delivery task: **zero website
code changes**. `src/`, `public/`, and all context docs are untouched.

**Source of truth.** Higgsfield completed image job
`eac4a900-4e07-438a-b954-ea2ec8391fa4` — a 768×1376 PNG. A backup copy
is already committed by the planner at
`marketing/creator-casting/story-checklist-768x1376.png` (this repo).

**Steps (mechanical, in order).**

1. Load tool schemas: `ToolSearch` with query
   `select:mcp__Higgsfield__upscale_image,mcp__Higgsfield__jobs_wait`.
2. Call `mcp__Higgsfield__upscale_image` with exactly:
   `params: { image_id: "eac4a900-4e07-438a-b954-ea2ec8391fa4",
   width: 768, height: 1376, resolution: "4k" }`. Omit `provider`
   (defaults to bytedance). This tool takes no prompt and no count.
   Do NOT preflight with `get_cost` — the owner has already asked for
   this file. If the call errors on insufficient credits, report the
   exact error to the owner and stop; do not switch providers,
   resolutions, or models.
3. Poll the returned job with `mcp__Higgsfield__jobs_wait`
   (`jobs: [{index: 1, job_id: <returned id>}]`, `timeout_seconds: 15`),
   repeating until `all_terminal` is true.
4. Download `result_url` with `curl -sS -o` into the session scratchpad
   as `story-checklist-4k.<ext>`, keeping whatever file extension the
   URL carries (the upscaler may emit png, jpg, or webp).
5. Verify with PIL (`python3`, `PIL.Image.open`): image opens; height
   ≥ 3000 px; width/height within 0.55–0.57 (source ratio is
   768/1376 ≈ 0.558). Then `Read` the image and confirm all five copy
   blocks survived the upscale verbatim: eyebrow
   "NOW CASTING — HYPE REEL"; headline "GET FEATURED. / GET SEEN.";
   the three card rows "Official collab post with @sonicpulsefestival",
   "Your cut, in the credits, on our page",
   "One night. One reel. Maximum chaos."; button
   "DM \"REEL\" TO APPLY"; footer
   "SONIC PULSE · 25 SEPT 2026 · SPOTS LIMITED". Any failed gate or
   mangled text → report to the owner with the image attached; do not
   retry-loop more than one fresh upscale attempt.
6. Deliver via `SendUserFile`: the 4K file, `display: "render"`,
   `status: "normal"`, caption exactly:
   "4K upscale of the Checklist story — ready to post."
7. Repo hygiene: commit nothing. `git status` must be clean at the end
   (the backup PNG and this plan section are already committed by the
   planner). Do not commit the 4K output — it is a chat deliverable,
   not a site asset.

**Fallback (only if step 2 rejects the `image_id` — e.g. job expired
or not found).** Load `mcp__Higgsfield__media_upload` and
`mcp__Higgsfield__media_confirm` via ToolSearch. Upload the committed
backup: `media_upload` with `filename:
"story-checklist-768x1376.png"`, `content_type: "image/png"`; PUT the
bytes of `marketing/creator-casting/story-checklist-768x1376.png` to
the returned `upload_url` (curl, per the tool's returned
instructions); `media_confirm`; then rerun step 2 with `image_id` =
the returned media_id (same width/height/resolution). If the fallback
also fails, report the exact error and stop — do NOT regenerate the
artwork from a prompt; regeneration changes the creative the owner
approved.

**Scope fences.** No changes to `src/`, `public/`, any `*_CONTEXT.md`,
or earlier plan sections. No website verification gates apply (no code
changed). Do not touch the claude.ai design artifact.

**Reversibility.** Delete `marketing/creator-casting/` to drop the
backup; the 4K file exists only in chat.

**Executor invocation (owner).** Run on Sonnet for token efficiency:
switch the session model to `claude-sonnet-5` (or open a fresh Sonnet
session on branch `claude/event-website-updates-1e8rib`) and prompt:
"execute §8.36 of REDESIGN_PLAN.md".

### 8.37 GATE_CONTEXT.md — gate-scanning handoff brief for Afterhours (added 18 Aug 2026, owner-requested)

Owner decision: Afterhours (the ticketing app) will take over ticketing
and gate scanning; guests will log in to Afterhours from the Sonic Pulse
website. The owner asked for a complete, accurate, up-to-date context
file so the session coding Afterhours has the full gate-scanning
picture: in/out tracking, gate-staff logins (or better alternatives),
and every feature already shipped on the web.

Executed directly by the planner (owner authorised "build the context
file yourself if token efficient"): **`GATE_CONTEXT.md`** created at the
repo root, sourced by reading the live implementation — `/gate`,
`/verify/[referenceCode]`, `QrScanner`, `/api/gate/scan`,
`/api/tickets` (+ transfer, admin), `gate-auth.ts`, `TicketCard`
(QR generation), `email.ts`, `data/tickets.ts`, `data/auth.ts`. The
brief records: the derived entry/exit presence model and its
server-side-enforcement gap, roles/allowlists, the `user_tickets` /
`ticket_scans` schema, reference-code + QR format, the staff and public
verify views, wristband policy, tier facts, Afterhours requirements
(parity + live occupancy + offline tolerance + staff accounts), open
owner decisions (auth unification, website-gate fallback), and known
bugs not to replicate (3:00 PM email, legacy `/api/register`).

No website code changed. Website behaviour is unaffected.

### 8.38 Wayfinder — Instagram handle becomes a mandatory field (added 19 Aug 2026, owner-requested)

Owner decision: the Wayfinder application's Instagram field, currently
optional ("Instagram / socials"), becomes **required**.

**Planner judgment calls, made now:**
- Label copy becomes **"Instagram handle"** (the owner's words; the
  "/ socials" catch-all drops because the field is now a hard
  requirement and must be one specific thing).
- The API strips a single leading `@` before storing, matching the
  ticket flow's convention (`replace(/^@/, '')`), so the DB holds bare
  handles regardless of how applicants type them.
- The DB column `wayfinder_applications.instagram_handle` **stays
  nullable** — historic applications were submitted without handles and
  a NOT NULL constraint would fail on them. Enforcement is
  application-level only. No migration.
- No new error copy: an empty handle trips the existing
  "All required fields must be filled in." response.

**Files: two code edits.**

1. **`src/components/wayfinder/WayfinderForm.tsx`** — the Instagram
   field block (currently `<label … htmlFor="wf-ig">Instagram /
   socials</label>` with a non-required input):
   - Label becomes exactly: `Instagram handle <Required />`
     (same `<Required />` marker component the other mandatory fields
     use).
   - Add the `required` attribute to the `wf-ig` input. Everything else
     about the block (id, style, placeholder `@yourhandle`, `set(
     'instagramHandle')`) is unchanged. Field position in the form is
     unchanged.
2. **`src/app/api/wayfinder/route.ts`**:
   - Parse line becomes:
     `const instagramHandle = (body.instagramHandle ?? '').trim().replace(/^@/, '')`
   - Add `!instagramHandle ||` to the big required-fields `if` (insert
     after `!emergencyContactPhone` — order inside the check is
     cosmetic; the response is the same either way).
   - In BOTH insert payloads (the main insert AND the gender-column
     fallback retry insert), `instagram_handle: instagramHandle || null`
     becomes `instagram_handle: instagramHandle`.

**Scope fences.** `src/app/admin/WayfinderTab.tsx` is untouched — it
already renders a null handle gracefully and strips `@` for display.
The `notes` optional field, the email template, the DB schema and every
other wayfinder validation rule are untouched.

**Reversibility.** Three-line revert (label, `required` attr, API
check); no data change.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100:
  - `curl -s http://localhost:3100/wayfinder | grep -c "Instagram handle"`
    → ≥1, and `grep -c "Instagram / socials"` → 0.
  - `curl -s -o /dev/null -w '%{http_code}' -X POST
    http://localhost:3100/api/wayfinder -H 'Content-Type:
    application/json' -d '{"fullName":"T","email":"t@t.co","phone":"0",
    "institution":"T","level":"other","gender":"female",
    "shiftPreference":"either","dateOfBirth":"2000-01-01",
    "emergencyContactName":"T","emergencyContactPhone":"0"}'`
    → **400** (missing handle rejected before any DB write).
  - Do NOT smoke-test the success path — it would insert a real row
    into the production `wayfinder_applications` table. The 400 path
    proves the enforcement; the insert-payload change is covered by
    tsc + code review of the diff.

### 8.39 Afterhours hand-off — SP ticket/sign-in surfaces point at the app (added 19 Aug 2026, owner-requested)

Owner decision: **Afterhours is the sign-up and ticketing platform for
festival-goers.** The SP website sends guests to the app and never shows
a price again. Source of truth: `AFTERHOURS_SIGNIN_HANDOFF.md` (repo
root — committed with this amendment; written by the Afterhours
canonical session 18 Aug 2026, owner-endorsed). Registration opens in
the app 19 Aug.

**Supersessions (explicit):**
- §8.9's "flip `TICKETS_LIVE` to true to bring them all back" is
  SUPERSEDED: `TICKETS_LIVE` stays **false permanently**. The internal
  ticket application never reopens (two ticketing paths = split-brain at
  the gate). The internal flow's code (dashboard, verify, gate, admin,
  APIs) is retained ONLY to serve tickets already issued through the
  website.
- The website-price-minus-৳1,000 app-discount scheme (`appPrice`,
  `APP_DISCOUNT`) is DEAD — owner-ratified 18 Aug. Those numbers are
  removed from the codebase, not just hidden.

**Locked link facts (use exactly; always `www.`):**
- Event page (ALL "Get tickets" CTAs):
  `https://www.onlyafterhours.com/events/sonicpulse-festival-26`
- Generic sign-in (only where tickets aren't the subject):
  `https://www.onlyafterhours.com/tonight?auth=1`
- App sign-in methods: Google, Apple, email magic link — passwordless.
  Never write "create an account with a password".
- No prices, no "from ৳X", no bKash number, anywhere on SP. Gate times:
  SP keeps saying gates 4:00 PM; do NOT add a doors time (the app shows
  doors 3:30 PM — the app is the source for it).

**Files — edits in build order:**

1. **`src/data/tickets.ts`**
   - Delete the `appPrice` field from the `TicketTier` type, its
     doc-comment line, and all three tier values. Delete
     `export const APP_DISCOUNT = 1000`. Keep `APP_NAME = 'Afterhours'`.
   - Below `TICKETS_LIVE` add (verbatim):
     ```ts
     /**
      * Afterhours hand-off (REDESIGN_PLAN §8.39). The app is the only
      * ticket + price surface. TICKETS_LIVE stays false permanently —
      * the internal application flow serves already-issued tickets only.
      * Flip AFTERHOURS_TICKETS_LIVE to false to pull the app CTAs.
      */
     export const AFTERHOURS_TICKETS_LIVE = true
     export const AFTERHOURS_EVENT_URL = 'https://www.onlyafterhours.com/events/sonicpulse-festival-26'
     export const AFTERHOURS_SIGNIN_URL = 'https://www.onlyafterhours.com/tonight?auth=1'
     export const TICKETS_CTA_LIVE = TICKETS_LIVE || AFTERHOURS_TICKETS_LIVE
     ```
     (`AFTERHOURS_SIGNIN_URL` is exported for future use even though no
     surface links it in this amendment — the handoff names it and a
     later amendment will want it findable in one place.)
2. **CTA gating swap — 4 files, mechanical.** In
   `src/components/home/Hero.tsx`, `src/components/layout/Navbar.tsx`,
   `src/components/layout/MobileMenu.tsx`,
   `src/components/layout/Footer.tsx`: change the import
   `TICKETS_LIVE` → `TICKETS_CTA_LIVE` (from `@/data/tickets`) and every
   `TICKETS_LIVE` condition in the file to `TICKETS_CTA_LIVE`. Labels
   ("Get tickets", "Tickets") and hrefs (`/tickets`) are UNCHANGED — the
   internal /tickets page is the click target and does the handing off.
3. **`src/app/(main)/tickets/page.tsx`** — replace the component body's
   logic with three branches in this order (imports adjust to match:
   add `AFTERHOURS_TICKETS_LIVE`, `AFTERHOURS_EVENT_URL`, and
   `AppPromoBand`; keep existing imports otherwise; metadata unchanged):
   - **If `AFTERHOURS_TICKETS_LIVE`** → return the hand-off page (no
     auth check, no redirect):
     - `PageHeader` with eyebrow `25 September 2026`, title
       `Tickets live in the Afterhours app`, sub
       `Sign up in the app, pick your tier, and your ticket is a QR pass in your wallet — verified once, scanned at the gate.`
     - CTA row (same flex row pattern as the current not-open branch):
       `<PillLink href={AFTERHOURS_EVENT_URL} variant="primary">Get tickets in the app →</PillLink>`
       and `<PillLink href="/lineup" variant="ghost">See the lineup</PillLink>`.
       Same tab — no `target`.
     - Info card, same style object as TicketsGate's "How it works" card
       (`background: 'var(--bg-elevated)', border: '1px solid
       var(--border)'`, rounded, text-left, `marginTop: 40`, maxWidth
       640), copy verbatim:
       `<strong>How it works: </strong>Sign in with Google, Apple, or an email magic link → pick your tier → pay by bKash inside the app → verify your ID before the gate. One ticket per person, and the name must match the ID you bring.`
     - Small print paragraph under the card (fontSize 12.5, color
       `var(--text-label-muted)`, marginTop 14), verbatim:
       `Your Sonic Pulse website account doesn't carry over — sign up fresh in the app (same email is fine). Trouble signing in or paying? support@onlyafterhours.com.`
     - `<AppPromoBand />` below, wrapped in a div with `marginTop: 56`.
   - **Else if `!TICKETS_LIVE`** → the existing "Tickets open soon"
     block, with its sub changed to exactly:
     `Ticket announcements land on @sonicpulsefestival first.`
     (the old "Prices and registration go live shortly" promised prices
     that will never appear).
   - **Else** → existing behaviour (signed-in redirect to /dashboard,
     `<TicketsGate />`).
4. **`src/components/ui/AppPromoBand.tsx`** — rewrite as a
   no-price app panel. Same layout/structure and styles; content
   changes only (verbatim):
   - Import change: `import { APP_NAME, AFTERHOURS_EVENT_URL } from
     '@/data/tickets'` and `import { PillLink } from './PillButton'`
     (drop `APP_DISCOUNT`, drop default `PillButton`).
   - Doc comment becomes: `/** Afterhours hand-off panel — the app is
     the only ticket surface. No prices here (§8.39). */`
   - h3: `Tickets live in the Afterhours app.`
   - p: `Sign up with <span style={{ color: 'var(--accent-magenta)', fontWeight: 600 }}>Google, Apple, or a magic link</span> — your ticket is a QR pass in the {APP_NAME} wallet. No PDFs, no printouts.`
   - Button: `<PillLink href={AFTERHOURS_EVENT_URL}>Get tickets in the app</PillLink>`
   - Phone mock: the tier row's two lines become
     `SonicPulse Festival` (line 1, unchanged style) and
     `Early Bird — on sale` (line 2, unchanged style). Everything else
     in the mock stays.
5. **`src/app/(main)/tickets/TicketsGate.tsx`** — delete the
   `৳{tier.appPrice.toLocaleString()} in the app` `<p>` block (3 lines)
   so the file compiles without `appPrice`. Nothing else — this branch
   is permanently dark behind `TICKETS_LIVE`.
6. **`src/components/home/TicketsTeaser.tsx`** — same: delete its
   `appPrice` `<p>` block. Nothing else.
7. **`src/data/faq.ts`** — four answer rewrites + one addition, copy
   verbatim:
   - NEW first entry in the `Tickets & Registration` category, before
     `why-nid`:
     `{ id: 'where-to-buy', category: 'Tickets & Registration', question: 'Where do I buy tickets?', answer: 'Tickets are sold only in the Afterhours app. Sign up with Google, Apple, or an email magic link, pick your tier, and pay by bKash inside the app. Tier announcements land on @sonicpulsefestival first.' },`
   - `ticket-transfer` answer →
     `Transfers happen inside the Afterhours app, and the new holder goes through the same ID verification. The name on the ticket must always match the ID presented at entry.`
   - `lost-ticket` answer →
     `Your ticket is a QR pass in the Afterhours app wallet — it can't be lost or forgotten at home. If you can't sign in to the app, email support@onlyafterhours.com.`
   - `door-sales` answer →
     `No. All tickets are bought in advance in the Afterhours app — ID verification takes time and cannot be done at the gate.`
   - `what-to-bring` answer →
     `The Afterhours app with your ticket QR ready, your original ID matching your registration, comfortable clothes, ear protection (optional but recommended), and your energy.`
8. **`GATE_CONTEXT.md`** (companion edit) — in §1, the first bullet's
   sentence about app pricing (`The website currently sells tickets
   in-app cheaper already: every tier has an ` + "`appPrice`" + ` =
   website price − ৳1,000 …`) is replaced with:
   `App tier names/prices are owned by Afterhours (Early Bird / Phase 2 / Final Phase); the old website-price-minus-৳1,000 scheme is dead and its fields were removed from the codebase (§8.39). SP shows no prices.`

**Scope fences.** `SIGNIN_LIVE`, `APPLE_SIGNIN_LIVE`,
`AFTERHOURS_SHARED_ACCOUNT_LIVE` and the whole `/login` page are
untouched (gate staff still sign in there). Dashboard, verify, gate,
admin, and all APIs untouched. `price` values in `ticketTiers` stay in
the data file (never rendered anywhere live). FAQ entries `why-nid`,
`nid-data-protection`, `refund-policy` and everything outside the five
listed are untouched. No email template changes. No gate-time changes
anywhere.

**Failure modes.** All content is static — no network calls, no new
failure states. If the owner flips `AFTERHOURS_TICKETS_LIVE` to false,
/tickets falls back to the "Tickets open soon" card and every app CTA
(nav, hero, footer, mobile menu) disappears with it.

**Reversibility.** `AFTERHOURS_TICKETS_LIVE = false` hides every new
surface; the `appPrice`/`APP_DISCOUNT` deletion is permanent
(owner-ratified — restoring it would need a new amendment).

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Source greps: `grep -rn "appPrice\|APP_DISCOUNT" src/` → no matches.
- Local dev on port 3100:
  - `/tickets` → `Tickets live in the Afterhours app` ≥1,
    `onlyafterhours.com/events/sonicpulse-festival-26` ≥1,
    `support@onlyafterhours.com` ≥1.
  - `/` (home) → `Get tickets` ≥1 (nav CTA is back), and `৳` **0**.
  - `/tickets` → `৳` **0**. `/faq` → `Afterhours` ≥3, `non-transferable`
    **0**.
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/tickets`.

### 8.40 Accounts, ticketing internals and gate ops flip OFF — carried by Afterhours (added 20 Aug 2026, owner-requested)

Owner decision: **no more account sign-ups on Sonic Pulse.** Accounts,
ticket functions and gate scanning are carried by Afterhours. The
website flips those surfaces off. Owner supplied the Afterhours logo —
pre-staged by the planner at
`public/images/brand/afterhours-logo.webp` (512×512 chip, glowing
"ah." wordmark on near-black; committed with this amendment).

**Supersessions (explicit):**
- §8.15's "flip `SIGNIN_LIVE` to true to restore" is SUPERSEDED:
  public sign-in never returns. `SIGNIN_LIVE` stays false permanently
  (its value is untouched by this amendment — only its meaning).
- GATE_CONTEXT.md §9's open question "does the website /gate stay as a
  fallback scanner" is ANSWERED: no — the website gate is retired
  (20 Aug 2026, this section). Afterhours is the only scanner.
- §8.13/8.14's Apple-provider work is moot; `APPLE_SIGNIN_LIVE` stays
  false, untouched.

**Planner judgment calls, made now:**
- **Hide, not delete.** Two new flags gate everything; flipping them
  true restores the surfaces. No code is deleted, no DB change.
- **`/login` SURVIVES** — it is the only way staff/admins sign in for
  `/admin` (First Pulse, Wayfinder, influencers — programs that remain
  website functions). Its public sign-in cards are already hidden by
  `SIGNIN_LIVE=false`. Its "Gate staff" labels are renamed to "Staff"
  (gate is gone; admins use that form) and post-login routing goes to
  `/admin` (the old routing sent staff to `/gate`, which now
  redirects home).
- **`/verify/<ref>` becomes a "Ticketing has moved" card** rather than
  a 404 — old website QR codes and reference-code emails exist in the
  wild; anyone scanning one gets pointed at Afterhours.
- Admin panel, its APIs, wayfinder, first-pulse, contact — all stay.
  Ticket APIs (`/api/tickets`, transfer, register) are left as-is:
  they are auth-gated (unreachable with guest accounts off) or already
  503-gated by `TICKETS_LIVE=false`.

**Files — edits in build order:**

1. **`src/data/auth.ts`** — append at the end (verbatim):
   ```ts
   /**
    * §8.40 (20 Aug 2026): guest accounts and gate ops moved to
    * Afterhours. GUEST_ACCOUNTS_LIVE gates /dashboard;
    * GATE_LIVE gates /gate, /verify and /api/gate/scan. Both flip
    * back to true to restore. /login remains for staff/admin ops.
    * SIGNIN_LIVE above stays false permanently (supersedes §8.15).
    */
   export const GUEST_ACCOUNTS_LIVE = false
   export const GATE_LIVE = false
   ```
2. **`src/app/dashboard/page.tsx`** — import `GUEST_ACCOUNTS_LIVE`
   from `@/data/auth`; first line of the component body:
   `if (!GUEST_ACCOUNTS_LIVE) redirect('/')` (before the getUser call).
3. **`src/app/gate/page.tsx`** — import `GATE_LIVE` from
   `@/data/auth`; first line of the component body:
   `if (!GATE_LIVE) redirect('/')`.
4. **`src/app/api/gate/scan/route.ts`** — import `GATE_LIVE` from
   `@/data/auth`; first lines of `POST`, before `getUser()`:
   ```ts
   if (!GATE_LIVE) {
     return NextResponse.json({ error: 'Gate scanning has moved to the Afterhours app.' }, { status: 410 })
   }
   ```
5. **`src/app/verify/[referenceCode]/page.tsx`** — add imports:
   `GATE_LIVE` from `@/data/auth`, `AFTERHOURS_EVENT_URL` from
   `@/data/tickets`, `Image` from `next/image`, `{ PillLink }` from
   `@/components/ui/PillButton`. First thing in the component body
   (before creating the admin client or any await):
   ```tsx
   if (!GATE_LIVE) {
     return (
       <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg-void)' }}>
         <div className="w-full max-w-sm text-center">
           <p className="mb-6" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.32em', fontFamily: 'var(--font-montserrat)', color: '#fff' }}>SONIC PULSE</p>
           <Image src="/images/brand/afterhours-logo.webp" alt="Afterhours" width={72} height={72} style={{ borderRadius: 16, margin: '0 auto 20px' }} />
           <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>Ticketing has moved</h1>
           <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tickets and entry for Sonic Pulse are handled in the Afterhours app. Your entry QR lives in the app wallet — this page is no longer used at the gate.</p>
           <PillLink href={AFTERHOURS_EVENT_URL} variant="primary" style={{ marginTop: 24 }}>Open Afterhours →</PillLink>
           <p className="text-xs mt-8" style={{ color: 'var(--text-muted)' }}>Sonic Pulse · 25 September 2026</p>
         </div>
       </main>
     )
   }
   ```
   Everything below it is unchanged.
6. **`src/app/login/LoginClient.tsx`** — four small changes:
   - Post-login routing line
     `window.location.href = gateEmails.includes(userEmail) ? '/gate' : '/dashboard'`
     becomes `window.location.href = '/admin'` (delete the now-unused
     `gateEmails`/`userEmail` lines above it if nothing else uses
     them — lint must stay at baseline, no new unused-var warnings).
   - Toggle text `'Gate staff login'` → `'Staff login'` (inside
     `{showGateLogin ? 'Hide' : 'Gate staff login'}`).
   - Heading `Gate staff access` → `Staff access`.
   - Button label `'Sign in as gate staff'` → `'Sign in'` (the
     loading state `'Signing in…'` stays).
   - Placeholder `gate@sonicpulsefestival.com` →
     `staff@sonicpulsefestival.com`.
7. **`src/components/ui/AppPromoBand.tsx`** — in the phone mock,
   replace the wordmark `<p …>{APP_NAME.toUpperCase()}</p>` with:
   `<Image src="/images/brand/afterhours-logo.webp" alt="Afterhours" width={44} height={44} style={{ borderRadius: 10, margin: '0 auto 12px', display: 'block' }} />`
   Add `import Image from 'next/image'` (NOT `<img>` — that would add
   a lint warning and break the 7/9 baseline). If `APP_NAME` is then
   unused in the file, remove it from the import.
8. **`GATE_CONTEXT.md`** — in §9, the bullet asking "**Does the
   website `/gate` stay as a fallback scanner**…" gets appended (same
   bullet, after "would be worse than either alone.)"):
   ` ANSWERED 20 Aug 2026 (§8.40): retired — the website's /gate,
   /verify and scan API are flag-gated off; Afterhours is the only
   scanner.`

**Scope fences.** `/admin` + all `/api/admin/*` untouched.
`/api/tickets`, `/api/tickets/transfer`, `/api/register`,
`/auth/callback` untouched. `SIGNIN_LIVE`, `APPLE_SIGNIN_LIVE`,
`AFTERHOURS_SHARED_ACCOUNT_LIVE` values untouched. §8.39's /tickets
hand-off page, nav CTAs, FAQ untouched (AppPromoBand's logo swap is
the only §8.39 surface touched). No DB changes, no email changes, no
gate-time changes.

**Failure modes.** All static: redirects and a 410. Old QR scans land
on the moved-card (200). If the logo file were missing the Image
simply 404s in the browser — but it is committed with this amendment,
so it cannot be.

**Reversibility.** `GUEST_ACCOUNTS_LIVE = true` restores /dashboard;
`GATE_LIVE = true` restores /gate, /verify and the scan API. Login
relabel and logo swap are cosmetic one-line reverts.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100 (`curl -s -o /dev/null -w '%{http_code}'`
  unless noted):
  - `/dashboard` → 307. `/gate` → 307. `/login` → 200.
  - `POST /api/gate/scan` with `-H 'Content-Type: application/json'
    -d '{"ticketId":"x","scanType":"entry"}'` → **410**.
  - `/verify/SP-TESTCODE` → 200; page grep: `Ticketing has moved` ≥1,
    `Identity Check` **0**, `afterhours-logo.webp` ≥1.
  - `/images/brand/afterhours-logo.webp` → 200.
  - `/tickets` → grep `afterhours-logo.webp` ≥1 (AppPromoBand logo).
  - `/login` page grep: `Staff login` ≥1, `Gate staff` **0**.
  - `/` → `Get tickets` ≥1 (§8.39 regression: nav CTA still present).
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/verify/SP-TESTCODE` and
  `/tickets`.

### 8.41 Correction: initial Afterhours registration is on the website, not "the app" (added 20 Aug 2026, owner-requested)

Owner correction: **the Afterhours mobile app is not out yet — it's
coming soon.** Initial guest registration happens on the Afterhours
**website**, `onlyafterhours.com` (the same domain §8.39's links
already point to). §8.39 and §8.40's copy wrote "the Afterhours app"
throughout as if the app already existed and handled sign-up — that
framing is SUPERSEDED on this narrow point everywhere it appears
(the URLs, flags and page/route structure those sections built are
correct and untouched; only prose claiming guests act "in the app"
today is wrong). `AFTERHOURS_SIGNIN_HANDOFF.md` (§8.39's source
document) is left as-is — a historical record — but its "the app"
framing is superseded the same way.

**Planner judgment calls, made now:**
- Every place that claimed a current-tense app action ("in the app",
  "inside the app", "app wallet") is rewritten to name the website
  directly (`onlyafterhours.com`) or the brand generically
  (`Afterhours`, matching the existing `{APP_NAME}` usage pattern).
- Exactly two places get a brief, clearly future-tense mention that
  the app is coming — the `/tickets` hand-off page (the most-seen
  surface) and the FAQ's `where-to-buy` answer. No other surface
  repeats this to avoid clutter.
- No behavioural/code change: no flags added or renamed, no routes
  added, no gating logic touched. This is a copy-only correction — six
  files, string literals and JSX text only.
- The `AFTERHOURS_EVENT_URL` / `AFTERHOURS_SIGNIN_URL` constant names
  and values are untouched — they already point at the website
  (`www.onlyafterhours.com`), which is exactly right for "initial
  registration is on the website."

**Files — edits in build order (old → new, verbatim):**

1. **`src/data/tickets.ts`** — the doc comment above
   `AFTERHOURS_TICKETS_LIVE` (added in §8.39):
   - Old:
     ```
     /**
      * Afterhours hand-off (REDESIGN_PLAN §8.39). The app is the only
      * ticket + price surface. TICKETS_LIVE stays false permanently —
      * the internal application flow serves already-issued tickets only.
      * Flip AFTERHOURS_TICKETS_LIVE to false to pull the app CTAs.
      */
     ```
   - New:
     ```
     /**
      * Afterhours hand-off (REDESIGN_PLAN §8.39, updated §8.41). Afterhours
      * is the only ticket + price surface. Initial registration is on the
      * Afterhours website (onlyafterhours.com) — the Afterhours app is
      * coming later. TICKETS_LIVE stays false permanently — the internal
      * application flow serves already-issued tickets only. Flip
      * AFTERHOURS_TICKETS_LIVE to false to pull the Afterhours CTAs.
      */
     ```
2. **`src/app/(main)/tickets/page.tsx`** — the `AFTERHOURS_TICKETS_LIVE`
   branch, four string changes:
   - `title="Tickets live in the Afterhours app"` →
     `title="Register for tickets on Afterhours"`
   - `sub="Sign up in the app, pick your tier, and your ticket is a QR pass in your wallet — verified once, scanned at the gate."`
     → `sub="Sign up at onlyafterhours.com, pick your tier, and hold your ticket there — the Afterhours app is on the way."`
   - `<PillLink href={AFTERHOURS_EVENT_URL} variant="primary">Get tickets in the app →</PillLink>`
     → `<PillLink href={AFTERHOURS_EVENT_URL} variant="primary">Register on Afterhours →</PillLink>`
   - Info card body `Sign in with Google, Apple, or an email magic link → pick your tier → pay by bKash inside the app → verify your ID before the gate. One ticket per person, and the name must match the ID you bring.`
     → `Sign in with Google, Apple, or an email magic link at onlyafterhours.com → pick your tier → pay by bKash → verify your ID before the gate. One ticket per person, and the name must match the ID you bring.`
   - Small print `Your Sonic Pulse website account doesn&apos;t carry over — sign up fresh in the app (same email is fine). Trouble signing in or paying? support@onlyafterhours.com.`
     → `Your Sonic Pulse website account doesn&apos;t carry over — sign up fresh at onlyafterhours.com (same email is fine). Trouble signing in or paying? support@onlyafterhours.com.`
3. **`src/components/ui/AppPromoBand.tsx`**:
   - Doc comment `/** Afterhours hand-off panel — the app is the only ticket surface. No prices here (§8.39). */`
     → `/** Afterhours hand-off panel — registration is on the Afterhours website for now; the app is coming later. No prices here (§8.39, §8.41). */`
   - `Tickets live in the Afterhours app.` → `Tickets are open on Afterhours.`
   - `Sign up with <span style={{ color: 'var(--accent-magenta)', fontWeight: 600 }}>Google, Apple, or a magic link</span> — your ticket is a QR pass in the {APP_NAME} wallet. No PDFs, no printouts.`
     → `Sign up with <span style={{ color: 'var(--accent-magenta)', fontWeight: 600 }}>Google, Apple, or a magic link</span> at onlyafterhours.com — your ticket stays on your {APP_NAME} account, ready to show at the gate.`
   - `<PillLink href={AFTERHOURS_EVENT_URL}>Get tickets in the app</PillLink>`
     → `<PillLink href={AFTERHOURS_EVENT_URL}>Register on Afterhours</PillLink>`
   - The phone-mock visual, logo, and the `SonicPulse Festival` /
     `Early Bird — on sale` mock rows are UNCHANGED.
4. **`src/app/verify/[referenceCode]/page.tsx`** — the `!GATE_LIVE`
   moved-card (added in §8.40):
   - `Tickets and entry for Sonic Pulse are handled in the Afterhours app. Your entry QR lives in the app wallet — this page is no longer used at the gate.`
     → `Tickets and entry for Sonic Pulse are handled by Afterhours. Register and manage your ticket at onlyafterhours.com — this page is no longer used at the gate.`
   - `<PillLink href={AFTERHOURS_EVENT_URL} variant="primary" style={{ marginTop: 24 }}>Open Afterhours →</PillLink>`
     → `<PillLink href={AFTERHOURS_EVENT_URL} variant="primary" style={{ marginTop: 24 }}>Go to Afterhours →</PillLink>`
5. **`src/app/api/gate/scan/route.ts`** — the `!GATE_LIVE` 410 body
   (added in §8.40):
   - `{ error: 'Gate scanning has moved to the Afterhours app.' }`
     → `{ error: 'Gate scanning has moved to Afterhours.' }`
6. **`src/data/faq.ts`** — five answers (four from §8.39, one —
   `where-to-buy` — also from §8.39):
   - `where-to-buy` answer, old:
     `'Tickets are sold only in the Afterhours app. Sign up with Google, Apple, or an email magic link, pick your tier, and pay by bKash inside the app. Tier announcements land on @sonicpulsefestival first.'`
     new:
     `'Tickets are sold only through Afterhours at onlyafterhours.com. Sign up with Google, Apple, or an email magic link, pick your tier, and pay by bKash on the site — the Afterhours app is coming soon. Tier announcements land on @sonicpulsefestival first.'`
   - `ticket-transfer` answer, old:
     `'Transfers happen inside the Afterhours app, and the new holder goes through the same ID verification. The name on the ticket must always match the ID presented at entry.'`
     new:
     `'Transfers happen through Afterhours, and the new holder goes through the same ID verification. The name on the ticket must always match the ID presented at entry.'`
   - `lost-ticket` answer, old:
     `'Your ticket is a QR pass in the Afterhours app wallet — it can\'t be lost or forgotten at home. If you can\'t sign in to the app, email support@onlyafterhours.com.'`
     new:
     `'Your ticket lives in your Afterhours account, so it can\'t be lost or forgotten at home. If you can\'t sign in, email support@onlyafterhours.com.'`
   - `door-sales` answer, old:
     `'No. All tickets are bought in advance in the Afterhours app — ID verification takes time and cannot be done at the gate.'`
     new:
     `'No. All tickets are bought in advance through Afterhours — ID verification takes time and cannot be done at the gate.'`
   - `what-to-bring` answer, old:
     `'The Afterhours app with your ticket QR ready, your original ID matching your registration, comfortable clothes, ear protection (optional but recommended), and your energy.'`
     new:
     `'Your ticket QR ready in your Afterhours account, your original ID matching your registration, comfortable clothes, ear protection (optional but recommended), and your energy.'`

**Scope fences.** No flags added, renamed, or flipped — `TICKETS_LIVE`,
`AFTERHOURS_TICKETS_LIVE`, `GATE_LIVE`, `GUEST_ACCOUNTS_LIVE` and every
value from §8.39/§8.40 are untouched. No routing/redirect logic
touched. `AFTERHOURS_EVENT_URL`, `AFTERHOURS_SIGNIN_URL`,
`AFTERHOURS_SHARED_ACCOUNT_LIVE` untouched. `GATE_CONTEXT.md` and
`AFTERHOURS_SIGNIN_HANDOFF.md` untouched (the former's "app" language
describes the future gate-scanning build for whoever builds it into
Afterhours, a different concern from guest registration; the latter is
a historical handoff record — its supersession is recorded here, not
by editing it). The `public/images/brand/afterhours-logo.webp` asset
and its two usages (moved-card, AppPromoBand) are untouched — the logo
is a brand mark, not an app-existence claim.

**Reversibility.** Six string-literal edits; revert verbatim from this
section if the app ships ahead of schedule and copy needs to flip back
to app-first framing (a future amendment, not this one).

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Source greps (old copy fully gone):
  `grep -rn "app wallet\|inside the app\|in the app\|Get tickets in the app\|Tickets live in the Afterhours app\|Open Afterhours" src/`
  → 0 matches.
- Local dev on port 3100:
  - `/tickets` → grep `onlyafterhours.com` ≥3, `Register on Afterhours`
    ≥1, `Afterhours app is on the way` ≥1.
  - `/verify/SP-TESTCODE` → grep `Go to Afterhours` ≥1,
    `onlyafterhours.com` ≥1.
  - `/faq` → grep `Afterhours app is coming soon` ≥1, `app wallet` **0**.
  - `POST /api/gate/scan` (`-d '{"ticketId":"x","scanType":"entry"}'`)
    → body contains `"Gate scanning has moved to Afterhours."` exactly
    (no "the ... app" wording).
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/tickets` and
  `/verify/SP-TESTCODE`.

### 8.42 Wayfinder — Instagram follow-back verification step (added 20 Aug 2026, owner-requested)

Owner decision: Wayfinder applicants must **follow @dhakamusicfestival
and accept the follow request it sends back**, so the team can verify
applicants through Instagram (private accounts included). Builds on
§8.38 (Instagram handle is already mandatory).

**Planner judgment calls, made now:**
- The instruction appears in THREE places, verbatim-identical wording
  so applicants see one consistent rule: under the form's Instagram
  handle field, on the post-submit success card, and in the
  confirmation email. Nowhere else (the page intro stays minimal).
- Wording is imperative and explains why: "Follow @dhakamusicfestival
  and accept the follow request it sends back — that's how we verify
  applicants." ("it sends back" because the page sends the request to
  the applicant, matching the owner's "accept its follow request".)
- No validation/enforcement change — the site cannot check Instagram
  follows; this is instruction copy only. No schema, flag, or API
  behaviour change.

**Files — three edits.**

1. **`src/components/wayfinder/WayfinderForm.tsx`** — in the Instagram
   handle field block (id `wf-ig`), directly AFTER the `<input …>` line
   and inside the same `<div>`, add:
   ```tsx
   <p style={{ fontSize: 12, color: 'var(--text-label-muted)', marginTop: 6, lineHeight: 1.5 }}>
     Follow @dhakamusicfestival and accept the follow request it sends back — that&apos;s how we verify applicants.
   </p>
   ```
2. **Same file, the `status === 'success'` card** — after the
   "We&apos;ll confirm your shift and briefing details closer to the
   event." `<p>` and before the "Reference code" label `<p>`, add:
   ```tsx
   <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 20 }}>
     One step now: follow <strong style={{ color: '#fff' }}>@dhakamusicfestival</strong> and accept the follow request it sends back — that&apos;s how we verify applicants.
   </p>
   ```
3. **`src/app/api/wayfinder/route.ts`** — in the confirmation email
   HTML, directly after the `<p>` ending "…guiding guests across the
   grounds from gates to sunrise.</p>" add:
   ```html
   <p style="margin:0 0 16px;">One step now: follow <strong>@dhakamusicfestival</strong> on Instagram and accept the follow request we send back — that's how we verify applicants.</p>
   ```

**Scope fences.** No changes to validation, required fields, the DB,
the admin tab, or any other wayfinder copy. §8.38's rules stand. The
`/wayfinder` page intro (`PageHeader`) is untouched.

**Reversibility.** Three copy blocks; delete to revert.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100: `/wayfinder` → grep
  `accept the follow request` ≥1 and `@dhakamusicfestival` ≥1.
- Source grep: `grep -c "accept the follow request" src/components/wayfinder/WayfinderForm.tsx` → 2;
  `grep -c "accept the follow request" src/app/api/wayfinder/route.ts` → 1.
- Do NOT smoke-test the submit path (writes a real production row —
  §8.38's rule applies); the success-card and email copy are covered by
  the source greps + diff review.
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/wayfinder`.

### 8.43 Main-branch merge + workflow change: push to main (added 20 Aug 2026, owner-decided)

Executed directly by the planner (owner authorised "do it urself if
it's token efficient"):

- **Merged** `claude/event-website-updates-1e8rib` into `main`
  (fast-forward, `b337fcb` → `8959ede`) and pushed. Everything from
  §8.35 through §8.42 — Portal of Light rename, mandatory Instagram
  handle, the full Afterhours ticket hand-off, accounts/gate flip-offs,
  website-not-app copy, follow-back verification — is now on `main`
  and deploys to production.
- **Workflow change, standing rule:** from 20 Aug 2026, all changes
  are pushed to `main` directly unless the owner asks for them to be
  parked in a branch. The `claude/event-website-updates-1e8rib` branch
  is retained as history but is no longer the working branch.
- **Venue stays TBA on the site.** The Afterhours event page briefly
  showed "Hatirjheel Amphitheatre"; the owner's decision is that
  Afterhours will change it back to TBA. The SP website's "Venue is
  TBA — full address will be sent to registered attendees" copy is
  CORRECT and must not be "fixed" to name the venue. Naming the venue
  publicly is an owner decision for a future amendment.

### 8.44 Partner-announcement visuals, round 4 — three ALL-NEW samples, Sonnet-executed (added 20 Aug 2026, owner-requested)

Owner decision: the next sample set uses **no existing art** — not
`hero-visual.jpg`, not any previously generated plate. Three absolutely
new visuals. The planner makes every creative call below; a Sonnet
executor runs the pipeline mechanically. The two standing owner notes
carry over: (1) the top lockup from sample P4 (eyebrow + SONIC PULSE ×
afterhours), (2) the serif declaration reading **"registration, live."**

**Session dependency (hard).** This section runs in the SAME session
that produced rounds 1–3 (owner switches model, context persists). It
depends on these existing files in
`/tmp/claude-0/-home-user-sonicpulse/38675d22-8609-5e00-8371-e3609f99025a/scratchpad/ah-posts/`
(called `$AH` below): `s3.html` (the proven lockup+declaration tile
template), `fonts-inline.css`, `render4.js`. If ANY is missing, STOP
and tell the owner — do not rebuild them by improvisation.

**Brand guardrails (unchanged law, from AFTERHOURS_SIGNIN_HANDOFF.md +
the 21 Aug brand doc, as applied in rounds 1–3):** no prices; no venue
name or depiction; no App Store / Google Play badges; CTA is
"tickets in the afterhours app — www.onlyafterhours.com"; PEGI-3-clean
imagery (no alcohol, drugs, smoking); "afterhours" always lowercase
Marcellus bone — never magenta; magenta only on SP-side elements; no
exclamation marks; one dominant glow per canvas; never AI-generate
Afterhours app UI; doors 3:30 PM is the only time stated.

**The three concepts (locked — executor invents nothing):**
- **N1 · GLOWTIDE** — an avenue of softly glowing jellyfish lanterns
  floating above a dark walkway, sparse crowd silhouettes beneath
  (SonicPulse's Echo II made photographic; brand-true, art-new).
- **N2 · THE DOOR** — a single free-standing doorway of pale light in
  an empty dark field, a few small silhouettes walking toward it (the
  registration metaphor: the night has one way in).
- **N3 · THE DOT** — one small glowing orb hovering above a dark crowd
  at a night show (the afterhours starlight dot made physical, over an
  SP crowd — the partnership in one image).

**Step 1 — generate (batch of 3, then targeted retries).** Tool:
`mcp__Higgsfield__generate_image_batch`, model `nano_banana_pro`,
`aspect_ratio: "1:1"`, one request per concept, prompts VERBATIM:

- N1: `Cinematic night photograph, square, full-bleed with no border or frame. A long straight walkway at night lined overhead with dozens of softly glowing translucent jellyfish-shaped paper lanterns floating in two loose rows, drifting away toward a dark horizon. Beneath them, sparse small crowd silhouettes strolling, seen from behind. Deep blue-black night (#050508 base) with a gentle magenta-and-cyan tint in the lantern glow and haze. The lantern avenue is the single dominant light source; sky above is dark with sparse faint stars. Subtle 35mm film grain, matte, cinematic restraint. Upper quarter and lower fifth of frame stay dark for typography. No text, no logos, no watermark, no readable faces, no drinks, no smoking.`
- N2: `Cinematic night photograph, square, full-bleed with no border or frame. A vast empty dark field at night under a near-black deep blue starry sky (#050508 base). In the middle distance stands a single free-standing rectangular doorway made of soft pale white-violet light — an open glowing door frame with nothing around it, its light spilling gently onto the grass. Three or four small human silhouettes walk toward it from different directions, seen from far behind. The doorway is the only light source. Subtle magenta tint in its halo. Subtle 35mm film grain, matte, cinematic restraint. Upper third of frame is dark empty sky for typography. No text, no logos, no watermark, no readable faces, no drinks, no smoking.`
- N3: `Cinematic night photograph, square, full-bleed with no border or frame. A dark festival crowd seen from behind in the lower quarter of frame, lit only faintly. Hovering in the dark air above their heads, dead center: one single small glowing orb of warm white light, like a bright star come down low, casting a soft halo into thin haze. Nothing else emits light — no stage, no beams, no phone screens. Deep blue-black night sky (#050508 base) with sparse faint stars. Subtle 35mm film grain, matte, cinematic restraint. Top quarter and bottom fifth stay very dark for typography. No text, no logos, no watermark, no readable faces, no drinks, no smoking.`

Poll with `mcp__Higgsfield__jobs_wait` until terminal; download each
`result_url` with curl into `$AH` as `bg-n1.png`, `bg-n2.png`,
`bg-n3.png`.

**Step 2 — QC each plate** (Read the image, judge against ALL of):
(a) zero legible text/letters/logos; (b) no border, frame, or white
edge band; (c) no readable faces (silhouettes fine); (d) no bottles,
drinks, smoke; (e) ONE dominant light source; (f) the top ~25% and
bottom ~20% are dark enough that bone text will read after the scrims
below. A plate failing any point → regenerate ONCE with the identical
prompt and re-QC. If the retry also fails, drop that concept from the
delivery and report which concept failed and on which checklist point —
do NOT write a new prompt. Budget cap: 6 generations total.

**Step 3 — build tiles.** In `$AH`, run this python VERBATIM (it
derives each tile from `s3.html` exactly as rounds 2–3 did):
```python
import base64
def b64(p): return base64.b64encode(open(p,'rb').read()).decode()
s3 = open('s3.html').read()
SCRIM_FULL = '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,8,.82) 0%,rgba(5,5,8,.55) 22%,transparent 40%,transparent 55%,rgba(5,5,8,.6) 78%,rgba(5,5,8,.88) 100%)"></div>'
SCRIM_TOP  = '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,8,.8) 0%,rgba(5,5,8,.45) 26%,transparent 44%,transparent 62%,rgba(5,5,8,.55) 82%,rgba(5,5,8,.85) 100%)"></div>'
ANCHOR = '<div class="eyebrow" style="position:absolute;top:88px'
for name, bg, scrim, decl in [
    ('n1','bg-n1.png',SCRIM_FULL,'top:600px;font-size:88px'),
    ('n2','bg-n2.png',SCRIM_TOP, 'top:470px;font-size:96px'),
    ('n3','bg-n3.png',SCRIM_FULL,'top:640px;font-size:92px'),
]:
    t = s3.replace(b64('bg-crowd-sq.png'), b64(bg))
    t = t.replace(ANCHOR, scrim + ANCHOR)
    t = t.replace('top:560px;font-size:88px', decl)
    open(f'{name}.html','w').write(t)
print('n1 n2 n3 built')
```
(If a concept was dropped in Step 2, omit its tuple.)

**Step 4 — render + finalize.** From `$AH`:
`NODE_PATH=$(npm root -g) node render4.js n1 n2 n3` (only surviving
tiles), then downscale each `out-<n>@2x.png` to
`final-<n>-1080x1080.png` with PIL LANCZOS exactly as rounds 2–3.

**Step 5 — proof + deliver.** Read each final and verify: the strings
`OFFICIAL TICKETING PARTNER`, `SONIC PULSE`, `afterhours`,
`registration, live.`, `FRI 25 SEPT`, `DOORS 3:30 PM`,
`www.onlyafterhours.com` all render exactly and legibly (no clipping,
no overlap with a bright area); the plate shows no rule violations
missed in Step 2. Then send the finals with SendUserFile,
`status: "normal"`, `display: "render"`, caption VERBATIM:
`Round 4 — three all-new visuals (Glowtide, the Door, the Dot). Nothing existing reused; awaiting your pick.`
Nothing is posted anywhere; no repo changes — `git status` must show a
clean tree at the end.

**Scope fences.** Do not touch the website code, the design canvas
artifact, or rounds 1–3 files beyond reading `s3.html`/`bg-crowd-sq.png`
as template inputs. Do not reuse `hero-visual.jpg`, any `bg-*` plate
from earlier rounds, or the app screenshots, as visible imagery.

**Reversibility.** Nothing persists outside the scratchpad; re-running
overwrites `bg-n*.png` and `final-n*.png`.

**Executor invocation (owner).** Switch to Sonnet and prompt:
"execute §8.44 of REDESIGN_PLAN.md".

### 8.45 Partner visuals round 5 — two more posts, planner-executed (added 20 Aug 2026, owner-requested)

Owner asked for two more posts and authorised the planner to run it
directly if that beat a plan+handoff on tokens — it did, so this is a
record, not a forward spec. Same §8.44 pipeline and guardrails, same
locked lockup + "registration, live." declaration, all-new imagery.

Two new concepts: **N4 · THE FERRY** (one circuit-lit boat on black
water — Styx) and **N5 · THE KITE** (a giant lit kite in a dark sky —
Icarus).

Outcome: **N4 delivered** (`final-n4-1080x1080.png`, passed QC first
generation). **N5 not delivered** — its first generation hit the same
pure-white letterbox border defect §8.44 saw on N3; the identical-prompt
retry was still generating when the Higgsfield MCP server disconnected
and moved to a re-authorization-required state. The retry job id is
`6616ff56-a9d5-4410-8cd8-ed56821a69ab`.

To finish N5 later: the owner re-authorizes Higgsfield (claude.ai
connector settings, or `claude mcp` / `/mcp` in an interactive
session), then a session polls that job id (or regenerates with the
§8.44-style kite prompt), corner-checks for the white border, and
builds the tile from `s3.html` with SCRIM_FULL and declaration
`top:470px;font-size:92px`.

Note for future rounds: the white-border defect has now appeared on 3
of 7 nano_banana_pro plates. Corner-pixel checking before QC is
cheap and should stay in every visual pipeline.

### 8.46 Partner visuals — N6 · COILGATE, prompt locked, awaiting Higgsfield (added 20 Aug 2026, owner-requested)

Owner asked for one more visual based on the COILGATE installation
(Echo I, `src/data/echoes.ts`: entrance arch, a coiled serpent guests
walk through, ember-lit scales, teal glass eye — "the first thing every
guest sees"). Conceptually the strongest fit yet for this campaign: the
gate you walk through, under "registration, live."

**Blocked, not abandoned.** The Higgsfield MCP server is disconnected
and requires re-authorization (same block as §8.45's N5 kite), so no
generation was attempted. Prompt is locked below so the next session
runs one call and composites.

**Locked prompt (verbatim, `nano_banana_pro`, `aspect_ratio: "1:1"`):**
`Cinematic night photograph, square, full-bleed with no border or frame. A monumental archway at a night festival entrance, built as an enormous coiled serpent curving up and over the path to form a gate people walk through. Its overlapping scales glow softly from within with warm ember-orange light — the single dominant light source in the scene — and set into its head is one small dark teal glass eye catching a faint highlight. A few small silhouetted figures walk beneath the arch from behind, dwarfed by it. Deep blue-black night sky (#050508 base) with sparse faint stars beyond the arch. Thin haze, subtle 35mm film grain, matte, cinematic restraint. Top fifth and bottom fifth of frame stay very dark for typography. No text, no logos, no watermark, no readable faces, no drinks, no smoking.`

**Guardrail note.** The installation's ember scales AND teal eye risk
breaking the one-glow law, so the prompt makes the scales dominant and
demotes the eye to a non-emitting highlight. Corner-pixel border check
before QC as always (§8.45: defect on 3 of 7 plates).

**Tile build when the plate passes QC:** from `s3.html` with
SCRIM_FULL and declaration `top:470px;font-size:92px`; render via
`render4.js n6`; downscale to `final-n6-1080x1080.png`.

### 8.47 Partner visuals — N7 · THE SIGNAL, owner-generated plate composited (added 20 Aug 2026, owner-requested)

New concept locked and shipped: **N7 · THE SIGNAL** — the founding
myth itself, a single streak of light falling into the wetlands (the
prompt was given to the owner in-chat; the owner generated the plate
in Higgsfield directly since the MCP connector was down, and uploaded
it back). Planner-executed composite per the §8.45 precedent: corner
check passed (no border defect), plate upscaled 1024→2048 LANCZOS,
tile built from `s3.html` with SCRIM_FULL and declaration
`top:690px;font-size:88px` (the dark field band between the impact
bloom and the water), rendered and delivered as
`final-n7-1080x1080.png`.

Process note now proven twice: when the Higgsfield MCP is down, the
locked-prompt-to-owner hand-off (§8.46 pattern) works — the owner
generates in the Higgsfield UI and uploads the plate; QC and composite
happen here. N5 (Kite) and N6 (Coilgate) both remain available via
their locked prompts whenever wanted.

### 8.48 Partner visuals — N8 · THE WALK-IN, feed-native neon composite (added 20 Aug 2026, owner-requested)

Owner supplied the SP Instagram grid as reference; the visual read
(saturated magenta + cyan on deep violet-blue, dense haze, laser fans,
UV-rimmed crowd silhouettes, hyper-real concept-render finish rather
than the film-restraint look of N1–N7) drove a new prompt handed to the
owner in-chat. Owner generated in the Higgsfield UI and uploaded;
composited here per the §8.47 pattern.

**N8 · THE WALK-IN** — first-person view down a neon-lined entrance
path, crowd walking in, laser fan at the vanishing point.

Composite notes: corner check passed; plate upscaled 1024→2048;
declaration placement chosen by measuring a row-band luminance profile
rather than by eye — bands 0–300 (mean 8–35) carry the lockup, the
420–540 laser convergence peaks at mean 110 and is avoided entirely,
and the declaration sits at `top:790px;font-size:84px` over the dark
foreground asphalt (mean 24→18), clear of the diverging neon lines.
Delivered as `final-n8-1080x1080.png`.

Reusable technique: for busy plates, profile row luminance in 60px
bands before choosing type placement — cheaper and more reliable than
render-and-eyeball iterations.

### 8.49 Partner-post CTA change — sonicpulsefestival.com/tickets (added 20 Aug 2026, owner-decided)

Owner decision on the N8 composite, applied to ALL future SP-side
partner posts: the footer CTA is now
**`register at  sonicpulsefestival.com/tickets`** (owner picked variant
B over a literal link swap that would have left the stale "tickets in
the afterhours app" wording).

This SUPERSEDES, for SP-side social creative only, the CTA line named
in `AFTERHOURS_SIGNIN_HANDOFF.md` / the Afterhours brand doc
("tickets in the afterhours app — www.onlyafterhours.com"). Rationale:
SP's own `/tickets` page is the §8.39 hand-off surface and already
routes to the Afterhours event page, so pointing at it keeps traffic on
SP first; and "register at" is consistent with §8.41 (the Afterhours
app is not out yet — registration happens on the web). The Afterhours
website remains the destination one click later; nothing about the
partnership framing changes. Afterhours' own channels are unaffected.

Approved artwork: `final-n8b-1080x1080.png` (N8 · The Walk-In).

### 8.50 Partner visuals — N9 · LOOK UP, reel cut 1080×1920 (added 20 Aug 2026, owner-requested)

Owner-approved reel creative. Concept **N9 · LOOK UP** — low camera
inside the crowd tilted skyward, laser fan spreading from the crowd
line to the top corners. First vertical attempt (a 9:16 restatement of
N8's walk-in path) was rejected by the owner; the replacement concept
is vertical-native (ground-to-sky) rather than a re-crop, which is the
lesson to carry into future 9:16 work.

Composite: owner-generated plate (Higgsfield UI, 768×1376) upscaled to
2160×3840; corner check passed. Row-luminance profiling put the only
usable dark zones at the top (mean 10–30) and the bottom crowd band
(mean 8–2), with y480–1440 laser-bright (mean 45–88), so ALL type sits
in one upper block: lockup 250–500, declaration 620, micro 790, CTA
838. This doubles as reel-UI safety — the caption/audio rail and action
buttons overlay the lower crowd, which carries no type.

Built from a purpose-made 1080×1920 template (`n9.html`, `render5.js`)
rather than the square `s3.html`; type scaled up for phone viewing
(declaration 104px, lockup 52/76px). Footer uses the §8.49 CTA.
Delivered as `final-n9-reel-1080x1920.png`.

### 8.51 Lineup — Fly on the Wall poster supplied (added 22 Aug 2026, owner-requested)

Owner supplied the Fly on the Wall artist poster, replacing the
placeholder state set when the act was added. Asset is **pre-staged by
the planner** and committed with this amendment at
`public/images/artists/fly-on-the-wall-poster.webp` — 1200×1489 WEBP,
q82, ~107 KB, matching the other artist posters exactly in dimensions
and weight (peers 93–129 KB). Source was 3291×4096 (ratio 0.803 vs the
poster ratio 0.806); centre-cropped 12 px of height, so the SONIC PULSE
wordmark and the FLYONTHEWALL name are both fully intact.

**Planner judgment calls, made now:**
- **`placeholder: true` STAYS.** The act is still incomplete — no bio
  copy, no `bioCard`. The flag is declared on the `Act` type but
  consumed by no component (`ArtistSlider` branches on `act.poster`,
  and the bio card renders behind `act.bioCard &&`), so it changes no
  output; it remains an accurate data marker until the bio lands.
- **`bioCard` stays `null`.** The slider renders that block
  conditionally, so there is no broken or empty state.
- **The bio placeholder line is reworded, not filled in.** Leaving
  "Poster and bio pending" while a poster renders is a visible
  contradiction on `/lineup`. The executor does NOT write artist bio
  copy — that is owner content.

**File — one edit.** `src/data/lineup.ts`, the `fly-on-the-wall` entry:
- `poster: null,` → `poster: '/images/artists/fly-on-the-wall-poster.webp',`
- `bio: 'Poster and bio pending — the owner will supply these assets closer to the event.',`
  → `bio: 'Bio pending — the owner will supply this closer to the event.',`
- `time`, `tag`, `hook`, `bioCard: null` and `placeholder: true` are
  UNCHANGED.

**Scope fences.** No other act is touched. The timetable array lower in
the same file (the `7:00 – 8:30 PM` row) is untouched — it carries no
image. `ArtistSlider` and the `/lineup` page are untouched; the poster
renders through the existing `act.poster` branch. No other asset is
added or deleted.

**Reversibility.** Restore `poster: null` and the original bio string;
delete the webp.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100:
  - `/lineup` → grep `fly-on-the-wall-poster.webp` ≥1, and
    `Poster and bio pending` **0**.
  - `curl -o /dev/null -w '%{http_code}'`
    `/images/artists/fly-on-the-wall-poster.webp` → **200**.
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/lineup`.

### 8.52 Lineup — Fly on the Wall bio copy supplied (added 22 Aug 2026, owner-requested)

Owner supplied the bio copy by pointing at the artist poster staged in
§8.51 (the attached image is the same 3291×4096 source, not a new
asset — no file was added, replaced or deleted). §8.51 deliberately left
the bio as a placeholder because "the executor does NOT write artist bio
copy — that is owner content"; that condition is now met, so the copy
lands.

**File — one edit.** `src/data/lineup.ts`, the `fly-on-the-wall` entry:
- `bio:` placeholder string → the poster copy, transcribed and set in
  house voice to match the peer bios (single paragraph, third person):
  "Lives in the space just below the surface. Melodic house, indie dance
  and trance woven into journeys that drift between deep grooves and
  hypnosis — music that makes you lose track of time without losing the
  groove. Designed to pull you somewhere between zoning in and zoning out
  entirely. The pulse found something fluid."
- `time`, `tag`, `hook`, `poster`, `bioCard: null` and
  `placeholder: true` are UNCHANGED.

**Source defect, handled not propagated.** The poster's body copy carries
a corrupted fragment — "…without losing the groove.gh to make you forget
you're moving." The ".gh to" is a broken word ending (most likely
"…enough to…" from a lost clause). It was NOT transcribed verbatim; the
sentence is closed at "groove" and the lost clause dropped rather than
guessed. If the owner supplies the intended wording, it slots into the
same sentence.

**`placeholder: true` STAYS.** §8.51 kept the flag on two grounds — no
bio copy, no `bioCard`. The first is now resolved; the second is not, so
the marker is still accurate. Independently re-verified this amendment:
`placeholder` is declared on the `Act` type and set on two entries but
read by no component, so it changes no rendered output either way. It
flips to `false` when a bio card lands.

**Scope fences.** No other act is touched. The `hook` ("The early
current") is unchanged — the owner asked for the bio only. The timetable
array is untouched. `ArtistSlider` and `/lineup` are untouched; the bio
renders through the existing field.

**Reversibility.** Restore the previous one-line placeholder bio string.

**Verification gates (executor).**
- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100: `/lineup` → grep `zoning in and zoning out` ≥1,
  and `Bio pending` **0**.
- Playwright at 1280×800 and 375×812:
  `scrollWidth - clientWidth === 0` on `/lineup`.

### 8.53 Lineup — swipe affordance on the artist photo (added 22 Aug 2026, owner-requested)

Owner request: a small indication (dots) at the bottom of the artist
photos on `/lineup`, so guests intuitively understand that left/right
swipes move to the next/previous artist.

**Diagnosis — the dots already exist; they are below the fold.**
`ArtistSlider.tsx` already renders a dot row plus prev/next chevrons
(current lines 168–208), but they sit beneath the *entire* card.
Measured on the running app (Playwright, `/lineup`):

| Viewport | Photo block | Card | Dot row | Verdict |
|---|---|---|---|---|
| 390×844 (mobile) | y 295–684 | y 294–**1159** (864 tall) | y **1195** | **351 px below the first fold** |
| 1280×800 (desktop) | y 331–722 | y 330–723 | y 759 | 41 px **above** the fold — already visible |

So the affordance is invisible exactly where swiping is the only way to
navigate. Two compounding causes: the card (864 px) is taller than the
viewport (844 px), and each slide is `flex: 0 0 100%` — measured slide
width 343 px against a track `clientWidth` of 343 px, i.e. **zero peek**
of the next card. Nothing on the first screen suggests a second artist
exists. This is a placement fix, not a new feature.

**Scoped to mobile.** Desktop already shows the dot row above the fold
and has chevrons, so the new overlay is mobile-only (`md:hidden`, the
Tailwind breakpoint already used in this file). This deliberately avoids
two dot rows visible in one glance on desktop.

**Slide count is 7, not 8.** `acts` has 7 entries; the page heading says
"8 artists" because `First Pulse ×2` is one slide counted as two acts
(`ARTIST_COUNT = acts.length + 1`). The overlay renders **`acts.length`
= 7 dots**. Do not use `ARTIST_COUNT`.

#### File — `src/components/lineup/ArtistSlider.tsx` (only file touched)

**Edit 1 — module constant.** Add above `function Slide`:
```ts
const SLIDE_GAP = 20
```

**Edit 2 — `Slide` signature.** Replace:
```ts
function Slide({ act }: { act: (typeof acts)[number] }) {
```
with:
```ts
function Slide({ act, activeIndex, count }: { act: (typeof acts)[number]; activeIndex: number; count: number }) {
```

**Edit 3 — the overlay.** Inside the photo block — the
`<div className="md:col-span-5 relative" style={{ minHeight: 340 }}>` —
insert this as the **last child**, after the `{act.poster ? … : …}`
ternary closes, so it paints above the image:
```tsx
<div
  className="flex md:hidden items-end justify-center"
  aria-hidden="true"
  style={{
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 6,
    padding: '28px 0 12px',
    zIndex: 2,
    pointerEvents: 'none',
    background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
  }}
>
  {Array.from({ length: count }, (_, i) => (
    <span
      key={i}
      style={{
        width: i === activeIndex ? 18 : 6,
        height: 6,
        borderRadius: 999,
        background: i === activeIndex ? 'var(--accent-magenta)' : 'rgba(255,255,255,0.45)',
        transition: 'width 200ms ease, background 200ms ease',
      }}
    />
  ))}
</div>
```

**CRITICAL — do not set `display` in the inline `style` object.** Inline
styles outrank Tailwind's class rules, so a `display: 'flex'` in `style`
would defeat `md:hidden` and the overlay would show on desktop too.
Display is carried by the `flex md:hidden` classes only. Everything else
stays inline, matching this file's existing mixed convention.

The overlay renders on **every** slide, including `First Pulse ×2`
(`poster: null`, the gradient placeholder branch) — it communicates
carousel position, not photo content.

**Edit 4 — call site.** Replace:
```tsx
<Slide key={act.id} act={act} />
```
with:
```tsx
<Slide key={act.id} act={act} activeIndex={index} count={acts.length} />
```

**Edit 5 — fix the active-index drift.** The dots become the primary
affordance, so the active one must be exact. Measured slide pitch is
**363 px** (`clientWidth` 343 + gap 20). `go()` already uses
`clientWidth + 20` and is correct; `onScroll` divides by `clientWidth`
alone, drifting by `i × 20 / clientWidth`. At 7 acts on a 390 px screen
this still rounds correctly, so it is currently invisible — but it
breaks the active dot at ~10 acts on that same screen, and every future
act added makes it worse. Fix now, and clamp against iOS overscroll
bounce:

- In `go()`, replace the literal `20` with `SLIDE_GAP`:
  `track.scrollTo({ left: clamped * (track.clientWidth + SLIDE_GAP), behavior: 'smooth' })`
- In the `onScroll` handler, replace:
  ```ts
  const i = Math.round(track.scrollLeft / track.clientWidth)
  setIndex(i)
  ```
  with:
  ```ts
  const i = Math.round(track.scrollLeft / (track.clientWidth + SLIDE_GAP))
  setIndex(Math.max(0, Math.min(acts.length - 1, i)))
  ```
- In the track's inline style, replace `gap: 20` with `gap: SLIDE_GAP`.

#### Scope fences

- The existing bottom bar (interactive dot buttons + chevrons) is
  **unchanged** and stays the accessible control. The overlay is
  decorative only — `aria-hidden="true"` and `pointerEvents: 'none'` —
  so screen readers and keyboard users are unaffected and there is no
  second `role="tablist"` in the DOM.
- No change to `Slide`'s bio-card state, the `href` CTA, `src/data/lineup.ts`,
  the `/lineup` page, or any other component or route.
- No new asset, dependency or icon. `lucide-react` imports stay as they are.

#### Considered and deliberately excluded

- **Edge peek** (making slides ~88% width so the next card's edge shows)
  is the single strongest swipe cue and the measurements above show the
  current 0 px peek is half the problem. It is excluded here because it
  changes card width and page rhythm on every viewport, which is more
  visual change than this request asked for. Recorded so a future
  amendment can take it up deliberately.
- **Enlarging the bottom dot buttons** (currently 8×8 px, below the 44 px
  touch-target minimum) is a real accessibility gap but is separate work.
- **A one-time animated "swipe" nudge** — rejected as noise.

#### Reversibility

Delete the Edit 3 overlay block, revert the Edit 2/4 props, and restore
the two `onScroll`/`go()` lines. No data, asset or flag is involved.

#### Verification gates (executor)

- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Local dev on port 3100, Playwright:
  - **390×844** — the overlay's bounding rect `bottom` is **≤ 844**
    (visible without scrolling, expected ≈ 684); it contains exactly
    **7** dot spans; computed `display` is **`flex`**.
  - **1280×800** — the overlay's computed `display` is **`none`**.
  - **Active dot tracks scroll:** call the next-chevron three times at
    390×844, wait for smooth scroll to settle, then assert the wide
    (18 px) dot is at **index 3** in the overlay *and* the bottom row's
    magenta dot is at index 3.
  - `scrollWidth - clientWidth === 0` on `/lineup` at both sizes.

### 8.54 Missing space after `@dhakamusicfestival` — SWC JSX entity whitespace bug (added 23 Aug 2026, owner-requested)

Owner reported the Wayfinder success card rendering
"…follow **@dhakamusicfestival**and accept the follow request…" with no
space after the handle.

**The source is not wrong.** `WayfinderForm.tsx:119` contains a real
U+0020 after `</strong>` (verified with `od -c`), and it has been there
since commit `8959ede`. The space is destroyed at build time, so no
amount of reading the source reveals it.

**Root cause — reproduced in a controlled experiment.** A throwaway
route was built with four variants and the prerendered HTML inspected:

| Variant | Text node after `</strong>` | Rendered |
|---|---|---|
| A | `␣and accept the thing.` | space **kept** |
| B | `␣— accept the thing.` | space **kept** |
| C | `␣and accept that&apos;s it.` | space **STRIPPED** |
| D | same as A, all on one line | space **kept** |
| F | `␣and accept that&rsquo;s it.` | space **STRIPPED** |
| G | `␣and accept that’s it.` (literal ’) | space **kept** |

**When a JSX text node contains an HTML entity, SWC's entity-decoding
path discards that node's leading whitespace.** Any entity triggers it
(`&apos;` and `&rsquo;` both reproduce); the entity does not need to be
adjacent to the space — it can sit at the far end of the sentence. This
is why `AddTicketForm.tsx:85`, structurally identical but with no entity
in its trailing text node, renders correctly.

**Blast radius — exactly two sites**, established two independent ways:
a source scan for "inline element, space, then an entity in the same
text node", and a ground-truth scan of the compiled bundles for
`}),"<letter>`. Both agree:

1. `src/components/wayfinder/WayfinderForm.tsx:119` — compiles to
   `}),"and accept the follow request…` (the reported bug).
2. `src/app/verify/[referenceCode]/VerifyClient.tsx:306` — compiles to
   `}),"Verify the attendee's wristband…`, i.e. the gate-staff re-entry
   warning renders "Wristband check required.**V**erify the attendee's…".
   **Not reported by the owner; found by this sweep and fixed here.**

Explicitly checked and NOT affected: the email templates in
`src/app/api/wayfinder/route.ts`, `first-pulse/route.ts` and
`register/route.ts` build plain HTML strings, never JSX, so entity
decoding never runs on them. No change there.

#### Fix — `{' '}`, two files

**Edit 1 — `src/components/wayfinder/WayfinderForm.tsx`.** Replace line 119:
```tsx
          One step now: follow <strong style={{ color: '#fff' }}>@dhakamusicfestival</strong> and accept the follow request it sends back — that&apos;s how we verify applicants.
```
with these two lines:
```tsx
          One step now: follow <strong style={{ color: '#fff' }}>@dhakamusicfestival</strong>{' '}
          and accept the follow request it sends back — that&apos;s how we verify applicants.
```

**Edit 2 — `src/app/verify/[referenceCode]/VerifyClient.tsx`.** Replace line 306:
```tsx
                  <strong style={{ color: 'var(--accent-pulse)' }}>Wristband check required.</strong> Verify the attendee&apos;s wristband is present and intact before confirming re-entry. Do not allow re-entry without a wristband.
```
with these two lines:
```tsx
                  <strong style={{ color: 'var(--accent-pulse)' }}>Wristband check required.</strong>{' '}
                  Verify the attendee&apos;s wristband is present and intact before confirming re-entry. Do not allow re-entry without a wristband.
```

`{' '}` is an expression child, not text, so entity decoding never
touches it. The following text node then begins with a newline, whose
leading whitespace normal JSX rules trim as usual — the single rendered
space comes from `{' '}` alone. Verified working (variant E of the
experiment). No copy changes: every word, the em dash and both `&apos;`
entities stay exactly as they are.

#### Considered and rejected

- **Replacing `&apos;` with a literal `’`** also fixes it (variant G) but
  changes the rendered glyph from a straight to a curly apostrophe and
  would make these two strings inconsistent with the `&apos;` used
  everywhere else in the codebase.
- **`&nbsp;`** — wrong semantics; it would suppress the line break the
  paragraph needs at that point.
- **Reordering the sentence to move the entity** — fragile, and it edits
  owner-approved copy to work around a compiler bug.

#### House rule for future amendments

In JSX, when an inline element (`<strong>`, `<em>`, `<a>`, `<code>`,
`<span>`) is followed by a space and the same text node contains an HTML
entity, write the space as `{' '}`. Reviewing the source will not reveal
the defect — only the built output shows it.

#### Reversibility

Rejoin each pair of lines back into one and delete the `{' '}`. No data,
asset, flag or dependency involved.

#### Verification gates (executor)

- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- **Compiled-output gates, run after `npm run build`** — these are the
  only checks that can see this bug:
  - `grep -r '}),"and accept the follow request' .next/` → **0 matches**
  - `grep -r '}),"Verify the attendee' .next/` → **0 matches**
  - `grep -rc '@dhakamusicfestival"}),"  *"' .next/server/` → **≥1**,
    confirming a standalone space child now sits between the handle and
    the following sentence.
- Source gate: `grep -c "</strong>{' '}" src/components/wayfinder/WayfinderForm.tsx`
  and the same against `src/app/verify/[referenceCode]/VerifyClient.tsx`
  → **1** each.
- Do **not** smoke-test by submitting the Wayfinder form: that writes a
  real application row to Supabase. The compiled-output gates cover it.

### 8.55 Wayfinder — main-account requirement for Instagram verification (added 23 Aug 2026, owner-requested)

Owner restated the Wayfinder verification rule and added a new
condition: applicants must follow **@dhakamusicfestival** and accept the
follow request back, **and must apply with their main Instagram account
— not an alt, fluff or second account.**

The follow-and-accept half already ships on three surfaces (§8.42). Only
the main-account condition is new. This amendment extends §8.42 rather
than replacing it: every existing sentence stays exactly as written, and
one sentence is appended after it on each of the same three surfaces.

**Locked copy — one sentence, verbatim-identical on all three surfaces:**

> Apply with your main account — not an alt, second or fluff account.

"fluff account" is the owner's own term and the one this audience uses
for the exact account type being excluded; it is kept deliberately. The
em dash is a real em dash (—), not a hyphen.

#### Files — four edits

**Edit 1 — `src/components/wayfinder/WayfinderForm.tsx`, line 251** (the
Instagram field hint). Replace:
```tsx
          Follow @dhakamusicfestival and accept the follow request it sends back — that&apos;s how we verify applicants.
```
with:
```tsx
          Follow @dhakamusicfestival and accept the follow request it sends back — that&apos;s how we verify applicants. Apply with your main account — not an alt, second or fluff account.
```

**Edit 2 — same file, line 120** (the success card). Replace:
```tsx
          and accept the follow request it sends back — that&apos;s how we verify applicants.
```
with:
```tsx
          and accept the follow request it sends back — that&apos;s how we verify applicants. Apply with your main account — not an alt, second or fluff account.
```
**Do not touch line 119.** It ends with `</strong>{' '}` — that `{' '}`
is the §8.54 fix for the SWC entity-whitespace bug and removing it
re-breaks the missing space after the handle.

**Edit 3 — `src/app/api/wayfinder/route.ts`, line 159** (confirmation
email). Replace:
```
            <p style="margin:0 0 16px;">One step now: follow <strong>@dhakamusicfestival</strong> on Instagram and accept the follow request we send back — that's how we verify applicants.</p>
```
with:
```
            <p style="margin:0 0 16px;">One step now: follow <strong>@dhakamusicfestival</strong> on Instagram and accept the follow request we send back — that's how we verify applicants. Apply with your main account — not an alt, second or fluff account.</p>
```
This is a JS template string, not JSX: the apostrophe in "that's" stays
a raw `'` and must NOT be converted to `&apos;`. The email's "we send
back" (vs the site's "it sends back") is a deliberate §8.42 distinction —
leave it.

**Edit 4 — same file as Edits 1–2: a required affirmation checkbox.**
Copy alone informs; the owner said applicants *must* use their main
account, so the form gets one deliberate moment of commitment.

4a. After line 58 (`const [stayToClose, setStayToClose] = useState(false)`)
add:
```tsx
  const [mainAccountConfirmed, setMainAccountConfirmed] = useState(false)
```

4b. Immediately after the Instagram field block's closing `</div>` (the
line after the `<p>` edited in Edit 1) and BEFORE the `<div>` holding
"Anything we should know", insert:
```tsx
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, cursor: 'pointer' }}>
        <input
          type="checkbox"
          required
          checked={mainAccountConfirmed}
          onChange={(e) => setMainAccountConfirmed(e.target.checked)}
          style={{ marginTop: 3, accentColor: 'var(--accent-magenta)', width: 16, height: 16, touchAction: 'manipulation' }}
        />
        This is my main Instagram account, not an alt, second or fluff account.
      </label>
```
The label wording is first-person because a checkbox is an affirmation,
not an instruction — the one deliberate exception to the verbatim rule
above. Styling is copied exactly from the existing `stayToClose`
checkbox so the two match.

**The checkbox is NOT submitted and NOT stored.** `handleSubmit` and the
`JSON.stringify({ ...form, stayToClose })` body stay untouched, and no
column is added. Because the field is `required`, every stored row would
read `true` and carry zero information — storing it would cost the owner
a SQL migration to record a constant. Native HTML validation blocks
submit while it is unchecked, which is the entire behavioural point.

#### Scope fences

- No API, schema, env var or flag change. No SQL for the owner to run.
- `src/data/wayfinder.ts`, `WAYFINDER_LIVE`, the shift data, the admin
  tab and `/api/admin/wayfinder` are untouched.
- The age check, the 600-character motivation counter and every other
  field are untouched.

#### Considered and rejected

- **A fourth bullet in the `points` list on `/wayfinder`.** §8.42 ruled
  the page intro stays minimal, and that still holds: the field hint sits
  directly above the Instagram input, which is the decisive moment —
  earlier placement would not change behaviour.
- **Storing the confirmation.** See above: a required checkbox stores a
  constant.
- **Rewriting the §8.42 sentence to fold both rules into one.** Two rules
  read more clearly as two sentences, and leaving the first untouched
  keeps the diff to one appended sentence per surface.

#### Reversibility

Delete the appended sentence from all three surfaces, delete the
checkbox `<label>` block and its `useState` line. Nothing else changes.

#### Verification gates (executor)

- §4.1: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Source gates:
  - `grep -c "not an alt, second or fluff account" src/components/wayfinder/WayfinderForm.tsx` → **3**
    (field hint, success card, checkbox label).
  - `grep -c "not an alt, second or fluff account" src/app/api/wayfinder/route.ts` → **1**.
  - `grep -c "</strong>{' '}" src/components/wayfinder/WayfinderForm.tsx` → **1**
    (§8.54 regression guard).
- **§8.54 regression gate**, after `npm run build`:
  `grep -r '}),"and accept the follow request' .next/` → **0 matches**.
- Playwright on `/wayfinder` at 375×812 and 1280×800:
  - The checkbox is present and reports `required === true` and
    `checkValidity() === false` while unchecked; after
    `.check()`, `checkValidity() === true`.
  - The field hint text contains "not an alt, second or fluff account".
  - `scrollWidth - clientWidth === 0`.
- **Do NOT submit the form.** A submission writes a real application row
  to Supabase and sends an email. Validate the checkbox via
  `checkValidity()` only, never by submitting.

### 8.56 FAQ — link the relevant answers to /policy (added 26 Aug 2026, owner-requested)

Owner asked why the rules page seemed to be missing. It is not — `/policy`
("Event policy and rules") is intact and builds as a static route, carrying
"No narcotics or alcohol", "No personal speakers allowed", "Safe space — no
harassment or bullying", "No live streaming during the event", "One ticket,
one entry", "Tickets are non-refundable", "Respect attendees and staff" and
"Venue rules apply".

**The real problem is discoverability.** `/policy` is absent from
`Navbar.tsx` (which lists Lineup, Activities, Echoes, Tickets, First Pulse,
Wayfinder, FAQ, Contact) and is reachable from exactly one place site-wide:
a "Policy" entry in the Footer's Support column (`Footer.tsx:46`). Guests
looking for the rules land on the FAQ first, and the FAQ never points onward.
This amendment adds that pointer.

#### Technical constraint (measured, not assumed)

`FAQItem.answer` is a plain `string`, rendered as `<p>{answer}</p>` in
`src/components/ui/Accordion.tsx:40`. A link cannot be embedded in the string
without introducing JSX into a `.ts` data file or a markdown parser — both
rejected. Instead the `FAQItem` type gains an optional structured `link`,
and the Accordion renders it as a real anchor beneath the answer.

`AccordionItem` has **two** consumers — `src/components/faq/FAQList.tsx:46`
and `src/components/home/FAQTeaser.tsx:13`. Both pass props explicitly, so
adding one optional prop breaks neither; the teaser simply never passes it.

**Panel height is safe.** The open panel is capped at `maxHeight: '400px'`
(`Accordion.tsx:38`), so a taller panel would clip. Measured on the running
app at 375×812 with every answer expanded: the tallest panel is **179px**
("Where do I buy tickets?", "Will there be food and drinks?", "What stages
are there"), and the tallest of the three answers receiving a link is
**157px** ("Is alcohol served at the event?"). A link line adds roughly 35px,
landing near 192px against a 400px cap. **Do NOT change `maxHeight`** — there
is 200px+ of headroom and touching it is out of scope.

#### Which answers get the link — three, and only three

Chosen because `/policy` genuinely elaborates on each; other FAQ entries are
left alone because the policy page adds nothing to them.

1. `prohibited` — "What is prohibited at the venue?"
2. `alcohol-free` — "Is alcohol served at the event?"
3. `refund-policy` — "What is your refund policy?"

**Locked link copy, identical on all three** (§5 voice: sentence case, no
exclamation marks):

> Read the full event policy →

The arrow is a literal `→` (U+2192), matching `ContactDetails.tsx` and the
tickets page. `href` is `/policy` with **no anchor** — the policy rows carry
no `id` attributes, so there is nothing to deep-link to.

#### Files — three edits

**Edit 1 — `src/data/faq.ts`.** Extend the type. Replace:
```ts
export type FAQItem = {
  id: string
  category: string
  question: string
  answer: string
}
```
with:
```ts
export type FAQItem = {
  id: string
  category: string
  question: string
  answer: string
  link?: { href: string; label: string }
}
```
Then add this exact property as the last line of each of the three entries
above, after `answer:` and before the closing `},`:
```ts
    link: { href: '/policy', label: 'Read the full event policy →' },
```
Apply to `id: 'refund-policy'` (currently line 78), `id: 'prohibited'`
(line 91) and `id: 'alcohol-free'` (line 109). No other entry is touched, and
no `answer` string changes.

**Edit 2 — `src/components/ui/Accordion.tsx`.** Add the import at the top,
directly after the `lucide-react` import:
```tsx
import Link from 'next/link'
```
Extend `AccordionItemProps`:
```tsx
type AccordionItemProps = {
  question: string
  answer: string
  link?: { href: string; label: string }
  defaultOpen?: boolean
}
```
Update the signature:
```tsx
export function AccordionItem({ question, answer, link, defaultOpen = false }: AccordionItemProps) {
```
Replace the answer paragraph (line 40):
```tsx
        <p className="text-[var(--text-muted)] text-sm pb-5 leading-relaxed">{answer}</p>
```
with:
```tsx
        <p className="text-[var(--text-muted)] text-sm leading-relaxed">{answer}</p>
        {link && (
          <Link
            href={link.href}
            className="inline-block text-sm font-semibold mt-2"
            style={{ color: 'var(--accent-magenta)', touchAction: 'manipulation' }}
          >
            {link.label}
          </Link>
        )}
        <div className="pb-5" />
```
The `pb-5` moves off the paragraph onto a trailing spacer so the link sits
between the answer and the existing bottom padding rather than after it.

Extend `AccordionProps` and pass the prop through:
```tsx
type AccordionProps = {
  items: { id: string; question: string; answer: string; link?: { href: string; label: string } }[]
}
```
```tsx
        <AccordionItem key={item.id} question={item.question} answer={item.answer} link={item.link} />
```

**Edit 3 — `src/components/faq/FAQList.tsx`, line 46.** Replace:
```tsx
              <AccordionItem key={item.id} question={item.question} answer={item.answer} />
```
with:
```tsx
              <AccordionItem key={item.id} question={item.question} answer={item.answer} link={item.link} />
```

#### Scope fences

- **`src/components/home/FAQTeaser.tsx` is NOT touched.** It renders a short
  teaser on the home page and must keep passing no `link`, so no policy links
  appear there. The optional prop makes this safe.
- `Navbar.tsx` and `Footer.tsx` are untouched — no nav entry is added.
- `src/app/(main)/policy/page.tsx` is untouched. No `id` anchors are added.
- No `answer` string, question, or category is reworded.
- `maxHeight` in `Accordion.tsx` stays `'400px'` (see measurement above).

#### Considered and rejected

- **Adding Policy to the top nav.** The navbar already carries eight items
  and a ninth crowds it at 375px. Recorded for a future amendment if the
  owner wants it despite that.
- **A standing "Read the full event policy" link at the foot of `/faq`.**
  Would help discoverability more broadly, but the owner asked specifically
  for links in the answers; this stays available as a follow-up.
- **Deep-linking to individual policy rows.** Requires adding `id`s to
  `PolicyRow`, which is a change to the policy page and out of scope.

#### Reversibility

Delete the three `link:` lines in `faq.ts`, revert the `link` prop through
`Accordion.tsx` and `FAQList.tsx`, and restore `pb-5` onto the answer `<p>`.
No data, asset or flag involved.

#### Verification gates (executor)

- §4: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Source gates:
  - `grep -c "Read the full event policy" src/data/faq.ts` → **3**
  - `grep -c "Read the full event policy" src/components/home/FAQTeaser.tsx` → **0**
  - `grep -c "maxHeight: open ? '400px'" src/components/ui/Accordion.tsx` → **1**
- Dev server on port 3100, Playwright at 375×812 and 1280×800 on `/faq`:
  - Expand all answers; exactly **3** anchors with `href="/policy"` are
    present in the accordion.
  - Each of those three sits inside the panel for `prohibited`,
    `alcohol-free` and `refund-policy` respectively.
  - No expanded panel's `scrollHeight` exceeds **400** (clipping guard).
  - `scrollWidth - clientWidth === 0`.
- On `/` (home): `0` anchors with `href="/policy"` inside the FAQ teaser
  (the footer's Policy link is outside the teaser and does not count — scope
  the selector to the teaser section).

### 8.57 Nav — add Policy to the navbar (added 26 Aug 2026, owner-requested)

**§8.56 is superseded on one point.** Its "Considered and rejected" list
declined to add Policy to the top nav, reasoning that "the navbar already
carries eight items and a ninth crowds it at 375px". The owner has decided
otherwise, and the reasoning was wrong on the facts as well — measurement
below. The §8.56 FAQ links stay exactly as built; this amendment adds the
nav entry alongside them.

#### The crowding concern was unfounded — measured

The desktop nav is `hidden lg:flex` (`Navbar.tsx:97`), so it only renders at
**≥1024px**; below that the hamburger takes over and 375px never shows the
horizontal nav at all. The tightest real case is therefore 1024px, not 375px.

Measured on the running app by cloning a nav link, relabelling it "Policy"
and re-measuring the free space between the logo's right edge and the nav's
left edge:

| Viewport | Free space now | With Policy added |
|---|---|---|
| 1024px | 109px | **48px** |
| 1152px | 237px | 176px |
| 1280px | 285px | 224px |

A "Policy" link costs 37px plus the 24px flex gap = 61px. At the tightest
width it leaves 48px of clear space and the row does not overflow
(`scrollWidth === clientWidth` at every width tested). It fits.

#### `navLinks` is duplicated — BOTH copies must change

`navLinks` is declared twice, independently and byte-identically:
`src/components/layout/Navbar.tsx:165` (desktop row) and
`src/components/layout/MobileMenu.tsx:12` (hamburger drawer). Editing only
one silently desyncs desktop from mobile. Since the drawer is the *only*
nav below 1024px, omitting it there would leave phone users exactly where
they started — which is the problem this change exists to fix.

The duplication itself is pre-existing and is NOT refactored here; extracting
a shared module is a separate change. Recorded so a future amendment can take
it up deliberately.

#### The entry

- **Label:** `Policy` — matching the existing Footer entry (`Footer.tsx:46`)
  so the same page is never called two different things. Sentence case per §5.
- **href:** `/policy`, no anchor.
- **Position:** last, after `Contact`. Policy is a reference page, not a
  destination people browse to first, and last also mirrors the Footer's
  Support column ordering.
- **No flag gate.** `/policy` is always live — unlike `/tickets`
  (`TICKETS_CTA_LIVE`) and `/wayfinder` (`WAYFINDER_LIVE`), it has no
  master switch and must never be conditional.

#### Files — two edits, identical change

**Edit 1 — `src/components/layout/Navbar.tsx`.** In the `navLinks` array
(currently lines 165–174), replace:
```ts
  { href: '/contact', label: 'Contact' },
]
```
with:
```ts
  { href: '/contact', label: 'Contact' },
  { href: '/policy', label: 'Policy' },
]
```

**Edit 2 — `src/components/layout/MobileMenu.tsx`.** In its `navLinks` array
(currently lines 12–21), make the **exact same** replacement:
```ts
  { href: '/contact', label: 'Contact' },
]
```
with:
```ts
  { href: '/contact', label: 'Contact' },
  { href: '/policy', label: 'Policy' },
]
```

Both files already render `navLinks` with an active-state check against
`pathname`, so `/policy` will highlight correctly when open with no further
change. No styling, no new import, no component change.

#### Scope fences

- `src/app/(main)/policy/page.tsx` is untouched.
- `Footer.tsx` is untouched — its existing Policy link stays where it is.
  Two links to the same page from nav and footer is intended, not duplication
  to clean up.
- The §8.56 FAQ answer links are untouched.
- No existing nav label, href or order changes; `Policy` is appended only.
- The `navLinks` duplication is not refactored.

#### Reversibility

Delete the one added line from each of the two files.

#### Verification gates (executor)

- §4: `npx tsc --noEmit`; `npm run lint` (pre-existing baseline only —
  7 errors / 9 warnings); `npm run build`.
- Source gates:
  - `grep -c "href: '/policy', label: 'Policy'" src/components/layout/Navbar.tsx` → **1**
  - `grep -c "href: '/policy', label: 'Policy'" src/components/layout/MobileMenu.tsx` → **1**
- Dev server on port 3100, Playwright:
  - **1024×800** on `/lineup`: the desktop nav contains an anchor with
    `href="/policy"` and text `Policy`; free space between the logo's right
    edge and the nav's left edge is **> 20px**; `scrollWidth - clientWidth === 0`.
  - **1280×800** on `/lineup`: same anchor present; no overflow.
  - **375×812** on `/lineup`: the desktop nav is `display: none`; open the
    hamburger and assert the drawer contains an anchor with `href="/policy"`
    and text `Policy`; `scrollWidth - clientWidth === 0` with the drawer open.
  - On `/policy` at 1280×800: the nav's Policy anchor renders in the active
    colour `rgb(255, 255, 255)` while a non-active link (e.g. `/faq`) does not.
### 8.58 Admin Wayfinder — search, filters, exports, age display, Instagram-link fix (added 31 Aug 2026, owner-requested)

Owner request, verbatim intent: "Make a filter function and the suggested export
function and other functions that might be useful." Context: the owner needed
accepted-applicant tables (summary and contact-sheet views) and could only get the
data out of `/admin` via devtools console snippets — impossible from a phone. This
amendment gives the admin Wayfinder tab first-class filtering and export, plus two
small data-quality fixes that real applications exposed. Everything is client-side
on data the tab already fetches; **no API, SQL, or schema changes**. No earlier
section is superseded.

Real-data facts that shaped the decisions (state of the live table, 25 Aug 2026,
15 accepted): one applicant pasted a full profile URL with an `igsh` tracking
param into the Instagram field, one pasted two handles separated by `//`, three
pre-§8.31 rows have `gender = NULL`, and the card's existing Instagram pill
(`instagram_handle.replace('@','')`) builds a broken link for the URL case.

**Decisions, all locked:**

- Filters compose with the existing status chips (chips keep their absolute
  per-status counts): a free-text search plus three pill selects. Search matches,
  case-insensitively, the concatenation of `full_name`, `email`, `phone`,
  `institution`, `instagram_handle` (null → empty) and `reference_code`; a leading
  `@` in the query is stripped before matching.
- Export always acts on **exactly the rows currently visible** (active status chip
  + filters + search), sorted by `full_name` case-insensitively — so the chips are
  also the export's status selector. Three column sets via one select —
  Everything / Summary / Contacts — and two actions: **Download CSV** (RFC 4180,
  CRLF, UTF-8 with BOM so Bangla names survive Excel) and **Copy JSON** (array of
  `{header: value}` objects, compact). Clipboard failure or absence falls back to
  downloading the same content as a `.json` file — no alert, no error state.
- Instagram values are normalised everywhere they are displayed or exported:
  profile URLs reduce to the username (query/fragment dropped), multi-handle
  entries split into separate handles, `@` prefixes stripped and re-applied. The
  card renders one pill per handle, fixing the broken-link bug.
- Age is computed against the event night, 25 Sep 2026 (§8.0), UTC-safe, and shown
  on the card next to date of birth and in the Everything CSV. The subtitle line
  gains a gender split for accepted applicants; rows with `prefer_not_to_say` or
  `NULL` gender are deliberately lumped as "not stated" (zero
  `prefer_not_to_say` rows exist today).
- Existing card list keeps its `created_at` (API) order; only exports sort by name.
  No in-page table view — on a 375px screen the CSV/JSON exports are the tabular
  surface. If the owner wants an in-page roster later, that is its own amendment.

**Edit 1 — create `src/app/admin/wayfinderExport.ts`** with exactly this content
(the `WayfinderApplication` type is the tab's current `Application` type moved
verbatim; the three label maps move from `WayfinderTab.tsx` unchanged):

```ts
// Pure helpers for the admin Wayfinder tab: filtering support, CSV/JSON export,
// Instagram normalisation, age computation. Client-side only. See §8.58.

export type WayfinderApplication = {
  id: string
  full_name: string
  email: string
  phone: string
  institution: string
  level: 'undergraduate_final' | 'hsc_alevel' | 'other'
  gender: 'female' | 'male' | 'prefer_not_to_say' | null
  graduation_year: number | null
  date_of_birth: string | null
  shift_preference: 'dusk' | 'dawn' | 'either'
  stay_to_close: boolean
  motivation: string | null
  emergency_contact_name: string
  emergency_contact_phone: string
  instagram_handle: string | null
  notes: string | null
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected'
  assigned_shift: 'dusk' | 'dawn' | null
  reference_code: string
  created_at: string
}

export const LEVEL_LABEL: Record<WayfinderApplication['level'], string> = {
  undergraduate_final: 'Final-year undergraduate',
  hsc_alevel: 'HSC / A-level finisher',
  other: 'Other',
}

export const GENDER_LABEL: Record<string, string> = {
  female: 'Female',
  male: 'Male',
  prefer_not_to_say: 'Prefer not to say',
}

export const SHIFT_LABEL: Record<string, string> = {
  dusk: 'Shift A · Dusk',
  dawn: 'Shift B · Dawn',
  either: 'Either shift',
}

// Normalise a free-text Instagram field: applicants paste bare handles,
// @handles, full profile URLs with tracking params, or several handles at
// once. Returns bare handles, no '@'. Empty array when nothing usable.
export function instagramHandles(raw: string | null): string[] {
  const value = (raw ?? '').trim()
  if (!value) return []
  if (value.toLowerCase().includes('instagram.com/')) {
    const tail = value.split(/instagram\.com\//i).pop() ?? ''
    const name = tail.split(/[/?#]/)[0].replace(/^@+/, '')
    return name ? [name] : []
  }
  return value
    .split(/[\s/,]+/)
    .map((part) => part.replace(/^@+/, ''))
    .filter(Boolean)
}

// Age on the event night, 25 Sep 2026 (§8.0). UTC arithmetic so the result
// does not depend on the viewer's timezone. Null when dob is missing/bad.
const EVENT_NIGHT = { year: 2026, month: 8, day: 25 } // month is 0-based
export function ageOnEventNight(dob: string | null): number | null {
  if (!dob) return null
  const d = new Date(dob.slice(0, 10) + 'T00:00:00Z')
  if (isNaN(d.getTime())) return null
  let age = EVENT_NIGHT.year - d.getUTCFullYear()
  if (
    d.getUTCMonth() > EVENT_NIGHT.month ||
    (d.getUTCMonth() === EVENT_NIGHT.month && d.getUTCDate() > EVENT_NIGHT.day)
  ) age--
  return age
}

export type ColumnSet = 'everything' | 'summary' | 'contacts'

const igDisplay = (a: WayfinderApplication) =>
  instagramHandles(a.instagram_handle).map((h) => '@' + h).join(' / ')

const COLUMNS: Record<ColumnSet, [string, (a: WayfinderApplication) => string][]> = {
  everything: [
    ['Reference', (a) => a.reference_code],
    ['Name', (a) => a.full_name],
    ['Gender', (a) => (a.gender ? GENDER_LABEL[a.gender] : '')],
    ['Email', (a) => a.email],
    ['Phone', (a) => a.phone],
    ['Institution', (a) => a.institution],
    ['Level', (a) => LEVEL_LABEL[a.level]],
    ['Graduation year', (a) => (a.graduation_year ? String(a.graduation_year) : '')],
    ['Date of birth', (a) => a.date_of_birth ?? ''],
    ['Age on event night', (a) => {
      const n = ageOnEventNight(a.date_of_birth)
      return n === null ? '' : String(n)
    }],
    ['Shift preference', (a) => SHIFT_LABEL[a.shift_preference]],
    ['Can stay to close', (a) => (a.stay_to_close ? 'yes' : 'no')],
    ['Assigned shift', (a) => (a.assigned_shift ? SHIFT_LABEL[a.assigned_shift] : '')],
    ['Status', (a) => a.status],
    ['Instagram', igDisplay],
    ['Emergency contact', (a) => a.emergency_contact_name],
    ['Emergency phone', (a) => a.emergency_contact_phone],
    ['Motivation', (a) => a.motivation ?? ''],
    ['Notes', (a) => a.notes ?? ''],
    ['Applied', (a) => a.created_at],
  ],
  summary: [
    ['Name', (a) => a.full_name],
    ['Gender', (a) => (a.gender ? GENDER_LABEL[a.gender] : '')],
    ['Instagram', igDisplay],
    ['Institution', (a) => a.institution],
    ['Level', (a) => LEVEL_LABEL[a.level]],
    ['Birth year', (a) => (a.date_of_birth ? a.date_of_birth.slice(0, 4) : '')],
  ],
  contacts: [
    ['Name', (a) => a.full_name],
    ['Instagram', igDisplay],
    ['Phone', (a) => a.phone],
    ['Emergency contact', (a) => a.emergency_contact_name],
    ['Emergency phone', (a) => a.emergency_contact_phone],
  ],
}

export function exportRows(apps: WayfinderApplication[], set: ColumnSet): { headers: string[]; rows: string[][] } {
  const cols = COLUMNS[set]
  const sorted = [...apps].sort((a, b) =>
    a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase(), 'en'))
  return { headers: cols.map(([h]) => h), rows: sorted.map((a) => cols.map(([, fn]) => fn(a))) }
}

// RFC 4180: CRLF line ends, fields containing quotes/commas/newlines are
// quoted with doubled quotes. Leading BOM so Excel opens UTF-8 correctly.
export function toCsv(headers: string[], rows: string[][]): string {
  const esc = (v: string) => (/[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v)
  return '\uFEFF' + [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n')
}

export function downloadBlob(filename: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
```

**Edit 2 — `src/app/admin/WayfinderTab.tsx`**, eight surgical changes. Line
numbers refer to the file as of commit `fbb5d2a`; anchor by the quoted code if
drift has occurred.

2a. Replace the local `type Application` block (lines 4–25) and the three label
maps `LEVEL_LABEL`, `GENDER_LABEL`, `SHIFT_LABEL` (lines 36–52) with:

```tsx
import {
  type WayfinderApplication, type ColumnSet,
  GENDER_LABEL, LEVEL_LABEL, SHIFT_LABEL,
  ageOnEventNight, downloadBlob, exportRows, instagramHandles, toCsv,
} from './wayfinderExport'

type Application = WayfinderApplication
```

(`STATUS_TABS` and `STATUS_STYLE` stay where they are.) Add at module level,
after `STATUS_STYLE`:

```tsx
const SELECT_STYLE = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  color: 'rgba(255,255,255,0.65)',
  touchAction: 'manipulation',
} as const
```

2b. After the `actionLoading` state (line 59), add:

```tsx
const [query, setQuery] = useState('')
const [genderFilter, setGenderFilter] = useState('any')
const [levelFilter, setLevelFilter] = useState('any')
const [shiftFilter, setShiftFilter] = useState('any')
const [columnSet, setColumnSet] = useState<ColumnSet>('everything')
const [copied, setCopied] = useState(false)
```

2c. Replace line 95 (`const filtered = applications.filter((a) => a.status === activeTab)`) with:

```tsx
const q = query.trim().toLowerCase().replace(/^@/, '')
const matchesFilters = (a: Application) => {
  if (q) {
    const haystack = [a.full_name, a.email, a.phone, a.institution, a.instagram_handle ?? '', a.reference_code]
      .join(' ').toLowerCase()
    if (!haystack.includes(q)) return false
  }
  if (genderFilter === 'none') { if (a.gender !== null) return false }
  else if (genderFilter !== 'any' && a.gender !== genderFilter) return false
  if (levelFilter !== 'any' && a.level !== levelFilter) return false
  if (shiftFilter === 'close') { if (!a.stay_to_close) return false }
  else if (shiftFilter === 'unassigned') { if (a.assigned_shift !== null) return false }
  else if (shiftFilter !== 'any' && a.assigned_shift !== shiftFilter) return false
  return true
}
const filtered = applications.filter((a) => a.status === activeTab && matchesFilters(a))
const filtersActive = q !== '' || genderFilter !== 'any' || levelFilter !== 'any' || shiftFilter !== 'any'
```

2d. After the `closeCount` line (line 100), add the gender split and export
handlers:

```tsx
const femaleCount = accepted.filter((a) => a.gender === 'female').length
const maleCount = accepted.filter((a) => a.gender === 'male').length
const unstatedCount = accepted.length - femaleCount - maleCount

const stamp = () => new Date().toISOString().slice(0, 10)
const handleDownloadCsv = () => {
  const { headers, rows } = exportRows(filtered, columnSet)
  downloadBlob(`wayfinder-${columnSet}-${activeTab}-${stamp()}.csv`, 'text/csv;charset=utf-8', toCsv(headers, rows))
}
const handleCopyJson = () => {
  const { headers, rows } = exportRows(filtered, columnSet)
  const json = JSON.stringify(rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]]))))
  const fallback = () => downloadBlob(`wayfinder-${columnSet}-${activeTab}-${stamp()}.json`, 'application/json', json)
  if (!navigator.clipboard) { fallback(); return }
  navigator.clipboard.writeText(json).then(
    () => { setCopied(true); setTimeout(() => setCopied(false), 2000) },
    fallback,
  )
}
```

2e. Replace the subtitle text on line 117 so it ends with the gender split —
the full line becomes:

```tsx
Fifty places across two shifts. Accepted: {accepted.length}/50 · Dusk {duskCount}/25 · Dawn {dawnCount}/25 · can stay to close {closeCount} · {femaleCount} female · {maleCount} male · {unstatedCount} not stated
```

2f. Immediately after the status-chip `</div>` (line 138), insert the toolbar.
It renders only once applications exist; `notReady` already early-returns above:

```tsx
{!loading && applications.length > 0 && (
  <>
    <div className="flex gap-2 mb-3 flex-wrap items-center">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, contact or institution"
        className="text-sm px-4 py-2 rounded-full flex-1"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', minWidth: 200, touchAction: 'manipulation' }}
      />
      <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="text-sm px-3 py-2 rounded-full cursor-pointer" style={SELECT_STYLE}>
        <option value="any">Any gender</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="prefer_not_to_say">Prefer not to say</option>
        <option value="none">Not stated</option>
      </select>
      <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="text-sm px-3 py-2 rounded-full cursor-pointer" style={SELECT_STYLE}>
        <option value="any">Any level</option>
        <option value="undergraduate_final">Final-year undergraduate</option>
        <option value="hsc_alevel">HSC / A-level finisher</option>
        <option value="other">Other</option>
      </select>
      <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)} className="text-sm px-3 py-2 rounded-full cursor-pointer" style={SELECT_STYLE}>
        <option value="any">Any shift</option>
        <option value="dusk">Assigned dusk</option>
        <option value="dawn">Assigned dawn</option>
        <option value="unassigned">Unassigned</option>
        <option value="close">Can stay to close</option>
      </select>
    </div>
    <div className="flex gap-2 mb-6 flex-wrap items-center">
      <select value={columnSet} onChange={(e) => setColumnSet(e.target.value as ColumnSet)} className="text-sm px-3 py-2 rounded-full cursor-pointer" style={SELECT_STYLE}>
        <option value="everything">Everything</option>
        <option value="summary">Summary</option>
        <option value="contacts">Contacts</option>
      </select>
      <button onClick={handleDownloadCsv} className="text-sm px-4 py-2 rounded-full cursor-pointer font-semibold" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.65)', touchAction: 'manipulation' }}>
        Download CSV
      </button>
      <button onClick={handleCopyJson} className="text-sm px-4 py-2 rounded-full cursor-pointer font-semibold" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.65)', touchAction: 'manipulation' }}>
        {copied ? 'Copied' : 'Copy JSON'}
      </button>
      {filtersActive && (
        <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Showing {filtered.length} of {counts[activeTab]}
        </span>
      )}
    </div>
  </>
)}
```

2g. In the empty state (line 144), replace the paragraph content
`No {activeTab} applications.` with:

```tsx
{counts[activeTab] === 0 ? `No ${activeTab} applications.` : 'No applications match these filters.'}
```

2h. Two card fixes. Replace the date-of-birth paragraph (line 207) with:

```tsx
<p className="text-sm" style={{ color: '#fff' }}>
  {app.date_of_birth}{ageOnEventNight(app.date_of_birth) !== null ? ` · ${ageOnEventNight(app.date_of_birth)} on event night` : ''}
</p>
```

and replace the single Instagram pill block (lines 221–225,
`{app.instagram_handle && ( <a … )}`) with one pill per normalised handle:

```tsx
{instagramHandles(app.instagram_handle).map((h) => (
  <a key={h} href={`https://instagram.com/${h}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)' }}>
    @{h}
  </a>
))}
```

**Failure and empty states, all specified:** `notReady` and the loading skeleton
are unchanged and render before the toolbar exists; the toolbar never renders
with zero applications; a filter set that excludes everything shows "No
applications match these filters." in the existing dashed empty card; clipboard
unavailable/denied silently downloads the `.json` instead; malformed or missing
`date_of_birth` yields no age suffix and an empty CSV cell; `instagram_handle`
values with no extractable handle render no pill and export as empty string.

**Scope fences — do not touch:** `src/app/api/admin/wayfinder/route.ts`, the
public `/wayfinder` page and `WayfinderForm.tsx` (§8.42/§8.55 copy rules stand),
`FirstPulseTab.tsx`, `AdminClient.tsx`, `src/data/wayfinder.ts`,
`scripts/wayfinders-png.py`, and all SQL files. No new dependencies.

**Reversibility:** additive UI plus two in-place fixes; no flag — restoration is
`git revert` of the execution commit. Nothing for the owner to run or supply
before execution.

**Verification gates (§4 protocol, adapted — `/admin` is auth-gated, so
interactive checks are owner-side after deploy):**

- `npx tsc --noEmit` clean; `npm run lint` with no new failures (baseline via
  `git stash -u` if unsure); `npm run build` passes.
- Greps: `grep -c "Download CSV" src/app/admin/WayfinderTab.tsx` → 1;
  `grep -c "No applications match these filters." src/app/admin/WayfinderTab.tsx` → 1;
  `grep -c "instagram_handle.replace" src/app/admin/WayfinderTab.tsx` → 0;
  `grep -c "instagram.com/" src/app/admin/wayfinderExport.ts` → 2 (comment + code).
- Playwright at 1280×800 and 375×812: `/wayfinder` and `/login` load with
  `scrollWidth - clientWidth === 0` (global-regression check; `/admin` redirects
  signed-out, which is itself the expected behaviour to confirm).
- Owner-side after deploy, on a phone: search narrows the list; each select
  filters; Download CSV on the accepted chip with Contacts selected produces
  `wayfinder-contacts-accepted-<date>.csv` opening with Bangla names intact;
  Copy JSON shows "Copied" and pastes valid JSON; the WF-NSK9XKWH-era card that
  held a pasted profile URL now shows a working `@adil_azbab` pill; date-of-birth
  lines show "· NN on event night".

### 8.59 Workflow — colliding rules eliminated, doc authority settled (added 31 Aug 2026, owner-decided)

Executed directly by the planner (owner: "Streamline the plan docs so no more
colliding rules exist. I want future plan amend sessions to go efficiently").
Two collisions bit on 31 Aug and both are now closed:

1. **Branch rule.** A remote session's harness designated a `claude/*` working
   branch and forbade pushing elsewhere, so the §8.58 work sat undeployed on
   that branch while the owner looked for it on the live site. Owner ruling:
   §8.43 stands — a harness-designated branch is NOT "the owner asking for work
   to be parked in a branch", and the owner grants standing permission to push
   `main` from any session. §8.43 is clarified on this one point, not
   superseded.
2. **Numbering.** Two sessions independently minted §8.56 (FAQ → /policy,
   26 Aug; admin Wayfinder, 31 Aug) by numbering from stale checkouts. The
   admin amendment was renumbered §8.56 → §8.58 in merge `76643d4`, keeping
   both sides. The skill now requires taking the next §8.x from `origin/main`
   immediately before appending, and documents keep-both-and-renumber recovery.

**Doc authority, from today:** `.claude/skills/plan-amend/SKILL.md` is the
normative workflow reference and is edited in place as the workflow evolves
(its new "Git and numbering" section carries the rules above). REDESIGN_PLAN.md
stays append-only history and the source of truth for product decisions —
copy, design, features. Where the two disagree on workflow mechanics, the
skill wins, and the divergence is fixed in the commit that reveals it.

### 8.60 Wayfinder — drop the 17+ rule; eligibility is school students and recent graduates (added 27 Aug 2026, owner-requested)

*(Planned in a parallel session as §8.58 and renumbered to §8.60 on merge,
per the §8.59 numbering rules — nothing else about it changed except Edit 5,
re-verified against the §8.58 admin refactor, and the new Edit 6.)*

Owner decision: the Wayfinder programme no longer requires applicants to
be 17 or older. Eligibility copy now says the programme is for **students
still in school or recent graduates**. This completes the §8.55-era
redesign of Wayfinder into a community outreach programme (the offline
parental permission form already exists for exactly this audience) and
supersedes the §8.28-era age rule wherever it appears.

**No new lower age bound is introduced.** Date of birth stays a required
field — it feeds the under-18 permission-form process, the admin view and
§8.58's age-on-event-night column — but no age is rejected. The server
keeps its date-validity (NaN) check. §8.58's `ageOnEventNight` helper
makes no 17+ assumption and needs no change; it is how staff will spot
minors who owe a permission form.

**The under-18 line is grounded in owner process, not invented:** the
owner's permission form states a student cannot be placed on a shift until
the signed form is held. The eligibility copy references that process.

#### Where the 17+ rule lives — all surfaces change

1. `src/components/wayfinder/WayfinderForm.tsx` — client-side age gate in
   `handleSubmit`.
2. `src/app/api/wayfinder/route.ts` — server-side age gate.
3. `src/app/(main)/wayfinder/page.tsx` — the "Open to graduating
   students" bullet.
4. The `level` select offers no school-student option, contradicting the
   new eligibility — a class-10 student cannot answer "Where you are in
   your studies". Labels are rewritten **without changing stored values**
   (`undergraduate_final` / `hsc_alevel` / `other` stay — the DB check
   constraint in `supabase-wayfinder.sql` allows only those three, so no
   migration and no SQL for the owner). Since §8.58, the single label map
   lives in `src/app/admin/wayfinderExport.ts` and feeds BOTH the admin
   display and the CSV export — one edit covers both. The offline PNG
   summary script carries its own copy and is updated to match. Historic
   rows adopt the new broader labels — accepted drift, recorded.

#### Files — six edits

**Edit 1 — `src/components/wayfinder/WayfinderForm.tsx`.** In
`handleSubmit`, delete the age gate. Replace:
```tsx
    setErrorMsg('')

    const dob = new Date(form.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    const isAtLeast17 = age > 17 || (age === 17 && (m > 0 || (m === 0 && today.getDate() >= dob.getDate())))
    if (!isAtLeast17) {
      setErrorMsg('Wayfinders must be 17 or older to apply.')
      setStatus('error')
      return
    }

    setStatus('submitting')
```
with:
```tsx
    setErrorMsg('')
    setStatus('submitting')
```

**Edit 2 — same file, the level select.** Replace:
```tsx
          <option value="">Select one</option>
          <option value="undergraduate_final">Final-year undergraduate</option>
          <option value="hsc_alevel">HSC / A-level finisher</option>
          <option value="other">Other</option>
```
with (school first — the primary audience now; values UNCHANGED):
```tsx
          <option value="">Select one</option>
          <option value="hsc_alevel">School student — SSC, HSC or A-levels</option>
          <option value="undergraduate_final">University student or recent graduate</option>
          <option value="other">Other</option>
```

**Edit 3 — `src/app/api/wayfinder/route.ts`.** Delete the age gate,
keep the validity check. Replace:
```ts
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    const isAtLeast17 = age > 17 || (age === 17 && (m > 0 || (m === 0 && today.getDate() >= dob.getDate())))
    if (!isAtLeast17) {
      return Response.json({ error: 'Wayfinders must be 17 or older to apply.' }, { status: 400 })
    }

    if (motivation.length > 600) {
```
with:
```ts
    if (motivation.length > 600) {
```
(The `const dob = new Date(dateOfBirth)` / NaN check directly above stays
exactly as it is.)

**Edit 4 — `src/app/(main)/wayfinder/page.tsx`.** Replace the bullet:
```ts
  {
    title: 'Open to graduating students',
    body: 'Final-year undergraduates and HSC or A-level finishers, 17 or older, are welcome to apply.',
  },
```
with:
```ts
  {
    title: 'Open to school students and recent graduates',
    body: 'Students still in school and recent graduates are welcome to apply. Applicants under 18 will be sent a parent or guardian permission form to return before their shift is confirmed.',
  },
```

**Edit 5 — `src/app/admin/wayfinderExport.ts`** (the §8.58 shared map;
`WayfinderTab.tsx` imports it — do NOT touch the tab). Replace:
```ts
export const LEVEL_LABEL: Record<WayfinderApplication['level'], string> = {
  undergraduate_final: 'Final-year undergraduate',
  hsc_alevel: 'HSC / A-level finisher',
  other: 'Other',
}
```
with:
```ts
export const LEVEL_LABEL: Record<WayfinderApplication['level'], string> = {
  undergraduate_final: 'University student or recent graduate',
  hsc_alevel: 'School student — SSC, HSC or A-levels',
  other: 'Other',
}
```

**Edit 6 — `scripts/wayfinders-png.py`.** Replace:
```python
LEVELS = {
    "undergraduate_final": "Undergraduate (final year)",
    "hsc_alevel": "HSC / A Level",
    "other": "Other",
}
```
with:
```python
LEVELS = {
    "undergraduate_final": "University student or recent graduate",
    "hsc_alevel": "School student — SSC, HSC or A-levels",
    "other": "Other",
}
```

#### Scope fences

- Date of birth stays required in the form and the API; only the age
  comparison goes.
- The §8.55 main-account checkbox, §8.42/§8.55 Instagram copy (including
  the `{' '}` on the success card — §8.54), the emergency-contact fields,
  the 600-char motivation limit, and the graduation-year 2026–2032 bounds
  are untouched.
- §8.58's admin search/filters/exports and `ageOnEventNight` are
  untouched beyond the LEVEL_LABEL values in Edit 5.
- No schema change; `supabase-wayfinder.sql` and the level check
  constraint are untouched. No SQL for the owner.
- First Pulse, the FAQ, the confirmation email, and the admin API routes
  are untouched (none mention the age rule — verified by grep).

#### Reversibility

Re-add the two deleted age blocks verbatim from this section's
"Replace" excerpts, and restore the four label/copy blocks. No data
change.

#### Verification gates (executor)

- §4: `npx tsc --noEmit`; `npm run lint` (baseline 7 errors / 9
  warnings); `npm run build`.
- Regression greps:
  - `grep -rn "isAtLeast17" src/` → **0 matches**
  - `grep -rn "17 or older" src/` → **0 matches**
  - `grep -c "School student — SSC, HSC or A-levels" src/components/wayfinder/WayfinderForm.tsx` → **1**
  - `grep -c "School student — SSC, HSC or A-levels" src/app/admin/wayfinderExport.ts` → **1**
  - `grep -c "School student — SSC, HSC or A-levels" scripts/wayfinders-png.py` → **1**
  - `grep -c "permission form" 'src/app/(main)/wayfinder/page.tsx'` → **1**
- Dev server on port 3100, Playwright at 375×812 and 1280×800 on
  `/wayfinder`:
  - Page contains "Open to school students and recent graduates" and the
    under-18 sentence.
  - The `#wf-level` select's option labels are, in order: "Select one",
    "School student — SSC, HSC or A-levels", "University student or
    recent graduate", "Other" — and option VALUES are unchanged
    (`hsc_alevel`, `undergraduate_final`, `other`).
  - `scrollWidth - clientWidth === 0`.
- **Do NOT submit the form** (writes a real Supabase row and sends
  email). The removal of the client gate is verified by grep, not by
  submitting an under-17 date of birth.

### 8.61 Admin Wayfinder — explicit sort control, newest first (added 31 Aug 2026, owner-requested)

Owner asked for a way to sort the admin Wayfinder list by latest added.

**Finding first: the list is already newest-first, and always has been.**
`src/app/api/admin/wayfinder/route.ts:29` fetches with
`.order('created_at', { ascending: false })`, the tab applies no client-side
`.sort()` at all, and `Array.prototype.filter` preserves order — so the
rendered list is already latest-added-first. `fetchApplications()` re-runs
after every status and shift change, so the order is re-derived from the
API each time and never drifts. Nothing is broken.

What is missing is that the ordering is **invisible and fixed**: nothing on
screen says how the list is ordered, and there is no way to reverse it.
Oldest-first is the genuinely useful companion — it is the order for working
a backlog first-come-first-served, which is how a volunteer intake queue is
normally cleared fairly.

**This amendment changes no default.** On load the control reads
"Newest first" and the list renders exactly as it does today; the only new
behaviour is the owner being able to flip it.

**Exports inherit the sort.** `handleDownloadCsv` and `handleCopyJson` both
build from `filtered` (lines 102 and 106), so sorting `filtered` means the
CSV and JSON come out in the chosen order too. That is intended — a
backlog-ordered export is the point of the oldest-first option.

#### Files — one edit, three hunks, all in `src/app/admin/WayfinderTab.tsx`

**Hunk 1 — the type.** Directly after the `SELECT_STYLE` block (currently
ends line 25), add:
```ts
type SortOrder = 'newest' | 'oldest'
```

**Hunk 2 — the state.** After the `columnSet` state line (currently line 37,
`const [columnSet, setColumnSet] = useState<ColumnSet>('everything')`), add:
```ts
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
```

**Hunk 3 — the sort.** Replace the `filtered` line (currently line 89):
```ts
  const filtered = applications.filter((a) => a.status === activeTab && matchesFilters(a))
```
with:
```ts
  const filtered = applications
    .filter((a) => a.status === activeTab && matchesFilters(a))
    .sort((a, b) => {
      const delta = Date.parse(b.created_at) - Date.parse(a.created_at)
      if (Number.isNaN(delta)) return 0
      return sortOrder === 'newest' ? delta : -delta
    })
```
`filter` already returns a fresh array, so sorting it never mutates
`applications`. `created_at` is typed non-null
(`wayfinderExport.ts:24`) and the column carries `default now()`, but the
`Number.isNaN` guard is required anyway: a single unparsable value would
otherwise make the whole comparator inconsistent and leave the list in an
arbitrary order rather than merely misplacing one row. Ties keep API order —
`Array.prototype.sort` is stable in every supported engine.

**Hunk 4 — the control.** In the export toolbar row (the
`<div className="flex gap-2 mb-6 flex-wrap items-center">` currently at line
185), insert this as the FIRST child, directly before the existing
`columnSet` select:
```tsx
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} className="text-sm px-3 py-2 rounded-full cursor-pointer" style={SELECT_STYLE}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
```
It reuses `SELECT_STYLE` and the exact class list of the three existing
filter selects, so it needs no new styling and inherits `touchAction:
'manipulation'` per §1.

#### Scope fences

- `src/app/api/admin/wayfinder/route.ts` is untouched — the API keeps its
  `created_at` descending order, which remains the source order the
  "Newest first" default reproduces.
- `src/app/admin/wayfinderExport.ts` is untouched: sorting happens on
  `filtered` before `exportRows` is called, so no export code changes.
- The §8.58 search, gender/level/shift filters, column sets, status tabs and
  the accepted-shift counters are untouched.
- No sort by name, institution or age is added (see rejected, below).
- No schema change, no API change, no new dependency.

#### Considered and rejected

- **Sorting by name, age or institution.** A general multi-key sort is a
  bigger control and a different request; the owner asked for latest-added.
  Recorded for a future amendment if the queue grows enough to need it.
- **Sorting inside the API instead.** The order would then be fixed per
  fetch and every toggle would round-trip to Supabase; the list is already
  fully client-side filtered, so sorting belongs in the same place.
- **A sort toggle button instead of a select.** The toolbar already speaks
  in selects (column set, gender, level, shift); a lone toggle button would
  read as an action, not a state.

#### Reversibility

Delete the `SortOrder` type, the `sortOrder` state line and the new
`<select>`, and restore the one-line `filtered` assignment.

#### Verification gates (executor)

- §4: `npx tsc --noEmit`; `npm run lint` (baseline 7 errors / 9 warnings);
  `npm run build`.
- Source gates:
  - `grep -c "type SortOrder" src/app/admin/WayfinderTab.tsx` → **1**
  - `grep -c "Newest first" src/app/admin/WayfinderTab.tsx` → **1**
  - `grep -c "Oldest first" src/app/admin/WayfinderTab.tsx` → **1**
  - `grep -c "order('created_at', { ascending: false })" src/app/api/admin/wayfinder/route.ts` → **1**
    (the API ordering must remain untouched)
- `/admin` is behind `ADMIN_EMAILS` auth, so a browser smoke test of the
  live list is NOT possible in a dev session without credentials. Verify the
  comparator in isolation instead, with a throwaway Node script (delete it
  afterwards; do not commit it): build an array of four objects whose
  `created_at` values are `2026-09-01T10:00:00Z`, `2026-09-04T09:00:00Z`,
  `2026-09-02T12:00:00Z` and an unparsable `"not-a-date"`, apply the Hunk 3
  comparator with `sortOrder = 'newest'` and assert the three valid dates
  come out 4 Sep, 2 Sep, 1 Sep; repeat with `'oldest'` and assert 1 Sep,
  2 Sep, 4 Sep; in both runs assert the array still has four entries and no
  exception is thrown.
- Confirm by reading the diff that the export handlers were not edited and
  still call `exportRows(filtered, columnSet)`.

### 8.62 Admin Wayfinder — batch status and shift actions (added 31 Aug 2026, owner-requested)

Owner asked to batch approve applicants and batch assign shifts on the admin
Wayfinder page. Today every action is per-card: accepting forty applicants
is forty clicks and forty refetches.

**Independent of §8.61.** That amendment adds a sort control to the same
file but touches different anchors (the `SELECT_STYLE` block, the
`columnSet` state, the `filtered` assignment, and the export toolbar's first
child). Every anchor below is identified by content, not line number, so
§8.62 applies cleanly whether §8.61 has been executed or not, in either
order. Sorting changes order, never membership, so selection is unaffected
by it.

#### The API takes ids in bulk — one query, not N requests

`PATCH /api/admin/wayfinder` currently updates one row via
`.eq('id', applicationId)`. Looping it client-side would mean forty
round trips and a half-applied batch if one failed midway. Instead the route
accepts an optional `applicationIds` array and switches to `.in('id', ids)`
— a single Supabase update, so a batch either lands or does not. The
existing `applicationId` field keeps working unchanged, so the per-card
buttons need no edit.

#### Selection rules — settled

- Selection is a `Set<string>` of application ids, held in the tab.
- **Selection clears whenever the visible set changes** — on a status-tab
  switch and on any change to the search box or the gender/level/shift
  filters. This is the one rule that prevents the dangerous case: acting on
  rows that were selected under a previous filter and are no longer on
  screen. The cost is that narrowing then re-widening loses the selection;
  that is the accepted trade.
- Clearing is done in the change handlers, NOT in a `useEffect`. An effect
  that calls `setState` would trip `react-hooks/set-state-in-effect`, which
  is already suppressed once in this file for the mount fetch; adding a
  second suppression to work around a lint rule is worse than calling the
  helper in five handlers.
- Select-all selects exactly the currently filtered rows. The checkbox is
  checked when every filtered row is selected; no indeterminate state (it
  would need a ref for one cosmetic detail).

#### Confirmation and failure

- Every batch action goes through `window.confirm` first, with this exact
  copy, `label` being the button's own word and the plural switching on
  count: `Apply "<label>" to <N> application(s)?` — implemented as
  `` `Apply "${label}" to ${ids.length} application${ids.length === 1 ? '' : 's'}?` ``.
  A mis-aimed batch reject is the worst outcome here and one dialog prevents it.
- On a non-OK response the bar shows the server's `error`, or
  `Could not apply that change. Nothing was updated.` — accurate because
  `.in()` is a single statement. The list is NOT refetched on failure, so
  the selection survives for a retry.
- Both action groups (status and shift) show on every status tab, matching
  the per-card buttons, which are already unrestricted by tab.

#### Files — two files

**Edit 1 — `src/app/api/admin/wayfinder/route.ts`.** In `PATCH`, replace:
```ts
  const { applicationId, status, assignedShift } = await req.json()

  if (!applicationId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
```
with:
```ts
  const { applicationId, applicationIds, status, assignedShift } = await req.json()

  const ids: string[] = Array.isArray(applicationIds)
    ? applicationIds
    : applicationId ? [applicationId] : []

  if (ids.length === 0 || ids.length > 200 || ids.some((id) => typeof id !== 'string' || id === '')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
```
and replace:
```ts
    .update(update)
    .eq('id', applicationId)
```
with:
```ts
    .update(update)
    .in('id', ids)
```
The 200 cap is a guard against a malformed or hostile payload; the whole
programme is 50 places, so it is never reached in normal use.

**Edit 2 — `src/app/admin/WayfinderTab.tsx`, six hunks.**

2a. After `const [copied, setCopied] = useState(false)` add:
```ts
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchError, setBatchError] = useState('')
```

2b. After the closing brace of `handleShift` and before
`const q = query.trim().toLowerCase().replace(/^@/, '')` add:
```ts
  const clearSelection = () => {
    setSelectedIds(new Set())
    setBatchError('')
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setBatchError('')
  }

  const runBatch = async (
    payload: { status?: Application['status']; assignedShift?: 'dusk' | 'dawn' },
    label: string,
  ) => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    if (!window.confirm(`Apply "${label}" to ${ids.length} application${ids.length === 1 ? '' : 's'}?`)) return
    setBatchLoading(true)
    setBatchError('')
    const res = await fetch('/api/admin/wayfinder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationIds: ids, ...payload }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setBatchError(json.error ?? 'Could not apply that change. Nothing was updated.')
      setBatchLoading(false)
      return
    }
    await fetchApplications()
    setSelectedIds(new Set())
    setBatchLoading(false)
  }
```

2c. Directly after the `const filtered = ...` assignment (whatever its
current form — §8.61 may have made it multi-line) add:
```ts
  const allVisibleSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id))
```

2d. Clear selection from the five controls that change the visible set.
Replace `onClick={() => setActiveTab(tab)}` with:
```tsx
            onClick={() => { setActiveTab(tab); clearSelection() }}
```
Replace `onChange={(e) => setQuery(e.target.value)}` with:
```tsx
              onChange={(e) => { setQuery(e.target.value); clearSelection() }}
```
Replace `onChange={(e) => setGenderFilter(e.target.value)}` with:
```tsx
            onChange={(e) => { setGenderFilter(e.target.value); clearSelection() }}
```
Replace `onChange={(e) => setLevelFilter(e.target.value)}` with:
```tsx
            onChange={(e) => { setLevelFilter(e.target.value); clearSelection() }}
```
Replace `onChange={(e) => setShiftFilter(e.target.value)}` with:
```tsx
            onChange={(e) => { setShiftFilter(e.target.value); clearSelection() }}
```

2e. The batch bar. Inside the `{!loading && applications.length > 0 && (<>…</>)}`
fragment, insert this as the LAST child — after the export toolbar `</div>`
and immediately before the closing `</>`:
```tsx
          {filtered.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap items-center rounded-2xl px-4 py-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'rgba(255,255,255,0.65)', touchAction: 'manipulation' }}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() => setSelectedIds(allVisibleSelected ? new Set() : new Set(filtered.map((a) => a.id)))}
                  style={{ accentColor: 'var(--accent-magenta)', width: 16, height: 16, touchAction: 'manipulation' }}
                />
                Select all {filtered.length}
              </label>
              {selectedIds.size > 0 && (
                <>
                  <span className="text-sm" style={{ color: '#fff' }}>{selectedIds.size} selected</span>
                  {STATUS_TABS.filter((s) => s !== activeTab).map((s) => (
                    <button
                      key={s}
                      onClick={() => runBatch({ status: s }, s)}
                      disabled={batchLoading}
                      className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold capitalize"
                      style={{ background: STATUS_STYLE[s].bg, border: STATUS_STYLE[s].border, color: STATUS_STYLE[s].color, touchAction: 'manipulation' }}
                    >
                      {s}
                    </button>
                  ))}
                  {(['dusk', 'dawn'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => runBatch({ assignedShift: s }, `assign ${SHIFT_LABEL[s]}`)}
                      disabled={batchLoading}
                      className="text-xs px-3 py-1.5 rounded-full cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.65)', touchAction: 'manipulation' }}
                    >
                      assign {SHIFT_LABEL[s]}
                    </button>
                  ))}
                  <button
                    onClick={clearSelection}
                    disabled={batchLoading}
                    className="text-xs px-3 py-1.5 rounded-full cursor-pointer"
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.5)', touchAction: 'manipulation' }}
                  >
                    clear
                  </button>
                </>
              )}
              {batchLoading && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>working…</span>}
              {batchError && <span className="text-xs" style={{ color: '#e24b4a' }}>{batchError}</span>}
            </div>
          )}
```

2f. The per-card checkbox. Inside each card's header, as the FIRST child of
`<div className="flex items-center gap-3 flex-wrap">` — directly before the
`{app.reference_code}` span — insert:
```tsx
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggleSelected(app.id)}
                      aria-label={`Select ${app.reference_code}`}
                      style={{ accentColor: 'var(--accent-magenta)', width: 16, height: 16, touchAction: 'manipulation' }}
                    />
```

#### Noted, not fixed here — stale level labels in the filter dropdown

§8.60 relabelled `LEVEL_LABEL` in `wayfinderExport.ts` believing the shared
map covered every admin surface. It does not: the level FILTER `<select>` in
`WayfinderTab.tsx` carries its own hardcoded option text, so it still reads
"Final-year undergraduate" and "HSC / A-level finisher" while the card body
directly beneath renders the new labels from the map. Cosmetic, wrong, and
out of scope for a batch-actions amendment. The fix is to replace those two
option labels with "University student or recent graduate" and "School
student — SSC, HSC or A-levels". Left for the owner to schedule.

#### Scope fences

- No schema change, no new dependency, no change to the GET handler or its
  `created_at` ordering.
- The per-card status and shift buttons, `handleAction`, `handleShift`,
  `actionLoading`, the export handlers, `wayfinderExport.ts` and the
  §8.58 filters are untouched.
- The stale filter labels above are NOT corrected in this amendment.
- First Pulse, the public Wayfinder form and the public API are untouched.

#### Reversibility

Revert the two API hunks to `applicationId` / `.eq('id', applicationId)`,
and delete the three state lines, the three helpers, `allVisibleSelected`,
the batch bar, the card checkbox, and the five `clearSelection()` calls.

#### Verification gates (executor)

- §4: `npx tsc --noEmit`; `npm run lint` (baseline 7 errors / 9 warnings —
  a NEW `react-hooks/set-state-in-effect` error means the clearing logic
  was put in an effect instead of the handlers); `npm run build`.
- Source gates:
  - `grep -c "applicationIds" src/app/api/admin/wayfinder/route.ts` → **2**
  - `grep -c "\.in('id', ids)" src/app/api/admin/wayfinder/route.ts` → **1**
  - `grep -c "eq('id', applicationId)" src/app/api/admin/wayfinder/route.ts` → **0**
  - `grep -c "clearSelection()" src/app/admin/WayfinderTab.tsx` → **6**
    (five control handlers plus the bar's own clear button)
  - `grep -c "runBatch(" src/app/admin/WayfinderTab.tsx` → **3**
    (the definition plus the two call sites in the bar)
  - `grep -c "window.confirm" src/app/admin/WayfinderTab.tsx` → **1**
- `/admin` sits behind `ADMIN_EMAILS`, so the live list cannot be smoke
  tested in a dev session. Verify the id-normalisation branch in isolation
  with a throwaway Node script (delete it after; do not commit): run the
  Edit 1 normalisation over five payloads — `{applicationId: 'a'}`,
  `{applicationIds: ['a','b']}`, `{}`, `{applicationIds: []}` and
  `{applicationIds: ['a', 7]}` — and assert the first yields `['a']`, the
  second `['a','b']`, and the last three are all rejected by the guard.
- Read the diff and confirm `handleAction` and `handleShift` still send
  `applicationId` (singular), proving the per-card path is untouched.

### 8.63 The plan-amend skill retired from this repo (owner request, 3 Sep 2026)

`.claude/skills/plan-amend/SKILL.md` is deleted. Both this repo and `afterhours` shipped a skill by that name, and a two-repo session could load either one depending on which the harness surfaced — it surfaced this repo's copy at least once, silently shadowing the other project's numbering, laws, and companion-file rules. The owner's fix: one copy only. `afterhours/.claude/skills/plan-amend/SKILL.md` is now the account's sole `plan-amend` skill.

**What this means for future work here:** a "plan amend" request against this repo has no skill to invoke. §8.59's "Doc authority, from today" line above (pointing at the now-deleted file) is superseded by this entry, not edited — this repo's own two-model workflow (Fable plans, Sonnet executes, §8.x numbering, the git-safety rules in that old §8.59 entry) is retired along with the skill. §0.7, §2, §4 and the rest of this plan remain the design/product source of truth exactly as before; only the *planning ritual* — the skill that turned an owner request into an executor-grade `§8.x` spec — is gone from this repo. If planning work resumes here, either re-author a repo-scoped skill or route the request through `afterhours`'s copy by hand.
