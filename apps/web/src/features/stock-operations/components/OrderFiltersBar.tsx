import React from 'react';
import { RotateCcw, Search, UserCheck } from 'lucide-react';
import { Button, Input, Select } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { INITIAL_WAREHOUSES } from '../../master-data/mockData';
import { SIMULATED_ACTORS } from '../mockData';
import type { OrderFilterState } from '../useStockOrders';

export interface OrderFiltersBarProps {
  filters: OrderFilterState;
  currentActor: string;
  searchPlaceholder: string;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onWarehouseChange: (val: string) => void;
  onActorChange: (val: string) => void;
  onReset: () => void;
}

export const OrderFiltersBar: React.FC<OrderFiltersBarProps> = ({
  filters,
  currentActor,
  searchPlaceholder,
  onSearchChange,
  onStatusChange,
  onWarehouseChange,
  onActorChange,
  onReset,
}) => {
  const { t, language } = useTranslation();

  const statusOptions = [
    { value: 'ALL', label: language === 'vi' ? 'Tất cả trạng thái' : 'All Statuses' },
    { value: 'DRAFT', label: t('status.draft') },
    { value: 'SUBMITTED', label: t('status.submitted') },
    { value: 'APPROVED', label: t('status.approved') },
    { value: 'COMPLETED', label: t('status.completed') },
    { value: 'REJECTED', label: t('status.rejected') },
  ];

  const warehouseOptions = [
    { value: 'ALL', label: language === 'vi' ? 'Tất cả kho hàng' : 'All Warehouses' },
    ...INITIAL_WAREHOUSES.filter((w) => w.status === 'active').map((w) => ({
      value: w.code,
      label: `${w.code} — ${w.name}`,
    })),
  ];

  const actorOptions = SIMULATED_ACTORS.map((actor) => ({
    value: actor,
    label: actor,
  }));

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'ALL' ||
    filters.warehouseCode !== 'ALL';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-4">
          <Input
            id="stock-order-search"
            label={language === 'vi' ? 'Tìm kiếm phiếu / SKU' : 'Search Voucher / SKU'}
            placeholder={searchPlaceholder}
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Search className="w-4 h-4 text-[#64748B]" />}
            size="sm"
          />
        </div>

        <div className="lg:col-span-2">
          <Select
            id="stock-order-filter-status"
            label={language === 'vi' ? 'Trạng thái' : 'Status'}
            value={filters.status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={statusOptions}
            size="sm"
          />
        </div>

        <div className="lg:col-span-3">
          <Select
            id="stock-order-filter-warehouse"
            label={language === 'vi' ? 'Kho áp dụng' : 'Warehouse'}
            value={filters.warehouseCode}
            onChange={(e) => onWarehouseChange(e.target.value)}
            options={warehouseOptions}
            size="sm"
          />
        </div>

        <div className="lg:col-span-3 flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <Select
              id="stock-order-actor-select"
              label={
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#0284C7]" aria-hidden="true" />
                  {language === 'vi' ? 'Người thao tác (Mô phỏng)' : 'Simulated Operator'}
                </span>
              }
              value={currentActor}
              onChange={(e) => onActorChange(e.target.value)}
              options={actorOptions}
              size="sm"
            />
          </div>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
              title={language === 'vi' ? 'Đặt lại bộ lọc' : 'Reset filters'}
            >
              {language === 'vi' ? 'Xóa lọc' : 'Reset'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
