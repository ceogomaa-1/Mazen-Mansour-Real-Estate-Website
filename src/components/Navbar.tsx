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
        <Link href='/' className='brand-wordmark'>
          Mike Mansour
        </Link>

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
    </header>
  );
}
