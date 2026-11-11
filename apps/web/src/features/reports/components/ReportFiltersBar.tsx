import React from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { Alert, Button, Select } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';
import { INITIAL_WAREHOUSES } from '../../master-data/mockData';
import { CATEGORIES_LIST } from '../../products/mockData';
import { REPORT_DEFAULT_END_DATE, REPORT_DEFAULT_START_DATE } from '../mockLedger';
import type {
  DateRangeValidationResult,
  ReportFilterState,
  ReportType,
} from '../types';

export interface ReportFiltersBarProps {
  filters: ReportFilterState;
  dateValidation: DateRangeValidationResult;
  onReportTypeChange: (type: ReportType) => void;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onWarehouseChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onApplyPreset: (start: string, end: string) => void;
  onReset: () => void;
}

const REPORT_TABS: ReadonlyArray<{
  id: ReportType;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'current_stock', icon: Boxes },
  { id: 'stock_in', icon: ArrowDownToLine },
  { id: 'stock_out', icon: ArrowUpFromLine },
  { id: 'stock_movement', icon: ArrowLeftRight },
  { id: 'low_stock', icon: AlertTriangle },
];

const DATE_PRESETS = [
  { id: '7d', start: '2026-11-05', end: '2026-11-11' },
  { id: 'nov', start: '2026-11-01', end: '2026-11-11' },
  { id: 'oct', start: '2026-10-15', end: '2026-10-31' },
  { id: 'q4', start: REPORT_DEFAULT_START_DATE, end: REPORT_DEFAULT_END_DATE },
];

export const ReportFiltersBar: React.FC<ReportFiltersBarProps> = ({
  filters,
  dateValidation,
  onReportTypeChange,
  onStartDateChange,
  onEndDateChange,
  onWarehouseChange,
  onCategoryChange,
  onApplyPreset,
  onReset,
}) => {
  const { t, language } = useTranslation();

  const warehouseOptions = [
    {
      value: 'ALL',
      label: t('reports.filters.allWarehouses'),
    },
    ...INITIAL_WAREHOUSES.filter((w) => w.status === 'active').map((w) => ({
      value: w.code,
      label: `${w.code} — ${translateDomainLabel(language, 'warehouseNames', w.code, w.name)}`,
    })),
  ];

  const categoryOptions = [
    {
      value: 'ALL',
      label: t('reports.filters.allCategories'),
    },
    ...CATEGORIES_LIST.map((cat) => ({
      value: cat,
      label: translateDomainLabel(language, 'categories', cat),
    })),
  ];

  const isFiltered =
    filters.startDate !== REPORT_DEFAULT_START_DATE ||
    filters.endDate !== REPORT_DEFAULT_END_DATE ||
    filters.warehouseCode !== 'ALL' ||
    filters.category !== 'ALL';

  return (
    <div className="space-y-4">
      {/* 5 Report Switcher Tabs */}
      <div
        role="tablist"
        aria-label={t('reports.tabs.tablistAria')}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2"
      >
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = filters.reportType === tab.id;
          return (
            <button
              key={tab.id}
              id={`report-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onReportTypeChange(tab.id)}
              className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                active
                  ? 'border-[#0284C7] bg-[#F0F9FF] text-[#0F172A]'
                  : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  active ? 'text-[#0284C7]' : 'text-[#64748B]'
                }`}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-xs font-semibold truncate">
                  {t(`reports.tabs.${tab.id}.label`)}
                </span>
                <span className="block text-[11px] text-[#64748B] truncate">
                  {t(`reports.tabs.${tab.id}.sub`)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Inputs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-2">
          <label
            htmlFor="report-start-date"
            className="block text-xs font-medium text-[#0F172A] mb-1.5"
          >
            {t('reports.filters.startDate')}
          </label>
          <input
            id="report-start-date"
            type="date"
            value={filters.startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            aria-invalid={!dateValidation.valid}
            className={`w-full h-8 rounded-md border px-2.5 text-xs font-mono tabular-nums text-[#0F172A] bg-white outline-none transition-colors focus:ring-2 ${
              !dateValidation.valid
                ? 'border-[#DC2626] focus:ring-[#FEE2E2]'
                : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#0284C7] focus:ring-[#E0F2FE]'
            }`}
          />
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="report-end-date"
            className="block text-xs font-medium text-[#0F172A] mb-1.5"
          >
            {t('reports.filters.endDate')}
          </label>
          <input
            id="report-end-date"
            type="date"
            value={filters.endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            aria-invalid={!dateValidation.valid}
            className={`w-full h-8 rounded-md border px-2.5 text-xs font-mono tabular-nums text-[#0F172A] bg-white outline-none transition-colors focus:ring-2 ${
              !dateValidation.valid
                ? 'border-[#DC2626] focus:ring-[#FEE2E2]'
                : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#0284C7] focus:ring-[#E0F2FE]'
            }`}
          />
        </div>

        <div className="lg:col-span-4">
          <Select
            id="report-warehouse-select"
            label={t('reports.filters.warehouse')}
            value={filters.warehouseCode}
            onChange={(e) => onWarehouseChange(e.target.value)}
            options={warehouseOptions}
            size="sm"
          />
        </div>

        <div className="lg:col-span-4 flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <Select
              id="report-category-select"
              label={t('reports.filters.category')}
              value={filters.category}
              onChange={(e) => onCategoryChange(e.target.value)}
              options={categoryOptions}
              size="sm"
            />
          </div>
          {isFiltered && (
            <Button
              id="btn-reset-report-filters"
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
            >
              {t('reports.filters.reset')}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Date Range Presets + Contextual Date Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] mr-1">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            {t('reports.filters.presetsLabel')}
          </span>
          {DATE_PRESETS.map((preset) => {
            const isSelected =
              filters.startDate === preset.start && filters.endDate === preset.end;
            return (
              <button
                key={preset.id}
                id={`preset-date-${preset.id}`}
                type="button"
                onClick={() => onApplyPreset(preset.start, preset.end)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#0284C7] bg-[#F0F9FF] text-[#0284C7]'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]'
                }`}
              >
                {t(`reports.filters.presets.${preset.id}`)}
              </button>
            );
          })}
        </div>

        {(filters.reportType === 'current_stock' || filters.reportType === 'low_stock') && (
          <p className="text-[11px] text-[#64748B]">
            {t('reports.filters.snapshotNote')}
          </p>
        )}
      </div>

      {/* Explicit Date Validation Error Alert */}
      {!dateValidation.valid && dateValidation.error && (
        <Alert
          variant="error"
          title={t('reports.filters.invalidRangeTitle')}
          message={dateValidation.error}
        />
      )}
    </div>
  );
};
