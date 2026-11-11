import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Table, type Column } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';
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

  const titleMap = {
    current_stock: t('reports.table.titles.current_stock'),
    stock_in: t('reports.table.titles.stock_in'),
    stock_out: t('reports.table.titles.stock_out'),
    stock_movement: t('reports.table.titles.stock_movement'),
    low_stock: t('reports.table.titles.low_stock'),
  };

  const renderTypedTable = () => {
    switch (report.reportType) {
      case 'current_stock': {
        const rows = report.rows as CurrentStockRow[];
        const columns: Column<CurrentStockRow>[] = [
          {
            key: 'sku',
            label: t('reports.table.cols.sku'),
            render: (_, r) => (
              <span className="font-mono text-xs font-semibold text-[#0F172A]">{r.sku}</span>
            ),
          },
          {
            key: 'productName',
            label: t('reports.table.cols.product'),
            render: (_, r) => (
              <div className="min-w-0 max-w-[260px]">
                <span className="text-xs font-medium text-[#0F172A] block truncate">
                  {r.productName}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {translateDomainLabel(language, 'categories', r.category)} ·{' '}
                  {translateDomainLabel(language, 'units', r.unit)}
                </span>
              </div>
            ),
          },
          {
            key: 'warehouseLabel',
            label: t('reports.table.cols.warehouseScope'),
            render: (_, r) => <span className="text-xs text-[#475569]">{r.warehouseLabel}</span>,
          },
          {
            key: 'quantity',
            label: t('reports.table.cols.onHand'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                {r.quantity.toLocaleString('en-US')}
              </span>
            ),
          },
          {
            key: 'reorderLevel',
            label: t('reports.table.cols.minLevel'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono tabular-nums text-[#64748B]">{r.reorderLevel}</span>
            ),
          },
          {
            key: 'unitCost',
            label: t('reports.table.cols.unitCost'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono tabular-nums text-[#475569] whitespace-nowrap">
                {formatCurrencyVND(r.unitCost)}
              </span>
            ),
          },
          {
            key: 'totalValue',
            label: t('reports.table.cols.stockValuation'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#0284C7] whitespace-nowrap">
                {formatCurrencyVND(r.totalValue)}
              </span>
            ),
          },
          {
            key: 'status',
            label: t('reports.table.cols.status'),
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
            caption={t('reports.table.captions.current_stock')}
            emptyTitle={t('reports.table.empty.currentTitle')}
            emptyDescription={t('reports.table.empty.currentDesc')}
            emptyAction={
              <Button variant="secondary" size="sm" onClick={onResetFilters}>
                {t('reports.table.empty.resetFilters')}
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
            label: t('reports.table.cols.date'),
            render: (_, r) => (
              <span className="font-mono text-xs tabular-nums text-[#0F172A] whitespace-nowrap">
                {r.date}
              </span>
            ),
          },
          {
            key: 'voucherCode',
            label: t('reports.table.cols.voucher'),
            render: (_, r) => (
              <span className="font-mono text-xs font-semibold text-[#0284C7]">
                {r.voucherCode}
              </span>
            ),
          },
          {
            key: 'warehouseCode',
            label: t('reports.table.cols.warehouse'),
            render: (_, r) => (
              <div>
                <span className="font-mono text-xs font-semibold text-[#0F172A]">
                  {r.warehouseCode}
                </span>
                <p className="text-[11px] text-[#64748B] truncate max-w-[140px]">
                  {translateDomainLabel(language, 'warehouseNames', r.warehouseCode, r.warehouseName)}
                </p>
              </div>
            ),
          },
          {
            key: 'partnerName',
            label: isIn ? t('reports.table.cols.supplier') : t('reports.table.cols.destination'),
            render: (_, r) => (
              <span className="text-xs text-[#334155] block truncate max-w-[190px]">
                {r.partnerName}
              </span>
            ),
          },
          {
            key: 'sku',
            label: t('reports.table.cols.skuProduct'),
            render: (_, r) => (
              <div className="min-w-0 max-w-[220px]">
                <span className="font-mono text-[11px] font-semibold text-[#0F172A]">
                  {r.sku}
                </span>
                <p className="text-xs text-[#334155] truncate">{r.productName}</p>
                <span className="text-[11px] text-[#64748B]">
                  {translateDomainLabel(language, 'categories', r.category)}
                </span>
              </div>
            ),
          },
          {
            key: 'quantity',
            label: t('reports.table.cols.qty'),
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
            label: t('reports.table.cols.unitCost'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono tabular-nums text-[#475569] whitespace-nowrap">
                {formatCurrencyVND(r.unitCost)}
              </span>
            ),
          },
          {
            key: 'lineTotal',
            label: t('reports.table.cols.lineTotal'),
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
            emptyTitle={t('reports.table.empty.txTitle')}
            emptyDescription={t('reports.table.empty.txDesc')}
            emptyAction={
              <Button variant="secondary" size="sm" onClick={onResetFilters}>
                {t('reports.table.empty.resetFilters')}
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
            label: t('reports.table.cols.sku'),
            render: (_, r) => (
              <span className="font-mono text-xs font-semibold text-[#0F172A]">{r.sku}</span>
            ),
          },
          {
            key: 'productName',
            label: t('reports.table.cols.productCategory'),
            render: (_, r) => (
              <div className="min-w-0 max-w-[240px]">
                <span className="text-xs font-medium text-[#0F172A] block truncate">
                  {r.productName}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {translateDomainLabel(language, 'categories', r.category)} ·{' '}
                  {translateDomainLabel(language, 'units', r.unit)}
                </span>
              </div>
            ),
          },
          {
            key: 'openingQty',
            label: t('reports.table.cols.opening'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono tabular-nums text-[#475569]">{r.openingQty}</span>
            ),
          },
          {
            key: 'inQty',
            label: t('reports.table.cols.inboundPlus'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#16A34A]">
                {r.inQty > 0 ? `+${r.inQty}` : '0'}
              </span>
            ),
          },
          {
            key: 'outQty',
            label: t('reports.table.cols.outboundMinus'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#D97706]">
                {r.outQty > 0 ? `-${r.outQty}` : '0'}
              </span>
            ),
          },
          {
            key: 'closingQty',
            label: t('reports.table.cols.closing'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-bold tabular-nums text-[#0F172A]">
                {r.closingQty}
              </span>
            ),
          },
          {
            key: 'closingValue',
            label: t('reports.table.cols.closingValue'),
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
            emptyTitle={t('reports.table.empty.movementTitle')}
            emptyDescription={t('reports.table.empty.movementDesc')}
          />
        );
      }

      case 'low_stock': {
        const rows = report.rows as LowStockRow[];
        const columns: Column<LowStockRow>[] = [
          {
            key: 'sku',
            label: t('reports.table.cols.sku'),
            render: (_, r) => (
              <span className="font-mono text-xs font-semibold text-[#0F172A]">{r.sku}</span>
            ),
          },
          {
            key: 'productName',
            label: t('reports.table.cols.product'),
            render: (_, r) => (
              <div className="min-w-0 max-w-[240px]">
                <span className="text-xs font-medium text-[#0F172A] block truncate">
                  {r.productName}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {translateDomainLabel(language, 'categories', r.category)} · {r.warehouseLabel}
                </span>
              </div>
            ),
          },
          {
            key: 'currentQty',
            label: t('reports.table.cols.onHand'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-bold tabular-nums text-[#DC2626]">
                {r.currentQty}
              </span>
            ),
          },
          {
            key: 'reorderLevel',
            label: t('reports.table.cols.minLevel'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono tabular-nums text-[#475569]">{r.reorderLevel}</span>
            ),
          },
          {
            key: 'deficitQty',
            label: t('reports.table.cols.deficit'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#D97706]">
                {r.deficitQty}
              </span>
            ),
          },
          {
            key: 'estimatedRestockValue',
            label: t('reports.table.cols.estRestockCost'),
            align: 'right',
            render: (_, r) => (
              <span className="font-mono font-semibold tabular-nums text-[#0F172A] whitespace-nowrap">
                {formatCurrencyVND(r.estimatedRestockValue)}
              </span>
            ),
          },
          {
            key: 'severity',
            label: t('reports.table.cols.severity'),
            align: 'center',
            render: (_, r) => (
              <Badge
                variant={r.severity === 'out' ? 'error' : r.severity === 'critical' ? 'warning' : 'info'}
                size="sm"
                dot
              >
                {t(`reports.table.severity.${r.severity}`)}
              </Badge>
            ),
          },
        ];

        return (
          <Table
            columns={columns}
            data={rows}
            caption={titleMap.low_stock}
            emptyTitle={t('reports.table.empty.lowTitle')}
            emptyDescription={t('reports.table.empty.lowDesc')}
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
          ? t('reports.table.descValid', { count: report.totals.rowCount })
          : t('reports.table.descInvalid')
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
          {t('reports.table.exportCsv')}
        </Button>
      }
    >
      {!validDateRange ? (
        <EmptyState
          title={t('reports.table.invalidRangeTitle')}
          description={t('reports.table.invalidRangeDesc')}
          action={
            <Button variant="secondary" size="sm" onClick={onResetFilters}>
              {t('reports.table.restoreDates')}
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
                {t('reports.table.footer.summaryTitle')} (
                {report.totals.rowCount} {t('reports.table.footer.rowsUnit')})
              </span>

              <div className="flex flex-wrap items-center gap-6 font-mono tabular-nums text-[#0F172A]">
                {report.reportType === 'stock_movement' ? (
                  <>
                    <span>
                      {t('reports.table.footer.totalIn')}{' '}
                      <strong className="text-[#16A34A]">
                        +{report.totals.totalPrimaryQty.toLocaleString('en-US')}
                      </strong>
                    </span>
                    <span>
                      {t('reports.table.footer.totalOut')}{' '}
                      <strong className="text-[#D97706]">
                        -{(report.totals.totalSecondaryQty ?? 0).toLocaleString('en-US')}
                      </strong>
                    </span>
                    <span>
                      {t('reports.table.footer.closing')}{' '}
                      <strong className="text-[#0284C7]">
                        {(report.totals.totalClosingQty ?? 0).toLocaleString('en-US')}
                      </strong>
                    </span>
                    <span>
                      {t('reports.table.footer.inValue')}{' '}
                      <strong>{formatCurrencyVND(report.totals.totalPrimaryValue)}</strong>
                    </span>
                  </>
                ) : report.reportType === 'low_stock' ? (
                  <>
                    <span>
                      {t('reports.table.footer.currentQty')}{' '}
                      <strong>{report.totals.totalPrimaryQty.toLocaleString('en-US')}</strong>
                    </span>
                    <span>
                      {t('reports.table.footer.deficitQty')}{' '}
                      <strong className="text-[#D97706]">
                        {(report.totals.totalSecondaryQty ?? 0).toLocaleString('en-US')}
                      </strong>
                    </span>
                    <span>
                      {t('reports.table.footer.estRestock')}{' '}
                      <strong className="text-[#0284C7]">
                        {formatCurrencyVND(report.totals.totalPrimaryValue)}
                      </strong>
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {t('reports.table.footer.totalQty')}{' '}
                      <strong>{report.totals.totalPrimaryQty.toLocaleString('en-US')}</strong>
                    </span>
                    <span>
                      {t('reports.table.footer.totalValue')}{' '}
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
