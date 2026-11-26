import React from 'react';
import { Card, Skeleton } from '../design-system';
import { useTranslation } from '../i18n';

export interface DashboardSkeletonProps {
  className?: string;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ className = '' }) => {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-label={t('common.loading')}
      className={`space-y-6 ${className}`}
    >
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-2 min-w-0 flex-1">
          <Skeleton width="100%" height={30} rounded="md" className="max-w-[220px]" />
          <Skeleton width="100%" height={16} rounded="md" className="max-w-[340px]" />
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Skeleton width={110} height={36} rounded="md" />
          <Skeleton width={110} height={36} rounded="md" />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={`dashboard-kpi-skel-${idx}`} padding="md" className="border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton width="60%" height={13} rounded="sm" />
                <Skeleton width="45%" height={26} rounded="sm" className="mt-1" />
                <Skeleton width="75%" height={12} rounded="sm" className="mt-1.5" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Skeleton width={20} height={20} rounded="sm" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid: Recent Transactions Table & Flow Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Table Card Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none" className="overflow-hidden border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-slate-200 bg-white">
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton width="100%" height={18} rounded="sm" className="max-w-[180px]" />
                <Skeleton width="100%" height={12} rounded="sm" className="max-w-[280px]" />
              </div>
              <Skeleton width={90} height={14} rounded="sm" className="shrink-0" />
            </div>

            <div className="w-full">
              {/* Header */}
              <div className="flex items-center gap-4 bg-slate-50 border-b border-slate-200 px-4 py-3">
                <div className="w-24"><Skeleton height={12} width="80%" rounded="sm" /></div>
                <div className="flex-1"><Skeleton height={12} width="60%" rounded="sm" /></div>
                <div className="w-20"><Skeleton height={12} width="60%" rounded="sm" /></div>
                <div className="w-20 text-right"><Skeleton height={12} width="70%" rounded="sm" className="ml-auto" /></div>
                <div className="w-24"><Skeleton height={12} width="70%" rounded="sm" /></div>
                <div className="w-20 text-right"><Skeleton height={12} width="60%" rounded="sm" className="ml-auto" /></div>
              </div>
              {/* Rows */}
              <div className="divide-y divide-slate-100 bg-white">
                {Array.from({ length: 4 }).map((_, rIdx) => (
                  <div key={`dashboard-table-row-skel-${rIdx}`} className="flex items-center gap-4 px-4 py-3.5">
                    <div className="w-24"><Skeleton height={14} width="85%" rounded="sm" /></div>
                    <div className="flex-1 space-y-1">
                      <Skeleton height={14} width="80%" rounded="sm" />
                      <Skeleton height={11} width="40%" rounded="sm" />
                    </div>
                    <div className="w-20"><Skeleton height={20} width={44} rounded="full" /></div>
                    <div className="w-20 text-right"><Skeleton height={14} width="60%" rounded="sm" className="ml-auto" /></div>
                    <div className="w-24"><Skeleton height={14} width="75%" rounded="sm" /></div>
                    <div className="w-20 text-right"><Skeleton height={14} width="50%" rounded="sm" className="ml-auto" /></div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Quick Guidance & Scope Skeleton */}
        <div className="space-y-4">
          <Card padding="md" className="border-slate-200 space-y-4">
            <div className="space-y-1.5 min-w-0">
              <Skeleton width="100%" height={16} rounded="sm" className="max-w-[160px]" />
              <Skeleton width="100%" height={12} rounded="sm" className="max-w-[220px]" />
            </div>
            <div className="space-y-3 pt-1">
              {Array.from({ length: 4 }).map((_, sIdx) => (
                <div key={`dashboard-step-skel-${sIdx}`} className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton width="50%" height={13} rounded="sm" />
                    <Skeleton width="85%" height={11} rounded="sm" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md" className="bg-blue-50/40 border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-blue-100 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <Skeleton width="45%" height={13} rounded="sm" />
                <Skeleton width="90%" height={11} rounded="sm" />
                <Skeleton width="75%" height={11} rounded="sm" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
