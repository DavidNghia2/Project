import React, { forwardRef } from 'react';
import { Spinner } from './Loading';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] focus-visible:ring-[#2563EB] shadow-sm',
  secondary:
    'bg-white text-[#475569] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A] active:bg-[#F1F5F9] focus-visible:ring-[#2563EB] shadow-sm',
  ghost:
    'bg-transparent text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] active:bg-[#E2E8F0] focus-visible:ring-[#2563EB]',
  danger:
    'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B] focus-visible:ring-[#DC2626] shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-xs font-medium gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm font-medium gap-2 rounded-md',
  lg: 'h-11 px-4.5 text-base font-medium gap-2.5 rounded-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      children,
      className = '',
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        className={`
          inline-flex items-center justify-center font-sans tracking-normal select-none
          transition-colors duration-150 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${
            isDisabled
              ? 'opacity-50 cursor-not-allowed pointer-events-none'
              : 'cursor-pointer active:scale-[0.98]'
          }
          ${className}
        `}
        {...rest}
      >
        {loading ? (
          <Spinner
            size={size === 'lg' ? 'md' : 'sm'}
            className={variant === 'secondary' || variant === 'ghost' ? 'text-[#2563EB]' : 'text-white'}
          />
        ) : (
          iconLeft && <span className="inline-flex shrink-0 items-center justify-center">{iconLeft}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && iconRight && (
          <span className="inline-flex shrink-0 items-center justify-center">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
