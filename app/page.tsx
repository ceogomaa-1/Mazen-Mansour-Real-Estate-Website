import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className='hero'>
        <div className='hero-overlay' />
        <img
          className='hero-media'
          src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80'
          alt='Luxury home exterior'
        />

        <div className='container hero-content reveal'>
          <p className='eyebrow'>Mike Mansour Real Estate</p>
          <h1>Buy. Sell. Invest. With confidence.</h1>
          <p>
            Precision marketing, premium listing strategy, and a data-driven process designed to maximize value in every
            transaction.
          </p>
          <div className='hero-actions'>
            <Link href='/properties' className='button button-primary'>
              View Properties
            </Link>
            <Link href='/contact' className='button button-ghost'>
              Let&apos;s Chat
            </Link>
          </div>
        </div>
      </section>

      <section className='section section-contrast'>
        <div className='container stats-grid'>
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
      </section>

      <section className='section'>
        <div className='container section-header reveal'>
          <p className='eyebrow'>From Our Clients</p>
          <h2>Client trust is the benchmark.</h2>
        </div>
        <div className='container testimonials-grid'>
          <article className='testimonial reveal'>
            <p>
              Mike handled everything with complete professionalism and clarity. We sold over asking and bought our next
              home without stress.
            </p>
            <p className='testimonial-author'>- Jason R.</p>
          </article>
          <article className='testimonial reveal'>
            <p>
              Every detail was managed at a high level, from staging and media to negotiation. We felt fully supported from
              start to close.
            </p>
            <p className='testimonial-author'>- Sarah L.</p>
          </article>
        </div>
      </section>
    </>
  );
}
