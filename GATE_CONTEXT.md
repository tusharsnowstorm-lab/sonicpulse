# SONIC PULSE — GATE SCANNING CONTEXT (for the Afterhours build)

A self-contained brief on the gate/entry system currently live on the Sonic
Pulse website (sonicpulsefestival.com), written for the session building the
same functionality into **Afterhours**, the ticketing app. Everything here is
sourced from the website codebase (repo `tusharsnowstorm-lab/sonicpulse`) as
of 18 Aug 2026 — file paths below point into that repo. Names in CAPS lockups
are locked — never rename, translate or paraphrase them.

## 1. Owner decisions driving this handoff

- **Afterhours becomes the ticketing platform.** All guests will log in to
  Afterhours from the Sonic Pulse website; ticketing and gate scanning move
  to (or are replicated in) the app. App tier names/prices are owned by
  Afterhours (Early Bird / Phase 2 / Final Phase); the old
  website-price-minus-৳1,000 scheme is dead and its fields were removed
  from the codebase (§8.39). SP shows no prices.
- **The app must keep track of who's in and who's out** — the entry/exit
  presence model below is the heart of the system, and a live "currently
  inside" count is the natural extension the website never built.
- **Gate staff need logins** (or an equivalent — the owner is open to better
  options than the website's env-var email allowlist, e.g. proper staff
  roles/accounts; see §4 and §8).
- The website and Afterhours currently run **SEPARATE Supabase projects**
  (confirmed 30 Jul 2026, REDESIGN_PLAN.md §8.14;
  `AFTERHOURS_SHARED_ACCOUNT_LIVE = false` in `src/data/auth.ts`). Unifying
  auth is an open decision — see §9.

## 2. Event facts that shape the gate

- One single night: **Friday 25 September 2026, gates 4:00 PM**, running
  continuously to 9:30 AM Saturday — 17.5 hours. (One email template wrongly
  says 3:00 PM — see §10 Known bugs.)
- Capacity 800+, **all ages** (18+ rule removed 13 Aug 2026), Dhaka; venue
  announced to ticket holders.
- **ID-verified entry**: NID, passport or birth certificate. Every ticket
  carries the holder's ID number and an uploaded ID document image.
- **Single entrance** through an installation arch (COILGATE) — one gate
  location, but multiple staff phones may scan simultaneously.
- Mostly-outdoor venue, ~14 hours of darkness — assume poor lighting and
  possibly weak connectivity at the gate (the website assumed online-only;
  see §8 for what Afterhours should do better).

## 3. The ticket lifecycle (what the gate depends on)

Source: `src/app/api/tickets/route.ts` (apply), `src/app/api/admin/tickets/route.ts`
(approve/reject), `src/app/api/tickets/transfer/route.ts` (transfer),
`src/components/dashboard/TicketCard.tsx` (guest-side ticket + QR).

1. **Apply** — a signed-in guest submits: full name, phone, ID type
   (`nid` | `passport` | `birth_certificate`), ID number, ID document file
   (JPG/PNG/PDF ≤ 5 MB, stored in private bucket `nid-documents`), Instagram
   handle, gender (`male` | `female`), tier. Ticket is created with
   `status: 'pending'` and a fresh **reference code**.
   - Validation: NID = 10 or 17 digits; passport = 5–20 chars; birth
     certificate = 8–20 digits.
   - **One ticket per ID number+type** across the whole system (409 on
     duplicate). One "for myself" ticket per account; extra tickets must be
     for other people.
2. **Review** — admins (env `ADMIN_EMAILS` allowlist) approve or reject from
   `/admin`. Approval fires an email. **Rejected is shown to the holder as
   "Processing"** — a deliberate soft label, never surface the word
   "rejected" to guests.
3. **Approved** — the guest can download their ticket (client-rendered HTML)
   ONLY once they've added a profile photo. The photo is the gate's primary
   identity check (see §6).
4. **Transfer** — holder can hand the ticket to a new person (new name,
   phone, ID, document, gender, Instagram). Status resets to `pending` for
   re-approval; the slot is preserved; rejected tickets can't transfer.
   Public ticket copy says "strictly non-transferable" — transfers exist but
   only through this vetted re-approval flow, never informally at the gate.
5. **Media/influencer passes** exist too (approved via `/admin`, get a
   reference code by email, no payment) — they go through the same gate flow.

**Tiers** (`src/data/tickets.ts`): `phase1` **PULSE** ৳5,500 (app ৳4,500),
`phase2` **RHYTHM** ৳6,500 (app ৳5,500), `phase3` **CRESCENDO** ৳7,500 (app
৳6,500). Perks differ (RHYTHM = priority entry + lounge; CRESCENDO = VIP
entry + stage-side deck) — the gate currently does NOT branch on tier beyond
displaying it; priority/VIP entry is handled by humans at the gate line.
`TICKETS_LIVE = false` is the current master switch hiding all public ticket
surfaces on the site.

