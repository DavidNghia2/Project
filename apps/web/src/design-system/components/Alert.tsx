import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useTranslation } from '../../i18n';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: React.ReactNode;
  message: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  dismissible?: boolean;
  className?: string;
}

interface VariantStyleConfig {
  container: string;
  badge: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  dismissBtn: string;
}

const variantConfig: Record<AlertVariant, VariantStyleConfig> = {
  error: {
    container: 'bg-rose-50/75 border-rose-200/90 text-rose-950',
    badge: 'w-7 h-7 rounded-lg bg-rose-100/90 text-rose-600 ring-1 ring-rose-200/70 flex items-center justify-center shrink-0',
    icon: <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2.2} />,
    title: 'text-rose-950',
    message: 'text-rose-900',
    dismissBtn: 'text-rose-400 hover:text-rose-700 hover:bg-rose-100/70 focus-visible:ring-rose-500',
  },
  warning: {
    container: 'bg-amber-50/75 border-amber-200/90 text-amber-950',
    badge: 'w-7 h-7 rounded-lg bg-amber-100/90 text-amber-600 ring-1 ring-amber-200/70 flex items-center justify-center shrink-0',
    icon: <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2.2} />,
    title: 'text-amber-950',
    message: 'text-amber-900',
    dismissBtn: 'text-amber-400 hover:text-amber-700 hover:bg-amber-100/70 focus-visible:ring-amber-500',
  },
  success: {
    container: 'bg-emerald-50/75 border-emerald-200/90 text-emerald-950',
    badge: 'w-7 h-7 rounded-lg bg-emerald-100/90 text-emerald-600 ring-1 ring-emerald-200/70 flex items-center justify-center shrink-0',
    icon: <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2.2} />,
    title: 'text-emerald-950',
    message: 'text-emerald-900',
    dismissBtn: 'text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100/70 focus-visible:ring-emerald-500',
  },
  info: {
    container: 'bg-blue-50/75 border-blue-200/90 text-blue-950',
    badge: 'w-7 h-7 rounded-lg bg-blue-100/90 text-blue-600 ring-1 ring-blue-200/70 flex items-center justify-center shrink-0',
    icon: <Info className="w-4 h-4 shrink-0" strokeWidth={2.2} />,
    title: 'text-blue-950',
    message: 'text-blue-900',
    dismissBtn: 'text-blue-400 hover:text-blue-700 hover:bg-blue-100/70 focus-visible:ring-blue-500',
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
  ...rest
}) => {
  const { t } = useTranslation();
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-sm
        transition-[opacity,transform,background-color,border-color] duration-200 ease-out shadow-xs
        ${config.container}
        ${className}
      `}
      {...rest}
    >
      <div className={`mt-0.5 shrink-0 ${config.badge}`}>
        {config.icon}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {title && (
          <h5 className={`font-semibold text-sm leading-snug mb-0.5 ${config.title}`}>
            {title}
          </h5>
        )}
        <div className={`leading-relaxed ${title ? 'text-xs sm:text-sm opacity-90' : 'text-sm font-medium'} ${config.message}`}>
          {message}
        </div>
        {action && <div className="mt-2.5 inline-flex">{action}</div>}
      </div>

      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('alert.dismiss') || 'Dismiss alert'}
          className={`
            -mr-1 -mt-1 p-1 rounded-md transition-colors duration-150 outline-none
            focus-visible:ring-2 cursor-pointer shrink-0
            ${config.dismissBtn}
          `}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
