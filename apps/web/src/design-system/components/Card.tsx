import React from 'react';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: CardPadding;
  hoverable?: boolean;
  children?: React.ReactNode;
  className?: string;
  headerBorder?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-5 sm:p-8',
};

export const Card: React.FC<CardProps> = ({
  title,
  description,
  actions,
  footer,
  padding = 'md',
  hoverable = false,
  children,
  className = '',
  headerBorder = true,
}) => {
  const hasHeader = Boolean(title || description || actions);

  return (
    <div
      className={`
        bg-white rounded-lg border border-[#E2E8F0] shadow-sm font-sans
        ${hoverable ? 'landing-card-hover cursor-pointer' : 'transition-[border-color,box-shadow] duration-150'}
        ${className}
      `}
    >
      {hasHeader && (
        <div
          className={`flex flex-wrap items-start justify-between gap-3 sm:gap-4 px-4 py-3.5 sm:px-6 sm:py-4.5 ${
            headerBorder ? 'border-b border-[#E2E8F0]' : ''
          }`}
        >
          <div className="space-y-1 min-w-0 flex-1">
            {title && (
              <h3 className="text-base font-semibold text-[#0F172A] tracking-tight break-words">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[#64748B] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {children && <div className={`min-w-0 ${paddingClasses[padding]}`}>{children}</div>}

      {footer && (
        <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 sm:px-6 sm:py-3.5 rounded-b-lg flex flex-wrap items-center justify-between gap-2">
          {footer}
        </div>
      )}
    </div>
  );
};
