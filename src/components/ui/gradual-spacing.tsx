'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';

type GradualSpacingProps = {
  text: string;
  duration?: number;
  delayMultiple?: number;
  framerProps?: Variants;
  className?: string;
};

export function GradualSpacing({
  text,
  duration = 0.45,
  delayMultiple = 0.028,
  framerProps = {
    hidden: { opacity: 0, x: -18 },
    visible: { opacity: 1, x: 0 },
  },
  className = '',
}: GradualSpacingProps) {
  return (
    <div className='gradual-spacing'>
      <AnimatePresence>
        {text.split('').map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            initial='hidden'
            animate='visible'
            exit='hidden'
            variants={framerProps}
            transition={{ duration, delay: index * delayMultiple }}
            className={className}
          >
            {char === ' ' ? <span>&nbsp;</span> : char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
