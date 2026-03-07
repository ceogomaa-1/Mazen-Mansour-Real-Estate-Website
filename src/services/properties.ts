import { sampleProperties } from '../data/properties';
import type { Property } from '../types/property';

export async function getProperties(): Promise<Property[]> {
  // Phase 1: static data fallback for fast frontend delivery.
  // Phase 2: replace with Supabase query once backend is ready.
  return sampleProperties;
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  const properties = await getProperties();
  return properties.find((property) => property.slug === slug);
}
