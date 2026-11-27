import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'motion/react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useSafeReducedMotion } from '../motion/hooks';
import { MOTION_SPRING } from '../motion/tokens';
import {
  ToastContext,
  type ToastContextValue,
  type ToastInput,
  type ToastVariant,
} from './toastContext';

interface ToastItem extends Required<Pick<ToastInput, 'variant' | 'message' | 'durationMs'>> {
  id: string;
  title?: string;
}

const VARIANT_STYLES: Record<
  ToastVariant,
  { border: string; iconBg: string; bar: string; icon: React.ReactNode }
> = {
  success: {
    border: 'border-emerald-200/90',
    iconBg: 'bg-emerald-50 text-emerald-600',
    bar: 'bg-emerald-500',
    icon: <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2.2} />,
  },
  error: {
    border: 'border-rose-200/90',
    iconBg: 'bg-rose-50 text-rose-600',
    bar: 'bg-rose-500',
    icon: <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2.2} />,
  },
  warning: {
    border: 'border-amber-200/90',
    iconBg: 'bg-amber-50 text-amber-600',
    bar: 'bg-amber-500',
    icon: <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2.2} />,
  },
  info: {
    border: 'border-blue-200/90',
    iconBg: 'bg-blue-50 text-blue-600',
    bar: 'bg-blue-500',
    icon: <Info className="w-4 h-4 shrink-0" strokeWidth={2.2} />,
  },
};

const ToastCard: React.FC<{ item: ToastItem; onDismiss: (id: string) => void }> = ({
  item,
  onDismiss,
}) => {
  const shouldReduceMotion = useSafeReducedMotion();
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(item.durationMs);
  const startRef = useRef<number>(0);
  const style = VARIANT_STYLES[item.variant];

  useEffect(() => {
    if (paused || item.durationMs <= 0) return;
    startRef.current = Date.now();
    const id = window.setTimeout(() => onDismiss(item.id), remainingRef.current);
    return () => {
      window.clearTimeout(id);
      if (startRef.current > 0) {
        remainingRef.current = Math.max(400, remainingRef.current - (Date.now() - startRef.current));
      }
    };
  }, [item.durationMs, item.id, onDismiss, paused]);

  return (
    <m.div
      layout
      role={item.variant === 'error' ? 'alert' : 'status'}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 32, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.96 }}
      transition={shouldReduceMotion ? { duration: 0.1 } : MOTION_SPRING.overlay}
      drag={shouldReduceMotion ? false : 'x'}
      dragConstraints={{ left: 0, right: 120 }}
      dragElastic={0.15}
      onDragEnd={(_e, info) => {
        if (info.offset.x > 64) onDismiss(item.id);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`pointer-events-auto relative overflow-hidden w-full sm:w-[360px] max-w-[calc(100vw-1.5rem)] bg-white rounded-xl border ${style.border} shadow-lg px-3.5 py-3 flex items-start gap-3`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${style.iconBg}`}>
        {style.icon}
      </div>

      <div className="flex-1 min-w-0 text-xs sm:text-sm">
        {item.title && (
          <p className="font-semibold text-[#0F172A] leading-snug mb-0.5">{item.title}</p>
        )}
        <p className="text-[#334155] leading-snug break-words">{item.message}</p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="inline-flex items-center justify-center min-h-8 min-w-8 -mr-1 -mt-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>

      {!shouldReduceMotion && item.durationMs > 0 && (
        <m.span
          aria-hidden="true"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: paused ? undefined : 0 }}
          transition={{ duration: item.durationMs / 1000, ease: 'linear' }}
          className={`absolute bottom-0 inset-x-0 h-0.5 origin-left ${style.bar} opacity-75`}
        />
      )}
    </m.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((input: ToastInput) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const next: ToastItem = {
      id,
      variant: input.variant ?? 'info',
      title: input.title,
      message: input.message,
      durationMs: input.durationMs ?? 4200,
    };
    setToasts((prev) => [...prev.slice(-2), next]);
    return id;
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      dismiss,
      success: (message, title) => push({ variant: 'success', message, title }),
      error: (message, title) => push({ variant: 'error', message, title, durationMs: 5500 }),
      warning: (message, title) => push({ variant: 'warning', message, title }),
      info: (message, title) => push({ variant: 'info', message, title }),
    }),
    [dismiss, push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-live="polite"
            aria-relevant="additions removals"
            className="pointer-events-none fixed z-[80] top-[calc(4.5rem+env(safe-area-inset-top))] inset-x-3 sm:inset-x-auto sm:right-5 flex flex-col items-stretch sm:items-end gap-2.5"
          >
            <AnimatePresence initial={false}>
              {toasts.map((item) => (
                <ToastCard key={item.id} item={item} onDismiss={dismiss} />
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};
