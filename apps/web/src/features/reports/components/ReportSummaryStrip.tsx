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
  const { language } = useTranslation();
  const isVi = language === 'vi';

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
            label: isVi ? 'Số mặt hàng (SKU)' : 'Catalog SKUs',
            value: qtyText(report.totals.rowCount),
            icon: Layers,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
          {
            id: 'kpi-primary-qty',
            label: isVi ? 'Tổng số lượng tồn' : 'Total On-Hand Qty',
            value: qtyText(report.totals.totalPrimaryQty),
            icon: Boxes,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
          {
            id: 'kpi-primary-val',
            label: isVi ? 'Tổng giá trị tồn kho' : 'Total Inventory Valuation',
            value: moneyText(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#16A34A] bg-[#ECFDF5]',
          },
          {
            id: 'kpi-secondary',
            label: isVi ? 'SKU chạm/dưới ngưỡng' : 'At/Below Safety Threshold',
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
            label: isVi ? 'Số dòng giao dịch' : 'Ledger Lines',
            value: qtyText(report.totals.rowCount),
            icon: Layers,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
          {
            id: 'kpi-primary-qty',
            label: isIn
              ? isVi
                ? 'Tổng số lượng nhập'
                : 'Total Inbound Qty'
              : isVi
                ? 'Tổng số lượng xuất'
                : 'Total Outbound Qty',
            value: qtyText(report.totals.totalPrimaryQty),
            icon: isIn ? ArrowDownToLine : ArrowUpFromLine,
            tone: isIn ? 'text-[#16A34A] bg-[#ECFDF5]' : 'text-[#D97706] bg-[#FFFBEB]',
          },
          {
            id: 'kpi-primary-val',
            label: isIn
              ? isVi
                ? 'Tổng giá trị nhập kho'
                : 'Total Inbound Value'
              : isVi
                ? 'Tổng giá trị xuất kho'
                : 'Total Outbound Value',
            value: moneyText(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
          {
            id: 'kpi-secondary',
            label: isVi ? 'Giá trị TB / dòng hàng' : 'Avg Value / Line',
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
            label: isVi ? 'Tổng nhập trong kỳ' : 'Period Inbound Qty',
            value: qtyText(report.totals.totalPrimaryQty),
            icon: ArrowDownToLine,
            tone: 'text-[#16A34A] bg-[#ECFDF5]',
          },
          {
            id: 'kpi-primary-qty',
            label: isVi ? 'Tổng xuất trong kỳ' : 'Period Outbound Qty',
            value: qtyText(report.totals.totalSecondaryQty ?? 0),
            icon: ArrowUpFromLine,
            tone: 'text-[#D97706] bg-[#FFFBEB]',
          },
          {
            id: 'kpi-primary-val',
            label: isVi ? 'Tồn cuối kỳ (SL)' : 'Closing Balance Qty',
            value: qtyText(report.totals.totalClosingQty ?? 0),
            icon: Boxes,
            tone: 'text-[#0284C7] bg-[#F0F9FF]',
          },
          {
            id: 'kpi-secondary',
            label: isVi ? 'Tổng giá trị nhập kỳ' : 'Period Inbound Value',
            value: moneyText(report.totals.totalPrimaryValue),
            icon: DollarSign,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
        ];

      case 'low_stock':
        return [
          {
            id: 'kpi-rows',
            label: isVi ? 'SKU dưới ngưỡng' : 'Below-Threshold SKUs',
            value: qtyText(report.totals.rowCount),
            icon: AlertTriangle,
            tone: 'text-[#DC2626] bg-[#FEF2F2]',
          },
          {
            id: 'kpi-primary-qty',
            label: isVi ? 'Tổng tồn hiện có' : 'Total Remaining Stock',
            value: qtyText(report.totals.totalPrimaryQty),
            icon: Boxes,
            tone: 'text-[#0F172A] bg-[#F1F5F9]',
          },
          {
            id: 'kpi-primary-val',
            label: isVi ? 'Tổng SL cần bổ sung' : 'Total Deficit Units',
            value: qtyText(report.totals.totalSecondaryQty ?? 0),
            icon: Layers,
            tone: 'text-[#D97706] bg-[#FFFBEB]',
          },
          {
            id: 'kpi-secondary',
            label: isVi ? 'Dự trù chi phí nhập bù' : 'Est. Restock Budget',
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
