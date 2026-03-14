'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Properties', to: '/properties' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className='site-header'>
      <div className='container header-inner'>
        <Link href='/' className='brand-mark'>
          <span className='brand-kicker'>Toronto Luxury Real Estate</span>
          <span className='brand-wordmark'>Mike Mansour</span>
        </Link>

        <div className='nav-center-shell'>
          <nav className='main-nav' aria-label='Main navigation'>
            {navItems.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={`nav-link${pathname === item.to ? ' nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className='nav-meta'>
          <div>By Appointment</div>
          <div>GTA Advisory</div>
        </div>
      </div>
    </header>
  );
}
