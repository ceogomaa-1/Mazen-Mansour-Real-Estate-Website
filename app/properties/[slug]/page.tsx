import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PropertyGalleryCarousel } from '../../../src/components/PropertyGalleryCarousel';
import { getPropertyBySlug } from '../../../src/services/properties';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PropertyDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const listingId = Array.isArray(resolvedSearchParams.id) ? resolvedSearchParams.id[0] : resolvedSearchParams.id;
  const property = await getPropertyBySlug(slug, listingId);

  if (!property) {
    notFound();
  }

  return (
    <>
      <section className='property-hero'>
        <img src={property.image} alt={property.title} />
        <div className='property-hero-overlay'>
          <div className='container property-hero-copy reveal'>
            <p className='eyebrow'>Property Detail</p>
            <h1>{property.title}</h1>
            <p>
              {property.address}, {property.city}
            </p>
          </div>
        </div>
      </section>

      <section className='section'>
        <div className='container property-layout'>
          <div className='property-main-column'>
            <PropertyGalleryCarousel title={property.title} images={property.gallery} />

            <section className='property-section-card reveal'>
              <div className='property-section-heading'>
                <p className='eyebrow'>Listing Description</p>
                <h2>Overview</h2>
              </div>
              {property.caption ? <p className='property-lead'>{property.caption}</p> : null}
              <p className='property-description'>{property.description}</p>
            </section>

            <section className='property-section-card reveal'>
              <div className='property-section-heading'>
                <p className='eyebrow'>Property Summary</p>
                <h2>Key Details</h2>
              </div>
              <div className='property-summary-grid'>
                <div className='property-summary-item'>
                  <span>Price</span>
                  <strong>{property.price}</strong>
                </div>
                <div className='property-summary-item'>
                  <span>Bedrooms</span>
                  <strong>{property.bedrooms}</strong>
                </div>
                <div className='property-summary-item'>
                  <span>Bathrooms</span>
                  <strong>{property.bathrooms}</strong>
                </div>
                <div className='property-summary-item'>
                  <span>Interior Size</span>
                  <strong>{property.sqft.toLocaleString()} sq ft</strong>
                </div>
                <div className='property-summary-item'>
                  <span>Status</span>
                  <strong>{property.status.replace('_', ' ')}</strong>
                </div>
                <div className='property-summary-item'>
                  <span>Location</span>
                  <strong>{property.city}</strong>
                </div>
              </div>
            </section>
          </div>

          <aside className='property-side-column'>
            <article className='property-detail-card reveal'>
              <p className='eyebrow'>Availability</p>
              <p className='property-price-lg'>{property.price}</p>
              <p className='property-meta-lg'>
                {property.bedrooms} Beds • {property.bathrooms} Baths • {property.sqft.toLocaleString()} sq ft
              </p>
              <p className='property-address-lg'>
                {property.address}, {property.city}
              </p>
              <div className='property-mini-facts'>
                <div>
                  <span>Status</span>
                  <strong>{property.status.replace('_', ' ')}</strong>
                </div>
                <div>
                  <span>Listing ID</span>
                  <strong>{property.id.slice(0, 8)}</strong>
                </div>
              </div>
              <Link href='/contact' className='button button-dark property-cta'>
                Request a Showing
              </Link>
            </article>

            <article className='property-section-card reveal'>
              <div className='property-section-heading'>
                <p className='eyebrow'>Highlights</p>
                <h2>What Stands Out</h2>
              </div>
              <div className='highlight-list'>
                {property.highlights.length ? (
                  property.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)
                ) : (
                  <>
                    <span>Professionally represented</span>
                    <span>Detailed marketing package</span>
                    <span>Private viewings available</span>
                  </>
                )}
              </div>
            </article>
          </aside>
        </div>
      </section>

      <section className='section'>
        <div className='container'>
          <Link href='/properties' className='button button-ghost'>
            Back to Properties
          </Link>
        </div>
      </section>
    </>
  );
}
