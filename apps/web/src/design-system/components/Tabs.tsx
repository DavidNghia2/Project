import React, { createContext, use, useCallback, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from '../motion/tokens';

export type TabsVariant = 'pill' | 'ink' | 'linked' | 'overshoot';

interface TabsContextValue {
  value: string;
  onValueChange: (next: string) => void;
  variant: TabsVariant;
  layoutId: string;
  direction: number;
  registerOrder: (val: string) => number;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = use(TabsContext);
  if (!ctx) {
    throw new Error('Tabs components must be used within <Tabs>');
  }
  return ctx;
}

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  variant?: TabsVariant;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  variant = 'pill',
  className = '',
  children,
}) => {
  const layoutId = useId();
  const orderMapRef = useRef<Map<string, number>>(new Map());
  const prevIndexRef = useRef<number>(0);
  const [direction, setDirection] = useState<number>(1);

  const registerOrder = useCallback((val: string) => {
    const existing = orderMapRef.current.get(val);
    if (existing !== undefined) return existing;
    const nextIdx = orderMapRef.current.size;
    orderMapRef.current.set(val, nextIdx);
    return nextIdx;
  }, []);

  const handleChange = useCallback(
    (next: string) => {
      const nextIdx = orderMapRef.current.get(next) ?? 0;
      setDirection(nextIdx >= prevIndexRef.current ? 1 : -1);
      prevIndexRef.current = nextIdx;
      onValueChange(next);
    },
    [onValueChange]
  );

  const ctxValue = useMemo<TabsContextValue>(
    () => ({
      value,
      onValueChange: handleChange,
      variant,
      layoutId: `tabs-indicator-${layoutId}`,
      direction,
      registerOrder,
    }),
    [direction, handleChange, layoutId, registerOrder, value, variant]
  );

  return (
    <TabsContext.Provider value={ctxValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className = '', children, onKeyDown, ...rest }) => {
  const { variant } = useTabsContext();

  const baseStyle =
    variant === 'ink'
      ? 'inline-flex items-center gap-1 border-b border-[#E2E8F0] relative'
      : variant === 'linked'
      ? 'grid gap-2 relative'
      : 'inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/75 border border-slate-200/80 relative';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    if (tabs.length === 0) return;
    const idx = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (idx === -1) return;
    const isRtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    let nextIdx = idx;
    if (e.key === 'ArrowRight') nextIdx = (idx + (isRtl ? -1 : 1) + tabs.length) % tabs.length;
    if (e.key === 'ArrowLeft') nextIdx = (idx + (isRtl ? 1 : -1) + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIdx = 0;
    if (e.key === 'End') nextIdx = tabs.length - 1;
    e.preventDefault();
    tabs[nextIdx]?.focus();
    tabs[nextIdx]?.click();
  };

  return (
    <div role="tablist" onKeyDown={handleKeyDown} className={`${baseStyle} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export interface TabsTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  indicatorClassName?: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value: itemValue,
  indicatorClassName = '',
  className = '',
  children,
  onClick,
  ...rest
}) => {
  const { value, onValueChange, variant, layoutId, registerOrder } = useTabsContext();
  const shouldReduceMotion = useReducedMotion();
  const isActive = value === itemValue;

  const springTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : variant === 'overshoot'
    ? MOTION_SPRING.overshoot
    : MOTION_SPRING.tab;

  const defaultIndicatorClass =
    variant === 'ink'
      ? 'absolute inset-x-1 -bottom-[1px] h-0.5 rounded-full bg-[#2563EB]'
      : variant === 'linked'
      ? 'absolute inset-0 rounded-lg border border-[#0284C7] bg-[#F0F9FF] shadow-2xs'
      : 'absolute inset-0 rounded-lg bg-white shadow-xs border border-slate-200/70';

  return (
    <button
      ref={() => {
        registerOrder(itemValue);
      }}
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={(e) => {
        onValueChange(itemValue);
        onClick?.(e);
      }}
      className={`relative z-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer ${className}`}
      {...rest}
    >
      {isActive && (
        <m.span
          layoutId={layoutId}
          aria-hidden="true"
          transition={springTransition}
          className={`pointer-events-none ${defaultIndicatorClass} ${indicatorClassName}`}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2 w-full">
        {children}
      </span>
    </button>
  );
};

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value: itemValue, className = '', children }) => {
  const { value, direction, variant } = useTabsContext();
  const shouldReduceMotion = useReducedMotion();
  const isActive = value === itemValue;
  const slideOffset = variant === 'linked' && !shouldReduceMotion ? direction * 12 : 0;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isActive && (
        <m.div
          key={itemValue}
          role="tabpanel"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: slideOffset }}
          animate={{ opacity: 1, x: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -slideOffset * 0.5 }}
          transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
          className={className}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
};
