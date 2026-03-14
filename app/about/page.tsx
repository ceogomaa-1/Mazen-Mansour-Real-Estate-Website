export default function AboutPage() {
  return (
    <>
      <section className='page-hero'>
        <div className='container page-hero-grid'>
          <div className='page-hero-copy reveal'>
            <div>
              <p className='eyebrow'>About</p>
              <h1>Meet Mike Mansour.</h1>
            </div>
            <p>
              Mike blends local market expertise with modern marketing systems to create standout listing exposure and
              smooth client experiences.
            </p>
          </div>

          <div className='page-hero-visual reveal'>
            <img
              src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=80'
              alt='Modern architectural exterior'
            />
            <div className='page-hero-card'>
              <p className='section-label'>Advisory Focus</p>
              <p>Strategic selling, premium buyer representation, and investment guidance built on clarity.</p>
            </div>
          </div>
        </div>
      </section>

      <section className='section'>
        <div className='container section-stack'>
          <div className='editorial-grid'>
            <article className='editorial-panel reveal'>
              <p className='split-kicker'>Method</p>
              <p className='split-display'>The process stays measured, modern, and presentation-first.</p>
            </article>

            <article className='editorial-panel editorial-copy reveal'>
              <h2 className='editorial-heading'>Representation should feel composed, not chaotic.</h2>
              <p>
                Strategic pricing, cinematic media, targeted paid campaigns, and precise negotiation all support one goal:
                protect your downside and maximize your upside.
              </p>
              <p>
                Coverage includes Toronto, Mississauga, Vaughan, and key GTA luxury corridors for both primary residences
                and investment opportunities.
              </p>
            </article>
          </div>

          <div className='about-grid'>
            <article className='about-card reveal'>
              <p className='section-label'>What Clients Get</p>
              <h2 className='editorial-heading'>Strategic listing execution.</h2>
              <p>Pricing discipline, polished media, targeted promotion, and negotiations handled with intent.</p>
            </article>
            <article className='about-card reveal'>
              <p className='section-label'>Coverage</p>
              <h2 className='editorial-heading'>Toronto and GTA reach.</h2>
              <p>From core Toronto to Mississauga and Vaughan, the advisory focus stays on premium market corridors.</p>
            </article>
            <article className='about-card reveal'>
              <p className='section-label'>Client Experience</p>
              <h2 className='editorial-heading'>Clear, calm, and informed.</h2>
              <p>Every step is explained, every decision is deliberate, and the process stays organized from start to close.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
