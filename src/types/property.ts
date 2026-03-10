export type PropertyStatus = 'active' | 'sold' | 'coming_soon';

export interface Property {
  id: string;
  slug: string;
  title: string;
  price: string;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: PropertyStatus;
  image: string;
  gallery: string[];
  description: string;
  caption?: string;
  highlights: string[];
  closedDate?: string;
}
