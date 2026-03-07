import type { Property } from '../types/property';

export const sampleProperties: Property[] = [
  {
    id: '1',
    slug: 'riverstone-modern-estate',
    title: 'Riverstone Modern Estate',
    price: '$2,950,000',
    address: '412 Riverstone Crescent',
    city: 'Mississauga, ON',
    bedrooms: 5,
    bathrooms: 6,
    sqft: 5200,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1613977257593-487ecd136cc3?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1400&q=80',
    ],
    description:
      'A refined contemporary residence with double-height ceilings, a chef-grade kitchen, and seamless indoor-outdoor living spaces designed for entertaining.',
    highlights: ['Smart home automation', 'Heated driveway', 'Wine cellar', 'Ravine-facing backyard'],
  },
  {
    id: '2',
    slug: 'oakridge-family-manor',
    title: 'Oakridge Family Manor',
    price: '$1,875,000',
    address: '98 Oakridge Lane',
    city: 'Etobicoke, ON',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3900,
    status: 'sold',
    image:
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=80',
    ],
    description:
      'Classic architecture meets modern comfort in this fully renovated family home with a private office wing and expansive landscaped lot.',
    highlights: ['Finished lower level', 'Custom millwork', 'Walkable neighborhood', 'School district premium'],
    closedDate: '2025-11-12',
  },
  {
    id: '3',
    slug: 'harbour-view-penthouse',
    title: 'Harbour View Penthouse',
    price: '$3,400,000',
    address: '200 Queens Quay W, PH-03',
    city: 'Toronto, ON',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2800,
    status: 'coming_soon',
    image:
      'https://images.unsplash.com/photo-1613553497126-a44624272024?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
    ],
    description:
      'Skyline-facing penthouse with panoramic lake views, private elevator access, and premium finishes throughout every curated space.',
    highlights: ['2,000 sq ft terrace', 'Private wine room', 'Marina access', '24/7 concierge'],
  },
  {
    id: '4',
    slug: 'westbrook-luxury-townhome',
    title: 'Westbrook Luxury Townhome',
    price: '$1,420,000',
    address: '55 Westbrook Avenue',
    city: 'Vaughan, ON',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 2600,
    status: 'sold',
    image:
      'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1597047084897-51e81819a499?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80',
    ],
    description:
      'Turnkey luxury townhome with high-end appliances, elegant finishes, and direct access to parks, schools, and top retail.',
    highlights: ['Two-car garage', 'Rooftop patio', 'Custom kitchen', 'Low maintenance lot'],
    closedDate: '2026-01-26',
  },
];
