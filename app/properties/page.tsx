import { PropertiesClient } from '../../src/components/PropertiesClient';
import { getProperties } from '../../src/services/properties';

export default async function PropertiesPage() {
  const properties = await getProperties();

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
        <PropertiesClient properties={properties} />
      </section>
    </>
  );
}
