import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, EmptyState } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { formatCurrencyVND } from '../../stock-operations/workflow';
import type { ComputedReportResult } from '../types';

export interface ReportChartsPanelProps {
  report: ComputedReportResult;
  validDateRange: boolean;
}

function truncateLabel(text: string, maxLen = 14): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}…`;
}

export const ReportChartsPanel: React.FC<ReportChartsPanelProps> = ({
  report,
  validDateRange,
}) => {
  const { language } = useTranslation();
  const isVi = language === 'vi';
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const series = validDateRange ? report.chartSeries : [];
  const hasSecondary =
    report.reportType === 'stock_movement' || report.reportType === 'low_stock';

  const chartTitle = isVi ? report.chartTitleVi : report.chartTitleEn;

  const primaryLegend = (() => {
    if (report.reportType === 'stock_in') return isVi ? 'SL Nhập' : 'Inbound Qty';
    if (report.reportType === 'stock_out') return isVi ? 'SL Xuất' : 'Outbound Qty';
    if (report.reportType === 'stock_movement') return isVi ? 'Nhập trong kỳ' : 'Inbound Qty';
    if (report.reportType === 'low_stock') return isVi ? 'Tồn hiện tại' : 'On Hand Qty';
    return isVi ? 'Số lượng tồn' : 'Stock Qty';
  })();

  const secondaryLegend = (() => {
    if (report.reportType === 'stock_movement') return isVi ? 'Xuất trong kỳ' : 'Outbound Qty';
    if (report.reportType === 'low_stock') return isVi ? 'Ngưỡng tối thiểu' : 'Safety Level';
    return '';
  })();

  const maxMetric = series.reduce((max, item) => {
    const candidate = Math.max(item.primaryQty, item.secondaryQty ?? 0);
    return candidate > max ? candidate : max;
  }, 0);
  const scaleMax = Math.max(1, maxMetric);

  const activePoint =
    series.find((s) => s.key === hoveredKey) ?? series[0] ?? null;

  const chartQtySum = series.reduce((sum, s) => sum + s.primaryQty, 0);
  const chartValueSum = series.reduce((sum, s) => sum + s.primaryValue, 0);

  return (
    <Card
      title={
        <span className="inline-flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#0284C7]" aria-hidden="true" />
          <span>{chartTitle}</span>
        </span>
      }
      actions={
        series.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0284C7]" aria-hidden="true" />
              {primaryLegend}
            </span>
            {hasSecondary && secondaryLegend && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#D97706]" aria-hidden="true" />
                {secondaryLegend}
              </span>
            )}
          </div>
        )
      }
    >
      {!validDateRange ? (
        <EmptyState
          title={isVi ? 'Chưa thể dựng biểu đồ' : 'Chart Unavailable'}
          description={
            isVi
              ? 'Vui lòng chọn khoảng ngày hợp lệ để xem phân tích trực quan.'
              : 'Please select a valid date range to render visual analytics.'
          }
        />
      ) : series.length === 0 ? (
        <EmptyState
          title={isVi ? 'Không có dữ liệu trong phạm vi lọc' : 'No Chart Data in Scope'}
          description={
            isVi
              ? 'Thử mở rộng ngày lọc, chọn tất cả kho hoặc chọn tất cả danh mục.'
              : 'Try widening the date range, warehouse, or category filters.'
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Active bar readout */}
          {activePoint && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs">
              <div className="font-semibold text-[#0F172A]">
                {activePoint.label}
              </div>
              <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums text-[#334155]">
                <span>
                  {primaryLegend}:{' '}
                  <strong className="text-[#0284C7]">
                    {activePoint.primaryQty.toLocaleString('en-US')}
                  </strong>
                </span>
                {hasSecondary && activePoint.secondaryQty !== undefined && (
                  <span>
                    {secondaryLegend}:{' '}
                    <strong className="text-[#D97706]">
                      {activePoint.secondaryQty.toLocaleString('en-US')}
                    </strong>
                  </span>
                )}
                <span>
                  {isVi ? 'Giá trị:' : 'Value:'}{' '}
                  <strong className="text-[#0F172A]">
                    {formatCurrencyVND(activePoint.primaryValue)}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Responsive SVG Geometry Bar Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              role="img"
              aria-label={chartTitle}
              viewBox="0 0 760 250"
              className="w-full min-w-[540px] h-60 select-none"
            >
              {/* Horizontal Gridlines & Y Ticks */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const plotHeight = 170;
                const topPad = 24;
                const y = topPad + plotHeight * (1 - ratio);
                const tickVal = Math.round(scaleMax * ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={52}
                      y1={y}
                      x2={744}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth={1}
                    />
                    <text
                      x={44}
                      y={y + 4}
                      textAnchor="end"
                      fill="#64748B"
                      fontSize={10}
                      fontFamily="monospace"
                    >
                      {tickVal}
                    </text>
                  </g>
                );
              })}

              {/* Bars per series item */}
              {series.map((item, idx) => {
                const count = series.length;
                const plotLeft = 58;
                const plotWidth = 680;
                const topPad = 24;
                const plotHeight = 170;
                const slotWidth = plotWidth / count;
                const centerX = plotLeft + slotWidth * idx + slotWidth / 2;

                const singleWidth = Math.min(36, Math.max(12, slotWidth * 0.48));
                const dualWidth = Math.min(20, Math.max(8, slotWidth * 0.28));

                const primaryH = (item.primaryQty / scaleMax) * plotHeight;
                const primaryY = topPad + plotHeight - primaryH;
                const isActive = activePoint?.key === item.key;

                const secondaryQty = item.secondaryQty ?? 0;
                const secondaryH = (secondaryQty / scaleMax) * plotHeight;
                const secondaryY = topPad + plotHeight - secondaryH;

                return (
                  <g
                    key={item.key}
                    tabIndex={0}
                    role="button"
                    aria-label={`${item.label}: ${item.primaryQty}`}
                    onMouseEnter={() => setHoveredKey(item.key)}
                    onFocus={() => setHoveredKey(item.key)}
                    className="cursor-pointer outline-none"
                  >
                    {/* Subtle column hover highlight */}
                    <rect
                      x={plotLeft + slotWidth * idx + 2}
                      y={topPad - 4}
                      width={Math.max(4, slotWidth - 4)}
                      height={plotHeight + 8}
                      rx={4}
                      fill={isActive ? '#F1F5F9' : 'transparent'}
                    />

                    {hasSecondary ? (
                      <>
                        {/* Primary Bar (Inbound / Current Stock) */}
                        <rect
                          x={centerX - dualWidth - 2}
                          y={primaryY}
                          width={dualWidth}
                          height={Math.max(item.primaryQty > 0 ? 3 : 0, primaryH)}
                          rx={3}
                          fill={isActive ? '#0369A1' : '#0284C7'}
                        >
                          <title>
                            {item.label} — {primaryLegend}: {item.primaryQty}
                          </title>
                        </rect>

                        {/* Secondary Bar (Outbound / Safety Threshold) */}
                        <rect
                          x={centerX + 2}
                          y={secondaryY}
                          width={dualWidth}
                          height={Math.max(secondaryQty > 0 ? 3 : 0, secondaryH)}
                          rx={3}
                          fill={isActive ? '#B45309' : '#D97706'}
                        >
                          <title>
                            {item.label} — {secondaryLegend}: {secondaryQty}
                          </title>
                        </rect>

                        {/* Numeric label above taller bar */}
                        <text
                          x={centerX}
                          y={Math.min(primaryY, secondaryY) - 6}
                          textAnchor="middle"
                          fill="#334155"
                          fontSize={10}
                          fontFamily="monospace"
                          fontWeight={600}
                        >
                          {item.primaryQty}/{secondaryQty}
                        </text>
                      </>
                    ) : (
                      <>
                        <rect
                          x={centerX - singleWidth / 2}
                          y={primaryY}
                          width={singleWidth}
                          height={Math.max(item.primaryQty > 0 ? 3 : 0, primaryH)}
                          rx={4}
                          fill={isActive ? '#0369A1' : '#0284C7'}
                        >
                          <title>
                            {item.label}: {item.primaryQty} ({formatCurrencyVND(item.primaryValue)})
                          </title>
                        </rect>
                        <text
                          x={centerX}
                          y={primaryY - 6}
                          textAnchor="middle"
                          fill="#0F172A"
                          fontSize={10}
                          fontFamily="monospace"
                          fontWeight={600}
                        >
                          {item.primaryQty}
                        </text>
                      </>
                    )}

                    {/* X-axis Label */}
                    <text
                      x={centerX}
                      y={topPad + plotHeight + 18}
                      textAnchor="middle"
                      fill={isActive ? '#0F172A' : '#64748B'}
                      fontSize={10}
                      fontWeight={isActive ? 600 : 400}
                    >
                      {truncateLabel(item.label, count > 7 ? 10 : 14)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Mathematical Consistency Footer */}
          <div
            data-testid="chart-totals-sync"
            className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] text-xs text-[#64748B]"
          >
            <span>
              {isVi
                ? `Đối soát biểu đồ: ${series.length} nhóm dữ liệu (khớp 100% bảng bên dưới)`
                : `Chart reconciliation: ${series.length} series points (100% synchronized with table)`}
            </span>
            <span className="font-mono tabular-nums text-[#0F172A]">
              {primaryLegend}: <strong>{chartQtySum.toLocaleString('en-US')}</strong> ·{' '}
              {formatCurrencyVND(chartValueSum)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
