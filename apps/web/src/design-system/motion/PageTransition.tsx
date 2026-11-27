import React from 'react';
import { m } from 'motion/react';
import { useSafeReducedMotion } from './hooks';
import { MOTION_DURATION, MOTION_EASE } from './tokens';

export interface PageTransitionProps {
  /** Key identifying the active route or view state. */
  transitionKey: string;
  /** Optional transition identifier preserved for API compatibility. */
  name?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Lightweight route arrival wrapper using GPU opacity fade without wrapping in native
 * `<ViewTransition>` bitmap snapshots (which freeze the first ~250ms of live Framer Motion
 * Stagger cascades on Chromium/Edge). Keeps Sidebar and Topbar completely stationary.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  transitionKey,
  children,
  className = '',
}) => {
  const shouldReduceMotion = useSafeReducedMotion();

  return (
    <m.div
      key={transitionKey}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0.01 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.16,
        ease: MOTION_EASE.ui,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
};

export interface SkeletonTransitionProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  name?: string;
}

/**
 * Smoothly cross-fades from skeleton placeholder to live content avoiding abrupt layout snaps.
 */
export const SkeletonTransition: React.FC<SkeletonTransitionProps> = ({
  loading,
  skeleton,
  children,
}) => {
  const shouldReduceMotion = useSafeReducedMotion();

  if (loading) {
    return (
      <m.div
        key="skeleton"
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ duration: MOTION_DURATION.fast }}
      >
        {skeleton}
      </m.div>
    );
  }

  return (
    <m.div
      key="content"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0.01, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : MOTION_DURATION.normal,
        ease: MOTION_EASE.out,
      }}
    >
      {children}
    </m.div>
  );
};
