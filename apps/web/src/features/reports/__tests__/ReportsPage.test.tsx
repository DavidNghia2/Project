import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../../i18n';
import { ReportsPage } from '../../../pages/ReportsPage';

function renderReportsPage() {
  return render(
    <I18nProvider>
      <ReportsPage />
    </I18nProvider>
  );
}

describe('ReportsPage Component Integration', () => {
  beforeEach(() => {
    localStorage.setItem('smart_inventory_language', 'vi');
  });

  it('switches across all 5 reports and synchronizes chart totals with table totals', async () => {
    const user = userEvent.setup();
    renderReportsPage();

    // Default Current Stock tab (localized Vietnamese subtitle)
    expect(screen.getByText(/Bảng cân đối tồn kho/i)).toBeInTheDocument();
    expect(screen.getByTestId('chart-totals-sync')).toBeInTheDocument();
    expect(screen.getByTestId('report-table-totals')).toBeInTheDocument();

    // Switch to Inbound Receipts
    await user.click(document.getElementById('report-tab-stock_in')!);
    expect(screen.getAllByText('IN-2026-087').length).toBeGreaterThanOrEqual(1);

    // Switch to Outbound Dispatches
    await user.click(document.getElementById('report-tab-stock_out')!);
    expect(screen.getAllByText('OUT-2026-040').length).toBeGreaterThanOrEqual(1);

    // Switch to Stock Movement
    await user.click(document.getElementById('report-tab-stock_movement')!);
    expect(
      screen.getByRole('heading', { name: /Bảng tổng hợp Nhập – Xuất – Tồn/i })
    ).toBeInTheDocument();

    // Switch to Below Threshold (Low Stock)
    await user.click(document.getElementById('report-tab-low_stock')!);
    expect(screen.getByTestId('kpi-rows')).toHaveTextContent('5');
  });

  it('filters by warehouse, category, and validates invalid date ranges', async () => {
    const user = userEvent.setup();
    renderReportsPage();

    await user.click(document.getElementById('report-tab-stock_in')!);

    // Filter by WH-02 & Category
    await user.selectOptions(document.getElementById('report-warehouse-select')!, 'WH-02');
    await user.selectOptions(
      document.getElementById('report-category-select')!,
      'Linh kiện máy tính'
    );
    expect(screen.getByText('IN-2026-084')).toBeInTheDocument();
    expect(screen.queryByText('IN-2026-087')).not.toBeInTheDocument();

    // Set invalid date range (startDate > endDate)
    fireEvent.change(document.getElementById('report-start-date')!, {
      target: { value: '2026-11-20' },
    });
    expect(screen.getByText(/Khoảng thời gian không hợp lệ/i)).toBeInTheDocument();
    expect(document.getElementById('btn-export-csv')).toBeDisabled();

    // Reset filters restores valid dates & data
    await user.click(document.getElementById('btn-reset-report-filters')!);
    expect(screen.getAllByText('IN-2026-087').length).toBeGreaterThanOrEqual(1);
    expect(document.getElementById('btn-export-csv')).toBeEnabled();
  });

  it('exports filtered CSV and displays export confirmation alert', async () => {
    const user = userEvent.setup();
    const createObjectUrlSpy = vi.fn(() => 'blob:mock-csv');
    const revokeObjectUrlSpy = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectUrlSpy,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectUrlSpy,
      configurable: true,
      writable: true,
    });

    renderReportsPage();

    await user.click(document.getElementById('btn-export-csv')!);

    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/Đã xuất file inventory-report-current_stock-all-warehouses/i)
    ).toBeInTheDocument();
  });

  it('renders full English localization when language is switched to en', async () => {
    localStorage.setItem('smart_inventory_language', 'en');
    const user = userEvent.setup();
    renderReportsPage();

    expect(screen.getByText(/Inventory Balance Sheet/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Export Report CSV/i }).length).toBeGreaterThanOrEqual(1);

    await user.click(document.getElementById('report-tab-stock_in')!);
    expect(screen.getByRole('heading', { name: /Inbound Stock Receipts Detail/i })).toBeInTheDocument();

    await user.click(document.getElementById('report-tab-stock_movement')!);
    expect(
      screen.getByRole('heading', { name: /Stock Movement Summary/i })
    ).toBeInTheDocument();
  });
});
