import { PropertiesClient } from '../../src/components/PropertiesClient';
import { getProperties } from '../../src/services/properties';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PropertiesPage() {
  const properties = await getProperties();

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
          </div>

          <div className='page-hero-visual reveal'>
            <img
              src='https://images.unsplash.com/photo-1613977257593-487ecd136cc3?auto=format&fit=crop&w=1800&q=80'
              alt='Luxury residence exterior'
            />
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
