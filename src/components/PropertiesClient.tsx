'use client';

import { useMemo, useState } from 'react';
import { PropertyCard } from './PropertyCard';
import type { Property, PropertyStatus } from '../types/property';

const filters: { label: string; value: 'all' | PropertyStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'For Sale', value: 'active' },
  { label: 'Sold', value: 'sold' },
  { label: 'Coming Soon', value: 'coming_soon' },
];

export function PropertiesClient({ properties }: { properties: Property[] }) {
  const [activeFilter, setActiveFilter] = useState<'all' | PropertyStatus>('all');

  const visibleProperties = useMemo(() => {
    if (activeFilter === 'all') return properties;
    return properties.filter((property) => property.status === activeFilter);
  }, [activeFilter, properties]);

  if (!properties.length) {
    return (
      <div className='container empty-state'>
        <h2>No properties published yet</h2>
        <p>Listings from mgcodashboard will appear here automatically after sync.</p>
      </div>
    );
  }

  return (
    <div className='container'>
      <div className='filters reveal'>
        {filters.map((filter) => (
          <button
            key={filter.value}
            type='button'
            className={`filter-pill${activeFilter === filter.value ? ' filter-pill-active' : ''}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className='property-grid'>
        {visibleProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
