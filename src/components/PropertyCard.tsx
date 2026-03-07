import { Link } from 'react-router-dom';
import type { Property } from '../types/property';

const statusLabel: Record<Property['status'], string> = {
  active: 'For Sale',
  sold: 'Sold',
  coming_soon: 'Coming Soon',
};

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className='property-card reveal'>
      <Link to={`/properties/${property.slug}`} className='property-card-link'>
        <div className='property-image-wrap'>
          <img src={property.image} alt={property.title} className='property-image' loading='lazy' />
          <span className={`property-status property-status-${property.status}`}>{statusLabel[property.status]}</span>
        </div>

        <div className='property-card-content'>
          <div className='property-row'>
            <h3>{property.title}</h3>
            <p className='property-price'>{property.price}</p>
          </div>
          <p className='property-address'>
            {property.address}, {property.city}
          </p>
          <p className='property-meta'>
            {property.bedrooms} Beds • {property.bathrooms} Baths • {property.sqft.toLocaleString()} sq ft
          </p>
        </div>
      </Link>
    </article>
  );
}
