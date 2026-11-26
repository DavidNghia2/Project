import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { MOTION_OVERLAY } from '../motion/tokens';

export interface DropdownItem {
  id?: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  placement?: 'bottom' | 'top';
  width?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  placement = 'bottom',
  width = 'w-52',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Actionable items filter (skip dividers and disabled items)
  const actionableItems = items.filter((item) => !item.divider && !item.disabled);

  const toggle = () => {
    setIsOpen((prev) => !prev);
    setHighlightedIndex(-1);
  };

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  // Handle outside click
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, close]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      triggerRef.current?.querySelector<HTMLElement>('button, [tabindex="0"]')?.focus();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % actionableItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? actionableItems.length - 1 : prev - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < actionableItems.length) {
        const item = actionableItems[highlightedIndex];
        if (!item.disabled && item.onClick) {
          item.onClick();
          close();
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative inline-block text-left font-sans ${className}`}
    >
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName === 'BUTTON') {
              return;
            }
            e.preventDefault();
            toggle();
          }
        }}
        className="cursor-pointer inline-flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <m.div
            role="menu"
            aria-orientation="vertical"
            initial={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.popover.initial}
            animate={MOTION_OVERLAY.popover.animate}
            exit={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.popover.exit}
            transition={MOTION_OVERLAY.popover.transition}
            className={`
              absolute z-50 mt-1.5 ${width} max-w-[calc(100vw-1.5rem)] rounded-md bg-white border border-[#CBD5E1] shadow-lg
              py-1 text-sm outline-none
              ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
              ${placement === 'top' ? 'bottom-full mb-1.5' : 'top-full'}
            `}
          >
            {items.map((item, idx) => {
              if (item.divider) {
                return <div key={`divider-${idx}`} className="my-1 border-t border-[#E2E8F0]" role="separator" />;
              }

              const actionableIdx = actionableItems.indexOf(item);
              const isHighlighted = actionableIdx === highlightedIndex;

              return (
                <button
                  key={item.id || `item-${idx}`}
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    item.onClick?.();
                    close();
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 min-h-11 sm:min-h-8 py-2 text-sm sm:text-xs font-medium text-left transition-colors duration-150
                    ${
                      item.disabled
                        ? 'text-[#94A3B8] cursor-not-allowed bg-transparent'
                        : item.danger
                        ? isHighlighted
                          ? 'bg-[#FEF2F2] text-[#DC2626]'
                          : 'text-[#DC2626] hover:bg-[#FEF2F2]'
                        : isHighlighted
                        ? 'bg-[#F1F5F9] text-[#0F172A]'
                        : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }
                  `}
                >
                  {item.icon && (
                    <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                </button>
              );
            })}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
