# SonicPulse → Afterhours sign-in handoff (for the SonicPulse web session)

Written by the Afterhours canonical session, 18 Aug 2026, the night before
registration opens. This is everything the SonicPulse website needs to do —
and know — to point its sign-in/ticket links at Afterhours cleanly. Facts
below were read from the live Afterhours production database and codebase
tonight, not from memory.

## 1. The links (use these exactly)

- **Sign in / register:**
  `https://www.onlyafterhours.com/tonight?auth=1`
  Opens the app on its feed with the sign-in sheet already open. Supports
  `&next=<url-encoded path>` to land somewhere specific after auth.
- **Straight to SonicPulse tickets (recommended for all "Get tickets" CTAs):**
  `https://www.onlyafterhours.com/events/sonicpulse-festival-26`
  The event page's own Get-tickets button opens sign-in automatically for
  signed-out visitors and returns them to checkout after — deep-linking here
  beats the generic sign-in link because nobody has to find the event.
- There are NO other linkable surfaces (no per-tier links, no /signup page —
  auth is a sheet, not a page). Always use `www.` (bare domain 308-redirects).

## 2. Sign-in methods a guest will see

Google · Apple · email magic link. Passwordless — there is no password to
create, so SP copy should never say "create an account with a password."
Magic-link sends have a per-address 60s cooldown (the UI explains it and
counts down); Google is the fastest path and safe to recommend in SP copy.

## 3. What buying on Afterhours involves (so SP copy sets expectations)

1. Sign in → open the SonicPulse event → pick a tier → the app holds the
   order and shows **bKash payment instructions** (send to the organizer's
   bKash number, then submit the TrxID in-app). Payment is manual-confirm at
   launch — the organizer matches the TrxID and the ticket mints.
2. **Identity verification before the gate:** full name, Bangladesh phone
   (+880, OTP via WhatsApp or SMS), ID type + number (NID / passport / birth
   certificate), an ID document photo, and a portrait photo. Same
   requirements the SP site's own apply flow had — guests re-enter them in
   Afterhours (the two systems' databases are separate; nothing migrates
   automatically).
3. One ticket per person per event; extra tickets for friends are their own
   accounts + transfers (in-app, re-verified). The ticket is a QR pass in
   the app wallet — no PDFs, no downloads.

## 4. Tier names and prices (state of the Afterhours DB tonight)

| Afterhours tier | Price | Status |
|---|---|---|
| Early Bird | ৳5,800 | on sale |
| Phase 2 | ৳6,800 | locked |
| Final Phase | ৳7,800 | locked |

FINAL (owner-ratified 18 Aug, prices re-set same day): these are the app's
tier names and prices. **The SP website keeps ALL prices hidden — do not put
any ticket price, tier price, or "from ৳X" figure anywhere on the SP site or
in SP social copy.** The app's event page is the only price surface; SP copy
says "tickets in the Afterhours app" and links, nothing more. The old
website-price-minus-৳1,000 scheme is dead — never revive those numbers. The
PULSE/RHYTHM/CRESCENDO lockups stay SP-side branding only; if SP copy pairs
them with app tiers it names the tier ("PULSE — Early Bird in the app") with
NO price attached. Also final: the app catalogue shows ONLY SonicPulse (the
demo events are gone), and the event runs Fri 4:00 PM → Sat 9:30 AM, doors
3:30 PM.

## 5. Things the SP site must NOT do

- **Do not keep its own ticket application open once Afterhours links go
  live** — two parallel ticketing paths for one event means two ticket
  registries and split-brain at the gate. `TICKETS_LIVE = false` on the SP
  side should stay false; SP sells the dream, Afterhours sells the ticket.
- Do not promise "your SonicPulse website account works in Afterhours" —
  separate Supabase projects, separate accounts (confirmed decision,
  REDESIGN_PLAN §8.14). A guest signs up fresh in Afterhours (same email is
  fine and recommended, but it is a new account).
- Do not publish the organizer bKash number on the SP site — the app shows
  it inside checkout, tied to a held order + reference code.
- Do not quote gate times SP-side that contradict the app's event page. The
  app currently shows gates 4:00 PM / doors 3:30 PM, Fri 25 Sept.

## 6. Support and escalation

Anything broken in sign-in or checkout: support@onlyafterhours.com. Do not
debug in public replies; route guests there. The Afterhours side is operated
through the owner's canonical session — feature requests and copy changes go
through the owner, not directly between sessions.
