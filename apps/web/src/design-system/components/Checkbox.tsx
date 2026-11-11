import React, { forwardRef, useEffect, useId, useRef } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  error?: string;
  hint?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      checked = false,
      onChange,
      disabled = false,
      indeterminate = false,
      error,
      hint,
      id: customId,
      className = '',
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = customId || generatedId;
    const internalRef = useRef<HTMLInputElement>(null);

    // Sync ref for indeterminate property
    useEffect(() => {
      const input = (ref && typeof ref !== 'function' ? ref.current : internalRef.current);
      if (input) {
        input.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate, ref]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(e.target.checked, e);
    };

    const hasError = Boolean(error);
    const isCheckedOrIndeterminate = checked || indeterminate;

    return (
      <div className={`flex flex-col gap-1 font-sans ${className}`}>
        <label
          htmlFor={checkboxId}
          className={`inline-flex items-start gap-2.5 select-none ${
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          }`}
        >
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              ref={(node) => {
                internalRef.current = node;
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
              }}
              id={checkboxId}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={handleChange}
              aria-invalid={hasError ? 'true' : 'false'}
              className="peer sr-only"
              {...rest}
            />

            {/* Visual Box */}
            <div
              className={`
                w-4 h-4 rounded border transition-colors duration-150 flex items-center justify-center
                peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[#2563EB]
                ${
                  disabled
                    ? 'bg-[#F1F5F9] border-[#CBD5E1]'
                    : hasError
                    ? 'border-[#DC2626] bg-white hover:border-[#B91C1C]'
                    : isCheckedOrIndeterminate
                    ? 'bg-[#2563EB] border-[#2563EB] hover:bg-[#1D4ED8] hover:border-[#1D4ED8]'
                    : 'bg-white border-[#CBD5E1] hover:border-[#94A3B8]'
                }
              `}
            >
              {indeterminate ? (
                /* Indeterminate Minus Icon */
                <svg
                  className="w-2.5 h-2.5 text-white"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="8" x2="13" y2="8" />
                </svg>
              ) : checked ? (
                /* Checked Mark Icon */
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
                </svg>
              ) : null}
            </div>
          </div>

          {label && (
            <span className="text-sm font-medium text-[#0F172A] leading-tight">
              {label}
            </span>
          )}
        </label>

        {hasError && (
          <p role="alert" className="text-xs font-medium text-[#DC2626] ml-6">
            {error}
          </p>
        )}

        {!hasError && hint && (
          <p className="text-xs text-[#64748B] ml-6">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
