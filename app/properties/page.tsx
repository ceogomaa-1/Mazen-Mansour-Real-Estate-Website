import { PropertiesClient } from '../../src/components/PropertiesClient';
import { getProperties } from '../../src/services/properties';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PropertiesPage() {
  const properties = await getProperties();
  const heroImage =
    properties.find((property) => property.image)?.image ??
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80';
  const summary = {
    all: properties.length,
    active: properties.filter((property) => property.status === 'active').length,
    sold: properties.filter((property) => property.status === 'sold').length,
  };

  return (
    <>
      <section className='page-hero'>
        <div className='container page-hero-grid'>
          <div className='page-hero-copy reveal'>
            <div>
              <p className='eyebrow'>Properties</p>
              <h1>Portfolio listings.</h1>
            </div>
            <p>
              Browse active homes, sold properties, and upcoming opportunities represented by Mike Mansour across Toronto
              and the GTA.
            </p>
            <div className='hero-meta'>
              <div className='hero-stat'>
                <strong>{summary.all}</strong>
                <span>Total Listings</span>
              </div>
              <div className='hero-stat'>
                <strong>{summary.active}</strong>
                <span>Currently Active</span>
              </div>
              <div className='hero-stat'>
                <strong>{summary.sold}</strong>
                <span>Sold Portfolio</span>
              </div>
            </div>
          </div>

          <div className='page-hero-visual reveal'>
            <img src={heroImage} alt='Luxury residence exterior' />
            <div className='page-hero-card'>
              <p className='section-label'>Selected Collection</p>
              <p>Image-led presentation for premium homes, investment properties, and market-ready listings.</p>
            </div>
          </div>
        </div>
      </section>

      <section className='section'>
        <PropertiesClient properties={properties} />
      </section>
    </>
  );
}
