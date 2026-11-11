import React, { forwardRef, useId } from 'react';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: React.ReactNode;
  options: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  size?: SelectSize;
}

const sizeClasses: Record<SelectSize, { select: string; text: string }> = {
  sm: {
    select: 'h-8 text-xs pl-2.5 pr-8',
    text: 'text-xs',
  },
  md: {
    select: 'h-9 text-sm pl-3 pr-9',
    text: 'text-sm',
  },
  lg: {
    select: 'h-11 text-base pl-3.5 pr-10',
    text: 'text-base',
  },
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder,
      error,
      hint,
      disabled = false,
      required = false,
      size = 'md',
      id: customId,
      className = '',
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = customId || generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;
    const hasError = Boolean(error);

    return (
      <div className={`w-full flex flex-col gap-1.5 font-sans ${className}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-[#0F172A] select-none flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-[#DC2626] font-semibold" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError ? errorId : hint ? hintId : undefined
            }
            className={`
              w-full rounded-md border appearance-none transition-colors duration-150 outline-none
              bg-white text-[#0F172A] font-sans
              ${sizeClasses[size].select}
              ${
                disabled
                  ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                  : hasError
                  ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626]'
                  : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]'
              }
            `}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="text-[#0F172A] bg-white"
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Accessible Chevron Down SVG */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#64748B]">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {hasError && (
          <p id={errorId} role="alert" className="text-xs font-medium text-[#DC2626] mt-0.5">
            {error}
          </p>
        )}

        {!hasError && hint && (
          <p id={hintId} className="text-xs text-[#64748B] mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
