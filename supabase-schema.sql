-- ================================================================
-- SONIC PULSE — Supabase Database Schema
-- Run this entire file in your Supabase SQL editor:
--   supabase.com → your project → SQL Editor → New query → paste → Run
-- ================================================================

-- ── Registrations ───────────────────────────────────────────────
create table if not exists public.registrations (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  date_of_birth   date not null,
  email           text not null,
  phone           text not null,
  instagram_handle text not null,
  nid_number      text not null,
  nid_file_path   text,
  ticket_tier     text not null check (ticket_tier in ('phase1','phase2','phase3')),
  ticket_qty      integer not null default 1 check (ticket_qty between 1 and 4),
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  reference_code  text unique not null,
  created_at      timestamptz default now()
);

-- ── Contact messages ─────────────────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  read       boolean default false,
  created_at timestamptz default now()
);

-- ── Row-Level Security ───────────────────────────────────────────
alter table public.registrations enable row level security;
alter table public.contact_messages enable row level security;

-- Anyone can insert a registration (the website form)
create policy "public can insert registrations"
  on public.registrations for insert
  with check (true);

-- Only authenticated admins can read registrations
create policy "admins can read registrations"
  on public.registrations for select
  using (auth.role() = 'authenticated');

-- Only admins can update status
create policy "admins can update registrations"
  on public.registrations for update
  using (auth.role() = 'authenticated');

-- Anyone can insert a contact message
create policy "public can insert contact messages"
  on public.contact_messages for insert
  with check (true);

-- Only admins can read contact messages
create policy "admins can read contact messages"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');

-- ── User tickets (account-based, multi-ticket per user) ─────────
create table if not exists public.user_tickets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  user_email      text not null,
  full_name       text not null,
  phone           text not null,
  nid_number      text not null,
  nid_file_path   text not null,
  ticket_tier     text not null check (ticket_tier in ('phase1','phase2','phase3')),
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  reference_code  text unique not null,
  created_at      timestamptz default now()
);

alter table public.user_tickets enable row level security;

-- Users can only see their own tickets
create policy "users can read own tickets"
  on public.user_tickets for select
  using (auth.uid() = user_id);

-- Users can insert their own tickets
create policy "users can insert own tickets"
  on public.user_tickets for insert
  with check (auth.uid() = user_id);

-- Only admins (service role) can update status
create policy "service role can update tickets"
  on public.user_tickets for update
  using (auth.role() = 'service_role');

-- ── Storage bucket for NID documents ────────────────────────────
-- Run these in Supabase Dashboard → Storage → New bucket
-- Name: nid-documents
-- Public: NO (keep private)
--
-- Then add this policy in Storage → nid-documents → Policies:
-- INSERT: allow all (so the API route can upload)
-- SELECT: allow authenticated only

-- ── User profiles (saved info, reused across ticket purchases) ──
-- NOTE: this table already exists in production (see src/app/api/profile/
-- route.ts) but was never added to this schema file. Safe to run as-is —
-- `create table if not exists` and `add column if not exists` are both
-- no-ops against a table that already has these columns.
create table if not exists public.user_profiles (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  full_name             text,
  phone                 text,
  nid_number            text,
  nid_file_path         text,
  instagram_handle      text,
  other_social_handle   text,
  gender                text check (gender in ('male','female','non-binary')),
  id_type               text check (id_type in ('nid','passport','birth_certificate')),
  profile_picture_path  text,
  updated_at            timestamptz default now()
);

alter table public.user_profiles add column if not exists other_social_handle text;

alter table public.user_profiles enable row level security;

create policy "users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "users can upsert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- If `gender` already exists on user_profiles, user_tickets, or
-- influencer_applications with an older ('male','female')-only check
-- constraint, widen it — the app now submits 'non-binary' too. Find the
-- constraint name in Supabase Studio → Table Editor → (table) → gender
-- column, or query:
--   select conname from pg_constraint where conrelid = 'public.user_profiles'::regclass;
-- then:
--   alter table public.user_profiles drop constraint <constraint_name>;
--   alter table public.user_profiles add check (gender in ('male','female','non-binary'));
-- (repeat for user_tickets and influencer_applications if they have the same constraint)

-- ── Mobile app backend wiring (Phase 04) ─────────────────────────
-- Ticket-level shuttle add-on, read/written by the app's toggleShuttle.
-- PLAN-payments.md's server-side amount computation already assumes this
-- column exists ("4500 + 800 if includes_shuttle requested and recorded").
alter table public.user_tickets add column if not exists includes_shuttle boolean not null default false;

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

