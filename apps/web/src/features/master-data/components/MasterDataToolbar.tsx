import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input, Select, Button } from '../../../design-system';
import { useTranslation } from '../../../i18n';

export interface FilterOption {
  value: string;
  label: string;
}

export interface MasterDataToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchInputId?: string;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  secondaryFilter?: string;
  onSecondaryFilterChange?: (value: string) => void;
  secondaryLabel?: string;
  secondaryOptions?: FilterOption[];
  isFiltered: boolean;
  onReset: () => void;
  totalFiltered: number;
  totalItems: number;
  itemUnitLabel?: string;
}

export const MasterDataToolbar: React.FC<MasterDataToolbarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder,
  searchInputId = 'master-search-input',
  statusFilter,
  onStatusChange,
  secondaryFilter,
  onSecondaryFilterChange,
  secondaryLabel,
  secondaryOptions,
  isFiltered,
  onReset,
  totalFiltered,
  totalItems,
  itemUnitLabel,
}) => {
  const { t } = useTranslation();
  const resolvedUnitLabel = itemUnitLabel ?? t('masterData.common.defaultUnitLabel');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        {/* Search Input */}
        <div className={secondaryOptions ? 'lg:col-span-2' : 'sm:col-span-1 lg:col-span-2'}>
          <Input
            id={searchInputId}
            label={t('masterData.common.searchLabel')}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Search className="w-4 h-4 text-[#64748B]" />}
            size="sm"
          />
        </div>

        {/* Optional Secondary Filter */}
        {secondaryOptions && onSecondaryFilterChange && (
          <div>
            <Select
              label={secondaryLabel || t('masterData.common.defaultSecondaryLabel')}
              value={secondaryFilter || 'ALL'}
              onChange={(e) => onSecondaryFilterChange(e.target.value)}
              size="sm"
              options={secondaryOptions}
            />
          </div>
        )}

        {/* Status Filter */}
        <div>
          <Select
            label={t('masterData.common.statusLabel')}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            size="sm"
            options={[
              { value: 'ALL', label: t('masterData.common.allStatuses') },
              { value: 'active', label: t('masterData.common.statusActive') },
              { value: 'inactive', label: t('masterData.common.statusInactive') },
            ]}
          />
        </div>
      </div>

      {/* Filter meta bar */}
      <div className="flex items-center justify-between text-xs text-[#475569]">
        <span>
          {t('masterData.common.showingPrefix')}{' '}
          <strong className="text-[#0F172A] font-semibold">{totalFiltered}</strong> /{' '}
          <strong className="text-[#0F172A] font-semibold">{totalItems}</strong> {resolvedUnitLabel}
        </span>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {t('masterData.common.clearFilters')}
          </Button>
        )}
      </div>
    </div>
  );
};
