import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit3,
  Eye,
  FilePlus2,
  PackagePlus,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Alert, Button, Card, Modal, Table, type Column } from '../design-system';
import { useTranslation } from '../i18n';
import {
  OrderFiltersBar,
  OrderStatusBadge,
  StockInFormModal,
  StockOrderDetailModal,
  formatCurrencyVND,
  useStockInOrders,
  type OrderStatus,
  type StockInFormData,
  type StockInOrder,
} from '../features/stock-operations';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const StockInPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const canCreate = capabilities.canCreateStockOrder;
  const canApprove = capabilities.canApproveStockOrder;
  const {
    orders,
    filteredOrders,
    filters,
    currentActor,
    setSearch,
    setStatus,
    setWarehouseCode,
    setCurrentActor,
    resetFilters,
    createOrder,
    updateOrder,
    deleteDraft,
    transitionOrder,
  } = useStockInOrders(language);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockInOrder | null>(null);
  const [toast, setToast] = useState<{ variant: 'success' | 'error'; message: string } | null>(
    null
  );

  const editingOrder = orders.find((o) => o.id === editingOrderId) ?? null;
  const detailOrder = orders.find((o) => o.id === detailOrderId) ?? null;

  const notify = (variant: 'success' | 'error', message: string) => {
    setToast({ variant, message });
  };

  const submittedCount = orders.filter((o) => o.status === 'SUBMITTED').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingOrderId(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (order: StockInOrder) => {
    setFormMode('edit');
    setEditingOrderId(order.id);
    setDetailOrderId(null);
    setFormOpen(true);
  };

  const handleSaveForm = (formData: StockInFormData, targetStatus: 'DRAFT' | 'SUBMITTED') => {
    if (formMode === 'edit' && editingOrderId) {
      const res = updateOrder(editingOrderId, formData, targetStatus);
      if (res.ok) {
        notify(
          'success',
          targetStatus === 'SUBMITTED'
            ? language === 'vi'
              ? `Đã cập nhật và gửi duyệt phiếu nhập ${res.order.code}.`
              : `Updated and submitted receipt ${res.order.code}.`
            : language === 'vi'
              ? `Đã lưu bản nháp phiếu nhập ${res.order.code}.`
              : `Saved draft receipt ${res.order.code}.`
        );
      }
      return res;
    }

    const res = createOrder(formData, targetStatus);
    if (res.ok) {
      notify(
        'success',
        targetStatus === 'SUBMITTED'
          ? language === 'vi'
            ? `Đã tạo và gửi duyệt phiếu nhập ${res.order.code}.`
            : `Created and submitted receipt ${res.order.code}.`
          : language === 'vi'
            ? `Đã lưu nháp phiếu nhập ${res.order.code}.`
            : `Saved draft receipt ${res.order.code}.`
      );
    }
    return res;
  };

  const handleTransition = (orderId: string, nextStatus: OrderStatus, note = '') => {
    const res = transitionOrder(orderId, nextStatus, note);
    if (res.ok) {
      notify(
        'success',
        language === 'vi'
          ? `Phiếu ${res.order.code} đã chuyển sang trạng thái ${nextStatus}.`
          : `Voucher ${res.order.code} transitioned to ${nextStatus}.`
      );
    }
    return res;
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const res = deleteDraft(deleteTarget.id);
    if (res.ok) {
      notify(
        'success',
        language === 'vi'
          ? `Đã xóa phiếu nháp ${deleteTarget.code}.`
          : `Deleted draft voucher ${deleteTarget.code}.`
      );
      setDeleteTarget(null);
    } else {
      notify('error', res.error);
    }
  };

  const columns: Column<StockInOrder>[] = [
    {
      key: 'code',
      label: language === 'vi' ? 'Mã phiếu' : 'Voucher Code',
      render: (_, record) => (
        <button
          type="button"
          onClick={() => setDetailOrderId(record.id)}
          className="font-mono font-semibold text-[#0284C7] hover:underline text-left cursor-pointer whitespace-nowrap"
        >
          {record.code}
        </button>
      ),
    },
    {
      key: 'warehouseName',
      label: language === 'vi' ? 'Kho nhận' : 'Warehouse',
      render: (_, record) => (
        <div className="min-w-0">
          <span className="font-mono text-xs font-semibold text-[#0F172A]">
            {record.warehouseCode}
          </span>
          <p
            title={record.warehouseName}
            className="text-xs text-[#64748B] truncate max-w-[115px]"
          >
            {record.warehouseName}
          </p>
        </div>
      ),
    },
    {
      key: 'supplierName',
      label: language === 'vi' ? 'Nhà cung cấp' : 'Supplier',
      render: (_, record) => (
        <div className="min-w-0">
          <span
            title={record.supplierName}
            className="text-xs font-medium text-[#0F172A] block truncate max-w-[135px]"
          >
            {record.supplierName}
          </span>
          <span className="text-[11px] font-mono text-[#64748B]">{record.supplierCode}</span>
        </div>
      ),
    },
    {
      key: 'totalQty',
      label: language === 'vi' ? 'SL / Dòng hàng' : 'Qty / Lines',
      align: 'right',
      render: (_, record) => (
        <div className="font-mono tabular-nums text-right">
          <span className="font-semibold text-[#0F172A]">{record.totalQty}</span>
          <span className="block text-[11px] text-[#64748B] whitespace-nowrap">
            {record.items.length} {language === 'vi' ? 'dòng' : 'lines'}
          </span>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: language === 'vi' ? 'Tổng giá trị' : 'Total Value',
      align: 'right',
      render: (_, record) => (
        <span className="font-mono font-semibold tabular-nums text-[#0F172A] whitespace-nowrap">
          {formatCurrencyVND(record.totalAmount)}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: language === 'vi' ? 'Người lập' : 'Created By',
      render: (_, record) => (
        <span
          title={record.createdBy}
          className="text-xs text-[#475569] block truncate max-w-[120px]"
        >
          {record.createdBy}
        </span>
      ),
    },
    {
      key: 'status',
      label: language === 'vi' ? 'Trạng thái' : 'Status',
      render: (_, record) => <OrderStatusBadge status={record.status} />,
    },
    {
      key: 'actions',
      label: language === 'vi' ? 'Thao tác' : 'Actions',
      align: 'right',
      render: (_, record) => (
        <div className="inline-flex items-center justify-end gap-1">
          <button
            type="button"
            data-testid={`btn-view-${record.code}`}
            onClick={() => setDetailOrderId(record.id)}
            title={language === 'vi' ? 'Xem chi tiết & lịch sử' : 'View details & timeline'}
            aria-label={`${language === 'vi' ? 'Xem chi tiết' : 'View details'} ${record.code}`}
            className="p-1.5 rounded-md text-[#475569] hover:text-[#0284C7] hover:bg-[#F0F9FF] transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          {record.status === 'DRAFT' && canCreate && (
            <>
              <button
                type="button"
                onClick={() => handleOpenEdit(record)}
                title={language === 'vi' ? 'Chỉnh sửa nháp' : 'Edit draft'}
                aria-label={`${language === 'vi' ? 'Chỉnh sửa' : 'Edit'} ${record.code}`}
                className="p-1.5 rounded-md text-[#475569] hover:text-[#0284C7] hover:bg-[#F0F9FF] transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(record)}
                title={language === 'vi' ? 'Xóa bản nháp' : 'Delete draft'}
                aria-label={`${language === 'vi' ? 'Xóa' : 'Delete'} ${record.code}`}
                className="p-1.5 rounded-md text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.stockIn')}
        description={
          language === 'vi'
            ? 'Quản lý phiếu nhập kho nhiều sản phẩm, kiểm soát chứng từ từ lưu nháp đến hoàn tất theo luồng phê duyệt hai cấp.'
            : 'Manage multi-line inbound stock receipts with draft saving, total valuation, and Maker-Checker approval workflow.'
        }
        actions={
          canCreate ? (
            <Button
              id="btn-create-stock-in"
              variant="primary"
              iconLeft={<FilePlus2 className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              {language === 'vi' ? 'Tạo phiếu nhập kho' : 'Create Stock-In Voucher'}
            </Button>
          ) : undefined
        }
      />

      {!canCreate && <RoleScopeNotice role={activeRole} context="restricted" />}

      {toast && (
        <Alert
          variant={toast.variant}
          message={toast.message}
          dismissible
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B]">
                {language === 'vi' ? 'Tổng phiếu nhập' : 'Total Receipts'}
              </p>
              <p className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-1">
                {orders.length}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F0F9FF] text-[#0284C7]">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B]">
                {language === 'vi' ? 'Đang chờ duyệt' : 'Pending Approval'}
              </p>
              <p className="text-2xl font-bold font-mono tabular-nums text-[#D97706] mt-1">
                {submittedCount}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FFFBEB] text-[#D97706]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B]">
                {language === 'vi' ? 'Đã hoàn tất nhập' : 'Completed'}
              </p>
              <p className="text-2xl font-bold font-mono tabular-nums text-[#16A34A] mt-1">
                {completedCount}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#ECFDF5] text-[#16A34A]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#64748B]">
                {language === 'vi' ? 'Tổng giá trị chứng từ' : 'Total Receipt Value'}
              </p>
              <p className="text-lg font-bold font-mono tabular-nums text-[#0F172A] mt-1 truncate">
                {formatCurrencyVND(totalValue)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] text-[#475569]">
              <PackagePlus className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Orders Table */}
      <Card
        title={language === 'vi' ? 'Danh sách phiếu nhập kho' : 'Inbound Stock Receipts'}
        description={
          language === 'vi'
            ? `Hiển thị ${filteredOrders.length} / ${orders.length} phiếu nhập (chế độ Prototype)`
            : `Showing ${filteredOrders.length} of ${orders.length} inbound receipts (Prototype mode)`
        }
      >
        <div className="space-y-4">
          <OrderFiltersBar
            filters={filters}
            currentActor={currentActor}
            searchPlaceholder={
              language === 'vi'
                ? 'Tìm theo mã phiếu, nhà cung cấp, SKU...'
                : 'Search voucher code, supplier, SKU...'
            }
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onWarehouseChange={setWarehouseCode}
            onActorChange={setCurrentActor}
            onReset={resetFilters}
          />

          <Table
            columns={columns}
            data={filteredOrders}
            caption={language === 'vi' ? 'Danh sách phiếu nhập kho' : 'Inbound Stock Receipts'}
            emptyTitle={
              language === 'vi' ? 'Không tìm thấy phiếu nhập phù hợp' : 'No matching receipts found'
            }
            emptyDescription={
              language === 'vi'
                ? 'Hãy thử điều chỉnh bộ lọc hoặc tạo mới một phiếu nhập kho.'
                : 'Adjust active filters or create a new stock-in receipt voucher.'
            }
            emptyAction={
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                {language === 'vi' ? 'Đặt lại bộ lọc' : 'Reset Filters'}
              </Button>
            }
          />
        </div>
      </Card>

      <StockInFormModal
        open={formOpen}
        mode={formMode}
        initialOrder={editingOrder}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveForm}
      />

      <StockOrderDetailModal
        open={Boolean(detailOrder)}
        direction="in"
        order={detailOrder}
        currentActor={currentActor}
        onActorChange={setCurrentActor}
        onClose={() => setDetailOrderId(null)}
        onEditDraft={detailOrder && canCreate ? () => handleOpenEdit(detailOrder) : undefined}
        onTransition={handleTransition}
        canCreate={canCreate}
        canApprove={canApprove}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={language === 'vi' ? 'Xác nhận xóa phiếu nháp' : 'Confirm Delete Draft'}
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4 text-sm text-[#334155]">
            <p>
              {language === 'vi'
                ? `Bạn có chắc chắn muốn xóa phiếu nháp ${deleteTarget.code}? Thao tác này không thể hoàn tác.`
                : `Are you sure you want to delete draft voucher ${deleteTarget.code}?`}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
                {language === 'vi' ? 'Xác nhận xóa' : 'Delete Draft'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
