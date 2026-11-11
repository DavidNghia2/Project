import type { Language } from '../../i18n';
import { INITIAL_PRODUCTS } from '../products/mockData';
import type { Product } from '../products/types';
import { REPORT_LEDGER_ENTRIES } from './mockLedger';
import type {
  ComputedReportResult,
  CurrentStockRow,
  DateRangeValidationResult,
  LowStockRow,
  ReportChartSeriesItem,
  ReportFilterState,
  ReportLedgerEntry,
  StockMovementRow,
  StockTransactionReportRow,
} from './types';

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map((n) => Number.parseInt(n, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function validateDateRange(
  startDate: string,
  endDate: string,
  language: Language = 'vi'
): DateRangeValidationResult {
  if (!startDate || !endDate) {
    return {
      valid: false,
      error:
        language === 'vi'
          ? 'Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.'
          : 'Please specify both start date and end date.',
    };
  }

  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    return {
      valid: false,
      error:
        language === 'vi'
          ? 'Định dạng ngày không hợp lệ (YYYY-MM-DD).'
          : 'Invalid date format (expected YYYY-MM-DD).',
    };
  }

  if (startDate > endDate) {
    return {
      valid: false,
      error:
        language === 'vi'
          ? 'Khoảng thời gian không hợp lệ: Ngày bắt đầu không được lớn hơn ngày kết thúc.'
          : 'Invalid date range: Start date cannot be later than end date.',
    };
  }

  return { valid: true };
}

/**
 * Ensures zero duplicate transaction lines using semantic identity
 * (voucherCode + direction + warehouseCode + productId + date) and entry id.
 */
export function deduplicateLedgerEntries(
  entries: ReadonlyArray<ReportLedgerEntry>
): ReportLedgerEntry[] {
  const seenIds = new Set<string>();
  const seenCompositeKeys = new Set<string>();
  const unique: ReportLedgerEntry[] = [];

  for (const entry of entries) {
    const compositeKey = `${entry.voucherCode}::${entry.direction}::${entry.warehouseCode}::${entry.productId}::${entry.date}`;
    if (seenIds.has(entry.id) || seenCompositeKeys.has(compositeKey)) {
      continue;
    }
    seenIds.add(entry.id);
    seenCompositeKeys.add(compositeKey);
    unique.push(entry);
  }

  return unique;
}

export function getProductScopeQuantity(product: Product, warehouseCode: string): number {
  if (warehouseCode === 'ALL') {
    return product.warehouses.reduce((sum, w) => sum + w.quantity, 0);
  }
  const wh = product.warehouses.find((w) => w.warehouseCode === warehouseCode);
  return wh ? wh.quantity : 0;
}

function getWarehouseLabel(product: Product, warehouseCode: string, language: Language): string {
  if (warehouseCode === 'ALL') {
    return language === 'vi'
      ? `Toàn hệ thống (${product.warehouses.length} kho)`
      : `All Warehouses (${product.warehouses.length})`;
  }
  const found = product.warehouses.find((w) => w.warehouseCode === warehouseCode);
  return found ? `${found.warehouseCode} — ${found.warehouseName}` : warehouseCode;
}

function groupSeriesByKey<T>(
  items: ReadonlyArray<T>,
  keyFn: (item: T) => string,
  labelFn: (item: T) => string,
  valuesFn: (item: T) => { primaryQty: number; secondaryQty?: number; primaryValue: number; secondaryValue?: number }
): ReportChartSeriesItem[] {
  const map = new Map<string, ReportChartSeriesItem>();
  for (const item of items) {
    const key = keyFn(item);
    const vals = valuesFn(item);
    const existing = map.get(key);
    if (existing) {
      existing.primaryQty += vals.primaryQty;
      existing.primaryValue += vals.primaryValue;
      if (vals.secondaryQty !== undefined) {
        existing.secondaryQty = (existing.secondaryQty ?? 0) + vals.secondaryQty;
      }
      if (vals.secondaryValue !== undefined) {
        existing.secondaryValue = (existing.secondaryValue ?? 0) + vals.secondaryValue;
      }
    } else {
      map.set(key, {
        key,
        label: labelFn(item),
        primaryQty: vals.primaryQty,
        secondaryQty: vals.secondaryQty,
        primaryValue: vals.primaryValue,
        secondaryValue: vals.secondaryValue,
      });
    }
  }
  return Array.from(map.values());
}

export function computeReport(
  filters: ReportFilterState,
  language: Language = 'vi',
  products: ReadonlyArray<Product> = INITIAL_PRODUCTS,
  rawLedger: ReadonlyArray<ReportLedgerEntry> = REPORT_LEDGER_ENTRIES
): ComputedReportResult {
  const dedupedLedger = deduplicateLedgerEntries(rawLedger);
  const matchingProducts = products.filter(
    (p) => filters.category === 'ALL' || p.category === filters.category
  );

  switch (filters.reportType) {
    case 'current_stock': {
      const rows: CurrentStockRow[] = matchingProducts.map((p) => {
        const qty = getProductScopeQuantity(p, filters.warehouseCode);
        const unitCost = p.costPrice ?? 0;
        return {
          id: `${p.id}-${filters.warehouseCode}`,
          productId: p.id,
          sku: p.sku,
          productName: p.name,
          category: p.category,
          unit: p.unit,
          warehouseLabel: getWarehouseLabel(p, filters.warehouseCode, language),
          quantity: qty,
          reorderLevel: p.reorderLevel,
          unitCost,
          totalValue: Math.round(qty * unitCost),
          status: p.status,
        };
      });

      const chartSeries =
        filters.category === 'ALL'
          ? groupSeriesByKey(
              rows,
              (r) => r.category,
              (r) => r.category,
              (r) => ({ primaryQty: r.quantity, primaryValue: r.totalValue })
            )
          : rows.map((r) => ({
              key: r.sku,
              label: r.sku,
              primaryQty: r.quantity,
              primaryValue: r.totalValue,
            }));

      const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
      const totalValue = rows.reduce((s, r) => s + r.totalValue, 0);

      return {
        reportType: 'current_stock',
        rows,
        chartTitleVi:
          filters.category === 'ALL'
            ? 'Phân bổ giá trị & số lượng tồn hiện tại theo danh mục'
            : `Tồn kho & giá trị theo SKU (${filters.category})`,
        chartTitleEn:
          filters.category === 'ALL'
            ? 'Current Inventory Valuation & Qty by Category'
            : `Stock & Valuation by SKU (${filters.category})`,
        chartSeries,
        totals: {
          rowCount: rows.length,
          totalPrimaryQty: totalQty,
          totalPrimaryValue: totalValue,
        },
      };
    }

    case 'stock_in':
    case 'stock_out': {
      const dir = filters.reportType === 'stock_in' ? 'IN' : 'OUT';
      const filteredTx = dedupedLedger
        .filter((e) => {
          if (e.direction !== dir) return false;
          if (e.date < filters.startDate || e.date > filters.endDate) return false;
          if (filters.warehouseCode !== 'ALL' && e.warehouseCode !== filters.warehouseCode) {
            return false;
          }
          if (filters.category !== 'ALL' && e.category !== filters.category) {
            return false;
          }
          return true;
        })
        .sort((a, b) => (a.date === b.date ? b.voucherCode.localeCompare(a.voucherCode) : b.date.localeCompare(a.date)));

      const rows: StockTransactionReportRow[] = filteredTx.map((e) => ({
        id: e.id,
        date: e.date,
        voucherCode: e.voucherCode,
        direction: e.direction,
        warehouseCode: e.warehouseCode,
        warehouseName: e.warehouseName,
        partnerName: e.partnerName,
        sku: e.sku,
        productName: e.productName,
        category: e.category,
        unit: e.unit,
        quantity: e.quantity,
        unitCost: e.unitCost,
        lineTotal: e.lineTotal,
        operator: e.operator,
      }));

      // Chronological ascending aggregation for chart
      const chronologicalRows = [...rows].sort((a, b) => a.date.localeCompare(b.date));
      const chartSeries = groupSeriesByKey(
        chronologicalRows,
        (r) => r.date,
        (r) => r.date.slice(5), // MM-DD
        (r) => ({ primaryQty: r.quantity, primaryValue: r.lineTotal })
      );

      return {
        reportType: filters.reportType,
        rows,
        chartTitleVi:
          dir === 'IN'
            ? 'Biểu đồ lượng & giá trị nhập kho theo ngày'
            : 'Biểu đồ lượng & giá trị xuất kho theo ngày',
        chartTitleEn:
          dir === 'IN'
            ? 'Inbound Volume & Value by Date'
            : 'Outbound Volume & Value by Date',
        chartSeries,
        totals: {
          rowCount: rows.length,
          totalPrimaryQty: rows.reduce((s, r) => s + r.quantity, 0),
          totalPrimaryValue: rows.reduce((s, r) => s + r.lineTotal, 0),
        },
      };
    }

    case 'stock_movement': {
      const rows: StockMovementRow[] = matchingProducts.map((p) => {
        const unitCost = p.costPrice ?? 0;
        const currentQty = getProductScopeQuantity(p, filters.warehouseCode);

        const productEntries = dedupedLedger.filter(
          (e) =>
            e.productId === p.id &&
            (filters.warehouseCode === 'ALL' || e.warehouseCode === filters.warehouseCode)
        );

        let afterEndNet = 0;
        let inQty = 0;
        let inValue = 0;
        let outQty = 0;
        let outValue = 0;

        for (const e of productEntries) {
          if (e.date > filters.endDate) {
            afterEndNet += e.direction === 'IN' ? e.quantity : -e.quantity;
          } else if (e.date >= filters.startDate && e.date <= filters.endDate) {
            if (e.direction === 'IN') {
              inQty += e.quantity;
              inValue += e.lineTotal;
            } else {
              outQty += e.quantity;
              outValue += e.lineTotal;
            }
          }
        }

        const closingQty = Math.max(0, currentQty - afterEndNet);
        const openingQty = Math.max(0, closingQty - inQty + outQty);

        return {
          id: `mov-${p.id}-${filters.warehouseCode}`,
          productId: p.id,
          sku: p.sku,
          productName: p.name,
          category: p.category,
          unit: p.unit,
          openingQty,
          inQty,
          outQty,
          closingQty,
          inValue,
          outValue,
          closingValue: Math.round(closingQty * unitCost),
        };
      });

      const chartSeries =
        filters.category === 'ALL'
          ? groupSeriesByKey(
              rows,
              (r) => r.category,
              (r) => r.category,
              (r) => ({
                primaryQty: r.inQty,
                secondaryQty: r.outQty,
                primaryValue: r.inValue,
                secondaryValue: r.outValue,
              })
            )
          : rows.map((r) => ({
              key: r.sku,
              label: r.sku,
              primaryQty: r.inQty,
              secondaryQty: r.outQty,
              primaryValue: r.inValue,
              secondaryValue: r.outValue,
            }));

      return {
        reportType: 'stock_movement',
        rows,
        chartTitleVi:
          filters.category === 'ALL'
            ? 'Đối chiếu Nhập kho vs Xuất kho theo danh mục'
            : `Biến động Nhập vs Xuất theo SKU (${filters.category})`,
        chartTitleEn:
          filters.category === 'ALL'
            ? 'Inbound vs Outbound Movement by Category'
            : `Inbound vs Outbound Movement by SKU (${filters.category})`,
        chartSeries,
        totals: {
          rowCount: rows.length,
          totalPrimaryQty: rows.reduce((s, r) => s + r.inQty, 0),
          totalSecondaryQty: rows.reduce((s, r) => s + r.outQty, 0),
          totalClosingQty: rows.reduce((s, r) => s + r.closingQty, 0),
          totalPrimaryValue: rows.reduce((s, r) => s + r.inValue, 0),
          totalSecondaryValue: rows.reduce((s, r) => s + r.outValue, 0),
        },
      };
    }

    case 'low_stock': {
      const lowRows: LowStockRow[] = matchingProducts
        .map((p) => {
          const currentQty = getProductScopeQuantity(p, filters.warehouseCode);
          const deficitQty = Math.max(0, p.reorderLevel - currentQty);
          const unitCost = p.costPrice ?? 0;
          const severity: LowStockRow['severity'] =
            currentQty === 0
              ? 'out'
              : currentQty <= Math.floor(p.reorderLevel / 2)
                ? 'critical'
                : 'low';
          return {
            id: `low-${p.id}-${filters.warehouseCode}`,
            productId: p.id,
            sku: p.sku,
            productName: p.name,
            category: p.category,
            unit: p.unit,
            warehouseLabel: getWarehouseLabel(p, filters.warehouseCode, language),
            currentQty,
            reorderLevel: p.reorderLevel,
            deficitQty,
            unitCost,
            estimatedRestockValue: Math.round(deficitQty * unitCost),
            severity,
          };
        })
        .filter((row) => row.currentQty <= row.reorderLevel)
        .sort((a, b) => b.deficitQty - a.deficitQty);

      const chartSeries: ReportChartSeriesItem[] = lowRows.map((r) => ({
        key: r.sku,
        label: r.sku,
        primaryQty: r.currentQty,
        secondaryQty: r.reorderLevel,
        primaryValue: r.estimatedRestockValue,
      }));

      return {
        reportType: 'low_stock',
        rows: lowRows,
        chartTitleVi: 'So sánh tồn hiện tại với ngưỡng an toàn (Mặt hàng dưới ngưỡng)',
        chartTitleEn: 'Current Stock vs Safety Threshold (Below-Reorder Items)',
        chartSeries,
        totals: {
          rowCount: lowRows.length,
          totalPrimaryQty: lowRows.reduce((s, r) => s + r.currentQty, 0),
          totalSecondaryQty: lowRows.reduce((s, r) => s + r.deficitQty, 0),
          totalPrimaryValue: lowRows.reduce((s, r) => s + r.estimatedRestockValue, 0),
        },
      };
    }
  }
}

/* ---------------- CSV Export Utilities ---------------- */

function escapeCsvCell(value: string | number): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '0';
  }
  const str = String(value ?? '');
  const needsQuotes = /[",\r\n]/.test(str);
  const safe = str.replace(/"/g, '""');
  return needsQuotes ? `"${safe}"` : safe;
}

function toCsvLine(cells: ReadonlyArray<string | number>): string {
  return cells.map(escapeCsvCell).join(',');
}

export function buildReportCsvContent(
  report: ComputedReportResult,
  language: Language = 'vi'
): string {
  const isVi = language === 'vi';
  const totalLabel = isVi ? 'TỔNG CỘNG' : 'TOTAL';
  const lines: string[] = [];

  switch (report.reportType) {
    case 'current_stock': {
      const rows = report.rows as CurrentStockRow[];
      lines.push(
        toCsvLine(
          isVi
            ? ['SKU', 'Tên sản phẩm', 'Danh mục', 'Đơn vị', 'Kho', 'Tồn hiện tại', 'Ngưỡng an toàn', 'Đơn giá vốn (VND)', 'Giá trị tồn (VND)', 'Trạng thái']
            : ['SKU', 'Product Name', 'Category', 'Unit', 'Warehouse', 'On Hand Qty', 'Reorder Level', 'Unit Cost (VND)', 'Stock Value (VND)', 'Status']
        )
      );
      for (const r of rows) {
        lines.push(
          toCsvLine([
            r.sku,
            r.productName,
            r.category,
            r.unit,
            r.warehouseLabel,
            r.quantity,
            r.reorderLevel,
            r.unitCost,
            r.totalValue,
            r.status,
          ])
        );
      }
      lines.push(
        toCsvLine([
          totalLabel,
          `${rows.length} SKU`,
          '',
          '',
          '',
          report.totals.totalPrimaryQty,
          '',
          '',
          report.totals.totalPrimaryValue,
          '',
        ])
      );
      break;
    }

    case 'stock_in':
    case 'stock_out': {
      const rows = report.rows as StockTransactionReportRow[];
      lines.push(
        toCsvLine(
          isVi
            ? ['Ngày', 'Mã phiếu', 'Loại', 'Mã kho', 'Tên kho', 'Đối tác / Nơi nhận', 'SKU', 'Tên sản phẩm', 'Danh mục', 'Số lượng', 'Đơn giá (VND)', 'Thành tiền (VND)', 'Người thực hiện']
            : ['Date', 'Voucher Code', 'Direction', 'Warehouse Code', 'Warehouse Name', 'Partner / Destination', 'SKU', 'Product Name', 'Category', 'Quantity', 'Unit Cost (VND)', 'Line Total (VND)', 'Operator']
        )
      );
      for (const r of rows) {
        lines.push(
          toCsvLine([
            r.date,
            r.voucherCode,
            r.direction,
            r.warehouseCode,
            r.warehouseName,
            r.partnerName,
            r.sku,
            r.productName,
            r.category,
            r.quantity,
            r.unitCost,
            r.lineTotal,
            r.operator,
          ])
        );
      }
      lines.push(
        toCsvLine([
          totalLabel,
          `${rows.length} lines`,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          report.totals.totalPrimaryQty,
          '',
          report.totals.totalPrimaryValue,
          '',
        ])
      );
      break;
    }

    case 'stock_movement': {
      const rows = report.rows as StockMovementRow[];
      lines.push(
        toCsvLine(
          isVi
            ? ['SKU', 'Tên sản phẩm', 'Danh mục', 'Đơn vị', 'Tồn đầu kỳ', 'Nhập trong kỳ', 'Xuất trong kỳ', 'Tồn cuối kỳ', 'Giá trị nhập (VND)', 'Giá trị xuất (VND)', 'Giá trị tồn cuối (VND)']
            : ['SKU', 'Product Name', 'Category', 'Unit', 'Opening Qty', 'Inbound Qty', 'Outbound Qty', 'Closing Qty', 'Inbound Value (VND)', 'Outbound Value (VND)', 'Closing Value (VND)']
        )
      );
      for (const r of rows) {
        lines.push(
          toCsvLine([
            r.sku,
            r.productName,
            r.category,
            r.unit,
            r.openingQty,
            r.inQty,
            r.outQty,
            r.closingQty,
            r.inValue,
            r.outValue,
            r.closingValue,
          ])
        );
      }
      const totalOpening = rows.reduce((s, r) => s + r.openingQty, 0);
      const totalClosingVal = rows.reduce((s, r) => s + r.closingValue, 0);
      lines.push(
        toCsvLine([
          totalLabel,
          `${rows.length} SKU`,
          '',
          '',
          totalOpening,
          report.totals.totalPrimaryQty,
          report.totals.totalSecondaryQty ?? 0,
          report.totals.totalClosingQty ?? 0,
          report.totals.totalPrimaryValue,
          report.totals.totalSecondaryValue ?? 0,
          totalClosingVal,
        ])
      );
      break;
    }

    case 'low_stock': {
      const rows = report.rows as LowStockRow[];
      lines.push(
        toCsvLine(
          isVi
            ? ['SKU', 'Tên sản phẩm', 'Danh mục', 'Kho', 'Tồn hiện tại', 'Ngưỡng tối thiểu', 'Số lượng thiếu hụt', 'Đơn giá dự kiến (VND)', 'Dự trù nhập bổ sung (VND)', 'Mức độ']
            : ['SKU', 'Product Name', 'Category', 'Warehouse', 'Current Qty', 'Reorder Level', 'Deficit Qty', 'Unit Cost (VND)', 'Est. Restock Value (VND)', 'Severity']
        )
      );
      for (const r of rows) {
        lines.push(
          toCsvLine([
            r.sku,
            r.productName,
            r.category,
            r.warehouseLabel,
            r.currentQty,
            r.reorderLevel,
            r.deficitQty,
            r.unitCost,
            r.estimatedRestockValue,
            r.severity,
          ])
        );
      }
      lines.push(
        toCsvLine([
          totalLabel,
          `${rows.length} SKU`,
          '',
          '',
          report.totals.totalPrimaryQty,
          '',
          report.totals.totalSecondaryQty ?? 0,
          '',
          report.totals.totalPrimaryValue,
          '',
        ])
      );
      break;
    }
  }

  // UTF-8 BOM ensures clean Unicode rendering in Microsoft Excel
  return `\uFEFF${lines.join('\r\n')}`;
}

export function buildCsvFilename(filters: ReportFilterState): string {
  const wh = filters.warehouseCode === 'ALL' ? 'all-warehouses' : filters.warehouseCode.toLowerCase();
  return `inventory-report-${filters.reportType}-${wh}-${filters.startDate}_to_${filters.endDate}.csv`;
}

export function triggerCsvDownload(
  report: ComputedReportResult,
  filters: ReportFilterState,
  language: Language = 'vi'
): { filename: string; content: string; rowCount: number } {
  const content = buildReportCsvContent(report, language);
  const filename = buildCsvFilename(filters);

  if (typeof document !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Defer revoke slightly so browser download handler always completes reading the blob URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return {
    filename,
    content,
    rowCount: report.rows.length,
  };
}
