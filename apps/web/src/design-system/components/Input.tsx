import React, { forwardRef, useId } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { MOTION_DURATION, MOTION_EASE } from '../motion/tokens';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: React.ReactNode;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  size?: InputSize;
  type?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

const sizeClasses: Record<InputSize, { container: string; input: string; text: string }> = {
  sm: {
    container: 'min-h-11 sm:min-h-0 sm:h-8 text-base sm:text-xs',
    input: 'px-2.5 py-2 sm:py-1 text-base sm:text-xs',
    text: 'text-base sm:text-xs',
  },
  md: {
    container: 'min-h-11 sm:min-h-0 sm:h-9 text-base sm:text-sm',
    input: 'px-3 py-2 sm:py-1.5 text-base sm:text-sm',
    text: 'text-base sm:text-sm',
  },
  lg: {
    container: 'min-h-11 text-base',
    input: 'px-3.5 py-2 text-base',
    text: 'text-base',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      error,
      hint,
      prefix,
      suffix,
      disabled = false,
      required = false,
      size = 'md',
      type = 'text',
      maxLength,
      showCharCount = false,
      id: customId,
      className = '',
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const charCount = typeof value === 'string' ? value.length : 0;
    const hasError = Boolean(error);
    const shouldReduceMotion = useReducedMotion();

    return (
      <div className={`w-full flex flex-col gap-1.5 font-sans ${className}`}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="text-xs font-medium text-[#0F172A] select-none flex items-center gap-1"
            >
              <span>{label}</span>
              {required && <span className="text-[#DC2626] font-semibold" aria-hidden="true">*</span>}
            </label>
            {showCharCount && maxLength && (
              <span className="text-[11px] text-[#94A3B8]">
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        <div
          className={`
            relative flex items-center w-full rounded-md border bg-white transition-[border-color,box-shadow,background-color] duration-150
            ${sizeClasses[size].container}
            ${
              disabled
                ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                : hasError
                ? 'border-[#DC2626] focus-within:ring-2 focus-within:ring-[#DC2626] focus-within:border-[#DC2626] input-error-shake'
                : 'border-[#CBD5E1] hover:border-[#94A3B8] focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:border-[#2563EB]'
            }
          `}
        >
          {prefix && (
            <div className="flex items-center pl-3 text-[#94A3B8] select-none shrink-0">
              {prefix}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            placeholder={placeholder}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError ? errorId : hint ? hintId : undefined
            }
            className={`
              w-full h-full bg-transparent border-0 outline-none placeholder:text-[#94A3B8] text-[#0F172A]
              disabled:cursor-not-allowed disabled:text-[#94A3B8]
              ${sizeClasses[size].input}
              ${prefix ? 'pl-2' : ''}
              ${suffix ? 'pr-2' : ''}
            `}
            {...rest}
          />

          {suffix && (
            <div className="flex items-center pr-3 text-[#94A3B8] select-none shrink-0">
              {suffix}
            </div>
          )}
        </div>

        <AnimatePresence initial={false}>
          {hasError && (
            <m.p
              key={error}
              id={errorId}
              role="alert"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
              className="text-xs font-medium text-[#DC2626] mt-0.5"
            >
              {error}
            </m.p>
          )}
        </AnimatePresence>

        {!hasError && hint && (
          <p id={hintId} className="text-xs text-[#64748B] mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
