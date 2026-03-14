import Link from 'next/link';

export function Footer() {
  return (
    <footer className='site-footer'>
      <div className='container footer-grid'>
        <div>
          <p className='footer-heading'>Mike Mansour Real Estate</p>
          <p className='footer-brand'>Mike Mansour</p>
          <p className='footer-copy'>
            Luxury real estate advisory for sellers, buyers, and investors across Toronto, Mississauga, Vaughan, and key
            GTA corridors.
          </p>
        </div>

        <div>
          <p className='footer-heading'>Navigate</p>
          <div className='footer-links'>
            <Link href='/'>Home</Link>
            <Link href='/properties'>Properties</Link>
            <Link href='/about'>About</Link>
            <Link href='/contact'>Contact</Link>
          </div>
        </div>

        <div>
          <p className='footer-heading'>Direct</p>
          <div className='footer-meta'>
            <p>Toronto, Ontario</p>
            <p>(647) 555-0198</p>
            <p>mike@mikemansour.ca</p>
          </div>
        </div>
      </div>
      <div className='container footer-bottom'>
        <p>Copyright Mike Mansour {new Date().getFullYear()}. All rights reserved.</p>
      </div>
    </footer>
  );
}
