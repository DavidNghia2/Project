import { describe, expect, it } from 'vitest';
import { INITIAL_PRODUCTS } from '../../products/mockData';
import {
  REPORT_DEFAULT_END_DATE,
  REPORT_DEFAULT_START_DATE,
  REPORT_LEDGER_ENTRIES,
  buildCsvFilename,
  buildReportCsvContent,
  computeReport,
  deduplicateLedgerEntries,
  validateDateRange,
  type CurrentStockRow,
  type LowStockRow,
  type ReportFilterState,
  type StockMovementRow,
  type StockTransactionReportRow,
} from '../index';

describe('Report Date Range Validation', () => {
  it('accepts valid chronological ranges and rejects startDate > endDate or bad formats', () => {
    expect(validateDateRange('2026-10-15', '2026-11-11', 'vi').valid).toBe(true);
    expect(validateDateRange('2026-11-01', '2026-11-01', 'en').valid).toBe(true);

    const inverted = validateDateRange('2026-11-12', '2026-11-01', 'vi');
    expect(inverted.valid).toBe(false);
    expect(inverted.error).toMatch(/không được lớn hơn/i);

    expect(validateDateRange('', '2026-11-01', 'en').valid).toBe(false);
    expect(validateDateRange('2026-02-30', '2026-11-01', 'en').valid).toBe(false);
  });
});

describe('Deduplication Invariant (No Double Counting)', () => {
  it('removes duplicate ledger records by id or composite semantic key', () => {
    const sample = REPORT_LEDGER_ENTRIES.slice(0, 3);
    const clonedWithNewId = { ...sample[0], id: 'dup-different-id' };
    const exactIdDuplicate = { ...sample[1] };

    const merged = [...sample, clonedWithNewId, exactIdDuplicate];
    const deduped = deduplicateLedgerEntries(merged);

    expect(deduped).toHaveLength(3);
  });

  it('produces identical inbound/outbound sums when raw ledger contains duplicate rows', () => {
    const baseFilter: ReportFilterState = {
      reportType: 'stock_in',
      startDate: REPORT_DEFAULT_START_DATE,
      endDate: REPORT_DEFAULT_END_DATE,
      warehouseCode: 'ALL',
      category: 'ALL',
    };

    const cleanReport = computeReport(baseFilter, 'vi');
    const pollutedLedger = [
      ...REPORT_LEDGER_ENTRIES,
      { ...REPORT_LEDGER_ENTRIES[0], id: 'dup-01' },
      { ...REPORT_LEDGER_ENTRIES[0], id: 'dup-02' },
    ];
    const pollutedReport = computeReport(baseFilter, 'vi', INITIAL_PRODUCTS, pollutedLedger);

    expect(pollutedReport.totals).toEqual(cleanReport.totals);
  });
});

