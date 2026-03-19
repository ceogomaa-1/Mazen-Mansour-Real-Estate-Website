'use client';

import { useState } from 'react';

type AboutPortraitProps = {
  src: string;
  alt: string;
};

export function AboutPortrait({ src, alt }: AboutPortraitProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className='about-portrait-fallback'>
        <p className='section-label'>Mike Mansour</p>
        <h3>Portrait Ready</h3>
        <p>The About layout is wired for Mike&apos;s portrait and will use `/mike-mansour-portrait.jpg` automatically once it exists in `public`.</p>
      </div>
    );
  }

  return <img src={src} alt={alt} className='about-portrait-image' onError={() => setFailed(true)} />;
}
