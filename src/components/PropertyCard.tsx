import Link from 'next/link';
import type { Property } from '../types/property';

const statusLabel: Record<Property['status'], string> = {
  active: 'For Sale',
  sold: 'Sold',
  coming_soon: 'Coming Soon',
};

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className='property-card reveal'>
      <Link href={`/properties/${property.slug}?id=${property.id}`} className='property-card-link'>
        <div className='property-image-wrap'>
          <img src={property.image} alt={property.title} className='property-image' loading='lazy' />
          <span className={`property-status property-status-${property.status}`}>{statusLabel[property.status]}</span>
        </div>

        <div className='property-card-content'>
          <div className='property-card-topline'>
            <p className='listing-index'>Featured Listing</p>
            <span className='property-card-id'>ID {property.id.slice(0, 6).toUpperCase()}</span>
          </div>
          <div className='property-row'>
            <h3>{property.title}</h3>
            <p className='property-price'>{property.price}</p>
          </div>
          {property.caption ? <p className='property-caption'>{property.caption}</p> : null}
          <p className='property-address'>
            {property.address}, {property.city}
          </p>
          <div className='property-facts'>
            <span>{property.bedrooms} Beds</span>
            <span>{property.bathrooms} Baths</span>
            <span>{property.sqft.toLocaleString()} sq ft</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
