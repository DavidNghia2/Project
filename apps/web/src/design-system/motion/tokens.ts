import type { Transition, Variants } from 'motion/react';

/** Duration scale in seconds aligned with CSS custom properties in tokens.css */
export const MOTION_DURATION = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.22,
  moderate: 0.32,
  slow: 0.5,
} as const;

/** Cubic-bezier easing curves (consistent across CSS & Motion) */
export const MOTION_EASE = {
  /** Exponential deceleration for confident arrivals (zero overshoot) */
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Crisp interactive curve for micro feedback & hover */
  ui: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
  /** Faster exit curve so dismissals feel instantaneous */
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
} as const;

/** Shared spring physics presets for tactile SaaS interactions */
export const MOTION_SPRING = {
  /** Snappy zero-overshoot spring for Sliding Pill, Ink Indicator & Sidebar active bar */
  tab: {
    type: 'spring',
    stiffness: 440,
    damping: 34,
    mass: 0.85,
  } satisfies Transition,

  /** Subtle tactile spring overshoot (~2-3px) for compact date presets & switchers */
  overshoot: {
    type: 'spring',
    stiffness: 460,
    damping: 22,
    mass: 0.75,
  } satisfies Transition,

  /** Smooth responsive spring for drawers, modals, and toasts */
  overlay: {
    type: 'spring',
    stiffness: 380,
    damping: 34,
    mass: 0.9,
  } satisfies Transition,

  /** Crisp micro-interaction spring for buttons, badges, and popovers */
  snappy: {
    type: 'spring',
    stiffness: 520,
    damping: 32,
    mass: 0.7,
  } satisfies Transition,
} as const;

/** Reusable overlay & panel animation presets */
export const MOTION_OVERLAY = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.ui },
  },
  popover: {
    initial: { opacity: 0, scale: 0.96, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97, y: -2 },
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.out },
  },
  modalPanel: {
    initial: { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97, y: 4 },
    transition: { duration: MOTION_DURATION.normal, ease: MOTION_EASE.out },
  },
  tooltip: {
    initial: { opacity: 0, scale: 0.95, y: 3 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97, y: 2 },
    transition: { duration: MOTION_DURATION.instant, ease: MOTION_EASE.ui },
  },
} as const;

/** Capped stagger config so routine warehouse tasks never wait for animations */
export const MOTION_STAGGER = {
  fastDelay: 0.035,
  normalDelay: 0.045,
  maxItemsAnimated: 8,
} as const;

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: MOTION_STAGGER.fastDelay,
      delayChildren: 0.015,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION.normal,
      ease: MOTION_EASE.out,
    },
  },
};
