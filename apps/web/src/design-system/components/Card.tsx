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
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
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
        transition-all duration-150 ease-in-out
        ${hoverable ? 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer' : ''}
        ${className}
      `}
    >
      {hasHeader && (
        <div
          className={`flex items-start justify-between gap-4 px-6 py-4.5 ${
            headerBorder ? 'border-b border-[#E2E8F0]' : ''
          }`}
        >
          <div className="space-y-1">
            {title && (
              <h3 className="text-base font-semibold text-[#0F172A] tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[#64748B] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {children && <div className={paddingClasses[padding]}>{children}</div>}

      {footer && (
        <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-3.5 rounded-b-lg flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
