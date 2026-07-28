-- ================================================================
-- SONIC PULSE — First Pulse (new-artist applications)
-- Run this entire file in your Supabase SQL editor:
--   supabase.com → your project → SQL Editor → New query → paste → Run
-- Safe to run alongside the existing supabase-schema.sql tables.
-- ================================================================

create table if not exists public.artist_applications (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  email           text not null,
  stage_name      text not null,
  city_country    text not null,
  genres          text not null,
  bio             text not null check (char_length(bio) <= 1000),
  mix_link        text,                -- SoundCloud / Mixcloud / YouTube; optional
  instagram_handle text,
  years_experience integer check (years_experience between 0 and 60),
  notes           text,                -- gear needs, b2b partner, anything else
  status          text not null default 'pending'
                  check (status in ('pending','shortlisted','accepted','rejected')),
  reference_code  text unique not null,        -- e.g. FP-XXXXXXXX
  created_at      timestamptz default now()
);

-- One application per email (case-insensitive)
create unique index if not exists artist_applications_email_key
  on public.artist_applications (lower(email));

-- ── Row-Level Security ───────────────────────────────────────────
alter table public.artist_applications enable row level security;

-- Inserts happen via the API route using the service role key, but keep a
-- public insert policy so the form still works if the route is ever moved
-- to the anon client (matches the registrations table convention).
create policy "public can insert artist applications"
  on public.artist_applications for insert
  with check (true);

-- Only authenticated admins can read applications
create policy "admins can read artist applications"
  on public.artist_applications for select
  using (auth.role() = 'authenticated');

-- Only authenticated admins can update status
create policy "admins can update artist applications"
  on public.artist_applications for update
  using (auth.role() = 'authenticated');
