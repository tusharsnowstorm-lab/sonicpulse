-- ================================================================
-- SONIC PULSE — Vendor stall applications (REDESIGN_PLAN.md §8.67)
--
-- Run this entire file in the Supabase SQL editor of the project whose
-- ref is  ytgwocaresxghgyiwikr  — the project that holds user_profiles
-- and wayfinder_applications (see §8.19 for what happens otherwise).
-- Safe to re-run.
-- ================================================================

create table if not exists public.vendor_applications (
  id                       uuid primary key default gen_random_uuid(),
  agreement_ref            text unique not null,      -- SP/VEND/2026/FS-P-007
  package_code             text not null check (package_code in ('MKT-B','FS-B','FS-P')),
  stalls                   integer not null check (stalls between 1 and 10),
  stall_fee                integer not null,          -- BDT, stalls × unit fee at signing
  business_name            text not null,
  contact_person           text not null,
  phone                    text not null,
  email                    text not null,
  business_address         text not null,
  trade_licence            text,
  goods_description        text not null check (char_length(goods_description) <= 1000),
  electrical_loads         text,
  cooking_equipment        text,
  staff_list               text,
  signatory_name           text not null,
  signatory_designation    text not null,
  signed_at                timestamptz not null default now(),
  signed_ip                text,
  signed_user_agent        text,
  contract_version         text not null,
  contract_hash            text not null,             -- sha256 hex of contractPlainText()
  acknowledged_clauses     text[] not null default '{}',
  status                   text not null default 'awaiting_payment'
                           check (status in ('awaiting_payment','paid_pending_verification','confirmed','lapsed','rejected','cancelled_by_organiser')),
  receipt_paths            text[] not null default '{}',
  receipt_uploaded_at      timestamptz,
  countersigned_by         text,
  countersigned_designation text,
  confirmed_at             timestamptz,
  admin_note               text,
  created_at               timestamptz default now()
);

create index if not exists vendor_applications_package_idx
  on public.vendor_applications (package_code, created_at desc);

alter table public.vendor_applications enable row level security;

create policy "public can insert vendor applications"
  on public.vendor_applications for insert
  with check (true);

create policy "admins can read vendor applications"
  on public.vendor_applications for select
  using (auth.role() = 'authenticated');

create policy "admins can update vendor applications"
  on public.vendor_applications for update
  using (auth.role() = 'authenticated');

-- Private bucket for transfer receipts. Uploads and signed URLs both go
-- through the service-role key, so no storage policies are needed.
-- If this insert is refused, create the bucket by hand:
-- Storage → New bucket → name "vendor-receipts" → Public: NO.
insert into storage.buckets (id, name, public)
  values ('vendor-receipts', 'vendor-receipts', false)
  on conflict (id) do nothing;
