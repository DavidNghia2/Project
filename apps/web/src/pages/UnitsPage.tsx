import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n';
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

const MEASURE_TYPE_LABELS: Record<UnitOfMeasure['measureType'], string> = {
  discrete: 'Đếm rời',
  packaging: 'Đóng gói',
  length: 'Chiều dài / Cuộn',
  weight: 'Khối lượng',
};

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
        showToast(`Đã tạo đơn vị tính mới: ${data.name} (${data.code.toUpperCase()}).`);
      }
      return res;
    }
    if (selectedItem) {
      const res = updateItem(selectedItem.id, data);
      if (res.success) {
        showToast(`Đã cập nhật đơn vị tính ${data.code.toUpperCase()}.`);
      }
      return res;
    }
    return { success: false };
  };

  const handleConfirmDelete = (forceConfirm: boolean) => {
    if (!selectedItem) return;
    const res = deleteItem(selectedItem.id, forceConfirm);
    if (res.success) {
      showToast(`Đã xóa đơn vị tính ${selectedItem.name} (${selectedItem.code}).`);
      setDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const columns: Column<UnitOfMeasure>[] = [
    {
      key: 'code',
      label: 'Mã đơn vị',
      render: (_val, row) => (
        <span className="font-mono text-xs font-bold text-[#2563EB]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên đơn vị tính',
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
      key: 'symbol',
      label: 'Ký hiệu',
      align: 'center',
      render: (_val, row) => (
        <span className="inline-block px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] font-mono text-xs font-semibold text-[#0F172A]">
          {row.symbol}
        </span>
      ),
    },
    {
      key: 'measureType',
      label: 'Nhóm đo lường',
      render: (_val, row) => (
        <span className="text-xs font-medium text-[#334155]">
          {MEASURE_TYPE_LABELS[row.measureType]}
        </span>
      ),
    },
    {
      key: 'conversionNote',
      label: 'Quy ước quy đổi',
      render: (_val, row) => (
        <span className="text-xs text-[#475569] line-clamp-1 max-w-sm block">
          {row.conversionNote || '—'}
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
              {language === 'vi' ? 'Thêm đơn vị tính' : 'Add Unit'}
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
          searchPlaceholder="Tìm theo mã đơn vị, tên gọi, ký hiệu hoặc mô tả..."
          searchInputId="uom-search-input"
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          secondaryFilter={secondaryFilter}
          onSecondaryFilterChange={setSecondaryFilter}
          secondaryLabel="Nhóm đo lường"
          secondaryOptions={[
            { value: 'ALL', label: 'Tất cả nhóm đo' },
            { value: 'discrete', label: 'Đếm rời' },
            { value: 'packaging', label: 'Đóng gói' },
            { value: 'length', label: 'Chiều dài / Cuộn' },
            { value: 'weight', label: 'Khối lượng' },
          ]}
          isFiltered={isFiltered}
          onReset={resetFilters}
          totalFiltered={filteredItems.length}
          totalItems={items.length}
          itemUnitLabel="đơn vị tính"
        />

        <Table
          columns={columns}
          data={filteredItems}
          caption="Danh mục đơn vị tính chuẩn"
          emptyTitle={isFiltered ? 'Không tìm thấy đơn vị tính phù hợp' : 'Chưa có đơn vị tính nào'}
          emptyDescription={
            isFiltered
              ? 'Không có đơn vị tính nào khớp với từ khóa hoặc bộ lọc hiện tại.'
              : 'Khai báo đơn vị tính để thống nhất kiểm đếm hàng hóa nhập xuất.'
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
                Thêm đơn vị tính
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
        titlePrefix="Chi tiết đơn vị tính"
        code={selectedItem?.code}
        name={selectedItem?.name}
        status={selectedItem?.status}
        description={selectedItem?.description}
        fields={
          selectedItem
            ? [
                { label: 'Ký hiệu hiển thị', value: selectedItem.symbol },
                { label: 'Nhóm đo lường', value: MEASURE_TYPE_LABELS[selectedItem.measureType] },
                { label: 'Quy ước quy đổi chuẩn', value: selectedItem.conversionNote, fullWidth: true },
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
        entityLabel="đơn vị tính"
        itemCode={selectedItem?.code}
        itemName={selectedItem?.name}
        references={selectedRefs}
      />
    </div>
  );
};
