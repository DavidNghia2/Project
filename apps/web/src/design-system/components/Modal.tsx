import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { m, useReducedMotion } from 'motion/react';
import { useTranslation } from '../../i18n';
import { MOTION_OVERLAY } from '../motion/tokens';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  actions?: React.ReactNode;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  actions,
  children,
  closeOnBackdrop = true,
  showCloseButton = true,
  className = '',
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation();
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      }
    } else {
      if (dialog.open) {
        if (typeof dialog.close === 'function') {
          dialog.close();
        } else {
          dialog.removeAttribute('open');
        }
      }
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus?.();
      }
    }
  }, [open]);

  // Handle native escape and cancel event
  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    e.preventDefault();
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (!closeOnBackdrop) return;
    const dialog = dialogRef.current;
    if (e.target === dialog) {
      onClose();
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className={`
        fixed inset-0 m-auto p-0 bg-transparent outline-none
        w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-2rem)] ${sizeClasses[size]} max-h-[90dvh]
        backdrop:bg-slate-900/50 backdrop:backdrop-blur-xs
        ${open ? 'block' : 'hidden'}
      `}
    >
      <m.div
        key={open ? 'modal-open' : 'modal-closed'}
        initial={shouldReduceMotion ? { opacity: 1 } : MOTION_OVERLAY.modalPanel.initial}
        animate={open ? MOTION_OVERLAY.modalPanel.animate : { opacity: 0 }}
        transition={shouldReduceMotion ? { duration: 0.01 } : MOTION_OVERLAY.modalPanel.transition}
        className={`
          relative w-full max-h-[90dvh] bg-white rounded-xl shadow-xl
          border border-[#E2E8F0] overflow-hidden flex flex-col font-sans ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="shrink-0 flex items-start justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#E2E8F0]">
            <div className="min-w-0 flex-1">
              {title && (
                <h3 id={titleId} className="text-base font-semibold text-[#0F172A] tracking-tight break-words">
                  {title}
                </h3>
              )}
              {description && (
                <p id={descriptionId} className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label={t('common.closeDialog')}
                className="
                  inline-flex items-center justify-center min-h-11 min-w-11 -mr-2 -mt-1.5 shrink-0
                  text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]
                  rounded-md transition-colors duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB] cursor-pointer
                "
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Actions / Footer */}
        {actions && (
          <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            {actions}
          </div>
        )}
      </m.div>
    </dialog>,
    document.body
  );
};
