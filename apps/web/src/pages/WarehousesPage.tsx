import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n';
import { translateDomainLabel } from '../i18n/domainTranslate';
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Badge, Table, Alert, type Column } from '../design-system';
import {
  useWarehouses,
  WAREHOUSE_REGIONS,
  MasterDataToolbar,
  MasterDataDetailModal,
  MasterDataDeleteModal,
  MasterDataRowActions,
  WarehouseFormModal,
  type Warehouse as WarehouseEntity,
  type WarehouseFormData,
} from '../features/master-data';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const WarehousesPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const canManageWarehouses = capabilities.canManageWarehouses;
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
  } = useWarehouses();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WarehouseEntity | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (wh: WarehouseEntity) => {
    setSelectedItem(wh);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleOpenDetail = (wh: WarehouseEntity) => {
    setSelectedItem(wh);
    setDetailOpen(true);
  };

  const handleOpenDelete = (wh: WarehouseEntity) => {
    setSelectedItem(wh);
    setDeleteOpen(true);
  };

  const handleFormSubmit = (data: WarehouseFormData) => {
    if (formMode === 'create') {
      const res = addItem(data);
      if (res.success) {
        showToast(
          t('masterData.warehouses.toastCreated', {
            name: data.name,
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
          t('masterData.warehouses.toastUpdated', { code: data.code.toUpperCase() })
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
        t('masterData.warehouses.toastDeleted', {
          name: translateDomainLabel(language, 'warehouseNames', selectedItem.code, selectedItem.name),
          code: selectedItem.code,
        })
      );
      setDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const columns: Column<WarehouseEntity>[] = [
    {
      key: 'code',
      label: t('masterData.warehouses.colCode'),
      render: (_val, row) => (
        <span className="font-mono text-xs font-bold text-[#2563EB]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: t('masterData.warehouses.colNameAddr'),
      render: (_val, row) => (
        <div className="space-y-0.5 max-w-xs">
          <button
            type="button"
            onClick={() => handleOpenDetail(row)}
            className="font-semibold text-[#0F172A] hover:text-[#2563EB] text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            {translateDomainLabel(language, 'warehouseNames', row.code, row.name)}
          </button>
          <span className="block text-xs text-[#475569] truncate">{row.address}</span>
        </div>
      ),
    },
    {
      key: 'region',
      label: t('masterData.warehouses.colRegionType'),
      render: (_val, row) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-medium text-[#0F172A] block">
            {translateDomainLabel(language, 'regions', row.region)}
          </span>
          <span className="text-[#475569] block">
            {t(`masterData.warehouses.types.${row.type}`)}
          </span>
        </div>
      ),
    },
    {
      key: 'manager',
      label: t('masterData.warehouses.colManager'),
      render: (_val, row) => (
        <div className="text-xs">
          <span className="font-medium text-[#0F172A] block">{row.manager}</span>
          <span className="text-[#475569]">
            {t('masterData.warehouses.staffUnit', { count: row.staffCount })}
          </span>
        </div>
      ),
    },
    {
      key: 'capacityPercent',
      label: t('masterData.warehouses.colCapacity'),
      align: 'center',
      render: (_val, row) => (
        <div className="inline-flex flex-col items-center gap-1 min-w-[72px]">
          <span className="font-mono text-xs font-semibold text-[#0F172A] tabular-nums">
            {row.capacityPercent}%
          </span>
          <div className="w-16 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.capacityPercent >= 85
                  ? 'bg-[#D97706]'
                  : 'bg-[#2563EB]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, row.capacityPercent))}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'references',
      label: t('masterData.warehouses.colRefs'),
      align: 'center',
      render: (_val, row) => {
        const count = getItemReferences(row).length;
        return (
          <span className="font-mono text-xs font-medium text-[#0F172A] tabular-nums">
            {count} SKU
          </span>
        );
      },
    },
    {
      key: 'status',
      label: t('masterData.warehouses.colStatus'),
      align: 'center',
      render: (_val, row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
          {row.status === 'active' ? t('status.active') : t('status.inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('masterData.warehouses.colActions'),
      align: 'right',
      render: (_val, row) => (
        <MasterDataRowActions
          itemCode={row.code}
          onView={() => handleOpenDetail(row)}
          onEdit={() => handleOpenEdit(row)}
          onDelete={() => handleOpenDelete(row)}
          canMutate={canManageWarehouses}
        />
      ),
    },
  ];

  const selectedRefs = selectedItem ? getItemReferences(selectedItem) : [];
  const selectedDisplayName = selectedItem
    ? translateDomainLabel(language, 'warehouseNames', selectedItem.code, selectedItem.name)
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.warehousesTitle')}
        description={t('pages.warehousesDesc')}
        actions={
          canManageWarehouses ? (
            <Button
              id="btn-add-warehouse"
              variant="primary"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              {t('masterData.warehouses.createBtn')}
            </Button>
          ) : undefined
        }
      />

      {!canManageWarehouses && <RoleScopeNotice role={activeRole} context="catalog" />}

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
          searchPlaceholder={t('masterData.warehouses.searchPlaceholder')}
          searchInputId="wh-search-input"
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          secondaryFilter={secondaryFilter}
          onSecondaryFilterChange={setSecondaryFilter}
          secondaryLabel={t('masterData.warehouses.filterRegionLabel')}
          secondaryOptions={[
            { value: 'ALL', label: t('masterData.warehouses.allRegions') },
            ...WAREHOUSE_REGIONS.map((r) => ({
              value: r,
              label: translateDomainLabel(language, 'regions', r),
            })),
          ]}
          isFiltered={isFiltered}
          onReset={resetFilters}
          totalFiltered={filteredItems.length}
          totalItems={items.length}
          itemUnitLabel={t('masterData.warehouses.unitLabel')}
        />

        <Table
          columns={columns}
          data={filteredItems}
          caption={t('masterData.warehouses.tableCaption')}
          emptyTitle={
            isFiltered
              ? t('masterData.warehouses.emptyFilteredTitle')
              : t('masterData.warehouses.emptyTitle')
          }
          emptyDescription={
            isFiltered
              ? t('masterData.warehouses.emptyFilteredDesc')
              : t('masterData.warehouses.emptyDesc')
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
            ) : canManageWarehouses ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreate}
                iconLeft={<Plus className="w-3.5 h-3.5" />}
              >
                {t('masterData.warehouses.createBtn')}
              </Button>
            ) : undefined
          }
        />
      </Card>

      <WarehouseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialItem={selectedItem}
        mode={formMode}
      />

      <MasterDataDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={canManageWarehouses ? () => selectedItem && handleOpenEdit(selectedItem) : undefined}
        titlePrefix={t('masterData.warehouses.detailPrefix')}
        code={selectedItem?.code}
        name={selectedDisplayName}
        status={selectedItem?.status}
        description={selectedItem?.description}
        fields={
          selectedItem
            ? [
                {
                  label: t('masterData.warehouses.detailRegion'),
                  value: translateDomainLabel(language, 'regions', selectedItem.region),
                },
                {
                  label: t('masterData.warehouses.detailType'),
                  value: t(`masterData.warehouses.types.${selectedItem.type}`),
                },
                { label: t('masterData.warehouses.detailManager'), value: selectedItem.manager },
                {
                  label: t('masterData.warehouses.detailStaff'),
                  value: t('masterData.warehouses.staffUnit', { count: selectedItem.staffCount }),
                },
                {
                  label: t('masterData.warehouses.detailCapacity'),
                  value: `${selectedItem.capacityPercent}%`,
                },
                {
                  label: t('masterData.warehouses.detailAddress'),
                  value: selectedItem.address,
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
        entityLabel={t('masterData.warehouses.entity')}
        itemCode={selectedItem?.code}
        itemName={selectedDisplayName}
        references={selectedRefs}
      />
    </div>
  );
};
