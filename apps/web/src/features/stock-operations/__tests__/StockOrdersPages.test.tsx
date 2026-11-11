import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../../i18n';
import { StockInPage } from '../../../pages/StockInPage';
import { StockOutPage } from '../../../pages/StockOutPage';
import { INITIAL_PRODUCTS } from '../../products/mockData';
import { getWarehouseAvailableStock } from '../workflow';

function renderStockIn() {
  return render(
    <I18nProvider>
      <StockInPage />
    </I18nProvider>
  );
}

function renderStockOut() {
  return render(
    <I18nProvider>
      <StockOutPage />
    </I18nProvider>
  );
}

describe('StockInPage Integration', () => {
  beforeEach(() => {
    localStorage.setItem('smart_inventory_language', 'vi');
  });

  it('creates a multi-item stock-in voucher with live totals and submits for approval', async () => {
    const user = userEvent.setup();
    renderStockIn();

    expect(screen.getByText('IN-2026-089')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /tạo phiếu nhập kho/i }));

    // Add a second line item
    await user.click(screen.getByRole('button', { name: /thêm dòng sản phẩm/i }));
    expect(screen.getByTestId('line-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('line-row-1')).toBeInTheDocument();

    const qty0 = document.getElementById('line-qty-0') as HTMLInputElement;
    const cost0 = document.getElementById('line-cost-0') as HTMLInputElement;
    const qty1 = document.getElementById('line-qty-1') as HTMLInputElement;
    const cost1 = document.getElementById('line-cost-1') as HTMLInputElement;

    await user.clear(qty0);
    await user.type(qty0, '4');
    await user.clear(cost0);
    await user.type(cost0, '100000');

    await user.clear(qty1);
    await user.type(qty1, '3');
    await user.clear(cost1);
    await user.type(cost1, '200000');

    expect(screen.getByTestId('voucher-total-qty')).toHaveTextContent('7');
    expect(screen.getByTestId('voucher-total-amount').textContent).toContain('1.000.000');

    await user.type(
      screen.getByLabelText(/chứng từ tham chiếu/i),
      'PO-2026-999 Nhập đa sản phẩm'
    );

    await user.click(screen.getByRole('button', { name: /gửi chờ duyệt/i }));

    expect(await screen.findByText(/đã tạo và gửi duyệt phiếu nhập IN-2026-090/i)).toBeInTheDocument();
    expect(screen.getByText('IN-2026-090')).toBeInTheDocument();

    // Verify Maker-Checker lock on newly created IN-2026-090 before switching actor
    await user.click(screen.getByRole('button', { name: /xem chi tiết IN-2026-090/i }));

    expect(screen.getByTestId('maker-checker-warning')).toBeInTheDocument();
    const approveBtn = screen.getByRole('button', { name: /phê duyệt phiếu/i });
    expect(approveBtn).toBeDisabled();

    // Switch operator inside Detail modal to Trần Thị Thu (Manager) and approve
    const detailActorSelect = document.getElementById('detail-actor-select') as HTMLSelectElement;
    await user.selectOptions(detailActorSelect, 'Trần Thị Thu (Manager)');

    expect(screen.queryByTestId('maker-checker-warning')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /phê duyệt phiếu/i })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /phê duyệt phiếu/i }));
    expect(await screen.findByRole('button', { name: /xác nhận hoàn tất/i })).toBeInTheDocument();
  });

  it('saves a draft stock-in voucher and allows viewing status history', async () => {
    const user = userEvent.setup();
    renderStockIn();

    await user.click(screen.getByRole('button', { name: /tạo phiếu nhập kho/i }));
    await user.type(screen.getByLabelText(/chứng từ tham chiếu/i), 'Draft Note 01');
    await user.click(screen.getByRole('button', { name: /lưu nháp/i }));

    expect(await screen.findByText(/đã lưu nháp phiếu nhập IN-2026-090/i)).toBeInTheDocument();
  });
});

describe('StockOutPage Integration', () => {
  beforeEach(() => {
    localStorage.setItem('smart_inventory_language', 'vi');
  });

  it('blocks stock-out submission when quantity exceeds available warehouse stock and succeeds with valid quantities', async () => {
    const user = userEvent.setup();
    renderStockOut();

    expect(screen.getByText('OUT-2026-042')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /tạo phiếu xuất kho/i }));

    const destInput = document.getElementById('stock-out-destination') as HTMLInputElement;
    await user.type(destInput, 'Công ty Đối tác ABC');

    const qty0 = document.getElementById('line-qty-0') as HTMLInputElement;
    const prodSelect0 = document.getElementById('line-product-0') as HTMLSelectElement;
    const selectedAvail = getWarehouseAvailableStock(prodSelect0.value, 'WH-01', INITIAL_PRODUCTS);

    // Attempt exceeding warehouse stock
    await user.clear(qty0);
    await user.type(qty0, String(selectedAvail + 100));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      new RegExp(`Vượt quá tồn kho khả dụng \\(${selectedAvail}\\)`, 'i')
    );

    await user.click(within(dialog).getByRole('button', { name: /gửi chờ duyệt/i }));
    // Still shows validation error and voucher OUT-2026-043 is not added
    expect(within(dialog).getByText(new RegExp(`Khả dụng: ${selectedAvail}`))).toBeInTheDocument();
    expect(screen.queryByText('OUT-2026-043')).not.toBeInTheDocument();

    // Fix quantity to valid level and add a second stocked item
    await user.clear(qty0);
    await user.type(qty0, '2');
    await user.click(within(dialog).getByRole('button', { name: /thêm dòng sản phẩm/i }));
    const qty1 = document.getElementById('line-qty-1') as HTMLInputElement;
    await user.clear(qty1);
    await user.type(qty1, '1');

    await user.click(within(dialog).getByRole('button', { name: /gửi chờ duyệt/i }));

    expect(await screen.findByText(/đã tạo và gửi duyệt phiếu xuất OUT-2026-043/i)).toBeInTheDocument();
    expect(screen.getByText('OUT-2026-043')).toBeInTheDocument();
  });
});
