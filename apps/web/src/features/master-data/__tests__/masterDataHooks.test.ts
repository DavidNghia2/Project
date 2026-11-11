import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useWarehouses,
  useCategories,
  useUnits,
  useSuppliers,
} from '../hooks';
import {
  INITIAL_WAREHOUSES,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_SUPPLIERS,
} from '../mockData';

describe('Master Data Hooks — CRUD, Validation & Referential Integrity', () => {
  /* ========================================================================
     1. WAREHOUSES
     ======================================================================== */
  describe('useWarehouses', () => {
    it('loads initial warehouses and detects references to products', () => {
      const { result } = renderHook(() => useWarehouses());
      expect(result.current.items.length).toBe(INITIAL_WAREHOUSES.length);

      const wh01 = result.current.items.find((w) => w.code === 'WH-01')!;
      const wh04 = result.current.items.find((w) => w.code === 'WH-04')!;

      expect(result.current.getItemReferences(wh01).length).toBeGreaterThan(0);
      expect(result.current.getItemReferences(wh04).length).toBe(0);
    });

    it('filters warehouses by search query, region, and status', () => {
      const { result } = renderHook(() => useWarehouses());

      act(() => {
        result.current.setSearch('Đà Nẵng');
      });
      expect(result.current.filteredItems.map((w) => w.code)).toEqual(['WH-02']);

      act(() => {
        result.current.resetFilters();
        result.current.setSecondaryFilter('Miền Bắc');
        result.current.setStatusFilter('active');
      });
      expect(result.current.filteredItems.map((w) => w.code)).toEqual(['WH-01']);
    });

    it('rejects duplicate warehouse code, duplicate name, and invalid capacity', () => {
      const { result } = renderHook(() => useWarehouses());

      let res: ReturnType<typeof result.current.addItem> = { success: false };
      act(() => {
        res = result.current.addItem({
          code: 'WH-01', // Duplicate
          name: 'Kho Tổng Hà Nội', // Duplicate
          region: 'Miền Bắc',
          type: 'regional',
          address: 'KCN Bắc Thăng Long, Đông Anh, Hà Nội',
          manager: 'Lê Văn Bình',
          staffCount: -2,
          capacityPercent: 150,
          description: '',
          status: 'active',
        });
      });

      expect(res.success).toBe(false);
      expect(res.errors?.code).toContain('đã tồn tại');
      expect(res.errors?.name).toContain('đã được sử dụng');
      expect(res.errors?.staffCount).toBeDefined();
      expect(res.errors?.capacityPercent).toBeDefined();
    });

    it('creates and updates warehouse cleanly', () => {
      const { result } = renderHook(() => useWarehouses());

      let createRes: ReturnType<typeof result.current.addItem> = { success: false };
      act(() => {
        createRes = result.current.addItem({
          code: 'wh-05',
          name: 'Kho Cần Thơ',
          region: 'Miền Nam',
          type: 'regional',
          address: 'KCN Trà Nóc, Bình Thủy, Cần Thơ',
          manager: 'Trần Văn An',
          staffCount: 6,
          capacityPercent: 35,
          description: 'Kho mới đồng bằng sông Cửu Long',
          status: 'active',
        });
      });

      expect(createRes.success).toBe(true);
      expect(createRes.item?.code).toBe('WH-05');

      let updateRes: ReturnType<typeof result.current.updateItem> = { success: false };
      act(() => {
        updateRes = result.current.updateItem(createRes.item!.id, {
          code: 'WH-05',
          name: 'Kho Cần Thơ Mở Rộng',
          region: 'Miền Nam',
          type: 'regional',
          address: 'KCN Trà Nóc, Bình Thủy, Cần Thơ',
          manager: 'Trần Văn An',
          staffCount: 10,
          capacityPercent: 45,
          description: 'Đã nâng cấp kệ chứa',
          status: 'active',
        });
      });

      expect(updateRes.success).toBe(true);
      expect(updateRes.item?.name).toBe('Kho Cần Thơ Mở Rộng');
    });

    it('blocks deletion of referenced warehouse without force confirmation, allows when confirmed', () => {
      const { result } = renderHook(() => useWarehouses());
      const wh01 = result.current.items.find((w) => w.code === 'WH-01')!;
      const wh04 = result.current.items.find((w) => w.code === 'WH-04')!;

      let blockedRes: ReturnType<typeof result.current.deleteItem> = { success: false };
      act(() => {
        blockedRes = result.current.deleteItem(wh01.id, false);
      });
      expect(blockedRes.success).toBe(false);
      expect(blockedRes.blockedByReferences).toBe(true);
      expect(blockedRes.references!.length).toBeGreaterThan(0);

      // Unreferenced WH-04 deletes directly
      let directRes: ReturnType<typeof result.current.deleteItem> = { success: false };
      act(() => {
        directRes = result.current.deleteItem(wh04.id, false);
      });
      expect(directRes.success).toBe(true);

      // Referenced WH-01 deletes when confirmed
      let forcedRes: ReturnType<typeof result.current.deleteItem> = { success: false };
      act(() => {
        forcedRes = result.current.deleteItem(wh01.id, true);
      });
      expect(forcedRes.success).toBe(true);
    });
  });

  /* ========================================================================
     2. CATEGORIES
     ======================================================================== */
  describe('useCategories', () => {
    it('loads initial categories, validates unique code & name, and performs CRUD', () => {
      const { result } = renderHook(() => useCategories());
      expect(result.current.items.length).toBe(INITIAL_CATEGORIES.length);

      let dupRes: ReturnType<typeof result.current.addItem> = { success: false };
      act(() => {
        dupRes = result.current.addItem({
          code: 'CAT-IT-ACC',
          name: 'Phụ kiện máy tính',
          parentGroup: 'Vật tư & Phụ kiện',
          description: '',
          status: 'active',
        });
      });
      expect(dupRes.success).toBe(false);
      expect(dupRes.errors?.code).toBeDefined();
      expect(dupRes.errors?.name).toBeDefined();

      let addRes: ReturnType<typeof result.current.addItem> = { success: false };
      act(() => {
        addRes = result.current.addItem({
          code: 'CAT-AUDIO',
          name: 'Thiết bị âm thanh',
          parentGroup: 'Thiết bị Văn phòng',
          description: 'Loa hội trường và micro không dây',
          status: 'active',
        });
      });
      expect(addRes.success).toBe(true);

      // Block deleting referenced category without confirmation
      const catAcc = result.current.items.find((c) => c.code === 'CAT-IT-ACC')!;
      let blockDel: ReturnType<typeof result.current.deleteItem> = { success: false };
      act(() => {
        blockDel = result.current.deleteItem(catAcc.id, false);
      });
      expect(blockDel.success).toBe(false);
      expect(blockDel.blockedByReferences).toBe(true);
    });
  });

  /* ========================================================================
     3. UNITS OF MEASUREMENT
     ======================================================================== */
  describe('useUnits', () => {
    it('enforces uniqueness across code, name, and symbol', () => {
      const { result } = renderHook(() => useUnits());
      expect(result.current.items.length).toBe(INITIAL_UNITS.length);

      let dupRes: ReturnType<typeof result.current.addItem> = { success: false };
      act(() => {
        dupRes = result.current.addItem({
          code: 'UOM-PCS',
          name: 'Cái (Piece)',
          symbol: 'Cái',
          measureType: 'discrete',
          conversionNote: '',
          description: '',
          status: 'active',
        });
      });
      expect(dupRes.success).toBe(false);
      expect(dupRes.errors?.code).toBeDefined();
      expect(dupRes.errors?.name).toBeDefined();
      expect(dupRes.errors?.symbol).toBeDefined();

      let addRes: ReturnType<typeof result.current.addItem> = { success: false };
      act(() => {
        addRes = result.current.addItem({
          code: 'UOM-KG',
          name: 'Kilôgam (Kg)',
          symbol: 'kg',
          measureType: 'weight',
          conversionNote: '1 kg = 1,000 g',
          description: 'Dùng cho vật tư tính theo trọng lượng',
          status: 'active',
        });
      });
      expect(addRes.success).toBe(true);

      // Clean delete of newly added unreferenced unit
      let delRes: ReturnType<typeof result.current.deleteItem> = { success: false };
      act(() => {
        delRes = result.current.deleteItem(addRes.item!.id, false);
      });
      expect(delRes.success).toBe(true);
    });
  });

  /* ========================================================================
     4. SUPPLIERS
     ======================================================================== */
  describe('useSuppliers', () => {
    it('validates email format and prevents duplicate code, name, and email', () => {
      const { result } = renderHook(() => useSuppliers());
      expect(result.current.items.length).toBe(INITIAL_SUPPLIERS.length);

      let invalidEmailRes: ReturnType<typeof result.current.addItem> = { success: false };
      act(() => {
        invalidEmailRes = result.current.addItem({
          code: 'SUP-NEW-01',
          name: 'Công ty Cổ phần Mới',
          categoryFocus: 'Phụ kiện máy tính',
          contactPerson: 'Nguyễn Văn B',
          phone: 'ext. 901',
          email: 'invalid-email-format',
          address: 'Quận 3, TP. HCM',
          paymentTerms: 'Công nợ 30 ngày (Net 30)',
          notes: '',
          status: 'active',
        });
      });
      expect(invalidEmailRes.success).toBe(false);
      expect(invalidEmailRes.errors?.email).toContain('không hợp lệ');

      let dupRes: ReturnType<typeof result.current.addItem> = { success: false };
      act(() => {
        dupRes = result.current.addItem({
          code: 'SUP-LOGI-VN',
          name: 'Công ty TNHH Logitech Việt Nam',
          categoryFocus: 'Phụ kiện máy tính',
          contactPerson: 'Trịnh Minh Tâm',
          phone: 'ext. 101-8899',
          email: 'tam.trinh@logitech-dist.example',
          address: 'Quận 1, TP. HCM',
          paymentTerms: 'Công nợ 30 ngày (Net 30)',
          notes: '',
          status: 'active',
        });
      });
      expect(dupRes.success).toBe(false);
      expect(dupRes.errors?.code).toBeDefined();
      expect(dupRes.errors?.name).toBeDefined();
      expect(dupRes.errors?.email).toBeDefined();

      // Referenced supplier SUP-LOGI-VN blocked unless confirmed
      const logi = result.current.items.find((s) => s.code === 'SUP-LOGI-VN')!;
      let blockDel: ReturnType<typeof result.current.deleteItem> = { success: false };
      act(() => {
        blockDel = result.current.deleteItem(logi.id, false);
      });
      expect(blockDel.success).toBe(false);
      expect(blockDel.blockedByReferences).toBe(true);
    });
  });
});
