import React, { useSyncExternalStore } from 'react';
import { m } from 'motion/react';
import {
  AnimatedCounter,
  REDUCED_MOTION_STATIC_ANIMATE,
  REDUCED_MOTION_TRANSITION,
  StaggerGroup,
  StaggerItem as BaseStaggerItem,
  useSafeReducedMotion,
} from '../design-system/motion';
import {
  LANDING_EASE_OUT,
  LANDING_EASE_UI,
  LANDING_VIEWPORT,
  sectionRevealVariants,
} from './landingMotionPrimitives';

function readDocumentHidden(): boolean {
  if (typeof document === 'undefined') return false;
  return document.visibilityState === 'hidden';
}

function subscribeDocumentVisibility(onChange: () => void): () => void {
  if (typeof document === 'undefined') return () => {};
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

function useIsDocumentHidden(): boolean {
  return useSyncExternalStore(subscribeDocumentVisibility, readDocumentHidden, () => false);
}

export interface AnimatedStatCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  trigger?: 'mount' | 'inView';
  useLocaleGrouping?: boolean;
  className?: string;
}

export const AnimatedStatCounter: React.FC<AnimatedStatCounterProps> = ({
  target,
  suffix = '',
  duration = 0.65,
  trigger = 'inView',
  useLocaleGrouping = true,
  className = '',
}) => (
  <AnimatedCounter
    value={target}
    suffix={suffix}
    duration={duration}
    animateOnMount
    trigger={trigger}
    useLocaleGrouping={useLocaleGrouping}
    className={className}
  />
);

export interface MotionCtaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Adds subtle vertical hover elevation (-1.5px) and press scale (0.985) on interactive CTAs.
 */
export const MotionCtaWrapper: React.FC<MotionCtaWrapperProps> = ({
  children,
  className = '',
}) => {
  const shouldReduceMotion = useSafeReducedMotion();

  return (
    <m.div
      className={className}
      whileHover={shouldReduceMotion ? undefined : { y: -1.5 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.14, ease: LANDING_EASE_UI }}
    >
      {children}
    </m.div>
  );
};

export interface ScrollRevealBlockProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const ScrollRevealBlock: React.FC<ScrollRevealBlockProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const shouldReduceMotion = useSafeReducedMotion();

  return (
    <m.div
      className={className}
      variants={shouldReduceMotion ? undefined : sectionRevealVariants}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate={shouldReduceMotion ? REDUCED_MOTION_STATIC_ANIMATE : undefined}
      whileInView={shouldReduceMotion ? undefined : 'visible'}
      viewport={shouldReduceMotion ? undefined : LANDING_VIEWPORT}
      transition={
        shouldReduceMotion
          ? REDUCED_MOTION_TRANSITION
          : { duration: 0.48, delay, ease: LANDING_EASE_OUT }
      }
    >
      {children}
    </m.div>
  );
};

export interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
}

/** Delegates to global `StaggerGroup` with expressive viewport choreography (no duplicated stagger system). */
export const StaggerGrid: React.FC<StaggerGridProps> = ({ children, className = '' }) => (
  <StaggerGroup preset="expressive" trigger="inView" className={className}>
    {children}
  </StaggerGroup>
);

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = '' }) => (
  <BaseStaggerItem className={className}>{children}</BaseStaggerItem>
);

/**
 * Subtle architectural depth layers anchored behind the Hero preview frame.
 * Paused cleanly whenever `prefers-reduced-motion` is enabled OR the browser tab is hidden.
 */
export const HeroAmbientDepth: React.FC = () => {
  const shouldReduceMotion = useSafeReducedMotion();
  const isTabHidden = useIsDocumentHidden();
  const pauseAmbient = shouldReduceMotion || isTabHidden;

  return (
    <div className="pointer-events-none hidden lg:block" aria-hidden="true">
      {/* Subtle architectural warehouse grid plate top-right */}
      <m.div
        className="absolute -top-6 -right-5 w-44 h-36 rounded-xl border border-slate-700/45 bg-slate-900/55 shadow-lg backdrop-blur-xs"
        animate={pauseAmbient ? { y: 0 } : { y: [-4, 5, -4] }}
        transition={
          pauseAmbient
            ? REDUCED_MOTION_TRANSITION
            : { duration: 6.8, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <div className="p-3.5 space-y-2 opacity-60">
          <div className="flex items-center justify-between">
            <span className="w-8 h-1.5 rounded-full bg-blue-500/60" />
            <span className="w-2 h-2 rounded-full bg-emerald-400/70" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <span className="h-5 rounded bg-slate-800/90 border border-slate-700/60" />
            <span className="h-5 rounded bg-slate-800/90 border border-slate-700/60" />
            <span className="h-5 rounded bg-blue-950/60 border border-blue-800/40" />
          </div>
          <span className="block w-2/3 h-1.5 rounded-full bg-slate-700/80" />
        </div>
      </m.div>

      {/* Subtle architectural balance card bottom-left */}
      <m.div
        className="absolute -bottom-5 -left-5 w-40 h-24 rounded-xl border border-slate-700/40 bg-slate-900/50 shadow-lg"
        animate={pauseAmbient ? { y: 0 } : { y: [5, -5, 5] }}
        transition={
          pauseAmbient
            ? REDUCED_MOTION_TRANSITION
            : { duration: 7.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
        }
      >
        <div className="p-3 space-y-2 opacity-55">
          <span className="block w-16 h-1.5 rounded-full bg-slate-600/80" />
          <div className="flex items-end gap-1.5 h-8 pt-1">
            <span className="w-2.5 h-4 rounded-xs bg-blue-500/45" />
            <span className="w-2.5 h-6 rounded-xs bg-blue-500/55" />
            <span className="w-2.5 h-5 rounded-xs bg-emerald-500/50" />
            <span className="w-2.5 h-8 rounded-xs bg-blue-400/60" />
          </div>
        </div>
      </m.div>
    </div>
  );
};
