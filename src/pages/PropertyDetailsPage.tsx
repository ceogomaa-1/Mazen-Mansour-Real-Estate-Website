import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPropertyBySlug } from '../services/properties';
import type { Property } from '../types/property';

export function PropertyDetailsPage() {
  const { slug = '' } = useParams();
  const [property, setProperty] = useState<Property | undefined>();

  useEffect(() => {
    getPropertyBySlug(slug).then(setProperty);
  }, [slug]);

  if (!property) {
    return (
      <section className='section'>
        <div className='container empty-state'>
          <h1>Property not found</h1>
          <p>The listing may have been removed or updated.</p>
          <Link to='/properties' className='button button-primary'>
            Back to Properties
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className='property-hero'>
        <img src={property.image} alt={property.title} />
        <div className='property-hero-overlay'>
          <div className='container reveal'>
            <p className='eyebrow'>Property Detail</p>
            <h1>{property.title}</h1>
            <p>
              {property.address}, {property.city}
            </p>
          </div>
        </div>
      </section>

      <section className='section'>
        <div className='container property-details-grid'>
          <article className='property-detail-card reveal'>
            <p className='property-price-lg'>{property.price}</p>
            <p>
              {property.bedrooms} Beds • {property.bathrooms} Baths • {property.sqft.toLocaleString()} sq ft
            </p>
            <p>{property.description}</p>
            <div className='highlight-list'>
              {property.highlights.map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
          </article>

          <aside className='property-gallery reveal'>
            {property.gallery.map((image) => (
              <img key={image} src={image} alt={property.title} loading='lazy' />
            ))}
          </aside>
        </div>
      </section>
    </>
  );
}
