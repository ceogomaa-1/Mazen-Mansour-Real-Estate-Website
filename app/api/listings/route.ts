import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type AnyRecord = Record<string, unknown>;

function asText(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim().replace(/^=+/, '').trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractImageUrls(value: unknown): string[] {
  if (typeof value === 'string') {
    const text = asText(value);
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      return extractImageUrls(parsed);
    } catch {
      if (text.includes(',')) {
        return text
          .split(',')
          .map((item) => asText(item))
          .filter((entry): entry is string => Boolean(entry));
      }
      return [text];
    }
  }

  if (!Array.isArray(value)) {
    if (typeof value === 'object' && value !== null) {
      const record = value as Record<string, unknown>;
      const one = asText(record.url) || asText(record.src) || asText(record.image_url);
      return one ? [one] : [];
    }
    return [];
  }

  return value
    .flatMap((entry) => extractImageUrls(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function asTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asText(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function toIsoDate(value: unknown): string | null {
  const text = asText(value);
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function normalizeStatus(value: unknown): 'active' | 'sold' | 'coming_soon' | 'archived' {
  const status = asText(value)?.toLowerCase();
  if (!status) return 'active';
  if (['sold', 'closed', 'sld'].includes(status)) return 'sold';
  if (['coming_soon', 'coming soon', 'pending'].includes(status)) return 'coming_soon';
  if (['archived', 'deleted', 'inactive'].includes(status)) return 'archived';
  return 'active';
}

async function logSyncEvent(supabase: { from: (table: string) => any }, event: AnyRecord) {
  await supabase.from('sync_events').insert(event);
}

export async function GET() {
  return NextResponse.json({
    success: true,
    route: '/api/listings',
    message: 'Listings API is reachable. Use POST to ingest listings.',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  const secret = process.env.N8N_INGEST_SECRET;
  if (secret) {
    const fromHeader =
      req.headers.get('x-mgco-secret') ??
      req.headers.get('x-ingest-secret') ??
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
      null;

    if (fromHeader !== secret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY',
      },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const body = (await req.json()) as AnyRecord;
  const payload = (body.listing as AnyRecord) ?? body;

  const title = asText(payload.title) ?? asText(payload.name) ?? 'Untitled Listing';
  const slugSource = asText(payload.slug) ?? title;
  const slug = slugify(slugSource) || `listing-${Date.now()}`;
  const externalId = asText(payload.external_id) ?? asText(payload.id) ?? asText(payload.listing_id);
  const status = normalizeStatus(payload.status ?? payload.listing_status);
  const galleryUrls = extractImageUrls(
    payload.gallery_urls ?? payload.gallery ?? payload.images ?? payload.photos ?? payload.media,
  );
  const coverImageUrl =
    asText(payload.cover_image_url) ??
    asText(payload.image_url) ??
    asText(payload.main_image) ??
    galleryUrls[0] ??
    null;

  const row = {
    external_source: 'mgcodashboard',
    external_id: externalId,
    slug,
    title,
    description: asText(payload.description),
    status,
    price_amount: asNumber(payload.price_amount ?? payload.price),
    price_currency: (asText(payload.price_currency) ?? 'CAD').toUpperCase(),
    address_line_1: asText(payload.address_line_1) ?? asText(payload.address) ?? 'Address TBD',
    address_line_2: asText(payload.address_line_2),
    city: asText(payload.city) ?? 'City TBD',
    province: asText(payload.province) ?? asText(payload.state),
    postal_code: asText(payload.postal_code) ?? asText(payload.zip),
    country: (asText(payload.country) ?? 'CA').toUpperCase(),
    latitude: asNumber(payload.latitude),
    longitude: asNumber(payload.longitude),
    bedrooms: asNumber(payload.bedrooms),
    bathrooms: asNumber(payload.bathrooms),
    sqft: asNumber(payload.sqft ?? payload.square_feet),
    lot_size_sqft: asNumber(payload.lot_size_sqft),
    property_type: asText(payload.property_type),
    cover_image_url: coverImageUrl,
    gallery_urls: galleryUrls,
    highlights: asTextArray(payload.highlights ?? payload.features),
    is_published: payload.is_published !== false,
    listed_at: asText(payload.listed_at) ?? new Date().toISOString(),
    closed_date: toIsoDate(payload.closed_date),
    sort_order: asNumber(payload.sort_order) ?? 0,
    raw_payload: payload,
  };

  const onConflict = externalId ? 'external_id' : 'slug';
  const { data, error } = await supabase
    .from('properties')
    .upsert(row as AnyRecord, { onConflict, ignoreDuplicates: false })
    .select('id, slug, status, updated_at')
    .single();

  if (error) {
    await logSyncEvent(supabase, {
      source: 'n8n',
      event_type: 'listing.upsert',
      external_id: externalId,
      status: 'failed',
      payload,
      error_message: error.message,
      processed_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  await logSyncEvent(supabase, {
    source: 'n8n',
    event_type: 'listing.upsert',
    external_id: externalId,
    status: 'processed',
    payload,
    processed_at: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: 'Listing received and saved',
    listing: data,
  });
}
