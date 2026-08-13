-- ================================================================
-- SONIC PULSE — Wayfinder (volunteer programme applications)
--
-- Run this entire file in the Supabase SQL editor of the project whose
-- ref is  ytgwocaresxghgyiwikr  — the project that holds user_profiles.
-- (Running it in the wrong project is what broke First Pulse; see
--  REDESIGN_PLAN.md §8.19.)
--   supabase.com → that project → SQL Editor → New query → paste → Run
-- Safe to run alongside the existing tables.
-- ================================================================

create table if not exists public.wayfinder_applications (
  id                      uuid primary key default gen_random_uuid(),
  full_name               text not null,
  email                   text not null,
  phone                   text not null,
  institution             text not null,
  level                   text not null
                          check (level in ('undergraduate_final','hsc_alevel','other')),
  graduation_year         integer check (graduation_year between 2026 and 2032),
  date_of_birth           date,
  shift_preference        text not null
                          check (shift_preference in ('dusk','dawn','either')),
  stay_to_close           boolean not null default false,
  motivation              text check (char_length(motivation) <= 600),
  emergency_contact_name  text not null,
  emergency_contact_phone text not null,
  instagram_handle        text,
  notes                   text,
  status                  text not null default 'pending'
                          check (status in ('pending','shortlisted','accepted','rejected')),
  assigned_shift          text check (assigned_shift in ('dusk','dawn')),
  reference_code          text unique not null,        -- e.g. WF-XXXXXXXX
  created_at              timestamptz default now()
);

-- One application per email (case-insensitive)
create unique index if not exists wayfinder_applications_email_key
  on public.wayfinder_applications (lower(email));

-- ── Row-Level Security ───────────────────────────────────────────
alter table public.wayfinder_applications enable row level security;

-- Inserts happen via the API route using the service role key, but keep a
-- public insert policy so the form still works if the route is ever moved
-- to the anon client (matches the artist_applications convention).
create policy "public can insert wayfinder applications"
  on public.wayfinder_applications for insert
  with check (true);

-- Only authenticated admins can read applications
create policy "admins can read wayfinder applications"
  on public.wayfinder_applications for select
  using (auth.role() = 'authenticated');

-- Only authenticated admins can update status / shift assignment
create policy "admins can update wayfinder applications"
  on public.wayfinder_applications for update
  using (auth.role() = 'authenticated');
