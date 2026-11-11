import React from 'react';
import { useTranslation } from '../../i18n';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div
      role="region"
      aria-label={t('emptyState.noticeAria')}
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 font-sans ${className}`}
    >
      {icon ? (
        <div className="w-12 h-12 mb-4 text-[#94A3B8] flex items-center justify-center shrink-0">
          {icon}
        </div>
      ) : (
        <div className="w-12 h-12 mb-4 text-[#94A3B8] flex items-center justify-center rounded-full bg-[#F1F5F9]">
          {/* Default teaching warehouse icon */}
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
      )}

      <h4 className="text-base font-semibold text-[#0F172A] mb-1.5 tracking-tight">
        {title}
      </h4>

      <p className="text-xs text-[#64748B] max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {action && <div className="inline-flex items-center">{action}</div>}
    </div>
  );
};
