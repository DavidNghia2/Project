/**
 * Design Tokens for Smart Inventory Management System
 * Professional Enterprise (Light mode, cool neutral base)
 */

export const colors = {
  primary: {
    DEFAULT: '#2563EB',
    dark: '#1D4ED8',
    light: '#EFF6FF',
  },
  surface: {
    base: '#FFFFFF',
    raised: '#F8FAFC',
    muted: '#F1F5F9',
  },
  border: {
    default: '#E2E8F0',
    strong: '#CBD5E1',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
  },
  status: {
    success: {
      text: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0',
    },
    warning: {
      text: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
    },
    error: {
      text: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
    },
    info: {
      text: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
    },
  },
  focusRing: {
    color: '#2563EB',
    offset: '2px',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const radii = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
} as const;
