import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n';
import { translateDomainLabel } from '../i18n/domainTranslate';
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Badge, Table, Alert, type Column } from '../design-system';
import {
  useSuppliers,
  SUPPLIER_PAYMENT_TERMS,
  MasterDataToolbar,
  MasterDataDetailModal,
  MasterDataDeleteModal,
  MasterDataRowActions,
  SupplierFormModal,
  type Supplier,
  type SupplierFormData,
} from '../features/master-data';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const SuppliersPage: React.FC = () => {
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
  } = useSuppliers();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Supplier | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => setToastMessage(msg);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setSelectedItem(sup);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleOpenDetail = (sup: Supplier) => {
    setSelectedItem(sup);
    setDetailOpen(true);
  };

  const handleOpenDelete = (sup: Supplier) => {
    setSelectedItem(sup);
    setDeleteOpen(true);
  };

  const handleFormSubmit = (data: SupplierFormData) => {
    if (formMode === 'create') {
      const res = addItem(data);
      if (res.success) {
        showToast(
          t('masterData.suppliers.toastCreated', {
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
          t('masterData.suppliers.toastUpdated', { code: data.code.toUpperCase() })
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
        t('masterData.suppliers.toastDeleted', {
          name: selectedItem.name,
          code: selectedItem.code,
        })
      );
      setDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'code',
      label: t('masterData.suppliers.colCode'),
      render: (_val, row) => (
        <span className="font-mono text-xs font-bold text-[#2563EB]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: t('masterData.suppliers.colNameAddr'),
      render: (_val, row) => (
        <div className="space-y-0.5 max-w-xs">
          <button
            type="button"
            onClick={() => handleOpenDetail(row)}
            className="font-semibold text-[#0F172A] hover:text-[#2563EB] text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            {row.name}
          </button>
          <span className="block text-xs text-[#475569] truncate">{row.address}</span>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      label: t('masterData.suppliers.colContact'),
      render: (_val, row) => (
        <div className="text-xs space-y-0.5">
          <span className="font-medium text-[#0F172A] block">{row.contactPerson}</span>
          <span className="text-[#475569] block">{row.phone} • {row.email}</span>
        </div>
      ),
    },
    {
      key: 'paymentTerms',
      label: t('masterData.suppliers.colTerms'),
      render: (_val, row) => (
        <span className="text-xs text-[#334155] font-medium">
          {translateDomainLabel(language, 'paymentTerms', row.paymentTerms)}
        </span>
      ),
    },
    {
      key: 'productsCount',
      label: t('masterData.suppliers.colProducts'),
      align: 'center',
      render: (_val, row) => (
        <span className="font-mono text-xs font-medium text-[#0F172A] tabular-nums">
          {getItemReferences(row).length} SKU
        </span>
      ),
    },
    {
      key: 'status',
      label: t('masterData.suppliers.colStatus'),
      align: 'center',
      render: (_val, row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
          {row.status === 'active' ? t('status.active') : t('status.inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('masterData.suppliers.colActions'),
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.suppliersTitle')}
        description={t('pages.suppliersDesc')}
        actions={
          canManageCatalog ? (
            <Button
              id="btn-add-supplier"
              variant="primary"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              {t('masterData.suppliers.createBtn')}
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
          searchPlaceholder={t('masterData.suppliers.searchPlaceholder')}
          searchInputId="sup-search-input"
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          secondaryFilter={secondaryFilter}
          onSecondaryFilterChange={setSecondaryFilter}
          secondaryLabel={t('masterData.suppliers.filterTermsLabel')}
          secondaryOptions={[
            { value: 'ALL', label: t('masterData.suppliers.allPaymentTerms') },
            ...SUPPLIER_PAYMENT_TERMS.map((p) => ({
              value: p,
              label: translateDomainLabel(language, 'paymentTerms', p),
            })),
          ]}
          isFiltered={isFiltered}
          onReset={resetFilters}
          totalFiltered={filteredItems.length}
          totalItems={items.length}
          itemUnitLabel={t('masterData.suppliers.unitLabel')}
        />

        <Table
          columns={columns}
          data={filteredItems}
          caption={t('masterData.suppliers.tableCaption')}
          emptyTitle={
            isFiltered
              ? t('masterData.suppliers.emptyFilteredTitle')
              : t('masterData.suppliers.emptyTitle')
          }
          emptyDescription={
            isFiltered
              ? t('masterData.suppliers.emptyFilteredDesc')
              : t('masterData.suppliers.emptyDesc')
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
                {t('masterData.suppliers.createBtn')}
              </Button>
            ) : undefined
          }
        />
      </Card>

      <SupplierFormModal
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
        titlePrefix={t('masterData.suppliers.detailPrefix')}
        code={selectedItem?.code}
        name={selectedItem?.name}
        status={selectedItem?.status}
        description={selectedItem?.notes}
        fields={
          selectedItem
            ? [
                { label: t('masterData.suppliers.detailContact'), value: selectedItem.contactPerson },
                { label: t('masterData.suppliers.detailPhone'), value: selectedItem.phone },
                { label: t('masterData.suppliers.detailEmail'), value: selectedItem.email },
                {
                  label: t('masterData.suppliers.detailTerms'),
                  value: translateDomainLabel(language, 'paymentTerms', selectedItem.paymentTerms),
                },
                {
                  label: t('masterData.suppliers.detailFocus'),
                  value: translateDomainLabel(language, 'categories', selectedItem.categoryFocus),
                },
                { label: t('masterData.suppliers.detailAddress'), value: selectedItem.address },
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
        entityLabel={t('masterData.suppliers.entity')}
        itemCode={selectedItem?.code}
        itemName={selectedItem?.name}
        references={selectedRefs}
      />
    </div>
  );
};
