import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPropertyBySlug } from '../../../src/services/properties';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PropertyDetailsPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { id?: string };
}) {
  const { slug } = params;
  const property = await getPropertyBySlug(slug, searchParams.id);

  if (!property) {
    notFound();
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

      <section className='section'>
        <div className='container'>
          <Link href='/properties' className='button button-primary'>
            Back to Properties
          </Link>
        </div>
      </section>
    </>
  );
}
