export default function ContactPage() {
  return (
    <>
      <section className='page-hero'>
        <div className='container page-hero-grid'>
          <div className='page-hero-copy reveal'>
            <div>
              <p className='eyebrow'>Contact</p>
              <h1>Start the conversation.</h1>
            </div>
            <p>Tell Mike about your goals and timeline. A response is typically sent within one business day.</p>
          </div>

          <div className='page-hero-visual reveal'>
            <img
              src='https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80'
              alt='Architectural interior'
            />
            <div className='page-hero-card'>
              <p className='section-label'>Direct Contact</p>
              <p>Seller consultations, buying strategy, investment guidance, and private showing requests.</p>
            </div>
          </div>
        </div>
      </section>

      <section className='section'>
        <div className='container contact-wrap'>
          <form className='contact-form reveal'>
            <label>
              <span className='contact-label'>Full Name</span>
              <input type='text' name='name' placeholder='Your name' />
            </label>
            <label>
              <span className='contact-label'>Email</span>
              <input type='email' name='email' placeholder='you@email.com' />
            </label>
            <label>
              <span className='contact-label'>Message</span>
              <textarea name='message' rows={6} placeholder='How can I help?' />
            </label>
            <button type='submit' className='button button-dark'>
              Send Message
            </button>
          </form>

          <aside className='contact-card reveal'>
            <p className='section-label'>Direct</p>
            <h2 className='editorial-heading'>Let&apos;s talk about your next move.</h2>
            <p>mike@mikemansour.ca</p>
            <p>(647) 555-0198</p>
            <p>Toronto, ON</p>
          </aside>
        </div>
      </section>
    </>
  );
}
