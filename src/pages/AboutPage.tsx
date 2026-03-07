export function AboutPage() {
  return (
    <>
      <section className='inner-hero'>
        <div className='container reveal'>
          <p className='eyebrow'>About</p>
          <h1>Meet Mike Mansour</h1>
          <p>
            Mike blends local market expertise with modern marketing systems to create standout listing exposure and smooth
            client experiences.
          </p>
        </div>
      </section>

      <section className='section'>
        <div className='container about-grid'>
          <article className='about-card reveal'>
            <h2>What clients get</h2>
            <p>
              Strategic pricing, cinematic media, targeted paid campaigns, and precise negotiation. The goal is simple:
              protect your downside and maximize your upside.
            </p>
          </article>
          <article className='about-card reveal'>
            <h2>Coverage</h2>
            <p>Toronto, Mississauga, Vaughan, and key GTA luxury corridors for both primary residences and investments.</p>
          </article>
        </div>
      </section>
    </>
  );
}