-- Membership check WITHOUT recursive RLS — a policy on clique_members that
-- itself selects clique_members recurses infinitely (Postgres 42P17).
-- security definer bypasses RLS inside the function; do not inline this
-- back into the policy body.
create or replace function public.is_clique_member(cid uuid)
returns boolean language sql security definer set search_path = public as
$$ select exists (select 1 from clique_members where clique_id = cid and user_id = auth.uid()) $$;

alter table public.cliques enable row level security;
alter table public.clique_members enable row level security;
alter table public.clique_invites enable row level security;
alter table public.accommodation_reservations enable row level security;

drop policy if exists "read own or member cliques" on public.cliques;
create policy "read own or member cliques" on public.cliques
  for select using (creator_id = auth.uid() or is_clique_member(id));
drop policy if exists "create own cliques" on public.cliques;
create policy "create own cliques" on public.cliques
  for insert with check (creator_id = auth.uid());
drop policy if exists "delete own cliques" on public.cliques;
create policy "delete own cliques" on public.cliques
  for delete using (creator_id = auth.uid());

drop policy if exists "read fellow members" on public.clique_members;
create policy "read fellow members" on public.clique_members
  for select using (is_clique_member(clique_id));
drop policy if exists "join via accepted invite or as creator" on public.clique_members;
create policy "join via accepted invite or as creator" on public.clique_members
  for insert with check (
    user_id = auth.uid() and (
      exists (
        select 1 from public.clique_invites
        where clique_id = clique_members.clique_id
          and invitee_id = auth.uid()
          and status = 'accepted'
      )
      or auth.uid() = (select creator_id from public.cliques where id = clique_members.clique_id)
    )
  );
drop policy if exists "leave or be removed" on public.clique_members;
create policy "leave or be removed" on public.clique_members
  for delete using (
    user_id = auth.uid()
    or auth.uid() = (select creator_id from public.cliques where id = clique_members.clique_id)
  );

drop policy if exists "read own invites" on public.clique_invites;
create policy "read own invites" on public.clique_invites
  for select using (inviter_id = auth.uid() or invitee_id = auth.uid());
drop policy if exists "creator sends invites" on public.clique_invites;
create policy "creator sends invites" on public.clique_invites
  for insert with check (
    inviter_id = auth.uid()
    and auth.uid() = (select creator_id from public.cliques where id = clique_invites.clique_id)
  );
drop policy if exists "invitee responds to invite" on public.clique_invites;
create policy "invitee responds to invite" on public.clique_invites
  for update using (invitee_id = auth.uid());

drop policy if exists "read own reservations" on public.accommodation_reservations;
create policy "read own reservations" on public.accommodation_reservations
  for select using (auth.uid() = user_id);
drop policy if exists "insert own reservations" on public.accommodation_reservations;
create policy "insert own reservations" on public.accommodation_reservations
  for insert with check (auth.uid() = user_id);
-- Status updates are admin/service-role only (approved via the website) —
-- deliberately no user update policy here.

-- Realtime respects RLS via WALRUS: a table left out of this publication
-- means postgres_changes silently delivers nothing, with no error. Each
-- addition is wrapped since re-adding an already-published table errors.
do $$ begin
  alter publication supabase_realtime add table public.user_tickets;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.accommodation_reservations;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.clique_invites;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.clique_members;
exception when duplicate_object then null; end $$;

-- ── Payments (Phase 08) — bKash + SSLCommerz ─────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.user_tickets(id) on delete set null,
  reservation_id uuid references public.accommodation_reservations(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('bkash','sslcommerz')),
  provider_txn_id text unique,
  amount integer not null,           -- whole BDT, integer. Never float.
  currency text not null default 'BDT',
  status text not null default 'initiated' check (status in ('initiated','success','failed','refunded')),
  includes_shuttle boolean not null default false,
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (num_nonnulls(ticket_id, reservation_id) = 1)   -- XOR: a payment settles exactly one thing
);
alter table public.payments add column if not exists updated_at timestamptz default now();

-- Keeps updated_at meaningful for the IPN/callback idempotency check
-- (acceptance criterion 5: replaying an IPN must not touch it) without
-- every route handler having to remember to set it by hand.
create or replace function public.set_payments_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_payments_updated_at();

alter table public.payments enable row level security;
drop policy if exists "own payments readable" on public.payments;
create policy "own payments readable" on public.payments for select using (auth.uid() = user_id);
-- inserts/updates: service role only (no user policy) — all writes go through the API routes.
