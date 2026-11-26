import React from 'react';
import { domMax, LazyMotion, MotionConfig } from 'motion/react';

export interface MotionRootProps {
  children: React.ReactNode;
}

/**
 * Application-wide Motion Design System root.
 * Uses LazyMotion with domMax (~25KB gzip) to power layoutId (Sliding Pill, Ink Indicator,
 * Sidebar Active Indicator), AnimatePresence, spring physics, and touch gestures while
 * automatically honoring OS-level prefers-reduced-motion preferences.
 */
export const MotionRoot: React.FC<MotionRootProps> = ({ children }) => {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax}>{children}</LazyMotion>
    </MotionConfig>
  );
};
