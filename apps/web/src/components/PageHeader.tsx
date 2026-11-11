import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  badge,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight truncate">
            {title}
          </h2>
          {badge}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
