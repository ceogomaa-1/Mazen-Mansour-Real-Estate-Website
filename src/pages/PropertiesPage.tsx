import { useEffect, useMemo, useState } from 'react';
import { PropertyCard } from '../components/PropertyCard';
import { getProperties } from '../services/properties';
import type { Property, PropertyStatus } from '../types/property';

const filters: { label: string; value: 'all' | PropertyStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'For Sale', value: 'active' },
  { label: 'Sold', value: 'sold' },
  { label: 'Coming Soon', value: 'coming_soon' },
];

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | PropertyStatus>('all');

  useEffect(() => {
    getProperties().then(setProperties);
  }, []);

  const visibleProperties = useMemo(() => {
    if (activeFilter === 'all') return properties;
    return properties.filter((property) => property.status === activeFilter);
  }, [activeFilter, properties]);

  return (
    <>
      <section className='inner-hero'>
        <div className='container reveal'>
          <p className='eyebrow'>Properties</p>
          <h1>Portfolio Listings</h1>
          <p>Browse active homes, sold properties, and upcoming opportunities represented by Mike Mansour.</p>
        </div>
      </section>

      <section className='section'>
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
      </section>
    </>
  );
}
