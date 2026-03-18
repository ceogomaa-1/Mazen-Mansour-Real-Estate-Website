import { createClient } from '@supabase/supabase-js';
import { sampleProperties } from '../data/properties';
import type { Property } from '../types/property';

type AnyRecord = Record<string, unknown>;

type SupabasePropertyRow = {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  status: Property['status'] | null;
  price_amount: number | null;
  price_currency: string | null;
  address_line_1: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  cover_image_url: string | null;
  gallery_urls: string[] | null;
  highlights: string[] | null;
  closed_date: string | null;
  is_published: boolean | null;
  raw_payload?: AnyRecord | null;
};

function cleanText(value: string | null): string {
  const cleaned = (value ?? '').replace(/^=+/, '').trim();
  if (['null', 'undefined', 'n/a', 'na', 'none'].includes(cleaned.toLowerCase())) return '';
  return cleaned;
}

function normalizeSlug(value: string): string {
  return decodeURIComponent(value)
    .toLowerCase()
    .replace(/^=+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanUrl(value: string | null): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  if (cleaned.toLowerCase().startsWith('javascript:')) return null;
  return cleaned;
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => toStringArray(entry)).filter(Boolean);
  }

  if (typeof value === 'string') {
    const text = cleanText(value);
    if (!text) return [];

    if ((text.startsWith('[') && text.endsWith(']')) || (text.startsWith('{') && text.endsWith('}'))) {
      return toStringArray(tryParseJson(text));
    }

    if (text.includes(',')) {
      return text
        .split(',')
        .map((entry) => cleanText(entry))
        .filter(Boolean);
    }

    return [text];
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as AnyRecord;
    const direct =
      cleanText(
        (record.url as string) ??
          (record.src as string) ??
          (record.image_url as string) ??
          (record.main_image as string) ??
          null,
      ) || '';
    if (direct) return [direct];

    return Object.values(record).flatMap((entry) => toStringArray(entry)).filter(Boolean);
  }

  return [];
}

function getPayloadArray(payload: AnyRecord | null | undefined, key: string): string[] {
  if (!payload) return [];
  return toStringArray(payload[key]);
}

function firstValidUrl(urls: string[]): string | null {
  for (const url of urls) {
    const cleaned = cleanUrl(url);
    if (cleaned) return cleaned;
  }
  return null;
}

function normalizeHighlight(value: unknown): string[] {
  return toStringArray(value)
    .map((item) => cleanText(item))
    .filter(Boolean)
    .filter((item) => !item.startsWith('http://') && !item.startsWith('https://'));
}

function formatPrice(amount: number | null, currency: string | null): string {
  if (!amount || amount <= 0) return 'Price Upon Request';
  const code = (currency ?? 'CAD').toUpperCase();
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
}

function mapRowToProperty(row: SupabasePropertyRow): Property {
  const payload = row.raw_payload ?? null;
  const captionFromPayload = cleanText(
    (payload?.listing_caption as string) ??
      (payload?.caption as string) ??
      (payload?.generated_caption as string) ??
      (payload?.ai_caption as string) ??
      null,
  );
  const descriptionText = cleanText(row.description);
  const caption = captionFromPayload || (descriptionText.length <= 220 ? descriptionText : '');

  const galleryCandidates = [
    ...toStringArray(row.gallery_urls),
    ...getPayloadArray(payload, 'gallery_urls'),
    ...getPayloadArray(payload, 'gallery'),
    ...getPayloadArray(payload, 'images'),
    ...getPayloadArray(payload, 'photos'),
    ...getPayloadArray(payload, 'media'),
  ];
  const gallery = galleryCandidates.map((url) => cleanUrl(url)).filter((url): url is string => Boolean(url));

  const image =
    cleanUrl(row.cover_image_url) ||
    cleanUrl(cleanText((payload?.cover_image_url as string) ?? null)) ||
    cleanUrl(cleanText((payload?.image_url as string) ?? null)) ||
    firstValidUrl(gallery) ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80';

  return {
    id: row.id,
    slug: normalizeSlug(cleanText(row.slug) || row.id),
    title: cleanText(row.title) || 'Untitled Listing',
    price: formatPrice(row.price_amount, row.price_currency),
    address: cleanText(row.address_line_1) || 'Address TBD',
    city: cleanText(row.city) || 'City TBD',
    bedrooms: Number(row.bedrooms ?? 0),
    bathrooms: Number(row.bathrooms ?? 0),
    sqft: Number(row.sqft ?? 0),
    status: row.status ?? 'active',
    image,
    gallery: gallery.length ? gallery : [image],
    description: descriptionText || 'No description available yet.',
    caption: caption || undefined,
    highlights: normalizeHighlight(row.highlights),
    closedDate: row.closed_date ?? undefined,
  };
}

export async function getProperties(): Promise<Property[]> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serverKey = serviceRoleKey || supabaseAnonKey;

  if (!supabaseUrl || !serverKey) {
    // Keep local mockups only for local development without env keys.
    if (process.env.NODE_ENV !== 'production') return sampleProperties;
    return [];
  }

  const supabase = createClient(supabaseUrl, serverKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('properties')
    .select(
      'id, slug, title, description, status, price_amount, price_currency, address_line_1, city, bedrooms, bathrooms, sqft, cover_image_url, gallery_urls, highlights, closed_date, is_published, raw_payload',
    )
    .neq('status', 'archived')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  if (error || !data) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Supabase read failed. Falling back to sample data in development.', error?.message);
      return sampleProperties;
    }
    console.error('Supabase read failed in production:', error?.message);
    return [];
  }

  const rows = data as SupabasePropertyRow[];
  if (!rows.length) {
    if (process.env.NODE_ENV !== 'production') return sampleProperties;
    return [];
  }

  return rows.map(mapRowToProperty);
}

export async function getPropertyBySlug(slug: string, id?: string): Promise<Property | undefined> {
  const normalizedSlug = normalizeSlug(slug);
  const normalizedId = cleanText(id ?? null);
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serverKey = serviceRoleKey || supabaseAnonKey;

  if (!supabaseUrl || !serverKey) {
    if (process.env.NODE_ENV !== 'production') {
      return sampleProperties.find((property) => normalizeSlug(property.slug) === normalizedSlug);
    }
    return undefined;
  }

  const supabase = createClient(supabaseUrl, serverKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const detailSelect =
    'id, slug, title, description, status, price_amount, price_currency, address_line_1, city, bedrooms, bathrooms, sqft, cover_image_url, gallery_urls, highlights, closed_date, is_published, raw_payload';

  if (normalizedId) {
    const byId = await supabase
      .from('properties')
      .select(detailSelect)
      .eq('id', normalizedId)
      .neq('status', 'archived')
      .eq('is_published', true)
      .maybeSingle();
    if (!byId.error && byId.data) return mapRowToProperty(byId.data as SupabasePropertyRow);
  }

  const { data, error } = await supabase
    .from('properties')
    .select(detailSelect)
    .eq('slug', normalizedSlug)
    .neq('status', 'archived')
    .eq('is_published', true)
    .maybeSingle();

  if (!error && data) return mapRowToProperty(data as SupabasePropertyRow);

  // Fallback for legacy rows where slug may have been stored with inconsistent formatting.
  const properties = await getProperties();
  const matched = properties.find((property) => normalizeSlug(property.slug) === normalizedSlug);
  if (matched) return matched;

  if (error) console.error('getPropertyBySlug failed:', error.message);
  return undefined;
}
