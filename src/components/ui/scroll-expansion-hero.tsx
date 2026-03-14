'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

interface ScrollExpansionHeroProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title: string;
  eyebrow?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

export default function ScrollExpansionHero({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  eyebrow,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpansionHeroProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const mobileRef = useRef(false);
  const [showContent, setShowContent] = useState(false);

  const [firstWord, ...remainingWords] = title.split(' ');
  const restOfTitle = remainingWords.join(' ');

  const syncProgress = (progress: number) => {
    const node = sectionRef.current;
    if (!node) return;

    const mediaWidth = 300 + progress * (mobileRef.current ? 650 : 1250);
    const mediaHeight = 400 + progress * (mobileRef.current ? 200 : 400);
    const textTranslate = progress * (mobileRef.current ? 180 : 150);

    node.style.setProperty('--scroll-hero-media-width', `${mediaWidth}px`);
    node.style.setProperty('--scroll-hero-media-height', `${mediaHeight}px`);
    node.style.setProperty('--scroll-hero-text-left', `${-textTranslate}vw`);
    node.style.setProperty('--scroll-hero-text-right', `${textTranslate}vw`);
    node.style.setProperty('--scroll-hero-backdrop-opacity', `${1 - progress}`);
    node.style.setProperty('--scroll-hero-media-overlay-opacity', `${Math.max(0.16, 0.5 - progress * 0.3)}`);
    setShowContent(progress >= 0.72);
  };

  useEffect(() => {
    const updateMobile = () => {
      mobileRef.current = window.innerWidth < 768;
    };

    const handleScroll = () => {
      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;

        const traveled = Math.max(0, -rect.top);
        const range = window.innerHeight * 0.95;
        const progress = Math.min(Math.max(traveled / range, 0), 1);
        syncProgress(progress);
      });
    };

    updateMobile();
    handleScroll();

    window.addEventListener('resize', updateMobile);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', updateMobile);
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [mediaType]);

  return (
    <div ref={sectionRef} className='scroll-hero-shell'>
      <section className='scroll-hero-stage'>
        <div className='scroll-hero-background'>
          <img src={bgImageSrc} alt='Hero background' className='scroll-hero-background-image' />
          <div className='scroll-hero-background-overlay' />
        </div>

        <div className='container scroll-hero-inner'>
          <div className='scroll-hero-center'>
            <div className='scroll-hero-media-frame'>
              {mediaType === 'video' ? (
                <div className='scroll-hero-video-wrap'>
                  <video
                    src={mediaSrc}
                    poster={posterSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload='metadata'
                    className='scroll-hero-video'
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                  />
                  <div className='scroll-hero-media-overlay' />
                </div>
              ) : (
                <div className='scroll-hero-video-wrap'>
                  <img src={mediaSrc} alt={title} className='scroll-hero-video' />
                  <div className='scroll-hero-media-overlay' />
                </div>
              )}

              <div className='scroll-hero-meta'>
                {eyebrow ? <p className='scroll-hero-eyebrow'>{eyebrow}</p> : null}
                {scrollToExpand ? <p className='scroll-hero-expand'>{scrollToExpand}</p> : null}
              </div>
            </div>

            <div className={`scroll-hero-title-wrap${textBlend ? ' scroll-hero-title-blend' : ''}`}>
              <h1 className='scroll-hero-title scroll-hero-title-first'>{firstWord}</h1>
              <h1 className='scroll-hero-title scroll-hero-title-rest'>{restOfTitle}</h1>
            </div>
          </div>
        </div>
      </section>

      <section className={`scroll-hero-content${showContent ? ' scroll-hero-content-visible' : ''}`}>{children}</section>
    </div>
  );
}
