import { createClient } from '@supabase/supabase-js';

type AnyRecord = Record<string, unknown>;

function asText(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
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

function asTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asText(entry))
      .filter((entry): entry is string => Boolean(entry));
  }
  return [];
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

  if (['sold', 'closed'].includes(status)) return 'sold';
  if (['coming_soon', 'coming soon', 'pending'].includes(status)) return 'coming_soon';
  if (['archived', 'deleted', 'inactive'].includes(status)) return 'archived';
  return 'active';
}

function getHeaderValue(req: { headers?: AnyRecord }, key: string): string | null {
  const value = req.headers?.[key] ?? req.headers?.[key.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? null;
  return asText(value);
}

function parseBody(body: unknown): AnyRecord {
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return typeof parsed === 'object' && parsed !== null ? (parsed as AnyRecord) : {};
    } catch {
      return {};
    }
  }
  if (typeof body === 'object' && body !== null) return body as AnyRecord;
  return {};
}

async function logSyncEvent(
  supabase: ReturnType<typeof createClient>,
  payload: {
    event_type: string;
    external_id: string | null;
    status: 'processed' | 'failed';
    payload: AnyRecord;
    error_message?: string;
  },
) {
  await supabase.from('sync_events').insert({
    source: 'n8n',
    event_type: payload.event_type,
    external_id: payload.external_id,
    status: payload.status,
    payload: payload.payload,
    error_message: payload.error_message ?? null,
    processed_at: new Date().toISOString(),
  });
}

export default async function handler(req: AnyRecord, res: AnyRecord) {
  const method = asText(req.method) ?? 'GET';
  if (method !== 'POST') {
    res.status?.(405).json?.({ success: false, error: 'Method not allowed' });
    return;
  }

  const secret = process.env.N8N_INGEST_SECRET;
  if (secret) {
    const fromHeader =
      getHeaderValue(req, 'x-mgco-secret') ??
      getHeaderValue(req, 'x-ingest-secret') ??
      getHeaderValue(req, 'authorization')?.replace(/^Bearer\s+/i, '') ??
      null;

    if (fromHeader !== secret) {
      res.status?.(401).json?.({ success: false, error: 'Unauthorized' });
      return;
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    res.status?.(500).json?.({
      success: false,
      error: 'Missing SUPABASE_URL (or VITE_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY',
    });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const body = parseBody(req.body);
  const payload = (body.listing as AnyRecord) ?? body;

  const title = asText(payload.title) ?? asText(payload.name) ?? 'Untitled Listing';
  const slugSource = asText(payload.slug) ?? title;
  const slug = slugify(slugSource) || `listing-${Date.now()}`;
  const externalId = asText(payload.external_id) ?? asText(payload.id) ?? asText(payload.listing_id);
  const status = normalizeStatus(payload.status ?? payload.listing_status);

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
    cover_image_url: asText(payload.cover_image_url) ?? asText(payload.image_url),
    gallery_urls: asTextArray(payload.gallery_urls ?? payload.gallery ?? payload.images),
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
    .upsert(row, { onConflict, ignoreDuplicates: false })
    .select('id, slug, status, updated_at')
    .single();

  if (error) {
    await logSyncEvent(supabase, {
      event_type: 'listing.upsert',
      external_id: externalId,
      status: 'failed',
      payload,
      error_message: error.message,
    });

    res.status?.(500).json?.({
      success: false,
      error: error.message,
    });
    return;
  }

  await logSyncEvent(supabase, {
    event_type: 'listing.upsert',
    external_id: externalId,
    status: 'processed',
    payload,
  });

  res.status?.(200).json?.({
    success: true,
    message: 'Listing received and saved',
    listing: data,
  });
}

