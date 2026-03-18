begin;

-- Normalize placeholder strings that should never be stored as actual values.
update public.properties
set
  external_id = case when lower(trim(coalesce(external_id, ''))) in ('', 'null', 'undefined', 'n/a', 'na', 'none') then null else trim(external_id) end,
  slug = case when lower(trim(coalesce(slug, ''))) in ('', 'null', 'undefined', 'n/a', 'na', 'none') then null else trim(slug) end,
  title = case when lower(trim(coalesce(title, ''))) in ('', 'null', 'undefined', 'n/a', 'na', 'none') then null else trim(title) end,
  description = case when lower(trim(coalesce(description, ''))) in ('', 'null', 'undefined', 'n/a', 'na', 'none') then null else trim(description) end,
  address_line_1 = case when lower(trim(coalesce(address_line_1, ''))) in ('', 'null', 'undefined', 'n/a', 'na', 'none') then null else trim(address_line_1) end,
  city = case when lower(trim(coalesce(city, ''))) in ('', 'null', 'undefined', 'n/a', 'na', 'none') then null else trim(city) end,
  cover_image_url = case when lower(trim(coalesce(cover_image_url, ''))) in ('', 'null', 'undefined', 'n/a', 'na', 'none') then null else trim(cover_image_url) end;

-- Backfill required presentation fields for already-damaged rows.
update public.properties
set
  title = coalesce(title, address_line_1, 'Listing ' || left(id::text, 8)),
  address_line_1 = coalesce(address_line_1, 'Address TBD'),
  city = coalesce(city, 'City TBD')
where title is null
   or address_line_1 is null
   or city is null;

-- Regenerate safe unique slugs for broken rows.
update public.properties
set slug = regexp_replace(lower(coalesce(title, 'listing')), '[^a-z0-9]+', '-', 'g')
           || '-' || left(id::text, 8)
where slug is null
   or lower(slug) in ('', 'null', 'undefined', 'n/a', 'na', 'none');

commit;
