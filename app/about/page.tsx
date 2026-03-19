import { AboutPortrait } from '../../src/components/ui/about-portrait';
import { GradualSpacing } from '../../src/components/ui/gradual-spacing';
import { TextRevealByWord } from '../../src/components/ui/text-reveal';

const aboutSections = [
  {
    label: 'A Strategy-First Approach',
    title: 'Mike doesn’t just list homes, he positions them.',
    body: [
      'Every property is treated like a high-value asset, with a tailored strategy designed to maximize exposure, attract qualified buyers, create competitive demand, and achieve the strongest possible sale price.',
      'For buyers, Mike operates with the same level of precision by identifying opportunities, negotiating aggressively, and ensuring every client secures the right property at the right value.',
    ],
  },
  {
    label: 'Client Experience That Stands Out',
    title: 'Clear guidance matters as much as the final result.',
    body: [
      'Real estate is one of the most important financial decisions you’ll ever make. Mike understands that and treats it that way.',
      'His approach is built on clear, honest communication, data-driven insights, strong negotiation expertise, and full transparency from start to finish.',
      'Whether you are buying your first home, upgrading, investing, or selling a luxury property, Mike ensures the process is smooth, informed, and stress-free.',
    ],
  },
  {
    label: 'More Than a Transaction',
    title: 'Trust, repeat business, and referrals are the real scoreboard.',
    body: [
      'For Mike, real estate isn’t just about closing deals — it’s about building long-term relationships.',
      'Many of his clients become repeat clients and referrals, which reflects trust, performance, and consistent results over time.',
    ],
  },
];

const achievements = [
  'Top 2% Realtor in Canada',
  'Top Tier status',
  'Certified Negotiation Expert (CNE)',
  'Executive Circle',
  'Red Diamond',
  'Director’s Platinum Awards',
];

export default function AboutPage() {
  return (
    <>
      <section className='about-page'>
        <div className='container about-hero-grid'>
          <div className='about-story-column'>
            <div className='about-intro-panel reveal'>
              <p className='eyebrow'>About Mike Mansour</p>
              <GradualSpacing className='about-hero-title' text='About Mike Mansour' />
              <p className='about-intro-copy'>
                In today’s competitive real estate market, results don’t come from luck. They come from precision,
                strategy, and experience. That’s exactly what Mike Mansour delivers.
              </p>
            </div>

            <TextRevealByWord
              className='reveal'
              text='Recognized as a Top 2% Realtor in Canada, Mike has built a reputation for consistently outperforming the market and delivering exceptional results for his clients.'
            />

            <section className='about-achievements reveal'>
              {achievements.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </section>

            <section className='about-longform'>
              {aboutSections.map((section, index) => (
                <article key={section.label} className={`about-story-card reveal about-story-card-${index + 1}`}>
                  <p className='section-label'>{section.label}</p>
                  <h2 className='editorial-heading'>{section.title}</h2>
                  <div className='about-story-copy'>
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </section>

            <section className='about-closing-card reveal'>
              <p className='section-label'>Work With a Proven Performer</p>
              <h2 className='editorial-heading'>
                If you’re looking for a real estate professional who combines elite-level results with a client-first
                mindset, Mike Mansour is the partner you want on your side.
              </h2>
              <p>Let’s turn your real estate goals into reality.</p>
            </section>
          </div>

          <aside className='about-portrait-column'>
            <div className='about-portrait-shell reveal'>
              <AboutPortrait src='/mike-mansour-portrait.jpg' alt='Mike Mansour portrait' />
              <div className='about-portrait-overlay-card'>
                <p className='section-label'>About Mike Mansour</p>
                <p>
                  Results-driven real estate advisory built on negotiation strength, market precision, and long-term client
                  trust.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
