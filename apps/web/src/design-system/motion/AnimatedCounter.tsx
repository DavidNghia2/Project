import React, { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { useSafeReducedMotion } from './hooks';
import { MOTION_DURATION, MOTION_EASE } from './tokens';
import { getIntlLocale, useTranslation } from '../../i18n';

export interface AnimatedCounterProps {
  value: number;
  /** Optional custom formatter (e.g. formatCurrencyVND or unit formatter). */
  format?: (value: number) => string;
  /** Suffix appended after default formatted number when `format` is not provided. */
  suffix?: string;
  /** Prefix prepended before default formatted number when `format` is not provided. */
  prefix?: string;
  /** Duration in seconds (default: 0.36s for fast SaaS feel). */
  duration?: number;
  /** Whether to count up from 0 on initial mount (default: false for instant KPI legibility; always animates value changes). */
  animateOnMount?: boolean;
  /** Trigger mode when animateOnMount is true. */
  trigger?: 'mount' | 'inView';
  useLocaleGrouping?: boolean;
  className?: string;
}

/**
 * Smooth numeric & currency counter with tabular-nums stability (zero CLS)
 * and clean single-node textContent for accessibility and test reliability.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  format,
  suffix = '',
  prefix = '',
  duration = MOTION_DURATION.moderate + 0.06,
  animateOnMount = false,
  trigger = 'mount',
  useLocaleGrouping = true,
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useSafeReducedMotion();
  const { language } = useTranslation();
  const isInView = useInView(ref, { once: true, amount: 'some' });
  const shouldStart = trigger === 'mount' || isInView;

  const initialVal = !animateOnMount || shouldReduceMotion ? value : 0;
  const prevValueRef = useRef<number>(initialVal);
  const [displayValue, setDisplayValue] = useState<number>(initialVal);

  useEffect(() => {
    if (!Number.isFinite(value)) return;
    if (shouldReduceMotion) {
      prevValueRef.current = value;
      return;
    }
    if (!shouldStart) {
      return;
    }

    const from = prevValueRef.current;
    if (from === value) return;

    const controls = animate(from, value, {
      duration: from === 0 && animateOnMount ? duration : Math.min(duration, 0.36),
      ease: MOTION_EASE.out,
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        prevValueRef.current = rounded;
        setDisplayValue(rounded);
      },
      onComplete: () => {
        prevValueRef.current = value;
        setDisplayValue(value);
      },
    });

    return () => controls.stop();
  }, [animateOnMount, duration, shouldReduceMotion, shouldStart, value]);

  const formatValue = (n: number) => {
    if (format) return format(n);
    const numStr = useLocaleGrouping ? n.toLocaleString(getIntlLocale(language)) : String(n);
    return `${prefix}${numStr}${suffix}`;
  };

  const renderedValue = shouldReduceMotion ? value : !shouldStart ? initialVal : displayValue;

  return (
    <span
      ref={ref}
      className={`tabular-nums ${className}`}
      aria-label={formatValue(value)}
    >
      <span aria-hidden="true">{formatValue(renderedValue)}</span>
    </span>
  );
};
