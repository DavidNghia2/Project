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
  labelVi: string;
  labelEn: string;
  subVi: string;
  subEn: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'current_stock',
    labelVi: 'Tồn kho hiện tại',
    labelEn: 'Current Stock',
    subVi: 'Inventory Balance Sheet',
    subEn: 'Inventory Balance Sheet',
    icon: Boxes,
  },
  {
    id: 'stock_in',
    labelVi: 'Báo cáo nhập kho',
    labelEn: 'Inbound Receipts',
    subVi: 'Chi tiết phiếu nhập',
    subEn: 'Inbound ledger',
    icon: ArrowDownToLine,
  },
  {
    id: 'stock_out',
    labelVi: 'Báo cáo xuất kho',
    labelEn: 'Outbound Dispatches',
    subVi: 'Chi tiết phiếu xuất',
    subEn: 'Outbound ledger',
    icon: ArrowUpFromLine,
  },
  {
    id: 'stock_movement',
    labelVi: 'Biến động tồn kho',
    labelEn: 'Stock Movement',
    subVi: 'Nhập - Xuất - Tồn',
    subEn: 'In / Out / Closing',
    icon: ArrowLeftRight,
  },
  {
    id: 'low_stock',
    labelVi: 'Tồn dưới ngưỡng',
    labelEn: 'Below Threshold',
    subVi: 'Cảnh báo định mức',
    subEn: 'Safety stock alerts',
    icon: AlertTriangle,
  },
];

const DATE_PRESETS = [
  {
    id: '7d',
    labelVi: '7 ngày qua (05–11/11)',
    labelEn: 'Last 7 Days (Nov 05–11)',
    start: '2026-11-05',
    end: '2026-11-11',
  },
  {
    id: 'nov',
    labelVi: 'Tháng 11/2026',
    labelEn: 'Nov 2026',
    start: '2026-11-01',
    end: '2026-11-11',
  },
  {
    id: 'oct',
    labelVi: 'Tháng 10/2026',
    labelEn: 'Oct 2026',
    start: '2026-10-15',
    end: '2026-10-31',
  },
  {
    id: 'q4',
    labelVi: 'Toàn kỳ Q4',
    labelEn: 'Full Q4 Range',
    start: REPORT_DEFAULT_START_DATE,
    end: REPORT_DEFAULT_END_DATE,
  },
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
  const { language } = useTranslation();

  const warehouseOptions = [
    {
      value: 'ALL',
      label: language === 'vi' ? 'Tất cả kho hàng' : 'All Warehouses',
    },
    ...INITIAL_WAREHOUSES.filter((w) => w.status === 'active').map((w) => ({
      value: w.code,
      label: `${w.code} — ${w.name}`,
    })),
  ];

  const categoryOptions = [
    {
      value: 'ALL',
      label: language === 'vi' ? 'Tất cả danh mục' : 'All Categories',
    },
    ...CATEGORIES_LIST.map((cat) => ({
      value: cat,
      label: cat,
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
        aria-label={language === 'vi' ? 'Chọn loại báo cáo kho' : 'Select inventory report'}
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
                  {language === 'vi' ? tab.labelVi : tab.labelEn}
                </span>
                <span className="block text-[11px] text-[#64748B] truncate">
                  {language === 'vi' ? tab.subVi : tab.subEn}
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
            {language === 'vi' ? 'Từ ngày' : 'Start Date'}
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
            {language === 'vi' ? 'Đến ngày' : 'End Date'}
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
            label={language === 'vi' ? 'Kho hàng' : 'Warehouse'}
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
              label={language === 'vi' ? 'Danh mục sản phẩm' : 'Product Category'}
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
              {language === 'vi' ? 'Đặt lại' : 'Reset'}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Date Range Presets + Contextual Date Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] mr-1">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            {language === 'vi' ? 'Mốc nhanh:' : 'Presets:'}
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
                {language === 'vi' ? preset.labelVi : preset.labelEn}
              </button>
            );
          })}
        </div>

        {(filters.reportType === 'current_stock' || filters.reportType === 'low_stock') && (
          <p className="text-[11px] text-[#64748B]">
            {language === 'vi'
              ? 'Số liệu tồn hiện tại & dưới ngưỡng phản ánh ảnh chụp kho tại thời điểm hiện tại.'
              : 'Current stock & low-stock views reflect present warehouse balances.'}
          </p>
        )}
      </div>

      {/* Explicit Date Validation Error Alert */}
      {!dateValidation.valid && dateValidation.error && (
        <Alert
          variant="error"
          title={language === 'vi' ? 'Khoảng ngày lọc không hợp lệ' : 'Invalid Date Range'}
          message={dateValidation.error}
        />
      )}
    </div>
  );
};
