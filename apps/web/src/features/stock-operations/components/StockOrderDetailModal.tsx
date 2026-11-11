import React, { useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  PackageCheck,
  RotateCcw,
  Send,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { Alert, Button, Input, Modal, Select } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { SIMULATED_ACTORS, STOCK_OUT_REASONS } from '../mockData';
import type { OrderStatus, StockInOrder, StockOutOrder } from '../types';
import { canApproveOrReject, formatCurrencyVND } from '../workflow';
import { OrderHistoryTimeline } from './OrderHistoryTimeline';
import { OrderStatusBadge } from './OrderStatusBadge';

export interface StockOrderDetailModalProps {
  open: boolean;
  direction: 'in' | 'out';
  order: StockInOrder | StockOutOrder | null;
  currentActor: string;
  onActorChange: (actor: string) => void;
  onClose: () => void;
  onEditDraft?: () => void;
  onTransition: (
    orderId: string,
    nextStatus: OrderStatus,
    note?: string
  ) => { ok: boolean; error?: string };
  canCreate?: boolean;
  canApprove?: boolean;
}

interface DetailContentProps {
  direction: 'in' | 'out';
  order: StockInOrder | StockOutOrder;
  currentActor: string;
  onActorChange: (actor: string) => void;
  onEditDraft?: () => void;
  onTransition: (
    orderId: string,
    nextStatus: OrderStatus,
    note?: string
  ) => { ok: boolean; error?: string };
  canCreate: boolean;
  canApprove: boolean;
}

const StockOrderDetailContent: React.FC<DetailContentProps> = ({
  direction,
  order,
  currentActor,
  onActorChange,
  onEditDraft,
  onTransition,
  canCreate,
  canApprove,
}) => {
  const { language } = useTranslation();
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const isStockIn = direction === 'in';
  const stockInOrder = isStockIn ? (order as StockInOrder) : null;
  const stockOutOrder = !isStockIn ? (order as StockOutOrder) : null;

  const makerChecker = canApproveOrReject(order.createdBy, currentActor, language);

  const reasonLabel = stockOutOrder
    ? (() => {
        const found = STOCK_OUT_REASONS.find((r) => r.value === stockOutOrder.reason);
        return found ? (language === 'vi' ? found.labelVi : found.labelEn) : stockOutOrder.reason;
      })()
    : '';

  const handleTransitionClick = (nextStatus: OrderStatus, note = '') => {
    setActionError(null);
    const res = onTransition(order.id, nextStatus, note);
    if (!res.ok) {
      setActionError(res.error ?? 'Transition failed');
    } else {
      setRejecting(false);
      setRejectReason('');
    }
  };

  return (
    <div className="space-y-5 text-xs sm:text-sm">
      {/* Header Metadata Card */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-base text-[#0F172A]">{order.code}</span>
            <OrderStatusBadge status={order.status} size="md" />
          </div>
          <span className="text-xs text-[#64748B]">
            {language === 'vi' ? 'Người lập phiếu:' : 'Created by:'}{' '}
            <strong className="text-[#0F172A]">{order.createdBy}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#64748B] block">
              {isStockIn
                ? language === 'vi'
                  ? 'Kho tiếp nhận'
                  : 'Receiving Warehouse'
                : language === 'vi'
                  ? 'Kho xuất hàng'
                  : 'Dispatch Warehouse'}
            </span>
            <span className="font-semibold text-[#0F172A]">
              {order.warehouseCode} — {order.warehouseName}
            </span>
          </div>

          {stockInOrder ? (
            <div>
              <span className="text-[#64748B] block">
                {language === 'vi' ? 'Nhà cung cấp' : 'Supplier'}
              </span>
              <span className="font-semibold text-[#0F172A]">
                {stockInOrder.supplierCode} — {stockInOrder.supplierName}
              </span>
            </div>
          ) : (
            stockOutOrder && (
              <div>
                <span className="text-[#64748B] block">
                  {language === 'vi' ? 'Nơi nhận / Khách hàng' : 'Destination / Recipient'}
                </span>
                <span className="font-semibold text-[#0F172A]">{stockOutOrder.destination}</span>
              </div>
            )
          )}

          {stockInOrder && stockInOrder.referenceNote && (
            <div className="sm:col-span-2">
              <span className="text-[#64748B] block">
                {language === 'vi' ? 'Ghi chú / Tham chiếu' : 'Reference Note'}
              </span>
              <span className="text-[#334155]">{stockInOrder.referenceNote}</span>
            </div>
          )}

          {stockOutOrder && (
            <div className="sm:col-span-2">
              <span className="text-[#64748B] block">
                {language === 'vi' ? 'Lý do xuất kho' : 'Dispatch Reason'}
              </span>
              <span className="text-[#334155] font-medium">{reasonLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-2">
        <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A]">
          {language === 'vi' ? 'Chi tiết sản phẩm' : 'Line Items Detail'}
        </h4>
        <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-semibold">
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">{language === 'vi' ? 'Sản phẩm' : 'Product'}</th>
                {!isStockIn && (
                  <th className="py-2.5 px-3 text-right">
                    {language === 'vi' ? 'Tồn lúc lập' : 'Stock Snapshot'}
                  </th>
                )}
                <th className="py-2.5 px-3 text-right">
                  {language === 'vi' ? 'Số lượng' : 'Qty'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {language === 'vi' ? 'Đơn giá' : 'Unit Cost'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {language === 'vi' ? 'Thành tiền' : 'Line Total'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#0F172A] whitespace-nowrap">
                    {item.sku}
                  </td>
                  <td className="py-2.5 px-3 text-[#334155]">
                    {item.productName}{' '}
                    <span className="text-[11px] text-[#64748B]">({item.unit})</span>
                  </td>
                  {!isStockIn && 'availableStock' in item && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#64748B]">
                      {item.availableStock}
                    </td>
                  )}
                  <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-[#0F172A]">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#475569] whitespace-nowrap">
                    {formatCurrencyVND(item.unitCost)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-[#0F172A] whitespace-nowrap">
                    {formatCurrencyVND(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#F8FAFC] border-t border-[#E2E8F0] font-semibold">
                <td colSpan={isStockIn ? 2 : 3} className="py-2.5 px-3 text-right text-[#475569]">
                  {language === 'vi' ? 'Tổng cộng:' : 'Totals:'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#0F172A]">
                  {order.totalQty}
                </td>
                <td className="py-2.5 px-3" />
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sm text-[#0284C7] whitespace-nowrap">
                  {formatCurrencyVND(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Prototype Warning Note */}
      <Alert
        variant="info"
        message={
          language === 'vi'
            ? 'Chế độ Prototype: Thao tác duyệt và hoàn tất phiếu chỉ mô phỏng quy trình, không ghi đè tồn kho thật.'
            : 'Prototype mode: Approving or completing this voucher simulates state transitions without altering real master stock.'
        }
      />

      {/* Workflow Actions & Maker-Checker Controls */}
      {order.status !== 'COMPLETED' && (canCreate || canApprove) && (
        <div className="border border-[#E2E8F0] rounded-lg p-4 bg-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A]">
              {language === 'vi' ? 'Xử lý trạng thái phiếu' : 'Workflow Transitions'}
            </h4>
            {canApprove && (
              <div className="w-full sm:w-64">
                <Select
                  id="detail-actor-select"
                  label={language === 'vi' ? 'Người thực hiện hiện tại' : 'Current Operator'}
                  value={currentActor}
                  onChange={(e) => {
                    onActorChange(e.target.value);
                    setActionError(null);
                  }}
                  options={SIMULATED_ACTORS.map((a) => ({ value: a, label: a }))}
                  size="sm"
                />
              </div>
            )}
          </div>

          {actionError && <Alert variant="error" message={actionError} />}

          {order.status === 'SUBMITTED' && !canApprove && (
            <Alert
              variant="warning"
              message={
                language === 'vi'
                  ? 'Nhân viên kho (Staff) không có quyền phê duyệt hoặc từ chối phiếu đã gửi.'
                  : 'Warehouse Staff cannot approve or reject submitted vouchers.'
              }
            />
          )}

          {order.status === 'SUBMITTED' && canApprove && !makerChecker.allowed && (
            <div
              role="alert"
              data-testid="maker-checker-warning"
              className="flex items-start gap-2.5 rounded-md border border-[#FDE68A] bg-[#FFFBEB] p-3 text-xs text-[#92400E]"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
              <div>
                <p className="font-semibold">
                  {language === 'vi'
                    ? 'Không thể tự phê duyệt phiếu của chính mình'
                    : 'Self-approval blocked (Maker-Checker)'}
                </p>
                <p className="mt-0.5">{makerChecker.reason}</p>
              </div>
            </div>
          )}

          {rejecting && order.status === 'SUBMITTED' && (
            <div className="p-3 bg-[#FEF2F2]/60 border border-[#FECACA] rounded-md space-y-2.5">
              <Input
                id="detail-reject-reason"
                label={language === 'vi' ? 'Lý do từ chối phiếu' : 'Rejection Reason'}
                required
                placeholder={
                  language === 'vi'
                    ? 'Nhập lý do yêu cầu lập lại chứng từ...'
                    : 'Enter reason for rejecting this voucher...'
                }
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                size="sm"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRejecting(false);
                    setRejectReason('');
                    setActionError(null);
                  }}
                >
                  {language === 'vi' ? 'Đóng' : 'Cancel'}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleTransitionClick('REJECTED', rejectReason)}
                >
                  {language === 'vi' ? 'Xác nhận từ chối' : 'Confirm Reject'}
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {order.status === 'DRAFT' && canCreate && (
              <>
                {onEditDraft && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onEditDraft}
                    iconLeft={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    {language === 'vi' ? 'Chỉnh sửa nháp' : 'Edit Draft'}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleTransitionClick('SUBMITTED')}
                  iconLeft={<Send className="w-3.5 h-3.5" />}
                >
                  {language === 'vi' ? 'Gửi chờ duyệt' : 'Submit for Approval'}
                </Button>
              </>
            )}

            {order.status === 'SUBMITTED' && canApprove && !rejecting && (
              <>
                <Button
                  id="btn-approve-order"
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!makerChecker.allowed}
                  onClick={() => handleTransitionClick('APPROVED')}
                  iconLeft={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  {language === 'vi' ? 'Phê duyệt phiếu' : 'Approve Voucher'}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={!makerChecker.allowed}
                  onClick={() => {
                    setActionError(null);
                    setRejecting(true);
                  }}
                  iconLeft={<XCircle className="w-3.5 h-3.5" />}
                >
                  {language === 'vi' ? 'Từ chối' : 'Reject'}
                </Button>
              </>
            )}

            {order.status === 'APPROVED' && canApprove && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleTransitionClick('COMPLETED')}
                iconLeft={<PackageCheck className="w-3.5 h-3.5" />}
              >
                {language === 'vi' ? 'Xác nhận hoàn tất' : 'Mark Completed'}
              </Button>
            )}

            {order.status === 'REJECTED' && canCreate && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleTransitionClick('DRAFT')}
                iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
              >
                {language === 'vi' ? 'Mở lại bản nháp' : 'Reopen as Draft'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Timeline History */}
      <div className="space-y-2.5">
        <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A]">
          {language === 'vi' ? 'Lịch sử thay đổi trạng thái' : 'Status History'}
        </h4>
        <OrderHistoryTimeline history={order.statusHistory} />
      </div>
    </div>
  );
};

export const StockOrderDetailModal: React.FC<StockOrderDetailModalProps> = ({
  open,
  direction,
  order,
  currentActor,
  onActorChange,
  onClose,
  onEditDraft,
  onTransition,
  canCreate = true,
  canApprove = true,
}) => {
  const { language } = useTranslation();

  const title = order
    ? direction === 'in'
      ? language === 'vi'
        ? `Chi tiết phiếu nhập kho ${order.code}`
        : `Stock-In Voucher ${order.code}`
      : language === 'vi'
        ? `Chi tiết phiếu xuất kho ${order.code}`
        : `Stock-Out Voucher ${order.code}`
    : '';

  return (
    <Modal open={open} onClose={onClose} title={title} size="xl">
      {open && order && (
        <StockOrderDetailContent
          key={`${order.id}-${order.status}-${order.statusHistory.length}`}
          direction={direction}
          order={order}
          currentActor={currentActor}
          onActorChange={onActorChange}
          onEditDraft={onEditDraft}
          onTransition={onTransition}
          canCreate={canCreate}
          canApprove={canApprove}
        />
      )}
    </Modal>
  );
};
