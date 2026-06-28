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
