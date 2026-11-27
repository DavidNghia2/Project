import type { Transition, Variant, Variants } from 'motion/react';

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

/** Reusable overlay & panel animation presets (exit is deliberately faster than entrance) */
export const MOTION_OVERLAY = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: MOTION_DURATION.instant, ease: MOTION_EASE.exit } },
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.ui },
  },
  popover: {
    initial: { opacity: 0, scale: 0.96, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: -2,
      transition: { duration: 0.095, ease: MOTION_EASE.exit },
    },
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.out },
  },
  modalPanel: {
    initial: { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: 4,
      transition: { duration: 0.11, ease: MOTION_EASE.exit },
    },
    transition: { duration: 0.21, ease: MOTION_EASE.out },
  },
  tooltip: {
    initial: { opacity: 0, scale: 0.95, y: 3 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: {
      opacity: 0,
      scale: 0.97,
      y: 2,
      transition: { duration: 0.08, ease: MOTION_EASE.exit },
    },
    transition: { duration: MOTION_DURATION.instant, ease: MOTION_EASE.ui },
  },
} as const;

/** Capped stagger config so routine warehouse tasks never wait for animations */
export const MOTION_STAGGER = {
  fastDelay: 0.035,
  normalDelay: 0.045,
  maxItemsAnimated: 8,
} as const;

export type StaggerPreset =
  | 'header'
  | 'sections'
  | 'cards'
  | 'list'
  | 'tableRow'
  | 'modal'
  | 'form'
  | 'chart'
  | 'expressive';

export interface StaggerPresetConfig {
  step: number;
  delayChildren: number;
  duration: number;
  distanceY: number;
  distanceX?: number;
  initialScale?: number;
  maxItems: number;
}

/**
 * Unified Global Motion Design Language presets calibrated for unmistakable, fluid
 * Linear/Stripe-grade visual cascades while staying snappy and capped on Operate screens.
 */
export const MOTION_STAGGER_PRESETS: Record<StaggerPreset, StaggerPresetConfig> = {
  header: {
    step: 0.07,
    delayChildren: 0,
    duration: 0.32,
    distanceY: 12,
    distanceX: 10,
    maxItems: 2,
  },
  sections: {
    step: 0.09,
    delayChildren: 0.04,
    duration: 0.36,
    distanceY: 16,
    maxItems: 5,
  },
  cards: {
    step: 0.075,
    delayChildren: 0.1,
    duration: 0.36,
    distanceY: 18,
    initialScale: 0.975,
    maxItems: 8,
  },
  list: {
    step: 0.055,
    delayChildren: 0.24,
    duration: 0.28,
    distanceY: 10,
    maxItems: 6,
  },
  tableRow: {
    step: 0.045,
    delayChildren: 0.24,
    duration: 0.28,
    distanceY: 10,
    maxItems: 6,
  },
  modal: {
    step: 0.06,
    delayChildren: 0.06,
    duration: 0.3,
    distanceY: 12,
    maxItems: 5,
  },
  form: {
    step: 0.055,
    delayChildren: 0.06,
    duration: 0.28,
    distanceY: 10,
    maxItems: 5,
  },
  chart: {
    step: 0.04,
    delayChildren: 0.12,
    duration: 0.42,
    distanceY: 0,
    maxItems: 8,
  },
  expressive: {
    step: 0.075,
    delayChildren: 0.06,
    duration: 0.46,
    distanceY: 16,
    maxItems: 8,
  },
} as const;

/**
 * Computes a deterministic stagger delay capped at `maxItems - 1` so long lists,
 * timelines, or chart series never accumulate unbounded entrance latency.
 */
export function getCappedStaggerDelay(
  index: number,
  preset: StaggerPreset = 'cards'
): number {
  const cfg = MOTION_STAGGER_PRESETS[preset];
  const safeIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
  const clampedIndex = Math.max(0, Math.min(safeIndex, cfg.maxItems - 1));
  return Number((cfg.delayChildren + clampedIndex * cfg.step).toFixed(4));
}

export type StaggerVariantChannel = 'default' | 'isolated';

export function getStaggerVariantKeys(channel: StaggerVariantChannel = 'default'): {
  hiddenKey: string;
  visibleKey: string;
} {
  return channel === 'isolated'
    ? { hiddenKey: 'isolatedHidden', visibleKey: 'isolatedVisible' }
    : { hiddenKey: 'hidden', visibleKey: 'visible' };
}

export const REDUCED_MOTION_STATIC_ANIMATE = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
} as const;

export const REDUCED_MOTION_TRANSITION: Transition = {
  duration: 0,
};

export function createStaggerContainerVariants(
  preset: StaggerPreset = 'cards',
  channel: StaggerVariantChannel = 'default',
  options?: { orchestrateChildren?: boolean }
): Variants {
  const cfg = MOTION_STAGGER_PRESETS[preset];
  const { hiddenKey, visibleKey } = getStaggerVariantKeys(channel);
  const orchestrateChildren = options?.orchestrateChildren ?? false;

  return {
    [hiddenKey]: { opacity: 1 },
    [visibleKey]: orchestrateChildren
      ? {
          opacity: 1,
          transition: {
            staggerChildren: cfg.step,
            delayChildren: cfg.delayChildren,
          },
        }
      : { opacity: 1 },
  };
}

export function createStaggerItemVariants(
  preset: StaggerPreset = 'cards',
  channel: StaggerVariantChannel = 'default',
  index?: number
): Variants {
  const cfg = MOTION_STAGGER_PRESETS[preset];
  const { hiddenKey, visibleKey } = getStaggerVariantKeys(channel);
  const transition: Transition = {
    duration: cfg.duration,
    ease: MOTION_EASE.out,
    ...(typeof index === 'number' ? { delay: getCappedStaggerDelay(index, preset) } : {}),
  };

  const hiddenState: Variant =
    cfg.initialScale !== undefined
      ? { opacity: 0.01, y: cfg.distanceY, scale: cfg.initialScale }
      : { opacity: 0.01, y: cfg.distanceY };
  const visibleState: Variant =
    cfg.initialScale !== undefined
      ? { opacity: 1, y: 0, scale: 1, transition }
      : { opacity: 1, y: 0, transition };

  return {
    [hiddenKey]: hiddenState,
    [visibleKey]: visibleState,
  };
}

/**
 * Shared row entrance props for `Table.tsx` backed by `MOTION_STAGGER_PRESETS.tableRow`
 * and `getCappedStaggerDelay` so row stagger uses the exact same tokens and delay cap.
 */
export function createTableRowMotionProps(
  index: number,
  shouldAnimateRow: boolean,
  shouldReduceMotion: boolean
): {
  initial: false | { opacity: number; y: number };
  animate: { opacity: number; y: number };
  transition: Transition;
} {
  if (shouldReduceMotion || !shouldAnimateRow) {
    return {
      initial: false,
      animate: { opacity: 1, y: 0 },
      transition: REDUCED_MOTION_TRANSITION,
    };
  }

  const cfg = MOTION_STAGGER_PRESETS.tableRow;
  return {
    initial: { opacity: 0.01, y: cfg.distanceY },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: cfg.duration,
      delay: getCappedStaggerDelay(index, 'tableRow'),
      ease: MOTION_EASE.out,
    },
  };
}

export const staggerContainerVariants: Variants = createStaggerContainerVariants('cards', 'default', {
  orchestrateChildren: true,
});

export const staggerItemVariants: Variants = createStaggerItemVariants('cards');
