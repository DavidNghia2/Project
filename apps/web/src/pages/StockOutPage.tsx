import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit3,
  Eye,
  FilePlus2,
  PackageMinus,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Alert, Button, Card, Modal, Table, type Column } from '../design-system';
import { useTranslation } from '../i18n';
import { translateDomainLabel } from '../i18n/domainTranslate';
import {
  OrderFiltersBar,
  OrderStatusBadge,
  STOCK_OUT_REASONS,
  StockOrderDetailModal,
  StockOutFormModal,
  formatCurrencyVND,
  useStockOutOrders,
  type OrderStatus,
  type StockOutFormData,
  type StockOutOrder,
} from '../features/stock-operations';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const StockOutPage: React.FC = () => {
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
  } = useStockOutOrders(language);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockOutOrder | null>(null);
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

  const getReasonLabel = (reasonCode: string) => {
    const found = STOCK_OUT_REASONS.find((r) => r.value === reasonCode);
    if (!found) return reasonCode;
    return t(`stockOps.reasons.${found.value}`);
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingOrderId(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (order: StockOutOrder) => {
    setFormMode('edit');
    setEditingOrderId(order.id);
    setDetailOrderId(null);
    setFormOpen(true);
  };

  const handleSaveForm = (formData: StockOutFormData, targetStatus: 'DRAFT' | 'SUBMITTED') => {
    if (formMode === 'edit' && editingOrderId) {
      const res = updateOrder(editingOrderId, formData, targetStatus);
      if (res.ok) {
        notify(
          'success',
          targetStatus === 'SUBMITTED'
            ? t('stockOps.outPage.toasts.updatedSubmitted', { code: res.order.code })
            : t('stockOps.outPage.toasts.savedDraft', { code: res.order.code })
        );
      }
      return res;
    }

    const res = createOrder(formData, targetStatus);
    if (res.ok) {
      notify(
        'success',
        targetStatus === 'SUBMITTED'
          ? t('stockOps.outPage.toasts.createdSubmitted', { code: res.order.code })
          : t('stockOps.outPage.toasts.createdDraft', { code: res.order.code })
      );
    }
    return res;
  };

  const handleTransition = (orderId: string, nextStatus: OrderStatus, note = '') => {
    const res = transitionOrder(orderId, nextStatus, note);
    if (res.ok) {
      notify(
        'success',
        t('stockOps.shared.transitionedToast', {
          code: res.order.code,
          status: t(`status.${nextStatus.toLowerCase()}`),
        })
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
        t('stockOps.shared.deletedDraftToast', { code: deleteTarget.code })
      );
      setDeleteTarget(null);
    } else {
      notify('error', res.error);
    }
  };

  const columns: Column<StockOutOrder>[] = [
    {
      key: 'code',
      label: t('stockOps.shared.colCode'),
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
      label: t('stockOps.outPage.colWarehouse'),
      render: (_, record) => {
        const localizedWarehouse = translateDomainLabel(
          language,
          'warehouseNames',
          record.warehouseCode,
          record.warehouseName
        );
        return (
          <div className="min-w-0">
            <span className="font-mono text-xs font-semibold text-[#0F172A]">
              {record.warehouseCode}
            </span>
            <p
              title={localizedWarehouse}
              className="text-xs text-[#64748B] truncate max-w-[115px]"
            >
              {localizedWarehouse}
            </p>
          </div>
        );
      },
    },
    {
      key: 'destination',
      label: t('stockOps.outPage.colDestReason'),
      render: (_, record) => (
        <div className="min-w-0">
          <span
            title={record.destination}
            className="text-xs font-medium text-[#0F172A] block truncate max-w-[140px]"
          >
            {record.destination}
          </span>
          <span className="text-[11px] text-[#64748B] block truncate max-w-[140px]">
            {getReasonLabel(record.reason)}
          </span>
        </div>
      ),
    },
    {
      key: 'totalQty',
      label: t('stockOps.shared.colQtyLines'),
      align: 'right',
      render: (_, record) => (
        <div className="font-mono tabular-nums text-right">
          <span className="font-semibold text-[#0F172A]">{record.totalQty}</span>
          <span className="block text-[11px] text-[#64748B] whitespace-nowrap">
            {record.items.length} {t('stockOps.shared.linesUnit')}
          </span>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: t('stockOps.outPage.colDispatchValue'),
      align: 'right',
      render: (_, record) => (
        <span className="font-mono font-semibold tabular-nums text-[#0F172A] whitespace-nowrap">
          {formatCurrencyVND(record.totalAmount)}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: t('stockOps.shared.colCreatedBy'),
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
      label: t('stockOps.shared.colStatus'),
      render: (_, record) => <OrderStatusBadge status={record.status} />,
    },
    {
      key: 'actions',
      label: t('stockOps.shared.colActions'),
      align: 'right',
      render: (_, record) => (
        <div className="inline-flex items-center justify-end gap-1">
          <button
            type="button"
            data-testid={`btn-view-${record.code}`}
            onClick={() => setDetailOrderId(record.id)}
            title={t('stockOps.shared.viewTooltip')}
            aria-label={t('stockOps.shared.viewAria', { code: record.code })}
            className="p-1.5 rounded-md text-[#475569] hover:text-[#0284C7] hover:bg-[#F0F9FF] transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          {record.status === 'DRAFT' && canCreate && (
            <>
              <button
                type="button"
                onClick={() => handleOpenEdit(record)}
                title={t('stockOps.shared.editTooltip')}
                aria-label={t('stockOps.shared.editAria', { code: record.code })}
                className="p-1.5 rounded-md text-[#475569] hover:text-[#0284C7] hover:bg-[#F0F9FF] transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(record)}
                title={t('stockOps.shared.deleteTooltip')}
                aria-label={t('stockOps.shared.deleteAria', { code: record.code })}
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
        title={t('nav.stockOut')}
        description={t('stockOps.outPage.subtitle')}
        actions={
          canCreate ? (
            <Button
              id="btn-create-stock-out"
              variant="primary"
              iconLeft={<FilePlus2 className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              {t('stockOps.outPage.createButton')}
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
                {t('stockOps.outPage.kpiTotal')}
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
                {t('stockOps.shared.pendingApproval')}
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
                {t('stockOps.shared.completed')}
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
                {t('stockOps.outPage.kpiTotalValue')}
              </p>
              <p className="text-lg font-bold font-mono tabular-nums text-[#0F172A] mt-1 truncate">
                {formatCurrencyVND(totalValue)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] text-[#475569]">
              <PackageMinus className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Orders Table */}
      <Card
        title={t('stockOps.outPage.cardTitle')}
        description={t('stockOps.outPage.cardDescription', {
          shown: filteredOrders.length,
          total: orders.length,
        })}
      >
        <div className="space-y-4">
          <OrderFiltersBar
            filters={filters}
            currentActor={currentActor}
            searchPlaceholder={t('stockOps.outPage.searchPlaceholder')}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onWarehouseChange={setWarehouseCode}
            onActorChange={setCurrentActor}
            onReset={resetFilters}
          />

          <Table
            columns={columns}
            data={filteredOrders}
            caption={t('stockOps.outPage.cardTitle')}
            emptyTitle={t('stockOps.outPage.emptyTitle')}
            emptyDescription={t('stockOps.outPage.emptyDescription')}
            emptyAction={
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                {t('stockOps.shared.resetFilters')}
              </Button>
            }
          />
        </div>
      </Card>

      <StockOutFormModal
        open={formOpen}
        mode={formMode}
        initialOrder={editingOrder}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveForm}
      />

      <StockOrderDetailModal
        open={Boolean(detailOrder)}
        direction="out"
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
        title={t('stockOps.shared.deleteModalTitle')}
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4 text-sm text-[#334155]">
            <p>
              {t('stockOps.shared.deleteModalBody', { code: deleteTarget.code })}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
                {t('stockOps.shared.cancel')}
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
                {t('stockOps.shared.confirmDelete')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
