import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n';
import { translateDomainLabel } from '../i18n/domainTranslate';
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Badge, Table, Alert, type Column } from '../design-system';
import {
  useCategories,
  CATEGORY_PARENT_GROUPS,
  MasterDataToolbar,
  MasterDataDetailModal,
  MasterDataDeleteModal,
  MasterDataRowActions,
  CategoryFormModal,
  type Category,
  type CategoryFormData,
} from '../features/master-data';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const CategoriesPage: React.FC = () => {
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
  } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Category | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => setToastMessage(msg);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedItem(cat);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleOpenDetail = (cat: Category) => {
    setSelectedItem(cat);
    setDetailOpen(true);
  };

  const handleOpenDelete = (cat: Category) => {
    setSelectedItem(cat);
    setDeleteOpen(true);
  };

  const handleFormSubmit = (data: CategoryFormData) => {
    if (formMode === 'create') {
      const res = addItem(data);
      if (res.success) {
        showToast(
          t('masterData.categories.toastCreated', {
            name: translateDomainLabel(language, 'categories', data.name),
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
          t('masterData.categories.toastUpdated', { code: data.code.toUpperCase() })
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
        t('masterData.categories.toastDeleted', {
          name: translateDomainLabel(language, 'categories', selectedItem.name),
          code: selectedItem.code,
        })
      );
      setDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: 'code',
      label: t('masterData.categories.colCode'),
      render: (_val, row) => (
        <span className="font-mono text-xs font-bold text-[#2563EB]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: t('masterData.categories.colName'),
      render: (_val, row) => (
        <button
          type="button"
          onClick={() => handleOpenDetail(row)}
          className="font-semibold text-[#0F172A] hover:text-[#2563EB] text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
        >
          {translateDomainLabel(language, 'categories', row.name)}
        </button>
      ),
    },
    {
      key: 'parentGroup',
      label: t('masterData.categories.colParentGroup'),
      render: (_val, row) => (
        <span className="text-xs text-[#334155] font-medium">
          {translateDomainLabel(language, 'parentGroups', row.parentGroup)}
        </span>
      ),
    },
    {
      key: 'description',
      label: t('masterData.categories.colDescription'),
      render: (_val, row) => (
        <span className="text-xs text-[#475569] line-clamp-1 max-w-md block">
          {row.description || '—'}
        </span>
      ),
    },
    {
      key: 'productsCount',
      label: t('masterData.categories.colProducts'),
      align: 'center',
      render: (_val, row) => (
        <span className="font-mono text-xs font-medium text-[#0F172A] tabular-nums">
          {getItemReferences(row).length} SKU
        </span>
      ),
    },
    {
      key: 'status',
      label: t('masterData.categories.colStatus'),
      align: 'center',
      render: (_val, row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
          {row.status === 'active' ? t('status.active') : t('status.inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('masterData.categories.colActions'),
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
    ? translateDomainLabel(language, 'categories', selectedItem.name)
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.categoriesTitle')}
        description={t('pages.categoriesDesc')}
        actions={
          canManageCatalog ? (
            <Button
              id="btn-add-category"
              variant="primary"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              {t('masterData.categories.createBtn')}
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
          searchPlaceholder={t('masterData.categories.searchPlaceholder')}
          searchInputId="cat-search-input"
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          secondaryFilter={secondaryFilter}
          onSecondaryFilterChange={setSecondaryFilter}
          secondaryLabel={t('masterData.categories.filterGroupLabel')}
          secondaryOptions={[
            { value: 'ALL', label: t('masterData.categories.allGroups') },
            ...CATEGORY_PARENT_GROUPS.map((g) => ({
              value: g,
              label: translateDomainLabel(language, 'parentGroups', g),
            })),
          ]}
          isFiltered={isFiltered}
          onReset={resetFilters}
          totalFiltered={filteredItems.length}
          totalItems={items.length}
          itemUnitLabel={t('masterData.categories.unitLabel')}
        />

        <Table
          columns={columns}
          data={filteredItems}
          caption={t('masterData.categories.tableCaption')}
          emptyTitle={
            isFiltered
              ? t('masterData.categories.emptyFilteredTitle')
              : t('masterData.categories.emptyTitle')
          }
          emptyDescription={
            isFiltered
              ? t('masterData.categories.emptyFilteredDesc')
              : t('masterData.categories.emptyDesc')
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
                {t('masterData.categories.createBtn')}
              </Button>
            ) : undefined
          }
        />
      </Card>

      <CategoryFormModal
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
        titlePrefix={t('masterData.categories.detailPrefix')}
        code={selectedItem?.code}
        name={selectedDisplayName}
        status={selectedItem?.status}
        description={selectedItem?.description}
        fields={
          selectedItem
            ? [
                { label: t('masterData.categories.detailCode'), value: selectedItem.code },
                {
                  label: t('masterData.categories.detailParentGroup'),
                  value: translateDomainLabel(language, 'parentGroups', selectedItem.parentGroup),
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
        entityLabel={t('masterData.categories.entity')}
        itemCode={selectedItem?.code}
        itemName={selectedDisplayName}
        references={selectedRefs}
      />
    </div>
  );
};
