import { createContext, use } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastInput {
  variant?: ToastVariant;
  title?: string;
  message: string;
  durationMs?: number;
}

export interface ToastContextValue {
  push: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const NOOP_TOAST: ToastContextValue = {
  push: () => '',
  dismiss: () => {},
  success: () => '',
  error: () => '',
  warning: () => '',
  info: () => '',
};

/**
 * Returns centralized Toast dispatcher. Safe to call in isolated unit tests
 * even without a surrounding <ToastProvider>.
 */
export function useToast(): ToastContextValue {
  return use(ToastContext) ?? NOOP_TOAST;
}