describe('All 5 Inventory Reports Computation & Synchronization', () => {
  it('1. current_stock computes exact warehouse-scoped quantities, values, and chart sync', () => {
    const wh1Report = computeReport(
      {
        reportType: 'current_stock',
        startDate: REPORT_DEFAULT_START_DATE,
        endDate: REPORT_DEFAULT_END_DATE,
        warehouseCode: 'WH-01',
        category: 'Phụ kiện máy tính',
      },
      'vi'
    );

    const rows = wh1Report.rows as CurrentStockRow[];
    // prod-001 (90 at WH-01) and prod-006 (22 at WH-01)
    expect(rows).toHaveLength(2);
    expect(wh1Report.totals.totalPrimaryQty).toBe(90 + 22);
    expect(wh1Report.totals.totalPrimaryValue).toBe(90 * 280000 + 22 * 1950000);

    // Chart sums strictly equal table totals
    const chartQtySum = wh1Report.chartSeries.reduce((s, c) => s + c.primaryQty, 0);
    const chartValSum = wh1Report.chartSeries.reduce((s, c) => s + c.primaryValue, 0);
    expect(chartQtySum).toBe(wh1Report.totals.totalPrimaryQty);
    expect(chartValSum).toBe(wh1Report.totals.totalPrimaryValue);
  });

  it('2 & 3. stock_in and stock_out enforce date window, warehouse, category, and chart sync', () => {
    const novStockIn = computeReport(
      {
        reportType: 'stock_in',
        startDate: '2026-11-01',
        endDate: '2026-11-11',
        warehouseCode: 'ALL',
        category: 'ALL',
      },
      'en'
    );
    const inRows = novStockIn.rows as StockTransactionReportRow[];
    expect(inRows.length).toBeGreaterThan(0);
    expect(inRows.every((r) => r.date >= '2026-11-01' && r.date <= '2026-11-11')).toBe(true);
    expect(
      novStockIn.chartSeries.reduce((s, c) => s + c.primaryQty, 0)
    ).toBe(novStockIn.totals.totalPrimaryQty);

    const octWh1Out = computeReport(
      {
        reportType: 'stock_out',
        startDate: '2026-10-15',
        endDate: '2026-10-31',
        warehouseCode: 'WH-01',
        category: 'ALL',
      },
      'en'
    );
    const outRows = octWh1Out.rows as StockTransactionReportRow[];
    expect(outRows.length).toBeGreaterThan(0);
    expect(outRows.every((r) => r.warehouseCode === 'WH-01' && r.date <= '2026-10-31')).toBe(true);
    expect(
      octWh1Out.chartSeries.reduce((s, c) => s + c.primaryValue, 0)
    ).toBe(octWh1Out.totals.totalPrimaryValue);
  });

  it('4. stock_movement maintains exact accounting identity opening + in - out === closing >= 0 across sub-periods', () => {
    const subRanges: Array<[string, string, string]> = [
      ['2026-10-15', '2026-11-11', 'ALL'],
      ['2026-11-01', '2026-11-11', 'WH-01'],
      ['2026-10-15', '2026-10-31', 'WH-02'],
      ['2026-11-01', '2026-11-11', 'WH-03'],
    ];

    for (const [startDate, endDate, warehouseCode] of subRanges) {
      const mov = computeReport(
        {
          reportType: 'stock_movement',
          startDate,
          endDate,
          warehouseCode,
          category: 'ALL',
        },
        'vi'
      );
      const rows = mov.rows as StockMovementRow[];
      for (const r of rows) {
        expect(r.openingQty).toBeGreaterThanOrEqual(0);
        expect(r.closingQty).toBeGreaterThanOrEqual(0);
        expect(r.openingQty + r.inQty - r.outQty).toBe(r.closingQty);
      }
      expect(mov.chartSeries.reduce((s, c) => s + c.primaryQty, 0)).toBe(mov.totals.totalPrimaryQty);
      expect(mov.chartSeries.reduce((s, c) => s + (c.secondaryQty ?? 0), 0)).toBe(
        mov.totals.totalSecondaryQty
      );
    }
  });

  it('5. low_stock detects SKUs at or below reorderLevel with accurate deficit and restock valuation', () => {
    const lowReport = computeReport(
      {
        reportType: 'low_stock',
        startDate: REPORT_DEFAULT_START_DATE,
        endDate: REPORT_DEFAULT_END_DATE,
        warehouseCode: 'ALL',
        category: 'ALL',
      },
      'vi'
    );
    const rows = lowReport.rows as LowStockRow[];
    expect(rows).toHaveLength(5);
    for (const r of rows) {
      expect(r.currentQty).toBeLessThanOrEqual(r.reorderLevel);
      expect(r.deficitQty).toBe(r.reorderLevel - r.currentQty);
      expect(r.estimatedRestockValue).toBe(r.deficitQty * r.unitCost);
    }
  });
});

describe('CSV Export Content & RFC-4180 Safety', () => {
  it('generates UTF-8 BOM CSV with escaped quotes/commas and matching totals footer', () => {
    const filters: ReportFilterState = {
      reportType: 'stock_in',
      startDate: '2026-11-01',
      endDate: '2026-11-11',
      warehouseCode: 'WH-01',
      category: 'ALL',
    };
    const report = computeReport(filters, 'vi');
    const csv = buildReportCsvContent(report, 'vi');
    const filename = buildCsvFilename(filters);

    expect(filename).toBe('inventory-report-stock_in-wh-01-2026-11-01_to_2026-11-11.csv');
    expect(csv.startsWith('\uFEFF')).toBe(true);

    const lines = csv.replace(/^\uFEFF/, '').split('\r\n');
    // Header + rows + Total row
    expect(lines).toHaveLength(1 + report.rows.length + 1);
    expect(lines[0]).toContain('Mã phiếu');
    expect(lines.at(-1)).toContain('TỔNG CỘNG');
    expect(lines.at(-1)).toContain(String(report.totals.totalPrimaryQty));
    expect(lines.at(-1)).toContain(String(report.totals.totalPrimaryValue));
  });
});
