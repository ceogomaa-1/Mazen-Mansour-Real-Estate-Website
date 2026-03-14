import Link from 'next/link';
import ScrollExpansionHero from '../src/components/ui/scroll-expansion-hero';
import { getProperties } from '../src/services/properties';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const properties = await getProperties();
  const featured = properties.slice(0, 2);
  const heroSpotlight = properties[0];
  const heroImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80';
  const heroVideo = 'https://www.pexels.com/download/video/7578552/';

  return (
    <>
      <ScrollExpansionHero
        mediaType='video'
        mediaSrc={heroVideo}
        posterSrc={heroImage}
        bgImageSrc={heroImage}
        title='Luxury property, framed like architecture.'
        eyebrow='Mike Mansour Real Estate'
        scrollToExpand='Scroll to expand'
        textBlend
      >
        <div className='hero-reveal-panel reveal'>
          <div className='hero-copy'>
            <div className='hero-copy-main'>
              <p className='hero-lead'>
                Precision marketing, premium listing strategy, and a data-driven process designed to maximize value while
                keeping every step clear for buyers, sellers, and investors.
              </p>
            </div>

            <div className='hero-actions'>
              <Link href='/properties' className='button button-dark'>
                View Properties
              </Link>
              <Link href='/contact' className='button button-ghost'>
                Start a Conversation
              </Link>
            </div>

            <div className='hero-meta'>
              <div className='hero-stat'>
                <strong>$120M+</strong>
                <span>Career Sales Volume</span>
              </div>
              <div className='hero-stat'>
                <strong>180+</strong>
                <span>Transactions Closed</span>
              </div>
              <div className='hero-stat'>
                <strong>19 Days</strong>
                <span>Average Days On Market</span>
              </div>
            </div>

            {heroSpotlight ? (
              <div className='hero-spotlight'>
                <div>
                  <p className='section-label'>Current Spotlight</p>
                  <p className='hero-spotlight-title'>{heroSpotlight.title}</p>
                </div>
                <p className='hero-spotlight-meta'>
                  {heroSpotlight.address}, {heroSpotlight.city} • {heroSpotlight.price}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </ScrollExpansionHero>

      <section className='section'>
        <div className='container section-stack'>
          <div className='editorial-grid'>
            <article className='editorial-panel reveal'>
              <p className='split-kicker'>Approach</p>
              <p className='split-display'>Not just listed. Carefully staged, positioned, and launched.</p>
            </article>

            <article className='editorial-panel editorial-copy reveal'>
              <h2 className='editorial-heading'>Every property deserves a point of view.</h2>
              <p>
                Mike blends local market expertise with modern marketing systems to create standout listing exposure and
                smoother client experiences from strategy through closing.
              </p>
              <p>
                Cinematic media, strong pricing discipline, buyer targeting, and measured execution turn attention into real
                leverage at the negotiation table.
              </p>
            </article>
          </div>

          <div className='stats-grid'>
            <article className='stat-card reveal'>
              <p className='stat-value'>$120M+</p>
              <p className='stat-label'>Career Sales Volume</p>
            </article>
            <article className='stat-card reveal'>
              <p className='stat-value'>180+</p>
              <p className='stat-label'>Transactions Closed</p>
            </article>
            <article className='stat-card reveal'>
              <p className='stat-value'>19 Days</p>
              <p className='stat-label'>Average Days On Market</p>
            </article>
          </div>
        </div>
      </section>

      <section className='section'>
        <div className='container section-stack'>
          <div className='section-header reveal'>
            <div>
              <p className='eyebrow'>Listings</p>
              <h2>Current portfolio and represented homes.</h2>
            </div>
            <p>
              Your existing property inventory stays front and center. The presentation now leads with stronger imagery,
              tighter hierarchy, and a more editorial pace.
            </p>
          </div>

          <div className='listings-feature'>
            {featured.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.slug}?id=${property.id}`}
                className='listing-feature-card reveal'
              >
                <img src={property.image} alt={property.title} />
                <div className='listing-feature-copy'>
                  <p className='listing-index'>{property.status.replace('_', ' ')}</p>
                  <h3>{property.title}</h3>
                  <p>
                    {property.address}, {property.city}
                  </p>
                  <p>{property.price}</p>
                </div>
              </Link>
            ))}
          </div>

          <div>
            <Link href='/properties' className='button button-ghost'>
              Explore All Listings
            </Link>
          </div>
        </div>
      </section>

      <section className='section'>
        <div className='container section-stack'>
          <div className='section-header reveal'>
            <div>
              <p className='eyebrow'>Client Trust</p>
              <h2>High standards, clear guidance, and outcomes that hold up.</h2>
            </div>
            <p>
              The design language changes here, but the core positioning remains the same: professional execution and a
              calm, informed client experience.
            </p>
          </div>

          <div className='testimonials-grid'>
            <article className='testimonial reveal'>
              <p>
                Mike handled everything with complete professionalism and clarity. We sold over asking and bought our next
                home without stress.
              </p>
              <p className='testimonial-author'>Jason R.</p>
            </article>
            <article className='testimonial reveal'>
              <p>
                Every detail was managed at a high level, from staging and media to negotiation. We felt fully supported
                from start to close.
              </p>
              <p className='testimonial-author'>Sarah L.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
