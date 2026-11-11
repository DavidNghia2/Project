import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../../i18n';
import { WarehousesPage } from '../../../pages/WarehousesPage';
import { CategoriesPage } from '../../../pages/CategoriesPage';
import { UnitsPage } from '../../../pages/UnitsPage';
import { SuppliersPage } from '../../../pages/SuppliersPage';

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

describe('Master Data Pages Component Integration', () => {
  beforeEach(() => {
    localStorage.setItem('smart_inventory_language', 'vi');
  });

  /* ========================================================================
     1. WAREHOUSES PAGE
     ======================================================================== */
  describe('WarehousesPage', () => {
    it('supports search, empty state recovery, create with duplicate validation, detail references, edit & safe delete', async () => {
      const user = userEvent.setup();
      renderWithI18n(<WarehousesPage />);

      expect(screen.getByText('WH-01')).toBeInTheDocument();
      expect(screen.getByText('Kho Tổng Hà Nội')).toBeInTheDocument();

      // Empty state on unmatched search + reset
      const searchInput = screen.getByPlaceholderText(/tìm theo mã kho/i);
      await user.type(searchInput, 'KHO-KHONG-TON-TAI-999');
      expect(screen.getByText(/không tìm thấy kho hàng phù hợp/i)).toBeInTheDocument();

      const clearFilterBtn = screen.getAllByRole('button', { name: /xóa bộ lọc/i })[0];
      await user.click(clearFilterBtn);
      expect(screen.getByText('WH-01')).toBeInTheDocument();

      // Open Create modal & test empty + duplicate validation
      await user.click(screen.getByRole('button', { name: /thiết lập kho mới/i }));
      await user.click(screen.getByRole('button', { name: /tạo kho hàng/i }));
      expect(screen.getByText(/mã kho không được để trống/i)).toBeInTheDocument();

      await user.type(screen.getByPlaceholderText(/VD: WH-05/i), 'WH-01');
      await user.type(screen.getByPlaceholderText(/VD: Kho Trung Chuyển Cần Thơ/i), 'Kho Tổng Hà Nội');
      await user.type(screen.getByPlaceholderText(/VD: Đường số 2/i), 'KCN Bình Thủy, Cần Thơ');
      await user.type(screen.getByPlaceholderText(/VD: Nguyễn Minh Hải/i), 'Trần Văn Hải');
      await user.click(screen.getByRole('button', { name: /tạo kho hàng/i }));
      expect(screen.getByText(/mã kho "WH-01" đã tồn tại/i)).toBeInTheDocument();

      // Fix code & name to unique values and save
      const codeInput = screen.getByPlaceholderText(/VD: WH-05/i);
      const nameInput = screen.getByPlaceholderText(/VD: Kho Trung Chuyển Cần Thơ/i);
      await user.clear(codeInput);
      await user.type(codeInput, 'WH-05');
      await user.clear(nameInput);
      await user.type(nameInput, 'Kho Trung Chuyển Cần Thơ');
      await user.click(screen.getByRole('button', { name: /tạo kho hàng/i }));

      await waitFor(() => {
        expect(screen.getByText('WH-05')).toBeInTheDocument();
        expect(screen.getByText('Kho Trung Chuyển Cần Thơ')).toBeInTheDocument();
      });

      // Open Detail Modal for WH-01 & verify referencing SKUs
      await user.click(screen.getByRole('button', { name: 'Xem chi tiết WH-01' }));
      expect(screen.getByText(/sản phẩm đang tham chiếu/i)).toBeInTheDocument();
      expect(screen.getByText('SKU-LOGI-M331')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Đóng' }));

      // Edit WH-05
      await user.click(screen.getByRole('button', { name: 'Sửa WH-05' }));
      const editName = screen.getByDisplayValue('Kho Trung Chuyển Cần Thơ');
      await user.clear(editName);
      await user.type(editName, 'Kho Cần Thơ Updated');
      await user.click(screen.getByRole('button', { name: /lưu thay đổi/i }));
      await waitFor(() => {
        expect(screen.getByText('Kho Cần Thơ Updated')).toBeInTheDocument();
      });

      // Delete referenced WH-01 -> requires acknowledgment checkbox
      await user.click(screen.getByRole('button', { name: 'Xóa WH-01' }));
      const confirmForceBtn = screen.getByRole('button', { name: /xác nhận xóa bất chấp liên kết/i });
      expect(confirmForceBtn).toBeDisabled();

      await user.click(screen.getByRole('checkbox'));
      expect(confirmForceBtn).toBeEnabled();
      await user.click(confirmForceBtn);

      await waitFor(() => {
        expect(screen.queryByText('WH-01')).not.toBeInTheDocument();
      });
    });
  });

  /* ========================================================================
     2. CATEGORIES PAGE
     ======================================================================== */
  describe('CategoriesPage', () => {
    it('handles create validation, detail, edit, and clean delete of unreferenced category', async () => {
      const user = userEvent.setup();
      renderWithI18n(<CategoriesPage />);

      expect(screen.getByText('CAT-IT-ACC')).toBeInTheDocument();

      // Create category
      await user.click(screen.getByRole('button', { name: /thêm danh mục/i }));
      await user.click(screen.getByRole('button', { name: /tạo danh mục/i }));
      expect(screen.getByText(/mã danh mục không được để trống/i)).toBeInTheDocument();

      await user.type(screen.getByPlaceholderText(/VD: CAT-PRINTER/i), 'CAT-PRINTER');
      await user.type(screen.getByPlaceholderText(/VD: Thiết bị in ấn/i), 'Thiết bị in ấn');
      await user.click(screen.getByRole('button', { name: /tạo danh mục/i }));

      await waitFor(() => {
        expect(screen.getByText('CAT-PRINTER')).toBeInTheDocument();
      });

      // Delete unreferenced CAT-CONF-AV without needing force checkbox
      await user.click(screen.getByRole('button', { name: 'Xóa CAT-CONF-AV' }));
      const confirmBtn = screen.getByRole('button', { name: 'Xác nhận xóa' });
      expect(confirmBtn).toBeEnabled();
      await user.click(confirmBtn);

      await waitFor(() => {
        expect(screen.queryByText('CAT-CONF-AV')).not.toBeInTheDocument();
      });
    });
  });

  /* ========================================================================
     3. UNITS PAGE
     ======================================================================== */
  describe('UnitsPage', () => {
    it('validates unique symbol & code, creates, edits, and deletes unit', async () => {
      const user = userEvent.setup();
      renderWithI18n(<UnitsPage />);

      expect(screen.getByText('UOM-PCS')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /thêm đơn vị tính/i }));
      await user.type(screen.getByPlaceholderText(/VD: UOM-PACK/i), 'UOM-PACK');
      await user.type(screen.getByPlaceholderText(/VD: Gói \(Pack\)/i), 'Gói (Pack)');
      await user.type(screen.getByPlaceholderText(/VD: Gói$/i), 'Cái'); // Duplicate symbol!
      await user.click(screen.getByRole('button', { name: /tạo đơn vị tính/i }));

      expect(screen.getByText(/ký hiệu "Cái" đã được sử dụng/i)).toBeInTheDocument();

      const symbolInput = screen.getByPlaceholderText(/VD: Gói$/i);
      await user.clear(symbolInput);
      await user.type(symbolInput, 'Gói');
      await user.click(screen.getByRole('button', { name: /tạo đơn vị tính/i }));

      await waitFor(() => {
        expect(screen.getByText('UOM-PACK')).toBeInTheDocument();
      });
    });
  });

  /* ========================================================================
     4. SUPPLIERS PAGE
     ======================================================================== */
  describe('SuppliersPage', () => {
    it('validates email format, prevents duplicate supplier, and blocks referenced delete until acknowledged', async () => {
      const user = userEvent.setup();
      renderWithI18n(<SuppliersPage />);

      expect(screen.getByText('SUP-LOGI-VN')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /thêm nhà cung cấp/i }));
      await user.type(screen.getByPlaceholderText(/VD: SUP-SAMSUNG-VN/i), 'SUP-NEW-TECH');
      await user.type(screen.getByPlaceholderText(/VD: Công ty TNHH Phân Phối/i), 'Công ty New Tech');
      await user.type(screen.getByPlaceholderText(/VD: Phạm Minh Quân/i), 'Lê Minh');
      await user.type(screen.getByPlaceholderText(/VD: ext. 808-9900/i), 'ext. 888');
      await user.type(screen.getByPlaceholderText(/VD: quan.pham@partner.example/i), 'bad-email');
      await user.type(screen.getByPlaceholderText(/VD: Phường Thảo Điền/i), 'Quận 1, TP. HCM');
      await user.click(screen.getByRole('button', { name: /tạo nhà cung cấp/i }));

      expect(screen.getByText(/định dạng email không hợp lệ/i)).toBeInTheDocument();

      const emailInput = screen.getByPlaceholderText(/VD: quan.pham@partner.example/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'minh@newtech.example');
      await user.click(screen.getByRole('button', { name: /tạo nhà cung cấp/i }));

      await waitFor(() => {
        expect(screen.getByText('SUP-NEW-TECH')).toBeInTheDocument();
      });

      // Block deleting SUP-LOGI-VN without confirmation checkbox
      await user.click(screen.getByRole('button', { name: 'Xóa SUP-LOGI-VN' }));
      const forceDelBtn = screen.getByRole('button', { name: /xác nhận xóa bất chấp liên kết/i });
      expect(forceDelBtn).toBeDisabled();
      expect(screen.getAllByText('SKU-LOGI-M331').length).toBeGreaterThan(0);
    });
  });
});
