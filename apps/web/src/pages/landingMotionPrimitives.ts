import type { Variants } from 'motion/react';

/** Exponential deceleration curve for confident UI settlement (zero overshoot). */
export const LANDING_EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Responsive interactive curve for hover, tab slides, and micro feedback. */
export const LANDING_EASE_UI: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

export const LANDING_VIEWPORT = {
  once: true,
  amount: 0.12,
} as const;

export const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.04,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      ease: LANDING_EASE_OUT,
    },
  },
};

export const heroFrameVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.975 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.62,
      delay: 0.14,
      ease: LANDING_EASE_OUT,
    },
  },
};

export const sectionRevealVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: LANDING_EASE_OUT,
    },
  },
};

export const staggerGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: LANDING_EASE_OUT,
    },
  },
};

export interface LeadingMetricParts {
  target: number;
  suffix: string;
}

/**
 * Extracts a leading integer and trailing localized unit text (e.g. "14 Modules" -> { target: 14, suffix: " Modules" }).
 */
export function splitLeadingMetric(label: string): LeadingMetricParts | null {
  const match = label.trim().match(/^(\d[\d,]*)(.*)$/);
  if (!match) return null;
  const numeric = Number.parseInt(match[1].replace(/,/g, ''), 10);
  if (Number.isNaN(numeric)) return null;
  return {
    target: numeric,
    suffix: match[2] ?? '',
  };
}
