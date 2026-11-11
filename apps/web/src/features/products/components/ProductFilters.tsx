import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';
import { Input, Select, Button } from '../../../design-system';
import { CATEGORIES_LIST, WAREHOUSES_LIST } from '../mockData';
import type { ProductFilterState } from '../types';

export interface ProductFiltersProps {
  filters: ProductFilterState;
  onSearchChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onWarehouseChange: (val: string) => void;
  onReset: () => void;
  totalFiltered: number;
  totalProducts: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onWarehouseChange,
  onReset,
  totalFiltered,
  totalProducts,
}) => {
  const { t, language } = useTranslation();

  const isFiltered =
    filters.search.trim() !== '' ||
    filters.category !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.warehouse !== 'ALL';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            id="product-search-input"
            label={t('products.filters.searchLabel')}
            placeholder={t('products.filters.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
          />
        </div>

        {/* Category Filter */}
        <div>
          <Select
            label={t('products.filters.categoryLabel')}
            value={filters.category}
            onChange={(e) => onCategoryChange(e.target.value)}
            size="sm"
            options={[
              { value: 'ALL', label: t('products.filters.allCategories') },
              ...CATEGORIES_LIST.map((c) => ({
                value: c,
                label: translateDomainLabel(language, 'categories', c),
              })),
            ]}
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            label={t('products.filters.statusLabel')}
            value={filters.status}
            onChange={(e) => onStatusChange(e.target.value)}
            size="sm"
            options={[
              { value: 'ALL', label: t('products.filters.allStatuses') },
              { value: 'active', label: t('products.filters.statusActiveOpt') },
              { value: 'inactive', label: t('products.filters.statusInactiveOpt') },
            ]}
          />
        </div>

        {/* Warehouse Filter */}
        <div>
          <Select
            label={t('products.filters.warehouseLabel')}
            value={filters.warehouse}
            onChange={(e) => onWarehouseChange(e.target.value)}
            size="sm"
            options={[
              { value: 'ALL', label: t('products.filters.allWarehouses') },
              ...WAREHOUSES_LIST.map((w) => ({
                value: w.code,
                label: translateDomainLabel(language, 'warehouseNames', w.code, w.name),
              })),
            ]}
          />
        </div>
      </div>

      {/* Filter summary & Reset */}
      <div className="flex items-center justify-between text-xs text-[#64748B] pt-1 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <span>
            {t('products.filters.resultsLabel')}{' '}
            <strong className="text-[#0F172A] font-semibold">{totalFiltered}</strong> / {totalProducts}{' '}
            {t('products.filters.itemsUnit')}
          </span>
          {isFiltered && (
            <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded text-[11px]">
              {t('products.filters.filtersActiveBadge')}
            </span>
          )}
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs text-[#475569] hover:text-[#0F172A]"
          >
            {t('products.filters.resetBtn')}
          </Button>
        )}
      </div>
    </div>
  );
};
