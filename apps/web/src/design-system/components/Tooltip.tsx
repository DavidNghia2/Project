import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'motion/react';
import { useSafeReducedMotion } from '../motion/hooks';
import { MOTION_OVERLAY } from '../motion/tokens';

export type TooltipPlacement = 'top' | 'bottom' | 'right' | 'left';

export interface TooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delayMs?: number;
  disabled?: boolean;
  triggerClassName?: string;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

/**
 * Accessible Hover & Focus Tooltip rendered via Portal so it is never clipped
 * by overflow-x-auto tables or collapsed sidebars.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  delayMs = 180,
  disabled = false,
  triggerClassName = 'inline-flex',
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const tooltipId = useId();
  const shouldReduceMotion = useSafeReducedMotion();

  const updateCoords = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    if (placement === 'right') {
      setCoords({ top: rect.top + rect.height / 2, left: rect.right + gap });
    } else if (placement === 'left') {
      setCoords({ top: rect.top + rect.height / 2, left: rect.left - gap });
    } else if (placement === 'bottom') {
      setCoords({ top: rect.bottom + gap, left: rect.left + rect.width / 2 });
    } else {
      setCoords({ top: rect.top - gap, left: rect.left + rect.width / 2 });
    }
  };

  const handleOpen = () => {
    if (disabled || !content) return;
    updateCoords();
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      updateCoords();
      setOpen(true);
    }, delayMs);
  };

  const handleClose = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (disabled || !content) {
    return children;
  }

  const transformStyle =
    placement === 'right'
      ? 'translateY(-50%)'
      : placement === 'left'
      ? 'translate(-100%, -50%)'
      : placement === 'bottom'
      ? 'translateX(-50%)'
      : 'translate(-50%, -100%)';

  return (
    <>
      <span
        ref={triggerRef}
        className={triggerClassName}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
        aria-describedby={open ? tooltipId : undefined}
      >
        {children}
      </span>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div
                style={{
                  position: 'fixed',
                  top: coords.top,
                  left: coords.left,
                  transform: transformStyle,
                  zIndex: 70,
                  pointerEvents: 'none',
                }}
              >
                <m.div
                  id={tooltipId}
                  role="tooltip"
                  initial={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.tooltip.initial}
                  animate={MOTION_OVERLAY.tooltip.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.tooltip.exit}
                  transition={MOTION_OVERLAY.tooltip.transition}
                  className="px-2.5 py-1.5 rounded-md bg-[#0F172A] text-white text-[11px] font-medium shadow-lg whitespace-nowrap max-w-[240px] truncate border border-white/10"
                >
                  {content}
                </m.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
