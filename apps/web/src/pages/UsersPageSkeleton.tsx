import React from 'react';
import { Card, Skeleton } from '../design-system';
import { useTranslation } from '../i18n';

export interface UsersPageSkeletonProps {
  className?: string;
}

export const UsersPageSkeleton: React.FC<UsersPageSkeletonProps> = ({ className = '' }) => {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-label={t('members.loading') || 'Loading members...'}
      className={`space-y-6 ${className}`}
    >
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div className="space-y-2">
          <Skeleton width={200} height={28} rounded="md" />
          <Skeleton width={260} height={15} rounded="md" />
        </div>
        <div>
          <Skeleton width={130} height={36} rounded="md" />
        </div>
      </div>

      {/* KPI Metric Strip Skeleton (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={`members-kpi-skel-${idx}`} padding="sm" className="border-slate-200">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton width={90} height={13} rounded="sm" />
                <Skeleton width={32} height={26} rounded="sm" className="font-mono mt-1" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Skeleton width={20} height={20} rounded="sm" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Bar & Table Card Skeleton */}
      <Card padding="md" className="space-y-4 border-slate-200">
        {/* Filter and Search Bar Skeleton */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Skeleton height={38} className="w-full rounded-md" />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Skeleton width={176} height={38} rounded="md" />
            <Skeleton width={176} height={38} rounded="md" />
          </div>
        </div>

        {/* Members Table Skeleton */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">{t('members.member')}</th>
                <th className="py-3 px-4">{t('members.role')}</th>
                <th className="py-3 px-4">{t('members.warehouse')}</th>
                <th className="py-3 px-4">{t('members.status')}</th>
                <th className="py-3 px-4 text-right">{t('members.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={`members-row-skel-${rIdx}`}>
                  {/* Member Avatar + Name + Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <Skeleton height={14} width={130} rounded="sm" />
                        <Skeleton height={11} width={160} rounded="sm" className="font-mono" />
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Skeleton height={22} width={76} rounded="full" />
                  </td>

                  {/* Warehouse Scope */}
                  <td className="py-3 px-4 min-w-44">
                    <Skeleton height={20} width={90} rounded="sm" />
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Skeleton height={22} width={100} rounded="full" />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <Skeleton height={32} width={88} rounded="md" />
                      <Skeleton height={32} width={80} rounded="md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
