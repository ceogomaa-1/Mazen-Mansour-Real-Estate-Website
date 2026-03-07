export function ContactPage() {
  return (
    <>
      <section className='inner-hero'>
        <div className='container reveal'>
          <p className='eyebrow'>Contact</p>
          <h1>Start the conversation.</h1>
          <p>Tell Mike about your goals and timeline. A response is typically sent within one business day.</p>
        </div>
      </section>

      <section className='section'>
        <div className='container contact-wrap'>
          <form className='contact-form reveal'>
            <label>
              Full Name
              <input type='text' name='name' placeholder='Your name' />
            </label>
            <label>
              Email
              <input type='email' name='email' placeholder='you@email.com' />
            </label>
            <label>
              Message
              <textarea name='message' rows={5} placeholder='How can I help?' />
            </label>
            <button type='submit' className='button button-primary'>
              Send Message
            </button>
          </form>

          <aside className='contact-card reveal'>
            <p className='footer-heading'>Direct</p>
            <p>mike@mikemansour.ca</p>
            <p>(647) 555-0198</p>
            <p>Toronto, ON</p>
          </aside>
        </div>
      </section>
    </>
  );
}
