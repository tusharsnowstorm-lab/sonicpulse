-- ================================================================
-- SONIC PULSE — Supabase Database Schema
-- Run this entire file in your Supabase SQL editor:
--   supabase.com → your project → SQL Editor → New query → paste → Run
--
-- This file is idempotent — safe to run repeatedly and safe to run
-- against an existing project. `create table if not exists`,
-- `add column if not exists`, and `drop policy if exists` guards mean
-- re-running never errors and never drops data.
--
-- SOURCE-OF-TRUTH NOTE: the column definitions for user_profiles,
-- influencer_applications, ticket_scans, and the newer columns on
-- registrations / user_tickets were reconstructed from the application
-- code (these tables were originally created ad-hoc in the dashboard and
-- never captured here). If you ever find a column in the live DB that
-- isn't reflected below, the live DB is authoritative — add it here.
-- ================================================================


-- ================================================================
-- TABLES
-- ================================================================

-- ── Registrations (public website form, one row per submission) ──
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
  shuttle         boolean not null default false,
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  reference_code  text unique not null,
  created_at      timestamptz default now()
);

-- ── Contact messages (public website form) ───────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  read       boolean default false,
  created_at timestamptz default now()
);

-- ── User tickets (account-based, multi-ticket per user) ──────────
-- user_id is nullable: influencer-approval tickets are minted by the
-- admin flow without an owning account (ticket_tier = 'influencer').
create table if not exists public.user_tickets (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade,
  user_email       text not null,
  full_name        text not null,
  phone            text not null,
  nid_number       text not null,
  id_type          text not null default 'nid',
  instagram_handle text,
  gender           text,
  nid_file_path    text not null,
  ticket_tier      text not null check (ticket_tier in ('phase1','phase2','phase3','influencer')),
  status           text not null default 'pending' check (status in ('pending','approved','rejected')),
  reference_code   text unique not null,
  created_at       timestamptz default now()
);

-- ── User profiles (per-account identity + avatar) ────────────────
-- The navbar reads profile_picture_path directly from the browser with
-- the anon key, so this table keeps a self-read RLS policy (below).
create table if not exists public.user_profiles (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references auth.users(id) on delete cascade,
  full_name            text,
  phone                text,
  nid_number           text,
  instagram_handle     text,
  gender               text,
  id_type              text,
  nid_file_path        text,
  profile_picture_path text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ── Influencer applications (public influencer form) ─────────────
-- Written and read exclusively through service-role API routes, so it
-- carries NO anon/authenticated policies — RLS on with no policy fully
-- closes it to the public key while the server routes bypass RLS.
create table if not exists public.influencer_applications (
  id                   uuid primary key default gen_random_uuid(),
  full_name            text not null,
  email                text not null unique,
  phone                text not null,
  id_type              text not null default 'nid',
  id_number            text not null,
  gender               text not null check (gender in ('male','female','others')),
  instagram_handle     text not null,
  tiktok_handle        text,
  youtube_channel      text,
  primary_platform     text default 'instagram',
  follower_count       text,
  content_type         text,
  nid_file_path        text,
  profile_picture_path text,
  shuttle              boolean not null default false,
  status               text not null default 'pending' check (status in ('pending','approved','rejected')),
  reference_code       text unique,
  created_at           timestamptz default now()
);

-- ── Ticket scans (gate entry/exit log) ───────────────────────────
-- Written and read exclusively through service-role gate routes — no
-- anon/authenticated policies, same rationale as influencer_applications.
create table if not exists public.ticket_scans (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.user_tickets(id) on delete cascade,
  scan_type  text not null check (scan_type in ('entry','exit')),
  scanned_by text,
  scanned_at timestamptz default now()
);


-- ================================================================
-- DRIFT BACKFILL — for projects created before the columns above
-- existed. No-ops on a fresh database (the create-table statements
-- already include them); additive and safe on an existing one.
-- ================================================================
alter table public.registrations add column if not exists shuttle boolean not null default false;

alter table public.user_tickets  add column if not exists id_type text not null default 'nid';
alter table public.user_tickets  add column if not exists instagram_handle text;
alter table public.user_tickets  add column if not exists gender text;
alter table public.user_tickets  alter column user_id drop not null;


-- ================================================================
-- ROW-LEVEL SECURITY
-- ================================================================
alter table public.registrations           enable row level security;
alter table public.contact_messages         enable row level security;
alter table public.user_tickets             enable row level security;
alter table public.user_profiles            enable row level security;
alter table public.influencer_applications  enable row level security;
alter table public.ticket_scans             enable row level security;

-- ── registrations ──
drop policy if exists "public can insert registrations" on public.registrations;
create policy "public can insert registrations"
  on public.registrations for insert
  with check (true);

drop policy if exists "admins can read registrations" on public.registrations;
create policy "admins can read registrations"
  on public.registrations for select
  using (auth.role() = 'authenticated');

drop policy if exists "admins can update registrations" on public.registrations;
create policy "admins can update registrations"
  on public.registrations for update
  using (auth.role() = 'authenticated');

-- ── contact_messages ──
drop policy if exists "public can insert contact messages" on public.contact_messages;
create policy "public can insert contact messages"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "admins can read contact messages" on public.contact_messages;
create policy "admins can read contact messages"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');

-- ── user_tickets ──
drop policy if exists "users can read own tickets" on public.user_tickets;
create policy "users can read own tickets"
  on public.user_tickets for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own tickets" on public.user_tickets;
create policy "users can insert own tickets"
  on public.user_tickets for insert
  with check (auth.uid() = user_id);

drop policy if exists "service role can update tickets" on public.user_tickets;
create policy "service role can update tickets"
  on public.user_tickets for update
  using (auth.role() = 'service_role');

-- ── user_profiles ──
-- Anon-key browser reads its own row (navbar avatar); all writes go
-- through the service-role /api/profile route, which bypasses RLS.
drop policy if exists "users read own profile" on public.user_profiles;
create policy "users read own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

-- ── influencer_applications ──
-- Intentionally NO policies: RLS enabled with zero policies denies all
-- anon/authenticated access via PostgREST; the service role bypasses it.

-- ── ticket_scans ──
-- Intentionally NO policies: same lock-down as influencer_applications.


-- ================================================================
-- STORAGE BUCKETS (create in Supabase Dashboard → Storage)
-- ================================================================
-- nid-documents   — Public: NO  (private; served via short-lived signed URLs)
--                   Paths: influencer/…, profiles/<user_id>/…
--                   Policies: INSERT allow all (API routes upload),
--                             SELECT authenticated only.
--
-- profile-pictures — Public: YES (avatars are served from the public URL)
--                    Paths: <user_id>/avatar.<ext>, influencer/profile-…
--                    Policies: INSERT allow all (API routes upload),
--                              SELECT public.
