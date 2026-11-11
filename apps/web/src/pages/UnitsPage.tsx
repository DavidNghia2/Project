import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n';
import { translateDomainLabel } from '../i18n/domainTranslate';
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Badge, Table, Alert, type Column } from '../design-system';
import {
  useUnits,
  MasterDataToolbar,
  MasterDataDetailModal,
  MasterDataDeleteModal,
  MasterDataRowActions,
  UnitFormModal,
  type UnitOfMeasure,
  type UnitFormData,
} from '../features/master-data';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const UnitsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const canManageCatalog = capabilities.canManageCatalog;
  const {
    items,
    filteredItems,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    secondaryFilter,
    setSecondaryFilter,
    isFiltered,
    resetFilters,
    addItem,
    updateItem,
    deleteItem,
    getItemReferences,
  } = useUnits();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UnitOfMeasure | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => setToastMessage(msg);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (unit: UnitOfMeasure) => {
    setSelectedItem(unit);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleOpenDetail = (unit: UnitOfMeasure) => {
    setSelectedItem(unit);
    setDetailOpen(true);
  };

  const handleOpenDelete = (unit: UnitOfMeasure) => {
    setSelectedItem(unit);
    setDeleteOpen(true);
  };

  const handleFormSubmit = (data: UnitFormData) => {
    if (formMode === 'create') {
      const res = addItem(data);
      if (res.success) {
        showToast(
          t('masterData.units.toastCreated', {
            name: translateDomainLabel(language, 'units', data.name),
            code: data.code.toUpperCase(),
          })
        );
      }
      return res;
    }
    if (selectedItem) {
      const res = updateItem(selectedItem.id, data);
      if (res.success) {
        showToast(
          t('masterData.units.toastUpdated', { code: data.code.toUpperCase() })
        );
      }
      return res;
    }
    return { success: false };
  };

  const handleConfirmDelete = (forceConfirm: boolean) => {
    if (!selectedItem) return;
    const res = deleteItem(selectedItem.id, forceConfirm);
    if (res.success) {
      showToast(
        t('masterData.units.toastDeleted', {
          name: translateDomainLabel(language, 'units', selectedItem.name),
          code: selectedItem.code,
        })
      );
      setDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const columns: Column<UnitOfMeasure>[] = [
    {
      key: 'code',
      label: t('masterData.units.colCode'),
      render: (_val, row) => (
        <span className="font-mono text-xs font-bold text-[#2563EB]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: t('masterData.units.colName'),
      render: (_val, row) => (
        <button
          type="button"
          onClick={() => handleOpenDetail(row)}
          className="font-semibold text-[#0F172A] hover:text-[#2563EB] text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
        >
          {translateDomainLabel(language, 'units', row.name)}
        </button>
      ),
    },
    {
      key: 'symbol',
      label: t('masterData.units.colSymbol'),
      align: 'center',
      render: (_val, row) => (
        <span className="inline-block px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] font-mono text-xs font-semibold text-[#0F172A]">
          {row.symbol}
        </span>
      ),
    },
    {
      key: 'measureType',
      label: t('masterData.units.colMeasureType'),
      render: (_val, row) => (
        <span className="text-xs font-medium text-[#334155]">
          {t(`masterData.units.measureTypes.${row.measureType}`)}
        </span>
      ),
    },
    {
      key: 'conversionNote',
      label: t('masterData.units.colConversion'),
      render: (_val, row) => (
        <span className="text-xs text-[#475569] line-clamp-1 max-w-sm block">
          {row.conversionNote || '—'}
        </span>
      ),
    },
    {
      key: 'productsCount',
      label: t('masterData.units.colProducts'),
      align: 'center',
      render: (_val, row) => (
        <span className="font-mono text-xs font-medium text-[#0F172A] tabular-nums">
          {getItemReferences(row).length} SKU
        </span>
      ),
    },
    {
      key: 'status',
      label: t('masterData.units.colStatus'),
      align: 'center',
      render: (_val, row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
          {row.status === 'active' ? t('status.active') : t('status.inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('masterData.units.colActions'),
      align: 'right',
      render: (_val, row) => (
        <MasterDataRowActions
          itemCode={row.code}
          onView={() => handleOpenDetail(row)}
          onEdit={() => handleOpenEdit(row)}
          onDelete={() => handleOpenDelete(row)}
          canMutate={canManageCatalog}
        />
      ),
    },
  ];

  const selectedRefs = selectedItem ? getItemReferences(selectedItem) : [];
  const selectedDisplayName = selectedItem
    ? translateDomainLabel(language, 'units', selectedItem.name)
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.unitsTitle')}
        description={t('pages.unitsDesc')}
        actions={
          canManageCatalog ? (
            <Button
              id="btn-add-unit"
              variant="primary"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              {t('masterData.units.createBtn')}
            </Button>
          ) : undefined
        }
      />

      {!canManageCatalog && <RoleScopeNotice role={activeRole} context="catalog" />}

      {toastMessage && (
        <Alert
          variant="success"
          title={t('common.operationSuccess')}
          message={toastMessage}
          dismissible
          onDismiss={() => setToastMessage(null)}
        />
      )}

      <Card padding="md" className="space-y-4">
        <MasterDataToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('masterData.units.searchPlaceholder')}
          searchInputId="uom-search-input"
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          secondaryFilter={secondaryFilter}
          onSecondaryFilterChange={setSecondaryFilter}
          secondaryLabel={t('masterData.units.filterMeasureLabel')}
          secondaryOptions={[
            { value: 'ALL', label: t('masterData.units.allMeasureTypes') },
            { value: 'discrete', label: t('masterData.units.measureTypes.discrete') },
            { value: 'packaging', label: t('masterData.units.measureTypes.packaging') },
            { value: 'length', label: t('masterData.units.measureTypes.length') },
            { value: 'weight', label: t('masterData.units.measureTypes.weight') },
          ]}
          isFiltered={isFiltered}
          onReset={resetFilters}
          totalFiltered={filteredItems.length}
          totalItems={items.length}
          itemUnitLabel={t('masterData.units.unitLabel')}
        />

        <Table
          columns={columns}
          data={filteredItems}
          caption={t('masterData.units.tableCaption')}
          emptyTitle={
            isFiltered
              ? t('masterData.units.emptyFilteredTitle')
              : t('masterData.units.emptyTitle')
          }
          emptyDescription={
            isFiltered
              ? t('masterData.units.emptyFilteredDesc')
              : t('masterData.units.emptyDesc')
          }
          emptyAction={
            isFiltered ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={resetFilters}
                iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
              >
                {t('masterData.common.clearFilters')}
              </Button>
            ) : canManageCatalog ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreate}
                iconLeft={<Plus className="w-3.5 h-3.5" />}
              >
                {t('masterData.units.createBtn')}
              </Button>
            ) : undefined
          }
        />
      </Card>

      <UnitFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialItem={selectedItem}
        mode={formMode}
      />

      <MasterDataDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={canManageCatalog ? () => selectedItem && handleOpenEdit(selectedItem) : undefined}
        titlePrefix={t('masterData.units.detailPrefix')}
        code={selectedItem?.code}
        name={selectedDisplayName}
        status={selectedItem?.status}
        description={selectedItem?.description}
        fields={
          selectedItem
            ? [
                { label: t('masterData.units.detailSymbol'), value: selectedItem.symbol },
                {
                  label: t('masterData.units.detailMeasureType'),
                  value: t(`masterData.units.measureTypes.${selectedItem.measureType}`),
                },
                {
                  label: t('masterData.units.detailConversion'),
                  value: selectedItem.conversionNote,
                  fullWidth: true,
                },
              ]
            : []
        }
        references={selectedRefs}
        createdAt={selectedItem?.createdAt}
        updatedAt={selectedItem?.updatedAt}
      />

      <MasterDataDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        entityLabel={t('masterData.units.entity')}
        itemCode={selectedItem?.code}
        itemName={selectedDisplayName}
        references={selectedRefs}
      />
    </div>
  );
};
