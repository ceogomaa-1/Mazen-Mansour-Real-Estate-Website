'use client';

import { useState } from 'react';

type PropertyGalleryCarouselProps = {
  title: string;
  images: string[];
};

export function PropertyGalleryCarousel({ title, images }: PropertyGalleryCarouselProps) {
  const slides = images.length ? images : [''];
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (index: number) => {
    const total = slides.length;
    setActiveIndex((index + total) % total);
  };

  return (
    <section className='property-gallery-shell reveal'>
      <div className='property-gallery-stage'>
        <img src={slides[activeIndex]} alt={`${title} image ${activeIndex + 1}`} className='property-gallery-stage-image' />
        {slides.length > 1 ? (
          <>
            <button type='button' className='gallery-arrow gallery-arrow-left' onClick={() => goTo(activeIndex - 1)}>
              <span aria-hidden='true'>‹</span>
              <span className='sr-only'>Previous image</span>
            </button>
            <button type='button' className='gallery-arrow gallery-arrow-right' onClick={() => goTo(activeIndex + 1)}>
              <span aria-hidden='true'>›</span>
              <span className='sr-only'>Next image</span>
            </button>
          </>
        ) : null}
        <div className='property-gallery-counter'>
          {activeIndex + 1} / {slides.length}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className='property-gallery-thumbs'>
          {slides.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type='button'
              className={`property-gallery-thumb${index === activeIndex ? ' property-gallery-thumb-active' : ''}`}
              onClick={() => goTo(index)}
            >
              <img src={image} alt={`${title} thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
