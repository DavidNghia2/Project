import React from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  DollarSign,
  Layers,
} from 'lucide-react';
import { Card } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { formatCurrencyVND } from '../../stock-operations/workflow';
import type { ComputedReportResult, CurrentStockRow } from '../types';

export interface ReportSummaryStripProps {
  report: ComputedReportResult;
  validDateRange: boolean;
}

export const ReportSummaryStrip: React.FC<ReportSummaryStripProps> = ({
  report,
  validDateRange,
}) => {
  const { t } = useTranslation();

  const qtyText = (n: number) => (validDateRange ? n.toLocaleString('en-US') : '—');
  const moneyText = (n: number) => (validDateRange ? formatCurrencyVND(n) : '—');

  const cards = (() => {
    switch (report.reportType) {
      case 'current_stock': {
        const rows = report.rows as CurrentStockRow[];
        const lowCount = rows.filter((r) => r.quantity <= r.reorderLevel).length;
        return [
          {
            id: 'kpi-rows',
            label: t('reports.kpi.catalogSkus'),
            value: qtyText(report.totals.rowCount),
            icon: Layers,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
          {
            id: 'kpi-primary-qty',
            label: t('reports.kpi.totalOnHandQty'),
            value: qtyText(report.totals.totalPrimaryQty),
            icon: Boxes,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
          {
            id: 'kpi-primary-val',
            label: t('reports.kpi.totalInventoryValuation'),
            value: moneyText(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#16A34A] bg-[#ECFDF5]',
          },
          {
            id: 'kpi-secondary',
            label: t('reports.kpi.atBelowThreshold'),
            value: qtyText(lowCount),
            icon: AlertTriangle,
            tone: 'text-[#D97706] bg-[#FFFBEB]',
          },
        ];
      }

      case 'stock_in':
      case 'stock_out': {
        const isIn = report.reportType === 'stock_in';
        const avgPerLine =
          report.totals.rowCount > 0
            ? Math.round(report.totals.totalPrimaryValue / report.totals.rowCount)
            : 0;
        return [
          {
            id: 'kpi-rows',
            label: t('reports.kpi.ledgerLines'),
            value: qtyText(report.totals.rowCount),
            icon: Layers,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
          {
            id: 'kpi-primary-qty',
            label: isIn ? t('reports.kpi.totalInboundQty') : t('reports.kpi.totalOutboundQty'),
            value: qtyText(report.totals.totalPrimaryQty),
            icon: isIn ? ArrowDownToLine : ArrowUpFromLine,
            tone: isIn ? 'text-[#16A34A] bg-[#ECFDF5]' : 'text-[#D97706] bg-[#FFFBEB]',
          },
          {
            id: 'kpi-primary-val',
            label: isIn ? t('reports.kpi.totalInboundValue') : t('reports.kpi.totalOutboundValue'),
            value: moneyText(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
          {
            id: 'kpi-secondary',
            label: t('reports.kpi.avgValuePerLine'),
            value: moneyText(avgPerLine),
            icon: Boxes,
            tone: 'text-[#475569] bg-[#F8FAFC]',
          },
        ];
      }

      case 'stock_movement':
        return [
          {
            id: 'kpi-rows',
            label: t('reports.kpi.periodInboundQty'),
            value: qtyText(report.totals.totalPrimaryQty),
            icon: ArrowDownToLine,
            tone: 'text-[#16A34A] bg-[#ECFDF5]',
          },
          {
            id: 'kpi-primary-qty',
            label: t('reports.kpi.periodOutboundQty'),
            value: qtyText(report.totals.totalSecondaryQty ?? 0),
            icon: ArrowUpFromLine,
            tone: 'text-[#D97706] bg-[#FFFBEB]',
          },
          {
            id: 'kpi-primary-val',
            label: t('reports.kpi.closingBalanceQty'),
            value: qtyText(report.totals.totalClosingQty ?? 0),
            icon: Boxes,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
          {
            id: 'kpi-secondary',
            label: t('reports.kpi.periodInboundValue'),
            value: moneyText(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
        ];

      case 'low_stock':
        return [
          {
            id: 'kpi-rows',
            label: t('reports.kpi.belowThresholdSkus'),
            value: qtyText(report.totals.rowCount),
            icon: AlertTriangle,
            tone: 'text-[#DC2626] bg-[#FEF2F2]',
          },
          {
            id: 'kpi-primary-qty',
            label: t('reports.kpi.totalRemainingStock'),
            value: qtyText(report.totals.totalPrimaryQty),
            icon: Boxes,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
          {
            id: 'kpi-primary-val',
            label: t('reports.kpi.totalDeficitUnits'),
            value: qtyText(report.totals.totalSecondaryQty ?? 0),
            icon: Layers,
            tone: 'text-[#D97706] bg-[#FFFBEB]',
          },
          {
            id: 'kpi-secondary',
            label: t('reports.kpi.estRestockBudget'),
            value: moneyText(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
        ];
    }
  })();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.id} padding="sm">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#64748B] truncate">{kpi.label}</p>
                <p
                  data-testid={kpi.id}
                  className="text-lg sm:text-xl font-bold font-mono tabular-nums text-[#0F172A] mt-1 truncate"
                >
                  {kpi.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-lg shrink-0 ${kpi.tone}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
