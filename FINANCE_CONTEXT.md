# SONIC PULSE — FINANCE CONTEXT

A self-contained brief for the finance/accounting session that maintains the
Sonic Pulse budget workbook (expenses, forecasts, commitments). Written 5 Aug
2026; the festival is ~7 weeks out. Figures marked **KNOWN** are committed or
published; anything marked **OPEN** has no number yet — treat OPEN items as
budget lines to be filled by the owner, never invent or assume values.

Currency: Bangladeshi Taka (BDT, ৳). The owner sometimes writes South Asian
notation (1,00,000 = 100,000). Companion file: `EVENT_CONTEXT.md` describes
the physical event in detail.

## 1. The event

Sonic Pulse — Bangladesh's first sunset-to-sunrise music festival, organised
by **Dhaka Music Festival** (Instagram @dhakamusicfestival; festival account
@sonicpulsefestival; site sonicpulsefestival.com). One night: Friday 25
September 2026, 4:00 PM through 9:30 AM Saturday — 17.5 continuous hours.
Dhaka; **venue TBA (OPEN — likely the single largest unbooked cost)**.
Capacity **800+ attendees**, **open to all ages** (strict 18+ removed 13 Aug 2026), ID-verified entry — NID, passport or birth certificate. Two stages running
in sequence: Main Stage (4 PM – 4:30 AM) and Sunrise Stage (4:30 – 9:30 AM).

## 2. Revenue

### Ticket tiers (KNOWN — published pricing, currently hidden behind a
feature flag until sales open; three phases, phase 1 current)

| Tier | Web price | In-app price (Afterhours app) |
| --- | --- | --- |
| PULSE (phase 1) | ৳5,500 | ৳4,500 |
| RHYTHM (phase 2) | ৳6,500 | ৳5,500 |
| CRESCENDO (phase 3 / VIP) | ৳7,500 | ৳6,500 |

- App purchases carry a flat ৳1,000 discount by design.
- Max 4 tickets per order. Tickets non-refundable, non-transferable; if the
  event is cancelled for reasons outside the organiser's control, tickets
  carry over to the next edition (a deferred-liability point, not a refund).
- Revenue envelope at 800 paid: ৳36–60 lakh depending on tier/channel mix
  (800 × 4,500 to 800 × 7,500). Not all 800 will be paid — see barter
  tickets below.
- **Payment rails: OPEN.** The registration flow emails "payment
  instructions" after manual approval; the processor/method (bKash, bank,
  card) and its fees are not recorded anywhere in the project.
- Other potential revenue — **all OPEN, none committed**: sponsorships,
  Bazaar of Echoes stall fees, Feast Quarter vendor fees, bar revenue or
  concession splits, merch. No numbers exist for any of these.

### Non-cash / barter
- **Creator programme:** free tickets in exchange for content coverage
  (media passes). Each pass is forgone ticket revenue at face value. Volume
  OPEN — recruitment was interrupted (see §7 risk) and is moving to an
  inbound application model.
- **First Pulse:** two open-call artists win the 4–7 PM opening slots.
  Whether winners are paid a fee or receive tickets/hospitality only: OPEN.

## 3. Committed vendor contract (KNOWN — the installation & stage builder)

One vendor is contracted (contract drafted in a separate session) for six of
the nine art installations — COILGATE (entrance serpent arch), GLOWTIDE
(jellyfish walkway), MYCELIA (five overhead mushroom canopies), EMBERHART
(monumental stag), CHROMA (climbable beast), THE EMPTY THRONE (climbable
chair) — plus the **Main Stage build (seven pillars, tallest ~40 ft, per
agreed blueprint)**.

| Line | Amount |
| --- | --- |
| Artist fee, 6 installations | **৳220,000** |
| Main Stage build fee | **৳100,000** |
| Additional workers (installations), vendor-supplied | **৳60,000** |
| Additional workers (Main Stage) | **OPEN — explicitly TBD in contract** |
| Materials (installations + stage) | **Owner-borne, OPEN** — vendor submits itemised material specs; owner purchases. No estimate exists yet. This is a major unbudgeted line. |

- Delivery deadline: all six installations completed and delivered by
  **20 September 2026** (five days before the event). Timely delivery and
  professional quality are contractual termination grounds.
