import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import type { StatusHistoryEntry } from '../types';
import { OrderStatusBadge } from './OrderStatusBadge';

export interface OrderHistoryTimelineProps {
  history: ReadonlyArray<StatusHistoryEntry>;
}

function formatTimestamp(iso: string, language: 'en' | 'vi'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const OrderHistoryTimeline: React.FC<OrderHistoryTimelineProps> = ({ history }) => {
  const { t, language } = useTranslation();

  if (history.length === 0) {
    return (
      <p className="text-xs text-[#64748B]">
        {t('stockOps.timeline.empty')}
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-[#CBD5E1] ml-2.5 pl-5">
      {history.map((entry, idx) => {
        const isLast = idx === history.length - 1;
        return (
          <li key={entry.id} className="relative">
            <span
              className={`absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                isLast ? 'bg-[#0284C7] ring-2 ring-[#E0F2FE]' : 'bg-[#94A3B8]'
              }`}
              aria-hidden="true"
            />
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {entry.fromStatus ? (
                    <>
                      <OrderStatusBadge status={entry.fromStatus} size="sm" />
                      <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />
                      <OrderStatusBadge status={entry.toStatus} size="sm" />
                    </>
                  ) : (
                    <OrderStatusBadge status={entry.toStatus} size="sm" />
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-[#64748B]">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {formatTimestamp(entry.timestamp, language)}
                </span>
              </div>

              <div className="text-xs text-[#334155]">
                <span className="font-semibold text-[#0F172A]">{entry.actor}</span>
                {entry.note && <span className="text-[#475569]"> — {entry.note}</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
