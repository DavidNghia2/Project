import React, { Children, cloneElement, createContext, isValidElement, use, useMemo } from 'react';
import { m } from 'motion/react';
import { useSafeReducedMotion } from './hooks';
import {
  MOTION_DURATION,
  MOTION_EASE,
  REDUCED_MOTION_STATIC_ANIMATE,
  REDUCED_MOTION_TRANSITION,
  createStaggerContainerVariants,
  createStaggerItemVariants,
  getStaggerVariantKeys,
  type StaggerPreset,
  type StaggerVariantChannel,
} from './tokens';

type StaggerContainerTag = 'div' | 'section' | 'ul' | 'ol';
type StaggerItemTag = 'div' | 'li' | 'article' | 'section';
type MotionRevealTag = 'div' | 'section' | 'article' | 'header';

const STAGGER_VIEWPORT = {
  once: true,
  amount: 'some',
} as const;

interface StaggerContextValue {
  preset: StaggerPreset;
  channel: StaggerVariantChannel;
}

const StaggerContext = createContext<StaggerContextValue>({
  preset: 'cards',
  channel: 'default',
});

export interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  /** Timing & distance preset tailored to visual role. */
  preset?: StaggerPreset;
  /** Trigger immediately on mount (default for Operate screens) or once scrolled into view. */
  trigger?: 'mount' | 'inView';
  /**
   * Decouples this group from an ancestor StaggerGroup's variant propagation so nested
   * KPI/card grids or modal sections never accumulate sequential delays.
   */
  isolate?: boolean;
  /** Semantic HTML tag to render (`div` | `section` | `ul` | `ol`). */
  as?: StaggerContainerTag;
}

const MOTION_CONTAINER_TAGS = {
  div: m.div,
  section: m.section,
  ul: m.ul,
  ol: m.ol,
} as const;

const MOTION_ITEM_TAGS = {
  div: m.div,
  li: m.li,
  article: m.article,
  section: m.section,
} as const;

const MOTION_REVEAL_TAGS = {
  div: m.div,
  section: m.section,
  article: m.article,
  header: m.header,
} as const;

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  /** Optional explicit 0-based sibling index to enforce strict `maxItems` delay capping on dynamic lists. */
  index?: number;
  /** Optional preset override; defaults to enclosing `StaggerList` / `StaggerGroup` preset. */
  preset?: StaggerPreset;
  /** Semantic HTML tag to render (`div` | `li` | `article` | `section`). */
  as?: StaggerItemTag;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
  index,
  preset: presetOverride,
  as = 'div',
}) => {
  const shouldReduceMotion = useSafeReducedMotion();
  const { preset: contextPreset, channel } = use(StaggerContext);
  const activePreset = presetOverride ?? contextPreset;
  const MotionTag = MOTION_ITEM_TAGS[as];

  const variants = useMemo(
    () => createStaggerItemVariants(activePreset, channel, index ?? 0),
    [activePreset, channel, index]
  );

  // Always keep the same MotionTag element type across reduced-motion toggles so React
  // reconciles in-place and never unmounts focused form inputs or interactive children.
  if (shouldReduceMotion) {
    return (
      <MotionTag
        className={className}
        initial={false}
        animate={REDUCED_MOTION_STATIC_ANIMATE}
        transition={REDUCED_MOTION_TRANSITION}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag className={className} variants={variants}>
      {children}
    </MotionTag>
  );
};

function assignSiblingIndices(children: React.ReactNode): React.ReactNode {
  let autoIndex = 0;
  return Children.map(children, (child) => {
    if (isValidElement<StaggerItemProps>(child) && child.type === StaggerItem) {
      const assignedIndex = typeof child.props.index === 'number' ? child.props.index : autoIndex;
      autoIndex += 1;
      return typeof child.props.index === 'number'
        ? child
        : cloneElement(child, { index: assignedIndex });
    }
    return child;
  });
}

export const StaggerList: React.FC<StaggerListProps> = ({
  children,
  className = '',
  preset = 'cards',
  trigger = 'mount',
  isolate = false,
  as = 'div',
}) => {
  const shouldReduceMotion = useSafeReducedMotion();
  const channel: StaggerVariantChannel = isolate ? 'isolated' : 'default';
  const contextValue = useMemo<StaggerContextValue>(
    () => ({ preset, channel }),
    [channel, preset]
  );
  const MotionTag = MOTION_CONTAINER_TAGS[as];
  const { hiddenKey, visibleKey } = getStaggerVariantKeys(channel);
  const variants = useMemo(
    () => createStaggerContainerVariants(preset, channel, { orchestrateChildren: false }),
    [channel, preset]
  );

  const indexedChildren = assignSiblingIndices(children);

  if (shouldReduceMotion) {
    return (
      <StaggerContext value={contextValue}>
        <MotionTag
          className={className}
          initial={false}
          animate={REDUCED_MOTION_STATIC_ANIMATE}
          transition={REDUCED_MOTION_TRANSITION}
        >
          {indexedChildren}
        </MotionTag>
      </StaggerContext>
    );
  }

  return (
    <StaggerContext value={contextValue}>
      <MotionTag
        className={className}
        variants={variants}
        initial={hiddenKey}
        animate={trigger === 'mount' ? visibleKey : undefined}
        whileInView={trigger === 'inView' ? visibleKey : undefined}
        viewport={trigger === 'inView' ? STAGGER_VIEWPORT : undefined}
      >
        {indexedChildren}
      </MotionTag>
    </StaggerContext>
  );
};

/** Alias emphasizing semantic hierarchy composition (`sections`, `cards`, `modal`, `form`). */
export const StaggerGroup = StaggerList;

export interface MotionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  as?: MotionRevealTag;
}

/**
 * Lightweight standalone arrival primitive for secondary blocks or empty/recovery surfaces
 * without writing ad-hoc `<m.div>` markup. Preserves element identity across reduced-motion changes.
 */
export const MotionReveal: React.FC<MotionRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = MOTION_DURATION.normal,
  y = 6,
  x = 0,
  as = 'div',
}) => {
  const shouldReduceMotion = useSafeReducedMotion();
  const MotionTag = MOTION_REVEAL_TAGS[as];

  return (
    <MotionTag
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0.01, y, x }}
      animate={REDUCED_MOTION_STATIC_ANIMATE}
      transition={
        shouldReduceMotion
          ? REDUCED_MOTION_TRANSITION
          : { duration, delay, ease: MOTION_EASE.out }
      }
    >
      {children}
    </MotionTag>
  );
};
