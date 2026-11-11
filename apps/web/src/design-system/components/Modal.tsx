import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

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
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      className={`
        fixed inset-0 m-auto p-0 bg-transparent outline-none
        backdrop:bg-slate-900/50 backdrop:backdrop-blur-xs
        open:animate-in open:fade-in open:zoom-in-95 duration-200
        ${open ? 'block' : 'hidden'}
      `}
    >
      <div
        className={`
          relative w-full ${sizeClasses[size]} mx-4 sm:mx-auto bg-white rounded-xl shadow-xl
          border border-[#E2E8F0] overflow-hidden flex flex-col font-sans ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-6 py-4.5 border-b border-[#E2E8F0]">
            <div>
              {title && (
                <h3 id="modal-title" className="text-base font-semibold text-[#0F172A] tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p id="modal-description" className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="
                  p-1.5 -mr-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9]
                  rounded-md transition-colors duration-150 outline-none
                  focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer
                "
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[calc(80vh-140px)] overflow-y-auto">
          {children}
        </div>

        {/* Actions / Footer */}
        {actions && (
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            {actions}
          </div>
        )}
      </div>
    </dialog>,
    document.body
  );
};
