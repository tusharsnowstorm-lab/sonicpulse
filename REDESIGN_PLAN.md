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