## 4. Roles and authentication (website implementation)

Auth backend: Supabase (`@supabase/ssr` cookie sessions). Login page
(`src/app/login/`) supports Google OAuth, Apple OAuth (flag-gated,
`APPLE_SIGNIN_LIVE = false` until the provider is configured — the plan notes
Apple can reuse the existing **Afterhours Services ID**), and email+password.
Public sign-in is currently hidden site-wide (`SIGNIN_LIVE = false`) but
**gate-staff login is deliberately unaffected** — staff go to `/login`
directly.

Three effective roles, all keyed on the signed-in user's email:

- **Guest** — any authenticated user; sees own tickets/dashboard only.
- **Gate staff** — email is in env `GATE_STAFF_EMAILS` (comma-separated,
  case-insensitive; `src/lib/gate-auth.ts` → `isGateStaff()`). Grants: the
  `/gate` scanner page, the staff view of `/verify/<ref>`, and POST
  `/api/gate/scan`.
- **Admin** — email in env `ADMIN_EMAILS`; ticket approval, not gate scanning
  (separate lists; an admin is not automatically gate staff).

There are no per-staff accounts, shifts, or gate assignments — just the
allowlist. Every scan does record **which staff email** performed it.

## 5. Data model (the two tables that matter)

- **`user_tickets`** — one row per ticket. Fields used by the gate:
  `id` (uuid), `user_id`, `user_email`, `full_name`, `phone`, `nid_number`,
  `id_type`, `nid_file_path` (path in private `nid-documents` bucket),
  `instagram_handle`, `gender`, `ticket_tier`, `status`
  (`pending` | `approved` | `rejected`), `reference_code`, `created_at`.
- **`ticket_scans`** — append-only scan log; the presence model is DERIVED
  from it, there is no mutable "inside" flag:
  `ticket_id` (fk → user_tickets), `scan_type` (`'entry'` | `'exit'`),
  `scanned_by` (staff email), `scanned_at` (timestamp, server default).
- Supporting: `user_profiles.profile_picture_path` → public bucket
  `profile-pictures` (the gate's identity photo); `nid-documents` is private,
  staff view documents via 600-second signed URLs only.
- Legacy: an older `registrations` table exists from a pre-dashboard flow
  (`src/app/api/register/route.ts`) — the gate does NOT read it; ignore it
  for Afterhours.

**Reference code**: `SP-` + 8 chars from alphabet
`ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no 0/O/1/I — chosen to survive humans
reading codes aloud at a dark gate). Uniqueness is probabilistic (no DB
uniqueness retry loop) — Afterhours should add a unique constraint + retry.

**QR contents**: the guest ticket QR encodes the full verify URL
`https://<origin>/verify/<REFERENCE_CODE>` (180 px, generated client-side
with the `qrcode` npm package at download time — QRs are NOT stored). The
scanner accepts either that URL or a bare `SP-XXXXXXXX` string.

## 6. The gate flow (what staff actually do)

Pages: `/gate` (`src/app/gate/page.tsx` + `GateLanding.tsx`), scanner overlay
(`src/components/gate/QrScanner.tsx`, `@zxing/browser`, back-camera
preferred, 200 ms scan interval), verification screen
(`src/app/verify/[referenceCode]/page.tsx` + `VerifyClient.tsx`).

1. Staff signs in, opens `/gate`: a big "Scan QR code" button (camera) and a
   **manual lookup** field for damaged/unreadable QRs (types the SP- code,
   11-char max). Both routes land on `/verify/<ref>`.
