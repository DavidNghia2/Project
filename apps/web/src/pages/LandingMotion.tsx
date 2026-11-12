import React, { useEffect, useRef, useState } from 'react';
import {
  animate,
  domAnimation,
  LazyMotion,
  m,
  MotionConfig,
  useInView,
  useReducedMotion,
} from 'motion/react';
import {
  LANDING_EASE_OUT,
  LANDING_EASE_UI,
  LANDING_VIEWPORT,
  sectionRevealVariants,
  staggerGridVariants,
  staggerItemVariants,
} from './landingMotionPrimitives';

export interface LandingMotionRootProps {
  children: React.ReactNode;
}

export const LandingMotionRoot: React.FC<LandingMotionRootProps> = ({ children }) => {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </MotionConfig>
  );
};

export interface AnimatedStatCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  trigger?: 'mount' | 'inView';
  useLocaleGrouping?: boolean;
  className?: string;
}

/**
 * Animates a metric from 0 to its target value once visible.
 * Reserves exact final text dimensions via an invisible overlay grid cell to avoid layout shift,
 * and shows the final value immediately when prefers-reduced-motion is active.
 */
export const AnimatedStatCounter: React.FC<AnimatedStatCounterProps> = ({
  target,
  suffix = '',
  duration = 0.9,
  trigger = 'inView',
  useLocaleGrouping = true,
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const shouldStart = trigger === 'mount' || isInView;
  const [displayValue, setDisplayValue] = useState<number>(() =>
    shouldReduceMotion ? target : 0
  );

  useEffect(() => {
    if (shouldReduceMotion || !shouldStart) {
      return;
    }

    const controls = animate(0, target, {
      duration,
      ease: LANDING_EASE_OUT,
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
      onComplete: () => {
        setDisplayValue(target);
      },
    });

    return () => controls.stop();
  }, [duration, shouldReduceMotion, shouldStart, target]);

  const formatNum = (n: number) => (useLocaleGrouping ? n.toLocaleString('en-US') : String(n));
  const finalString = `${formatNum(target)}${suffix}`;
  const currentString = `${formatNum(shouldReduceMotion ? target : displayValue)}${suffix}`;

  return (
    <span
      ref={ref}
      className={`inline-grid align-baseline tabular-nums ${className}`}
      aria-label={finalString}
    >
      <span className="col-start-1 row-start-1 invisible select-none" aria-hidden="true">
        {finalString}
      </span>
      <span className="col-start-1 row-start-1" aria-hidden="true">
        {currentString}
      </span>
    </span>
  );
};

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
  const shouldReduceMotion = useReducedMotion();

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
  return (
    <m.div
      className={className}
      variants={sectionRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_VIEWPORT}
      transition={{ duration: 0.48, delay, ease: LANDING_EASE_OUT }}
    >
      {children}
    </m.div>
  );
};

export interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerGrid: React.FC<StaggerGridProps> = ({ children, className = '' }) => {
  return (
    <m.div
      className={className}
      variants={staggerGridVariants}
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_VIEWPORT}
    >
      {children}
    </m.div>
  );
};

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = '' }) => {
  return (
    <m.div className={className} variants={staggerItemVariants}>
      {children}
    </m.div>
  );
};

/**
 * Subtle architectural depth layers anchored behind the Hero preview frame.
 * Hidden on smaller viewports and frozen cleanly when prefers-reduced-motion is active.
 */
export const HeroAmbientDepth: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none hidden lg:block" aria-hidden="true">
      {/* Subtle architectural warehouse grid plate top-right */}
      <m.div
        className="absolute -top-6 -right-5 w-44 h-36 rounded-xl border border-slate-700/45 bg-slate-900/55 shadow-lg backdrop-blur-xs"
        animate={shouldReduceMotion ? undefined : { y: [-4, 5, -4] }}
        transition={
          shouldReduceMotion
            ? undefined
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
        animate={shouldReduceMotion ? undefined : { y: [5, -5, 5] }}
        transition={
          shouldReduceMotion
            ? undefined
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
