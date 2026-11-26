import React, { ViewTransition } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { MOTION_DURATION, MOTION_EASE } from './tokens';

export interface PageTransitionProps {
  /** Key identifying the active route or view state. */
  transitionKey: string;
  /** Optional native view-transition-name for compositor continuity. */
  name?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Combines React 19 native <ViewTransition> (when available at runtime) with
 * a fast, zero-blocking Motion fade+rise entrance for instant perceived smoothness
 * across all browsers and jsdom test environments.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  transitionKey,
  name = 'app-page-content',
  children,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const content = (
    <m.div
      key={transitionKey}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : MOTION_DURATION.normal,
        ease: MOTION_EASE.out,
      }}
      className={className}
    >
      {children}
    </m.div>
  );

  // React 19 <ViewTransition> gracefully degrades in browsers without View Transition API
  if (typeof ViewTransition !== 'undefined') {
    return <ViewTransition name={name}>{content}</ViewTransition>;
  }

  return content;
};

export interface SkeletonTransitionProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  name?: string;
}

/**
 * Smoothly cross-fades from skeleton placeholder to live content using React 19 <ViewTransition>
 * and subtle opacity arrival, avoiding abrupt layout snaps.
 */
export const SkeletonTransition: React.FC<SkeletonTransitionProps> = ({
  loading,
  skeleton,
  children,
  name,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const inner = loading ? (
    <m.div
      key="skeleton"
      initial={{ opacity: 0.85 }}
      animate={{ opacity: 1 }}
      transition={{ duration: MOTION_DURATION.fast }}
    >
      {skeleton}
    </m.div>
  ) : (
    <m.div
      key="content"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : MOTION_DURATION.normal,
        ease: MOTION_EASE.out,
      }}
    >
      {children}
    </m.div>
  );

  if (typeof ViewTransition !== 'undefined') {
    return <ViewTransition name={name}>{inner}</ViewTransition>;
  }
  return inner;
};
