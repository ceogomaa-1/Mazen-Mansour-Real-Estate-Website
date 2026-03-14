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
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const touchStartYRef = useRef(0);
  const mobileRef = useRef(false);
  const expandedRef = useRef(false);
  const shownRef = useRef(false);
  const [showContent, setShowContent] = useState(false);

  const [firstWord, ...remainingWords] = title.split(' ');
  const restOfTitle = remainingWords.join(' ');

  const syncProgress = (progress: number) => {
    const node = sectionRef.current;
    if (!node) return;

    const mediaWidth = 300 + progress * (mobileRef.current ? 650 : 1250);
    const mediaHeight = 400 + progress * (mobileRef.current ? 200 : 400);
    const textTranslate = progress * (mobileRef.current ? 180 : 150);

    node.style.setProperty('--scroll-hero-progress', progress.toString());
    node.style.setProperty('--scroll-hero-media-width', `${mediaWidth}px`);
    node.style.setProperty('--scroll-hero-media-height', `${mediaHeight}px`);
    node.style.setProperty('--scroll-hero-text-left', `${-textTranslate}vw`);
    node.style.setProperty('--scroll-hero-text-right', `${textTranslate}vw`);
    node.style.setProperty('--scroll-hero-backdrop-opacity', `${1 - progress}`);
    node.style.setProperty('--scroll-hero-media-overlay-opacity', `${Math.max(0.16, 0.5 - progress * 0.3)}`);
  };

  const queueProgress = (nextProgress: number) => {
    progressRef.current = Math.min(Math.max(nextProgress, 0), 1);

    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const progress = progressRef.current;
      syncProgress(progress);

      const shouldShow = progress >= 0.75;
      if (shownRef.current !== shouldShow) {
        shownRef.current = shouldShow;
        setShowContent(shouldShow);
      }

      expandedRef.current = progress >= 1;
    });
  };

  useEffect(() => {
    const checkIfMobile = () => {
      mobileRef.current = window.innerWidth < 768;
      syncProgress(progressRef.current);
    };

    checkIfMobile();
    queueProgress(0);
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [mediaType]);

  useEffect(() => {
    const isNearTop = () => {
      const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
      return top <= 8 && top >= -80;
    };

    const handleWheel = (event: globalThis.WheelEvent) => {
      if (!isNearTop() && !expandedRef.current) return;

      if (!expandedRef.current) {
        event.preventDefault();
        queueProgress(progressRef.current + event.deltaY * 0.0009);
        return;
      }

      if (event.deltaY < 0 && window.scrollY <= 5) {
        event.preventDefault();
        queueProgress(Math.max(0, progressRef.current + event.deltaY * 0.0012));
      }
    };

    const handleTouchStart = (event: globalThis.TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: globalThis.TouchEvent) => {
      if (!touchStartYRef.current) return;
      if (!isNearTop() && !expandedRef.current) return;

      const touchY = event.touches[0]?.clientY ?? 0;
      const deltaY = touchStartYRef.current - touchY;

      if (!expandedRef.current) {
        event.preventDefault();
        queueProgress(progressRef.current + deltaY * (deltaY < 0 ? 0.008 : 0.005));
      } else if (deltaY < -20 && window.scrollY <= 5) {
        event.preventDefault();
        queueProgress(Math.max(0, progressRef.current + deltaY * 0.008));
      }

      touchStartYRef.current = touchY;
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = 0;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

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

          <section className={`scroll-hero-content${showContent ? ' scroll-hero-content-visible' : ''}`}>{children}</section>
        </div>
      </section>
    </div>
  );
}
