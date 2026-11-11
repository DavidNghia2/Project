import React from 'react';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: React.ReactNode;
  message: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  dismissible?: boolean;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  {
    container: string;
    iconColor: string;
    icon: React.ReactNode;
  }
> = {
  error: {
    container: 'bg-[#FEF2F2] border-[#FECACA] text-[#0F172A]',
    iconColor: 'text-[#DC2626]',
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  warning: {
    container: 'bg-[#FFFBEB] border-[#FDE68A] text-[#0F172A]',
    iconColor: 'text-[#D97706]',
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  success: {
    container: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#0F172A]',
    iconColor: 'text-[#16A34A]',
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  info: {
    container: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#0F172A]',
    iconColor: 'text-[#2563EB]',
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  action,
  onDismiss,
  dismissible = false,
  className = '',
}) => {
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 p-4 rounded-lg border font-sans text-sm
        transition-all duration-150
        ${config.container}
        ${className}
      `}
    >
      <div className={`mt-0.5 shrink-0 ${config.iconColor}`}>
        {config.icon}
      </div>

      <div className="flex-1 space-y-1">
        {title && (
          <h5 className="font-semibold text-sm text-[#0F172A] leading-tight">
            {title}
          </h5>
        )}
        <div className="text-xs text-[#475569] leading-relaxed">
          {message}
        </div>
        {action && <div className="mt-2.5 inline-flex">{action}</div>}
      </div>

      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="
            -mr-1 -mt-1 p-1 text-[#64748B] hover:text-[#0F172A] rounded-md
            transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer
          "
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </div>
  );
};
