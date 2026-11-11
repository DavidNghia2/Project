import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n';
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

const TYPE_LABELS: Record<WarehouseEntity['type'], string> = {
  main: 'Kho trung tâm',
  regional: 'Kho vùng',
  transit: 'Kho trung chuyển',
  reserve: 'Kho dự phòng',
};

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
        showToast(`Đã thêm kho hàng mới: ${data.name} (${data.code.toUpperCase()}).`);
      }
      return res;
    }
    if (selectedItem) {
      const res = updateItem(selectedItem.id, data);
      if (res.success) {
        showToast(`Đã cập nhật thông tin kho hàng ${data.code.toUpperCase()}.`);
      }
      return res;
    }
    return { success: false };
  };

  const handleConfirmDelete = (forceConfirm: boolean) => {
    if (!selectedItem) return;
    const res = deleteItem(selectedItem.id, forceConfirm);
    if (res.success) {
      showToast(`Đã xóa kho hàng ${selectedItem.name} (${selectedItem.code}).`);
      setDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const columns: Column<WarehouseEntity>[] = [
    {
      key: 'code',
      label: 'Mã kho',
      render: (_val, row) => (
        <span className="font-mono text-xs font-bold text-[#2563EB]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên kho & Địa điểm',
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
      key: 'region',
      label: 'Khu vực / Loại',
      render: (_val, row) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-medium text-[#0F172A] block">{row.region}</span>
          <span className="text-[#475569] block">{TYPE_LABELS[row.type]}</span>
        </div>
      ),
    },
    {
      key: 'manager',
      label: 'Phụ trách',
      render: (_val, row) => (
        <div className="text-xs">
          <span className="font-medium text-[#0F172A] block">{row.manager}</span>
          <span className="text-[#475569]">{row.staffCount} nhân sự</span>
        </div>
      ),
    },
    {
      key: 'capacityPercent',
      label: 'Sức chứa',
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
      label: 'SP đang lưu',
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
          canMutate={canManageWarehouses}
        />
      ),
    },
  ];

  const selectedRefs = selectedItem ? getItemReferences(selectedItem) : [];

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
              {language === 'vi' ? 'Thiết lập kho mới' : 'Create Warehouse'}
            </Button>
          ) : undefined
        }
      />

      {!canManageWarehouses && <RoleScopeNotice role={activeRole} context="catalog" />}

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
          searchPlaceholder="Tìm theo mã kho, tên kho, quản lý hoặc địa chỉ..."
          searchInputId="wh-search-input"
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          secondaryFilter={secondaryFilter}
          onSecondaryFilterChange={setSecondaryFilter}
          secondaryLabel="Khu vực"
          secondaryOptions={[
            { value: 'ALL', label: 'Tất cả khu vực' },
            ...WAREHOUSE_REGIONS.map((r) => ({ value: r, label: r })),
          ]}
          isFiltered={isFiltered}
          onReset={resetFilters}
          totalFiltered={filteredItems.length}
          totalItems={items.length}
          itemUnitLabel="kho hàng"
        />

        <Table
          columns={columns}
          data={filteredItems}
          caption="Danh sách kho hàng và địa điểm lưu trữ"
          emptyTitle={isFiltered ? 'Không tìm thấy kho hàng phù hợp' : 'Chưa có kho hàng nào'}
          emptyDescription={
            isFiltered
              ? 'Không có kho hàng nào khớp với từ khóa hoặc bộ lọc hiện tại. Hãy thử xóa bộ lọc.'
              : 'Thiết lập kho vật lý đầu tiên để phân bổ tồn kho và theo dõi sức chứa.'
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
            ) : canManageWarehouses ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreate}
                iconLeft={<Plus className="w-3.5 h-3.5" />}
              >
                Thiết lập kho mới
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
        titlePrefix="Chi tiết kho hàng"
        code={selectedItem?.code}
        name={selectedItem?.name}
        status={selectedItem?.status}
        description={selectedItem?.description}
        fields={
          selectedItem
            ? [
                { label: 'Khu vực địa lý', value: selectedItem.region },
                { label: 'Loại hình kho', value: TYPE_LABELS[selectedItem.type] },
                { label: 'Quản lý phụ trách', value: selectedItem.manager },
                { label: 'Quy mô nhân sự', value: `${selectedItem.staffCount} nhân viên` },
                { label: 'Tỷ lệ lấp đầy hiện tại', value: `${selectedItem.capacityPercent}%` },
                { label: 'Địa điểm / Khu công nghiệp', value: selectedItem.address, fullWidth: true },
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
        entityLabel="kho hàng"
        itemCode={selectedItem?.code}
        itemName={selectedItem?.name}
        references={selectedRefs}
      />
    </div>
  );
};
