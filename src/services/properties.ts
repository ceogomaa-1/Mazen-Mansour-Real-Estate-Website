import { createClient } from '@supabase/supabase-js';
import { sampleProperties } from '../data/properties';
import type { Property } from '../types/property';

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
};

function cleanText(value: string | null): string {
  return (value ?? '').replace(/^=+/, '').trim();
}

function cleanUrl(value: string | null): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned;
  return null;
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
  const gallery = Array.isArray(row.gallery_urls)
    ? row.gallery_urls.map((url) => cleanUrl(url)).filter((url): url is string => Boolean(url))
    : [];
  const image =
    cleanUrl(row.cover_image_url) ||
    gallery[0] ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80';

  return {
    id: row.id,
    slug: cleanText(row.slug) || row.id,
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
    description: cleanText(row.description) || 'No description available yet.',
    highlights: Array.isArray(row.highlights) ? row.highlights.filter(Boolean) : [],
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
      'id, slug, title, description, status, price_amount, price_currency, address_line_1, city, bedrooms, bathrooms, sqft, cover_image_url, gallery_urls, highlights, closed_date, is_published',
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

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serverKey = serviceRoleKey || supabaseAnonKey;

  if (!supabaseUrl || !serverKey) {
    if (process.env.NODE_ENV !== 'production') {
      return sampleProperties.find((property) => property.slug === slug);
    }
    return undefined;
  }

  const supabase = createClient(supabaseUrl, serverKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('properties')
    .select(
      'id, slug, title, description, status, price_amount, price_currency, address_line_1, city, bedrooms, bathrooms, sqft, cover_image_url, gallery_urls, highlights, closed_date, is_published',
    )
    .eq('slug', slug)
    .neq('status', 'archived')
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) return undefined;
  return mapRowToProperty(data as SupabasePropertyRow);
}
