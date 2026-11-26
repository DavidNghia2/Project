import React, { useState } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { BarChart3 } from 'lucide-react';
import { AnimatedCounter, Card, EmptyState, MOTION_DURATION, MOTION_EASE } from '../../../design-system';
import { getIntlLocale, useTranslation } from '../../../i18n';
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
  const { t, language } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const series = validDateRange ? report.chartSeries : [];
  const hasSecondary =
    report.reportType === 'stock_movement' || report.reportType === 'low_stock';

  const chartTitle = report.chartTitle;

  const primaryLegend = (() => {
    if (report.reportType === 'stock_in') return t('reports.charts.legends.inboundQty');
    if (report.reportType === 'stock_out') return t('reports.charts.legends.outboundQty');
    if (report.reportType === 'stock_movement') return t('reports.charts.legends.movementInbound');
    if (report.reportType === 'low_stock') return t('reports.charts.legends.onHandQty');
    return t('reports.charts.legends.stockQty');
  })();

  const secondaryLegend = (() => {
    if (report.reportType === 'stock_movement') return t('reports.charts.legends.movementOutbound');
    if (report.reportType === 'low_stock') return t('reports.charts.legends.safetyLevel');
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
          title={t('reports.charts.unavailableTitle')}
          description={t('reports.charts.unavailableDesc')}
        />
      ) : series.length === 0 ? (
        <EmptyState
          title={t('reports.charts.noDataTitle')}
          description={t('reports.charts.noDataDesc')}
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
                    <AnimatedCounter value={activePoint.primaryQty} />
                  </strong>
                </span>
                {hasSecondary && activePoint.secondaryQty !== undefined && (
                  <span>
                    {secondaryLegend}:{' '}
                    <strong className="text-[#D97706]">
                      <AnimatedCounter value={activePoint.secondaryQty} />
                    </strong>
                  </span>
                )}
                <span>
                  {t('reports.charts.valueLabel')}{' '}
                  <strong className="text-[#0F172A]">
                    <AnimatedCounter value={activePoint.primaryValue} format={formatCurrencyVND} />
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
              preserveAspectRatio="xMidYMid meet"
              className="w-full min-w-[540px] max-w-5xl mx-auto h-60 sm:h-64 xl:h-72 select-none"
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
                    onClick={() => setHoveredKey(item.key)}
                    onMouseEnter={() => setHoveredKey(item.key)}
                    onFocus={() => setHoveredKey(item.key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setHoveredKey(item.key);
                      }
                    }}
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
                        <m.rect
                          key={`${report.reportType}-${item.key}-p`}
                          x={centerX - dualWidth - 2}
                          y={primaryY}
                          width={dualWidth}
                          height={Math.max(item.primaryQty > 0 ? 3 : 0, primaryH)}
                          rx={3}
                          fill={isActive ? '#0369A1' : '#0284C7'}
                          style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
                          initial={shouldReduceMotion ? { scaleY: 1 } : { scaleY: 0.08, opacity: 0.7 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={{
                            duration: MOTION_DURATION.moderate,
                            delay: Math.min(idx, 7) * 0.025,
                            ease: MOTION_EASE.out,
                          }}
                        >
                          <title>
                            {item.label} — {primaryLegend}: {item.primaryQty}
                          </title>
                        </m.rect>

                        {/* Secondary Bar (Outbound / Safety Threshold) */}
                        <m.rect
                          key={`${report.reportType}-${item.key}-s`}
                          x={centerX + 2}
                          y={secondaryY}
                          width={dualWidth}
                          height={Math.max(secondaryQty > 0 ? 3 : 0, secondaryH)}
                          rx={3}
                          fill={isActive ? '#B45309' : '#D97706'}
                          style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
                          initial={shouldReduceMotion ? { scaleY: 1 } : { scaleY: 0.08, opacity: 0.7 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={{
                            duration: MOTION_DURATION.moderate,
                            delay: Math.min(idx, 7) * 0.025 + 0.04,
                            ease: MOTION_EASE.out,
                          }}
                        >
                          <title>
                            {item.label} — {secondaryLegend}: {secondaryQty}
                          </title>
                        </m.rect>

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
                        <m.rect
                          key={`${report.reportType}-${item.key}-single`}
                          x={centerX - singleWidth / 2}
                          y={primaryY}
                          width={singleWidth}
                          height={Math.max(item.primaryQty > 0 ? 3 : 0, primaryH)}
                          rx={4}
                          fill={isActive ? '#0369A1' : '#0284C7'}
                          style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
                          initial={shouldReduceMotion ? { scaleY: 1 } : { scaleY: 0.08, opacity: 0.7 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={{
                            duration: MOTION_DURATION.moderate,
                            delay: Math.min(idx, 7) * 0.025,
                            ease: MOTION_EASE.out,
                          }}
                        >
                          <title>
                            {item.label}: {item.primaryQty} ({formatCurrencyVND(item.primaryValue)})
                          </title>
                        </m.rect>
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
              {t('reports.charts.reconciliation', { count: series.length })}
            </span>
            <span className="font-mono tabular-nums text-[#0F172A]">
              {primaryLegend}: <strong>{chartQtySum.toLocaleString(getIntlLocale(language))}</strong> ·{' '}
              {formatCurrencyVND(chartValueSum)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
