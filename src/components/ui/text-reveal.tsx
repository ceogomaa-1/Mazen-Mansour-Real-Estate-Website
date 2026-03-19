'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

type TextRevealByWordProps = {
  text: string;
  className?: string;
};

export function TextRevealByWord({ text, className = '' }: TextRevealByWordProps) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start 0.85', 'end 0.25'],
  });

  const words = text.split(' ');

  return (
    <div ref={targetRef} className={`text-reveal-shell ${className}`}>
      <div className='text-reveal-sticky'>
        <p className='text-reveal-copy'>
          {words.map((word, index) => {
            const start = index / words.length;
            const end = start + 1 / words.length;

            return (
              <RevealWord key={`${word}-${index}`} progress={scrollYProgress} range={[start, end]}>
                {word}
              </RevealWord>
            );
          })}
        </p>
      </div>
    </div>
  );
}

function RevealWord({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, [range[0], range[1]], [0.18, 1]);

  return (
    <span className='text-reveal-word'>
      <span className='text-reveal-word-shadow'>{children}</span>
      <motion.span style={{ opacity }} className='text-reveal-word-live'>
        {children}
      </motion.span>
    </span>
  );
}
