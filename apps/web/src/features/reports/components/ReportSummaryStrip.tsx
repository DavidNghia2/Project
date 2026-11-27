import React from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  DollarSign,
  Layers,
} from 'lucide-react';
import { AnimatedCounter, Card, StaggerGroup, StaggerItem } from '../../../design-system';
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
  const { t, language } = useTranslation();

  const qtyNode = (n: number) =>
    validDateRange ? <AnimatedCounter value={n} /> : '—';
  const moneyNode = (n: number) =>
    validDateRange ? (
      <AnimatedCounter value={n} format={(val) => formatCurrencyVND(val, language)} />
    ) : (
      '—'
    );

  const cards = (() => {
    switch (report.reportType) {
      case 'current_stock': {
        const rows = report.rows as CurrentStockRow[];
        const lowCount = rows.filter((r) => r.quantity <= r.reorderLevel).length;
        return [
          {
            id: 'kpi-rows',
            label: t('reports.kpi.catalogSkus'),
            value: qtyNode(report.totals.rowCount),
            icon: Layers,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
          {
            id: 'kpi-primary-qty',
            label: t('reports.kpi.totalOnHandQty'),
            value: qtyNode(report.totals.totalPrimaryQty),
            icon: Boxes,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
          {
            id: 'kpi-primary-val',
            label: t('reports.kpi.totalInventoryValuation'),
            value: moneyNode(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#16A34A] bg-[#ECFDF5]',
          },
          {
            id: 'kpi-secondary',
            label: t('reports.kpi.atBelowThreshold'),
            value: qtyNode(lowCount),
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
            value: qtyNode(report.totals.rowCount),
            icon: Layers,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
          {
            id: 'kpi-primary-qty',
            label: isIn ? t('reports.kpi.totalInboundQty') : t('reports.kpi.totalOutboundQty'),
            value: qtyNode(report.totals.totalPrimaryQty),
            icon: isIn ? ArrowDownToLine : ArrowUpFromLine,
            tone: isIn ? 'text-[#16A34A] bg-[#ECFDF5]' : 'text-[#D97706] bg-[#FFFBEB]',
          },
          {
            id: 'kpi-primary-val',
            label: isIn ? t('reports.kpi.totalInboundValue') : t('reports.kpi.totalOutboundValue'),
            value: moneyNode(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
          {
            id: 'kpi-secondary',
            label: t('reports.kpi.avgValuePerLine'),
            value: moneyNode(avgPerLine),
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
            value: qtyNode(report.totals.totalPrimaryQty),
            icon: ArrowDownToLine,
            tone: 'text-[#16A34A] bg-[#ECFDF5]',
          },
          {
            id: 'kpi-primary-qty',
            label: t('reports.kpi.periodOutboundQty'),
            value: qtyNode(report.totals.totalSecondaryQty ?? 0),
            icon: ArrowUpFromLine,
            tone: 'text-[#D97706] bg-[#FFFBEB]',
          },
          {
            id: 'kpi-primary-val',
            label: t('reports.kpi.closingBalanceQty'),
            value: qtyNode(report.totals.totalClosingQty ?? 0),
            icon: Boxes,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
          {
            id: 'kpi-secondary',
            label: t('reports.kpi.periodInboundValue'),
            value: moneyNode(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
        ];

      case 'low_stock':
        return [
          {
            id: 'kpi-rows',
            label: t('reports.kpi.belowThresholdSkus'),
            value: qtyNode(report.totals.rowCount),
            icon: AlertTriangle,
            tone: 'text-[#DC2626] bg-[#FEF2F2]',
          },
          {
            id: 'kpi-primary-qty',
            label: t('reports.kpi.totalRemainingStock'),
            value: qtyNode(report.totals.totalPrimaryQty),
            icon: Boxes,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
          {
            id: 'kpi-primary-val',
            label: t('reports.kpi.totalDeficitUnits'),
            value: qtyNode(report.totals.totalSecondaryQty ?? 0),
            icon: Layers,
            tone: 'text-[#D97706] bg-[#FFFBEB]',
          },
          {
            id: 'kpi-secondary',
            label: t('reports.kpi.estRestockBudget'),
            value: moneyNode(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
        ];
    }
  })();

  return (
    <StaggerGroup preset="cards" isolate className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <StaggerItem key={kpi.id} index={idx}>
            <Card padding="sm" className="h-full">
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
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
};
