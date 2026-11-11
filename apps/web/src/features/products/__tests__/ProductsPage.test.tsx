import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../../i18n';
import { ProductsPage } from '../../../pages/ProductsPage';

function renderProductsPage() {
  return render(
    <I18nProvider>
      <ProductsPage />
    </I18nProvider>
  );
}

describe('ProductsPage Component Integration', () => {
  beforeEach(() => {
    localStorage.setItem('smart_inventory_language', 'vi');
  });

  it('renders page header, KPI cards, filter controls, and product table', () => {
    renderProductsPage();

    // Check Header & KPIs
    expect(screen.getByRole('heading', { level: 2, name: /danh mục hàng hóa|product catalog/i })).toBeInTheDocument();
    expect(screen.getByText('Tổng số mặt hàng')).toBeInTheDocument();
    expect(screen.getByText('Đang kinh doanh')).toBeInTheDocument();
    expect(screen.getByText('Cảnh báo tồn thấp')).toBeInTheDocument();
    expect(screen.getByText('Tổng tồn khả dụng')).toBeInTheDocument();

    // Check Filters & Button
    expect(screen.getByPlaceholderText(/tìm theo sku, tên sản phẩm/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thêm sản phẩm mới|add new product/i })).toBeInTheDocument();

    // Check initial page 1 table data
    expect(screen.getByText('SKU-KB-LOGI-MXKEYS')).toBeInTheDocument();
    expect(screen.getByText(/Bàn phím không dây Logitech MX Keys Advanced/i)).toBeInTheDocument();
  });

  it('filters table rows when typing into the search input', async () => {
    const user = userEvent.setup();
    renderProductsPage();

    const searchInput = screen.getByPlaceholderText(/tìm theo sku, tên sản phẩm/i);
    await user.type(searchInput, 'Dell Professional');

    await waitFor(() => {
      expect(screen.getByText('SKU-DELL-P2419')).toBeInTheDocument();
      expect(screen.queryByText('SKU-KB-LOGI-MXKEYS')).not.toBeInTheDocument();
    });
  });

  it('opens create modal, enforces validation, and adds a new product to table', async () => {
    const user = userEvent.setup();
    renderProductsPage();

    // 1. Open create modal
    const addBtn = screen.getByRole('button', { name: /thêm sản phẩm mới|add new product/i });
    await user.click(addBtn);

    expect(screen.getByText('Thêm mới sản phẩm vào kho')).toBeInTheDocument();

    // 2. Submit empty to trigger validation
    const submitBtn = screen.getByRole('button', { name: /tạo sản phẩm/i });
    await user.click(submitBtn);

    // Validation messages should appear
    expect(screen.getByText(/tên sản phẩm không được để trống/i)).toBeInTheDocument();
    expect(screen.getByText(/mã sku không được để trống/i)).toBeInTheDocument();

    // 3. Fill in required fields (Name starting with "AAA" to ensure it sorts at the very top of page 1)
    const skuInput = screen.getByPlaceholderText(/VD: SKU-DELL-P2419/i);
    const nameInput = screen.getByPlaceholderText(/VD: Màn hình Dell Professional 24 inch FHD IPS/i);

    await user.type(skuInput, 'SKU-AAA-NEW-01');
    await user.type(nameInput, 'AAA Sản phẩm Test Mới 2026');

    // 4. Submit valid form
    await user.click(submitBtn);

    // Modal should close (have hidden class) and new product should be in table
    await waitFor(() => {
      const dialog = document.querySelector('dialog');
      expect(dialog).toHaveClass('hidden');
      expect(screen.getByText('SKU-AAA-NEW-01')).toBeInTheDocument();
      expect(screen.getByText('AAA Sản phẩm Test Mới 2026')).toBeInTheDocument();
    });
  });

  it('opens detail modal when clicking product name', async () => {
    const user = userEvent.setup();
    renderProductsPage();

    const prodLink = screen.getByRole('button', { name: /Bàn phím không dây Logitech MX Keys Advanced/i });
    await user.click(prodLink);

    // Modal detail opens
    expect(screen.getByText(/chi tiết sản phẩm:/i)).toBeInTheDocument();
    expect(screen.getByText(/phân bổ tồn kho thực tế theo từng kho bãi/i)).toBeInTheDocument();

    // Close detail modal
    const closeBtn = screen.getByRole('button', { name: 'Đóng' });
    await user.click(closeBtn);

    await waitFor(() => {
      const dialog = document.querySelector('dialog');
      expect(dialog).toHaveClass('hidden');
    });
  });

  it('opens edit modal and updates product info', async () => {
    const user = userEvent.setup();
    renderProductsPage();

    // Click edit on SKU-KB-LOGI-MXKEYS
    const editBtn = screen.getByRole('button', { name: 'Sửa SKU-KB-LOGI-MXKEYS' });
    await user.click(editBtn);

    expect(screen.getByText(/chỉnh sửa sản phẩm: SKU-KB-LOGI-MXKEYS/i)).toBeInTheDocument();

    // Clear and change name
    const nameInput = screen.getByDisplayValue('Bàn phím không dây Logitech MX Keys Advanced');
    await user.clear(nameInput);
    await user.type(nameInput, 'Bàn phím không dây Logitech MX Keys Đã Đổi Tên');

    // Submit edit
    const saveBtn = screen.getByRole('button', { name: /lưu thay đổi/i });
    await user.click(saveBtn);

    await waitFor(() => {
      const dialog = document.querySelector('dialog');
      expect(dialog).toHaveClass('hidden');
      expect(screen.getByText('Bàn phím không dây Logitech MX Keys Đã Đổi Tên')).toBeInTheDocument();
    });
  });

  it('opens delete modal and removes product from table upon confirmation', async () => {
    const user = userEvent.setup();
    renderProductsPage();

    // Click delete on SKU-KB-LOGI-MXKEYS
    const deleteBtn = screen.getByRole('button', { name: 'Xóa SKU-KB-LOGI-MXKEYS' });
    await user.click(deleteBtn);

    expect(screen.getByText(/xác nhận xóa sản phẩm/i)).toBeInTheDocument();
    expect(screen.getByText(/cảnh báo thao tác xóa dữ liệu/i)).toBeInTheDocument();

    // Click confirm delete
    const confirmBtn = screen.getByRole('button', { name: /xác nhận xóa/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByText(/xác nhận xóa sản phẩm/i)).not.toBeInTheDocument();
      expect(screen.queryByText('SKU-KB-LOGI-MXKEYS')).not.toBeInTheDocument();
    });
  });
});
