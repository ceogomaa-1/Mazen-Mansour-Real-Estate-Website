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
};

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
  const gallery = Array.isArray(row.gallery_urls) ? row.gallery_urls.filter(Boolean) : [];
  const image = row.cover_image_url || gallery[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80';

  return {
    id: row.id,
    slug: row.slug,
    title: row.title || 'Untitled Listing',
    price: formatPrice(row.price_amount, row.price_currency),
    address: row.address_line_1 || 'Address TBD',
    city: row.city || 'City TBD',
    bedrooms: Number(row.bedrooms ?? 0),
    bathrooms: Number(row.bathrooms ?? 0),
    sqft: Number(row.sqft ?? 0),
    status: row.status ?? 'active',
    image,
    gallery: gallery.length ? gallery : [image],
    description: row.description || 'No description available yet.',
    highlights: Array.isArray(row.highlights) ? row.highlights.filter(Boolean) : [],
    closedDate: row.closed_date ?? undefined,
  };
}

export async function getProperties(): Promise<Property[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return sampleProperties;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('properties_public')
    .select(
      'id, slug, title, description, status, price_amount, price_currency, address_line_1, city, bedrooms, bathrooms, sqft, cover_image_url, gallery_urls, highlights, closed_date',
    )
    .order('updated_at', { ascending: false });

  if (error || !data) {
    return sampleProperties;
  }

  const rows = data as SupabasePropertyRow[];
  if (!rows.length) return sampleProperties;

  return rows.map(mapRowToProperty);
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  const properties = await getProperties();
  return properties.find((property) => property.slug === slug);
}
