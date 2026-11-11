import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Table, type Column } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { formatCurrencyVND } from '../../stock-operations/workflow';
import type {
  ComputedReportResult,
  CurrentStockRow,
  LowStockRow,
  StockMovementRow,
  StockTransactionReportRow,
} from '../types';

export interface ReportDataTableProps {
  report: ComputedReportResult;
  validDateRange: boolean;
  onResetFilters: () => void;
  onExportCsv: () => void;
}

export const ReportDataTable: React.FC<ReportDataTableProps> = ({
  report,
  validDateRange,
  onResetFilters,
  onExportCsv,
}) => {
  const { t, language } = useTranslation();
  const isVi = language === 'vi';

  const titleMap = {
    current_stock: isVi
      ? 'Bảng chi tiết tồn kho hiện tại'
      : 'Current Stock Valuation Table',
    stock_in: isVi ? 'Bảng chi tiết giao dịch nhập kho' : 'Inbound Stock Receipts Detail',
    stock_out: isVi ? 'Bảng chi tiết giao dịch xuất kho' : 'Outbound Stock Dispatches Detail',
    stock_movement: isVi
      ? 'Bảng tổng hợp Nhập – Xuất – Tồn theo SKU'
      : 'Stock Movement Summary (Opening – In – Out – Closing)',
    low_stock: isVi
      ? 'Danh sách sản phẩm tồn dưới ngưỡng an toàn'
      : 'Below-Threshold Low Stock Products',
  };

  const renderTypedTable = () => {
    switch (report.reportType) {
      case 'current_stock': {
        const rows = report.rows as CurrentStockRow[];
        const columns: Column<CurrentStockRow>[] = [
          {
            key: 'sku',
            label: 'SKU',
            render: (_, r) => (
              <span className="font-mono text-xs font-semibold text-[#0F172A]">{r.sku}</span>
            ),
          },
          {
            key: 'productName',
            label: isVi ? 'Sản phẩm' : 'Product',
            render: (_, r) => (
              <div className="min-w-0 max-w-[260px]">
                <span className="text-xs font-medium text-[#0F172A] block truncate">
                  {r.productName}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {r.category} · {r.unit}
                </span>
              </div>
            ),
          },
          {
            key: 'warehouseLabel',
            label: isVi ? 'Phạm vi kho' : 'Warehouse Scope',
            render: (_, r) => <span className="text-xs text-[#475569]">{r.warehouseLabel}</span>,
          },
          {
            key: 'quantity',
            label: isVi ? 'Tồn hiện tại' : 'On Hand',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                {r.quantity.toLocaleString('en-US')}
              </span>
            ),
          },
          {
            key: 'reorderLevel',
            label: isVi ? 'Ngưỡng tối thiểu' : 'Min Level',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono tabular-nums text-[#64748B]">{r.reorderLevel}</span>
            ),
          },
          {
            key: 'unitCost',
            label: isVi ? 'Giá vốn' : 'Unit Cost',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono tabular-nums text-[#475569] whitespace-nowrap">
                {formatCurrencyVND(r.unitCost)}
              </span>
            ),
          },
          {
            key: 'totalValue',
            label: isVi ? 'Giá trị tồn' : 'Stock Valuation',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#0284C7] whitespace-nowrap">
                {formatCurrencyVND(r.totalValue)}
              </span>
            ),
          },
          {
            key: 'status',
            label: isVi ? 'Trạng thái' : 'Status',
            align: 'center',
            render: (_, r) => (
              <Badge variant={r.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
                {r.status === 'active' ? t('status.active') : t('status.inactive')}
              </Badge>
            ),
          },
        ];

        return (
          <Table
            columns={columns}
            data={rows}
            caption={isVi ? 'Dữ liệu tồn kho chi tiết' : 'Detailed stock rows'}
            emptyTitle={isVi ? 'Không có mặt hàng phù hợp' : 'No matching inventory items'}
            emptyDescription={
              isVi
                ? 'Không có sản phẩm nào khớp với bộ lọc kho hoặc danh mục.'
                : 'No products match the active warehouse or category filter.'
            }
            emptyAction={
              <Button variant="secondary" size="sm" onClick={onResetFilters}>
                {isVi ? 'Đặt lại bộ lọc' : 'Reset Filters'}
              </Button>
            }
          />
        );
      }

      case 'stock_in':
      case 'stock_out': {
        const rows = report.rows as StockTransactionReportRow[];
        const isIn = report.reportType === 'stock_in';
        const columns: Column<StockTransactionReportRow>[] = [
          {
            key: 'date',
            label: isVi ? 'Ngày chứng từ' : 'Date',
            render: (_, r) => (
              <span className="font-mono text-xs tabular-nums text-[#0F172A] whitespace-nowrap">
                {r.date}
              </span>
            ),
          },
          {
            key: 'voucherCode',
            label: isVi ? 'Mã phiếu' : 'Voucher',
            render: (_, r) => (
              <span className="font-mono text-xs font-semibold text-[#0284C7]">
                {r.voucherCode}
              </span>
            ),
          },
          {
            key: 'warehouseCode',
            label: isVi ? 'Kho' : 'Warehouse',
            render: (_, r) => (
              <div>
                <span className="font-mono text-xs font-semibold text-[#0F172A]">
                  {r.warehouseCode}
                </span>
                <p className="text-[11px] text-[#64748B] truncate max-w-[140px]">
                  {r.warehouseName}
                </p>
              </div>
            ),
          },
          {
            key: 'partnerName',
            label: isIn ? (isVi ? 'Nhà cung cấp' : 'Supplier') : isVi ? 'Nơi nhận' : 'Destination',
            render: (_, r) => (
              <span className="text-xs text-[#334155] block truncate max-w-[190px]">
                {r.partnerName}
              </span>
            ),
          },
          {
            key: 'sku',
            label: isVi ? 'Sản phẩm / Danh mục' : 'SKU & Product',
            render: (_, r) => (
              <div className="min-w-0 max-w-[220px]">
                <span className="font-mono text-[11px] font-semibold text-[#0F172A]">
                  {r.sku}
                </span>
                <p className="text-xs text-[#334155] truncate">{r.productName}</p>
                <span className="text-[11px] text-[#64748B]">{r.category}</span>
              </div>
            ),
          },
          {
            key: 'quantity',
            label: isVi ? 'Số lượng' : 'Qty',
            align: 'right',
            render: (_, r) => (
              <span
                className={`font-mono font-semibold tabular-nums ${
                  isIn ? 'text-[#16A34A]' : 'text-[#D97706]'
                }`}
              >
                {isIn ? '+' : '-'}
                {r.quantity}
              </span>
            ),
          },
          {
            key: 'unitCost',
            label: isVi ? 'Đơn giá' : 'Unit Cost',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono tabular-nums text-[#475569] whitespace-nowrap">
                {formatCurrencyVND(r.unitCost)}
              </span>
            ),
          },
          {
            key: 'lineTotal',
            label: isVi ? 'Thành tiền' : 'Line Total',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#0F172A] whitespace-nowrap">
                {formatCurrencyVND(r.lineTotal)}
              </span>
            ),
          },
        ];

        return (
          <Table
            columns={columns}
            data={rows}
            caption={titleMap[report.reportType]}
            emptyTitle={
              isVi ? 'Không có giao dịch trong khoảng lọc' : 'No matching transactions'
            }
            emptyDescription={
              isVi
                ? 'Không có chứng từ hoàn tất nào nằm trong khoảng ngày, kho và danh mục đã chọn.'
                : 'No completed transactions fall within the selected date range, warehouse, and category.'
            }
            emptyAction={
              <Button variant="secondary" size="sm" onClick={onResetFilters}>
                {isVi ? 'Đặt lại bộ lọc' : 'Reset Filters'}
              </Button>
            }
          />
        );
      }

      case 'stock_movement': {
        const rows = report.rows as StockMovementRow[];
        const columns: Column<StockMovementRow>[] = [
          {
            key: 'sku',
            label: 'SKU',
            render: (_, r) => (
              <span className="font-mono text-xs font-semibold text-[#0F172A]">{r.sku}</span>
            ),
          },
          {
            key: 'productName',
            label: isVi ? 'Sản phẩm & Danh mục' : 'Product & Category',
            render: (_, r) => (
              <div className="min-w-0 max-w-[240px]">
                <span className="text-xs font-medium text-[#0F172A] block truncate">
                  {r.productName}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {r.category} · {r.unit}
                </span>
              </div>
            ),
          },
          {
            key: 'openingQty',
            label: isVi ? 'Tồn đầu kỳ' : 'Opening',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono tabular-nums text-[#475569]">{r.openingQty}</span>
            ),
          },
          {
            key: 'inQty',
            label: isVi ? 'Nhập kỳ' : 'Inbound (+)',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#16A34A]">
                {r.inQty > 0 ? `+${r.inQty}` : '0'}
              </span>
            ),
          },
          {
            key: 'outQty',
            label: isVi ? 'Xuất kỳ' : 'Outbound (-)',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#D97706]">
                {r.outQty > 0 ? `-${r.outQty}` : '0'}
              </span>
            ),
          },
          {
            key: 'closingQty',
            label: isVi ? 'Tồn cuối kỳ' : 'Closing',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-bold tabular-nums text-[#0F172A]">
                {r.closingQty}
              </span>
            ),
          },
          {
            key: 'closingValue',
            label: isVi ? 'Giá trị tồn cuối' : 'Closing Value',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#0284C7] whitespace-nowrap">
                {formatCurrencyVND(r.closingValue)}
              </span>
            ),
          },
        ];

        return (
          <Table
            columns={columns}
            data={rows}
            caption={titleMap.stock_movement}
            emptyTitle={isVi ? 'Không có dữ liệu biến động' : 'No movement records'}
            emptyDescription={
              isVi
                ? 'Hãy chọn danh mục hoặc kho khác để xem số dư đầu kỳ, nhập, xuất và tồn cuối.'
                : 'Select another category or warehouse filter to inspect stock movements.'
            }
          />
        );
      }

      case 'low_stock': {
        const rows = report.rows as LowStockRow[];
        const columns: Column<LowStockRow>[] = [
          {
            key: 'sku',
            label: 'SKU',
            render: (_, r) => (
              <span className="font-mono text-xs font-semibold text-[#0F172A]">{r.sku}</span>
            ),
          },
          {
            key: 'productName',
            label: isVi ? 'Sản phẩm' : 'Product',
            render: (_, r) => (
              <div className="min-w-0 max-w-[240px]">
                <span className="text-xs font-medium text-[#0F172A] block truncate">
                  {r.productName}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {r.category} · {r.warehouseLabel}
                </span>
              </div>
            ),
          },
          {
            key: 'currentQty',
            label: isVi ? 'Tồn hiện tại' : 'On Hand',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-bold tabular-nums text-[#DC2626]">
                {r.currentQty}
              </span>
            ),
          },
          {
            key: 'reorderLevel',
            label: isVi ? 'Ngưỡng an toàn' : 'Min Level',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono tabular-nums text-[#475569]">{r.reorderLevel}</span>
            ),
          },
          {
            key: 'deficitQty',
            label: isVi ? 'Thiếu hụt' : 'Deficit',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#D97706]">
                {r.deficitQty}
              </span>
            ),
          },
          {
            key: 'estimatedRestockValue',
            label: isVi ? 'Dự trù nhập bù' : 'Est. Restock Cost',
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#0F172A] whitespace-nowrap">
                {formatCurrencyVND(r.estimatedRestockValue)}
              </span>
            ),
          },
          {
            key: 'severity',
            label: isVi ? 'Mức cảnh báo' : 'Severity',
            align: 'center',
            render: (_, r) => (
              <Badge
                variant={r.severity === 'out' ? 'error' : r.severity === 'critical' ? 'warning' : 'info'}
                size="sm"
                dot
              >
                {r.severity === 'out'
                  ? isVi
                    ? 'Hết hàng'
                    : 'Out of Stock'
                  : r.severity === 'critical'
                    ? isVi
                      ? 'Nguy cấp'
                      : 'Critical'
                    : isVi
                      ? 'Dưới ngưỡng'
                      : 'Low Stock'}
              </Badge>
            ),
          },
        ];

        return (
          <Table
            columns={columns}
            data={rows}
            caption={titleMap.low_stock}
            emptyTitle={
              isVi ? 'Không có mặt hàng nào dưới ngưỡng' : 'No Below-Threshold SKUs'
            }
            emptyDescription={
              isVi
                ? 'Tất cả sản phẩm trong bộ lọc hiện tại đều đạt định mức tồn kho an toàn.'
                : 'All inventory items in the active scope meet minimum safety levels.'
            }
          />
        );
      }
    }
  };

  return (
    <Card
      title={titleMap[report.reportType]}
      description={
        validDateRange
          ? isVi
            ? `Hiển thị ${report.totals.rowCount} bản ghi chính xác từ mock data (không trùng lặp giao dịch)`
            : `Showing ${report.totals.rowCount} deduplicated records from mock dataset`
          : isVi
            ? 'Vui lòng sửa khoảng thời gian lọc để xem dữ liệu báo cáo.'
            : 'Resolve the invalid date range to load report rows.'
      }
      actions={
        <Button
          id="btn-table-export-csv"
          type="button"
          variant="secondary"
          size="sm"
          disabled={!validDateRange || report.rows.length === 0}
          onClick={onExportCsv}
          iconLeft={<FileSpreadsheet className="w-4 h-4 text-[#16A34A]" />}
        >
          {isVi ? 'Xuất CSV báo cáo này' : 'Export Report CSV'}
        </Button>
      }
    >
      {!validDateRange ? (
        <EmptyState
          title={isVi ? 'Khoảng ngày lọc không hợp lệ' : 'Invalid Date Range Selected'}
          description={
            isVi
              ? 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc trước khi tổng hợp báo cáo.'
              : 'Start date must be on or before end date before compiling report data.'
          }
          action={
            <Button variant="secondary" size="sm" onClick={onResetFilters}>
              {isVi ? 'Khôi phục ngày mặc định' : 'Restore Default Dates'}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {renderTypedTable()}

          {/* Totals Summary Footer Strip */}
          {report.rows.length > 0 && (
            <div
              data-testid="report-table-totals"
              className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <span className="font-semibold text-[#0F172A]">
                {isVi ? 'Tổng hợp bảng báo cáo' : 'Report Totals Summary'} (
                {report.totals.rowCount} {isVi ? 'dòng' : 'rows'})
              </span>

              <div className="flex flex-wrap items-center gap-6 font-mono tabular-nums text-[#0F172A]">
                {report.reportType === 'stock_movement' ? (
                  <>
                    <span>
                      {isVi ? 'Tổng nhập:' : 'Total In:'}{' '}
                      <strong className="text-[#16A34A]">
                        +{report.totals.totalPrimaryQty.toLocaleString('en-US')}
                      </strong>
                    </span>
                    <span>
                      {isVi ? 'Tổng xuất:' : 'Total Out:'}{' '}
                      <strong className="text-[#D97706]">
                        -{(report.totals.totalSecondaryQty ?? 0).toLocaleString('en-US')}
                      </strong>
                    </span>
                    <span>
                      {isVi ? 'Tồn cuối:' : 'Closing:'}{' '}
                      <strong className="text-[#0284C7]">
                        {(report.totals.totalClosingQty ?? 0).toLocaleString('en-US')}
                      </strong>
                    </span>
                    <span>
                      {isVi ? 'Giá trị nhập:' : 'In Value:'}{' '}
                      <strong>{formatCurrencyVND(report.totals.totalPrimaryValue)}</strong>
                    </span>
                  </>
                ) : report.reportType === 'low_stock' ? (
                  <>
                    <span>
                      {isVi ? 'Tồn hiện có:' : 'Current Qty:'}{' '}
                      <strong>{report.totals.totalPrimaryQty.toLocaleString('en-US')}</strong>
                    </span>
                    <span>
                      {isVi ? 'Thiếu hụt:' : 'Deficit Qty:'}{' '}
                      <strong className="text-[#D97706]">
                        {(report.totals.totalSecondaryQty ?? 0).toLocaleString('en-US')}
                      </strong>
                    </span>
                    <span>
                      {isVi ? 'Dự trù bổ sung:' : 'Est. Restock:'}{' '}
                      <strong className="text-[#0284C7]">
                        {formatCurrencyVND(report.totals.totalPrimaryValue)}
                      </strong>
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {isVi ? 'Tổng số lượng:' : 'Total Quantity:'}{' '}
                      <strong>{report.totals.totalPrimaryQty.toLocaleString('en-US')}</strong>
                    </span>
                    <span>
                      {isVi ? 'Tổng giá trị:' : 'Total Value:'}{' '}
                      <strong className="text-sm text-[#0284C7]">
                        {formatCurrencyVND(report.totals.totalPrimaryValue)}
                      </strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
