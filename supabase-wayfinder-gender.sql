-- ================================================================
-- SONIC PULSE — Wayfinder: add gender column (REDESIGN_PLAN.md §8.31)
--
-- Run this in the Supabase SQL editor of the project whose ref is
--   ytgwocaresxghgyiwikr   (the project that holds user_profiles and
-- the live wayfinder_applications table — see §8.19 for why the ref
-- must be checked before running).
--
-- Safe to run at any time, before or after the code deploys: the API
-- falls back to inserting without gender if this column is missing,
-- so applications are never lost either way.
--
-- Existing applications keep gender = NULL ("not stated"); the value
-- cannot be recovered retroactively.
-- ================================================================

alter table public.wayfinder_applications
  add column if not exists gender text
  check (gender is null or gender in ('female','male','prefer_not_to_say'));
