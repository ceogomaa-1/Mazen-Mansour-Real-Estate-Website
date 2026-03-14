'use client';

import type { ReactNode, TouchEvent as ReactTouchEvent, WheelEvent as ReactWheelEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (event: globalThis.WheelEvent) => {
      const sectionTop = sectionRef.current?.getBoundingClientRect().top ?? 0;
      const nearTop = sectionTop <= 8 && sectionTop >= -80;

      if (!nearTop && !mediaFullyExpanded) {
        return;
      }

      if (mediaFullyExpanded && event.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        setShowContent(false);
        event.preventDefault();
        return;
      }

      if (!mediaFullyExpanded) {
        event.preventDefault();
        const nextProgress = Math.min(Math.max(scrollProgress + event.deltaY * 0.0009, 0), 1);
        setScrollProgress(nextProgress);

        if (nextProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (nextProgress < 0.75) {
          setShowContent(false);
        }
      }
    };

    const handleTouchStart = (event: globalThis.TouchEvent) => {
      setTouchStartY(event.touches[0]?.clientY ?? 0);
    };

    const handleTouchMove = (event: globalThis.TouchEvent) => {
      if (!touchStartY) return;

      const sectionTop = sectionRef.current?.getBoundingClientRect().top ?? 0;
      const nearTop = sectionTop <= 8 && sectionTop >= -80;

      if (!nearTop && !mediaFullyExpanded) {
        return;
      }

      const touchY = event.touches[0]?.clientY ?? 0;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        setShowContent(false);
        event.preventDefault();
      } else if (!mediaFullyExpanded) {
        event.preventDefault();
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005;
        const nextProgress = Math.min(Math.max(scrollProgress + deltaY * scrollFactor, 0), 1);
        setScrollProgress(nextProgress);

        if (nextProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (nextProgress < 0.75) {
          setShowContent(false);
        }
      }

      setTouchStartY(touchY);
    };

    const handleTouchEnd = () => {
      setTouchStartY(0);
    };

    const handleScroll = () => {
      if (!mediaFullyExpanded && window.scrollY > 0 && (sectionRef.current?.getBoundingClientRect().top ?? 0) >= 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mediaFullyExpanded, scrollProgress, touchStartY]);

  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);
  const [firstWord, ...remainingWords] = title.split(' ');
  const restOfTitle = remainingWords.join(' ');

  const blockWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!mediaFullyExpanded) event.preventDefault();
  };

  const blockTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!mediaFullyExpanded) event.preventDefault();
  };

  return (
    <div ref={sectionRef} className='scroll-hero-shell' onWheel={blockWheel} onTouchMove={blockTouchMove}>
      <section className='scroll-hero-stage'>
        <motion.div
          className='scroll-hero-background'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 - scrollProgress }}
          transition={{ duration: 0.12 }}
        >
          <img src={bgImageSrc} alt='Hero background' className='scroll-hero-background-image' />
          <div className='scroll-hero-background-overlay' />
        </motion.div>

        <div className='container scroll-hero-inner'>
          <div className='scroll-hero-center'>
            <div
              className='scroll-hero-media-frame'
              style={{
                width: `${mediaWidth}px`,
                height: `${mediaHeight}px`,
                maxWidth: '95vw',
                maxHeight: '86vh',
              }}
            >
              {mediaType === 'video' ? (
                <div className='scroll-hero-video-wrap'>
                  <video
                    src={mediaSrc}
                    poster={posterSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload='auto'
                    className='scroll-hero-video'
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                  />
                  <motion.div
                    className='scroll-hero-media-overlay'
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              ) : (
                <div className='scroll-hero-video-wrap'>
                  <img src={mediaSrc} alt={title} className='scroll-hero-video' />
                  <motion.div
                    className='scroll-hero-media-overlay'
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 0.45 - scrollProgress * 0.25 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              )}

              <div className='scroll-hero-meta'>
                {eyebrow ? (
                  <p className='scroll-hero-eyebrow' style={{ transform: `translateX(-${textTranslateX}vw)` }}>
                    {eyebrow}
                  </p>
                ) : null}
                {scrollToExpand ? (
                  <p className='scroll-hero-expand' style={{ transform: `translateX(${textTranslateX}vw)` }}>
                    {scrollToExpand}
                  </p>
                ) : null}
              </div>
            </div>

            <div className={`scroll-hero-title-wrap${textBlend ? ' scroll-hero-title-blend' : ''}`}>
              <motion.h1 className='scroll-hero-title' style={{ transform: `translateX(-${textTranslateX}vw)` }}>
                {firstWord}
              </motion.h1>
              <motion.h1 className='scroll-hero-title scroll-hero-title-rest' style={{ transform: `translateX(${textTranslateX}vw)` }}>
                {restOfTitle}
              </motion.h1>
            </div>
          </div>

          <motion.section
            className='scroll-hero-content'
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ duration: 0.7 }}
          >
            {children}
          </motion.section>
        </div>
      </section>
    </div>
  );
}
