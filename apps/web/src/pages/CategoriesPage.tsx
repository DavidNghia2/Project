import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n';
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
        showToast(`Đã tạo mới danh mục ${data.name} (${data.code.toUpperCase()}).`);
      }
      return res;
    }
    if (selectedItem) {
      const res = updateItem(selectedItem.id, data);
      if (res.success) {
        showToast(`Đã cập nhật danh mục ${data.code.toUpperCase()}.`);
      }
      return res;
    }
    return { success: false };
  };

  const handleConfirmDelete = (forceConfirm: boolean) => {
    if (!selectedItem) return;
    const res = deleteItem(selectedItem.id, forceConfirm);
    if (res.success) {
      showToast(`Đã xóa danh mục ${selectedItem.name} (${selectedItem.code}).`);
      setDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: 'code',
      label: 'Mã danh mục',
      render: (_val, row) => (
        <span className="font-mono text-xs font-bold text-[#2563EB]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên danh mục',
      render: (_val, row) => (
        <button
          type="button"
          onClick={() => handleOpenDetail(row)}
          className="font-semibold text-[#0F172A] hover:text-[#2563EB] text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
        >
          {row.name}
        </button>
      ),
    },
    {
      key: 'parentGroup',
      label: 'Nhóm ngành chính',
      render: (_val, row) => (
        <span className="text-xs text-[#334155] font-medium">{row.parentGroup}</span>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (_val, row) => (
        <span className="text-xs text-[#475569] line-clamp-1 max-w-md block">
          {row.description || '—'}
        </span>
      ),
    },
    {
      key: 'productsCount',
      label: 'Sản phẩm',
      align: 'center',
      render: (_val, row) => (
        <span className="font-mono text-xs font-medium text-[#0F172A] tabular-nums">
          {getItemReferences(row).length} SKU
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      align: 'center',
      render: (_val, row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
          {row.status === 'active' ? t('status.active') : t('status.inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
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
              {language === 'vi' ? 'Thêm danh mục' : 'Add Category'}
            </Button>
          ) : undefined
        }
      />

      {!canManageCatalog && <RoleScopeNotice role={activeRole} context="catalog" />}

      {toastMessage && (
        <Alert
          variant="success"
          title="Thao tác thành công"
          message={toastMessage}
          dismissible
          onDismiss={() => setToastMessage(null)}
        />
      )}

      <Card padding="md" className="space-y-4">
        <MasterDataToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm theo mã danh mục, tên ngành hàng hoặc mô tả..."
          searchInputId="cat-search-input"
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          secondaryFilter={secondaryFilter}
          onSecondaryFilterChange={setSecondaryFilter}
          secondaryLabel="Nhóm ngành chính"
          secondaryOptions={[
            { value: 'ALL', label: 'Tất cả nhóm ngành' },
            ...CATEGORY_PARENT_GROUPS.map((g) => ({ value: g, label: g })),
          ]}
          isFiltered={isFiltered}
          onReset={resetFilters}
          totalFiltered={filteredItems.length}
          totalItems={items.length}
          itemUnitLabel="danh mục"
        />

        <Table
          columns={columns}
          data={filteredItems}
          caption="Danh sách phân loại sản phẩm"
          emptyTitle={isFiltered ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào'}
          emptyDescription={
            isFiltered
              ? 'Không có danh mục nào khớp với điều kiện tìm kiếm hiện tại.'
              : 'Tạo danh mục đầu tiên để phân nhóm hàng hóa trong kho.'
          }
          emptyAction={
            isFiltered ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={resetFilters}
                iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Xóa bộ lọc
              </Button>
            ) : canManageCatalog ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreate}
                iconLeft={<Plus className="w-3.5 h-3.5" />}
              >
                Thêm danh mục
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
        titlePrefix="Chi tiết danh mục"
        code={selectedItem?.code}
        name={selectedItem?.name}
        status={selectedItem?.status}
        description={selectedItem?.description}
        fields={
          selectedItem
            ? [
                { label: 'Mã danh mục', value: selectedItem.code },
                { label: 'Nhóm ngành chính', value: selectedItem.parentGroup },
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
        entityLabel="danh mục"
        itemCode={selectedItem?.code}
        itemName={selectedItem?.name}
        references={selectedRefs}
      />
    </div>
  );
};