- **Exclusivity commitment (recurring, post-event):** the vendor is bound as
  exclusive installation provider until **end of 2028**; in return the
  organiser commits to giving them **work every 4 months**. If no work is
  provided within 6 months after Sonic Pulse, exclusivity lapses. Finance
  implication: a standing ~3×/year procurement obligation through 2028
  should appear in forecasts.

## 4. Known remaining physical scope (all OPEN — no vendor, no numbers)

- The other three Echoes: EVENT HORIZON (portal-of-light dressing), CLOUD
  NINE (nine guest-rated net bays), ICARUS (monumental kite, deliberately
  burned at midnight — a consumable build plus burn-crew/fire-safety cost).
- Three additional Echoes — SWAYBLOOM (four swings), OVERSTORY (canopy
  net), SHOAL (fish-light pyramid): vendor engaged, terms **OPEN**.
- Production: sound systems for two stages, stage/production lighting, UV
  rigs, all installation power and distribution, generators/redundancy for
  17.5 continuous hours.
- Activities infrastructure: STYX lit boats + lake operation, NEON LAGOON
  pool operation, EMBER RITES fire performers, STARSIDE telescopes/guide,
  WARPAINT UV artists and paint, bazaar and feast-lane build-out.
- Operations: venue rental, security (ID-checked entry, overnight), gate
  staff, medical, sanitation, drinking water, weather contingency (event
  proceeds in light rain), insurance, permits (event, fire — the midnight
  burn — and possibly drone), cleaning/strike, artist fees for the six
  named headliners (Izhaqo, Vampbetch, Psytaraa, Drip, Rii, Fly on the
  Wall) plus resident selectors and the Night Rituals/Starside programme.
- Media: a **videography quotation is currently under evaluation (OPEN)**;
  photography and aftermovie deliverables unassigned.

## 5. Digital & recurring overhead (small but real; exact billing OPEN)

Website on Vercel (Next.js), database/auth on Supabase, transactional email
via Resend, domain + email forwarding on Namecheap (hello@, press@, support@
forward to a personal inbox; a paid mailbox is a future decision), and a
possible Meta Verified subscription for Instagram trust signals (under
consideration, not committed). The companion Afterhours app runs on separate
infrastructure and is not a Sonic Pulse cost, but its ৳1,000 app discount
affects ticket yield (see §2).

## 6. Programme (context for artist-fee and scheduling lines)

4:00–7:00 PM First Pulse ×2 (open-call winners) · 7:00–8:30 Fly on the Wall ·
8:30–10:00 Izhaqo · 10:00–11:30 Vampbetch · 11:30 PM–3:00 AM Night Rituals
(Ember Rites peak; THE GREAT BURN at midnight) · 3:00–4:30 Psytaraa ·
4:30–6:30 Starside Hours · 6:30–8:00 Drip · 8:00–9:30 Rii.

## 7. Risks with financial edges

- **Venue unbooked** ~7 weeks out — cost, deposit and permit chain all flow
  from this single decision.
- **Materials cost unbounded** until the vendor's itemised specs arrive —
  the ৳380,000 of committed fees is labour only.
- **Creator-acquisition channel disrupted:** the @dhakamusicfestival account
  is under a Meta messaging restriction to 2 Sep 2026 (appeal pending);
  promotion may need paid boosts as a fallback (OPEN).
- **The Great Burn** (deliberate midnight bonfire of a monumental piece) and
  two climbable installations carry insurance/permit costs that generic
  event budgets miss.
- **Ticket sales not yet open** while pricing is published-but-hidden —
  every week of delay compresses the sales window before 25 Sep.

## 8. Working rules for the finance session

- Never fabricate a number for an OPEN line — enter it as a named line with
  amount blank/flagged, and ask the owner.
- Distinguish committed (contracted), published (ticket prices), and
  estimated values in the workbook; keep barter tickets visible as forgone
  revenue rather than zero-cost.
- Currency is BDT throughout; if the workbook mixes lakh notation and
  standard notation, normalise to one and note the convention.
- The festival is a single night: there is no "day 2" anywhere — any
  multi-day assumption in a forecast is an error.