2. `/verify/<ref>` staff view shows, top to bottom:
   - **Status banner** — one of: "Entry not permitted" (status ≠ approved,
     shows the raw status), "Valid — Not yet entered" (green; "First entry —
     issue wristband on confirmation"), "Currently inside" (with entry
     time), "Outside — exited at <time>" (with wristband re-entry warning).
   - **Identity Check card** — the profile photo LARGE (this is the primary
     face match; if missing: "No profile photo — verify ID document
     manually"), name, ID type + number, tier, and a "View ID document" link
     (600 s signed URL to the uploaded NID/passport/birth-certificate file).
   - **Scan history** — every entry/exit with timestamps, first entry
     flagged.
   - **One action button** — the state machine offers exactly one next
     action (see §7): Confirm Entry / Confirm Re-entry / Confirm Exit.
   - **Confirm modal** — repeats name + code; for first entry reminds staff
     to issue a wristband; for re-entry asks "Wristband confirmed as present
     and intact?". Cancel or Confirm. Confirm POSTs the scan.
3. A public (non-staff) visitor opening the same URL sees a minimal view
   only: valid/inside/attended status, name, tier, first-entry time — no
   phone, no ID number, no document link, no action buttons. Ticket-holders
   effectively get a self-status page; data exposure is deliberately tiered.

## 7. The presence state machine (who's in, who's out)

State is derived from the LAST scan row for the ticket:

- No scans → `never_entered`. Next action: **Entry** (first entry ⇒ issue
  wristband).
- Last scan `entry` → `inside`. Next action: **Exit**.
- Last scan `exit` → `outside`. Next action: **Re-entry** (staff must
  physically verify the wristband is present and intact first — the
  wristband, not the QR, is the proof of prior entry; "Do not allow re-entry
  without a wristband").

Unlimited re-entry is allowed. The ticket's public disclaimers promise: QR
scanned on every entry AND exit; wristband issued at first entry, must stay
on (can't be removed without cutting), serves as re-admission proof; entry
refused if the photo doesn't match; name must match presented ID.

**API**: `POST /api/gate/scan` `{ ticketId, scanType: 'entry' | 'exit' }` —
staff-only (401 otherwise), 404 unknown ticket, 400 if ticket not
`approved`, else inserts the scan row with the staff email. **Important
gap**: the server does NOT enforce the state machine — it will happily
record entry-after-entry (double scan, two staff phones racing). The
sequencing lives only in the UI. Afterhours must enforce it server-side
(reject or idempotently coalesce a scan that doesn't match the derived
state, with a clear "already inside — scanned at <time> by <staff>" error).

## 8. Requirements for Afterhours (owner's ask + parity + known gaps to fix)

**Parity — everything above, specifically:**
1. QR scan (camera) + manual reference-code lookup fallback.
2. The three-state presence model with entry/exit/re-entry and full
   per-ticket scan history (who scanned, when).
3. The staff verification screen: photo-first identity check, ID document
   view, tier display, status banners, single-next-action + confirm step,
   wristband prompts (first entry = issue; re-entry = verify intact).
4. Approved-only entry; pending/rejected blocked with reason shown to staff
   (and "rejected" still soft-labelled for guests).
5. Tiered data exposure: staff see everything; a guest sees only their own
   status.
6. Gate staff authentication with per-scan attribution. The owner wants
   proper staff logins **"or options like that"** — a role flag on accounts,
   invited staff accounts, or device-bound gate logins are all acceptable
   improvements over the website's env-var allowlist; pick one and keep
   per-scan staff attribution.
7. Guests log in to Afterhours from the Sonic Pulse website (the site will
   link out; Afterhours owns the account + ticket + QR from then on).

**Expected improvements (gaps the website knowingly shipped with):**
8. **Live occupancy**: current inside-count (entries minus exits) and a
   who's-inside list — the owner's "keep track of who's in and who's out"
   ask. The append-only `ticket_scans` design makes this a simple derived
   query; keep that design.
9. Server-side state-machine enforcement + idempotency (see §7 gap).
10. Offline/poor-connectivity tolerance at the gate (queue scans locally,
    sync when back online) — outdoor venue, overnight.
11. DB-level uniqueness on reference codes (see §5).
12. Consider tier-aware gate hints (RHYTHM = priority lane, CRESCENDO = VIP
    lane) — display-only today; owner has not specced lane logic, ask before
    building more than a badge.

## 9. Open decisions (flag to the owner, do not silently decide)

- **Auth unification**: separate Supabase projects today. Does Afterhours
  import/replace the website's `user_tickets` data, or does the website
  hand over ticketing entirely at a cutoff date? Migration of ~existing
  pending/approved tickets and their uploaded ID documents needs an owner
  call.
- **Does the website `/gate` stay as a fallback scanner** after Afterhours
  ships, or is it retired? (If both run, they must share one scan log —
  split-brain presence tracking at a single gate would be worse than either
  alone.)
- Payment inside Afterhours (the app prices imply in-app purchase) is out of
  scope for this brief — separate context.

## 10. Known bugs / discrepancies in the website (do NOT replicate)

- The approval email (`src/lib/email.ts`, EMAIL 3) says **"Gates open
  3:00 PM"** — wrong; canonical is **4:00 PM** (EVENT_CONTEXT.md). The
  downloadable ticket says the correct `16:00 FRI → 09:30 SAT`.
- The old `/api/register` route emails "Sonic Pulse 2025" — legacy flow,
  ignore entirely.
- No server-side scan sequencing (§7) and no reference-code uniqueness
  guarantee (§5) — listed above as required fixes.

## 11. Environment variable names (website; for reference only — never copy values into docs)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `GATE_STAFF_EMAILS`, `ADMIN_EMAILS`,
`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`.
