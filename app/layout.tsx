import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Footer } from '../src/components/Footer';
import { Navbar } from '../src/components/Navbar';
import '../src/styles.css';

export const metadata: Metadata = {
  title: 'Mike Mansour Real Estate',
  description: 'Luxury real estate portfolio and listings for Mike Mansour.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='site-shell'>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
