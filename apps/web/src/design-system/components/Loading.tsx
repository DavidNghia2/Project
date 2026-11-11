import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

const spinnerSizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-3',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = 'text-current',
  ariaLabel = 'Loading',
}) => {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-block animate-spin rounded-full border-solid border-current border-t-transparent ${spinnerSizes[size]} ${className}`}
    >
      <span className="sr-only">{ariaLabel}</span>
    </span>
  );
};

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className = '',
  rounded = 'md',
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse bg-[#E2E8F0] ${roundedMap[rounded]} ${className}`}
    />
  );
};

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div
      aria-label="Loading table data"
      role="status"
      className={`w-full overflow-hidden border border-[#E2E8F0] rounded-lg bg-white shadow-sm ${className}`}
    >
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-col-${i}`} className="flex-1">
            <Skeleton height={16} width={i === 0 ? '40%' : '65%'} />
          </div>
        ))}
      </div>
      {/* Row Skeletons */}
      <div className="divide-y divide-[#E2E8F0]">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={`row-${r}`}
            className="flex items-center gap-4 px-4 py-3.5"
          >
            {Array.from({ length: columns }).map((_, c) => (
              <div key={`cell-${r}-${c}`} className="flex-1">
                <Skeleton
                  height={14}
                  width={c === 0 ? '50%' : c === columns - 1 ? '30%' : '80%'}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center min-h-[320px] w-full p-8"
    >
      <Spinner size="lg" className="text-[#2563EB] mb-4" />
      <p className="text-sm font-medium text-[#475569]">{message}</p>
    </div>
  );
};
