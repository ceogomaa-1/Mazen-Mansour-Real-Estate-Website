-- Mike Mansour Real Estate - Supabase initial schema
-- Run this in Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

-- Keep updated_at accurate automatically.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Core listings table (source of truth for website properties page).
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  external_source text not null default 'mgcodashboard',
  external_id text unique,
  slug text not null unique,
  title text not null,
  description text,
  status text not null default 'active'
    check (status in ('active', 'sold', 'coming_soon', 'archived')),

  -- Pricing
  price_amount bigint,
  price_currency text not null default 'CAD'
    check (char_length(price_currency) = 3),

  -- Location
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  province text,
  postal_code text,
  country text not null default 'CA',
  latitude double precision,
  longitude double precision,

  -- Property specs
  bedrooms numeric(4,1),
  bathrooms numeric(4,1),
  sqft integer,
  lot_size_sqft integer,
  property_type text,

  -- Media
  cover_image_url text,
  gallery_urls text[] not null default '{}',
  highlights text[] not null default '{}',

  -- Publishing / lifecycle
  is_published boolean not null default true,
  listed_at timestamptz,
  closed_date date,
  sort_order integer not null default 0,

  -- Extra payload from mgcodashboard for future-proofing
  raw_payload jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_published on public.properties(is_published);
create index if not exists idx_properties_city on public.properties(city);
create index if not exists idx_properties_updated_at_desc on public.properties(updated_at desc);
create index if not exists idx_properties_external on public.properties(external_source, external_id);
create index if not exists idx_properties_gallery_gin on public.properties using gin (gallery_urls);
create index if not exists idx_properties_highlights_gin on public.properties using gin (highlights);
create index if not exists idx_properties_raw_payload_gin on public.properties using gin (raw_payload);

drop trigger if exists trg_properties_set_updated_at on public.properties;
create trigger trg_properties_set_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

-- n8n ingestion log table (optional but strongly recommended).
create table if not exists public.sync_events (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'mgcodashboard',
  event_type text not null, -- e.g. listing.created, listing.updated, listing.deleted
  external_id text,
  status text not null default 'received'
    check (status in ('received', 'processed', 'failed')),
  request_id text,
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sync_events_status on public.sync_events(status);
create index if not exists idx_sync_events_source_external on public.sync_events(source, external_id);
create index if not exists idx_sync_events_created_at_desc on public.sync_events(created_at desc);

drop trigger if exists trg_sync_events_set_updated_at on public.sync_events;
create trigger trg_sync_events_set_updated_at
before update on public.sync_events
for each row
execute function public.set_updated_at();

-- Contact form submissions (if you decide to store website leads in Supabase).
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  message text not null,
  source_page text,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_submissions_created_at_desc on public.contact_submissions(created_at desc);

-- RLS setup
alter table public.properties enable row level security;
alter table public.sync_events enable row level security;
alter table public.contact_submissions enable row level security;

-- Public website can read only published + non-archived properties.
drop policy if exists "Public read published properties" on public.properties;
create policy "Public read published properties"
on public.properties
for select
to anon, authenticated
using (
  is_published = true
  and status <> 'archived'
);

-- Service-role integrations (n8n with service key) can manage sync logs.
drop policy if exists "Service role full access sync_events" on public.sync_events;
create policy "Service role full access sync_events"
on public.sync_events
for all
to service_role
using (true)
with check (true);

-- Optional: allow public insert for contact form, but no reads.
drop policy if exists "Public insert contact submissions" on public.contact_submissions;
create policy "Public insert contact submissions"
on public.contact_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "Service role full access contact submissions" on public.contact_submissions;
create policy "Service role full access contact submissions"
on public.contact_submissions
for all
to service_role
using (true)
with check (true);

-- Helpful read model for frontend (simple shape).
create or replace view public.properties_public as
select
  id,
  slug,
  title,
  description,
  status,
  price_amount,
  price_currency,
  address_line_1,
  city,
  province,
  country,
  bedrooms,
  bathrooms,
  sqft,
  cover_image_url,
  gallery_urls,
  highlights,
  listed_at,
  closed_date,
  updated_at
from public.properties
where is_published = true
  and status <> 'archived';

grant select on public.properties_public to anon, authenticated;

commit;

