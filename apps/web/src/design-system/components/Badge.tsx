import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  success: {
    container: 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]',
    dot: 'bg-[#16A34A]',
  },
  warning: {
    container: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
    dot: 'bg-[#D97706]',
  },
  error: {
    container: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
    dot: 'bg-[#DC2626]',
  },
  info: {
    container: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
    dot: 'bg-[#2563EB]',
  },
  neutral: {
    container: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
    dot: 'bg-[#94A3B8]',
  },
  primary: {
    container: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
    dot: 'bg-[#2563EB]',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[11px] font-medium px-2 py-0.5 rounded-full',
  md: 'text-xs font-medium px-2.5 py-0.5 rounded-full',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 leading-none select-none tracking-wide font-sans
        ${variantStyles[variant].container}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${variantStyles[variant].dot}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
