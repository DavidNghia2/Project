import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProducts } from '../useProducts';
import type { Product, ProductFormData } from '../types';

const mockTestProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'SKU-AAA-001',
    name: 'Bàn phím cơ DareU EK87 Tenkeyless Blue Switch',
    category: 'Thiết bị & Linh kiện',
    unit: 'Chiếc',
    barcode: '8936001001',
    reorderLevel: 10,
    onHand: 25,
    status: 'active',
    warehouses: [
      { warehouseCode: 'WH-HN-01', warehouseName: 'Kho Hà Nội', quantity: 20 },
      { warehouseCode: 'WH-HCM-01', warehouseName: 'Kho TP.HCM', quantity: 5 },
      { warehouseCode: 'WH-DN-01', warehouseName: 'Kho Đà Nẵng', quantity: 0 },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    sku: 'SKU-BBB-002',
    name: 'Chuột không dây Logitech M331 Silent Black',
    category: 'Thiết bị & Linh kiện',
    unit: 'Cái',
    barcode: '8936001002',
    reorderLevel: 15,
    onHand: 8,
    status: 'active',
    warehouses: [
      { warehouseCode: 'WH-HN-01', warehouseName: 'Kho Hà Nội', quantity: 0 },
      { warehouseCode: 'WH-HCM-01', warehouseName: 'Kho TP.HCM', quantity: 8 },
      { warehouseCode: 'WH-DN-01', warehouseName: 'Kho Đà Nẵng', quantity: 0 },
    ],
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'prod-3',
    sku: 'SKU-CCC-003',
    name: 'Mực in laser HP 85A Black CE285A',
    category: 'Văn phòng phẩm',
    unit: 'Hộp',
    barcode: '8936001003',
    reorderLevel: 5,
    onHand: 0,
    status: 'inactive',
    warehouses: [
      { warehouseCode: 'WH-HN-01', warehouseName: 'Kho Hà Nội', quantity: 0 },
      { warehouseCode: 'WH-HCM-01', warehouseName: 'Kho TP.HCM', quantity: 0 },
      { warehouseCode: 'WH-DN-01', warehouseName: 'Kho Đà Nẵng', quantity: 0 },
    ],
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
];

describe('useProducts hook', () => {
  it('initializes with provided products and default filter values', () => {
    const { result } = renderHook(() => useProducts(mockTestProducts));

    expect(result.current.products.length).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.filters.search).toBe('');
    expect(result.current.filters.category).toBe('ALL');
    expect(result.current.filters.status).toBe('ALL');
    expect(result.current.filters.warehouse).toBe('ALL');
    expect(result.current.currentPage).toBe(1);
  });

  describe('Search operations', () => {
    it('filters products by name (case-insensitive)', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setSearch('chuột');
      });

      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].sku).toBe('SKU-BBB-002');
    });

    it('filters products by SKU (case-insensitive)', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setSearch('aaa-001');
      });

      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].name).toContain('DareU');
    });

    it('filters products by barcode', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setSearch('8936001003');
      });

      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].sku).toBe('SKU-CCC-003');
    });

    it('returns empty array when search query does not match anything', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setSearch('NON-EXISTENT-QUERY-XYZ');
      });

      expect(result.current.filteredProducts.length).toBe(0);
      expect(result.current.totalItems).toBe(0);
    });
  });

  describe('Filter operations', () => {
    it('filters by category', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setCategory('Văn phòng phẩm');
      });

      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].sku).toBe('SKU-CCC-003');
    });

    it('filters by status', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setStatus('inactive');
      });

      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].sku).toBe('SKU-CCC-003');
    });

    it('filters by warehouse stock availability (quantity > 0)', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setWarehouse('WH-HN-01');
      });

      // Only prod-1 has quantity 20 in WH-HN-01
      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].sku).toBe('SKU-AAA-001');
    });

    it('combines search and multiple filters simultaneously', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setCategory('Thiết bị & Linh kiện');
        result.current.setStatus('active');
        result.current.setWarehouse('WH-HCM-01');
        result.current.setSearch('Logitech');
      });

      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].sku).toBe('SKU-BBB-002');
    });

    it('resets all filters properly', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setCategory('Thiết bị & Linh kiện');
        result.current.setSearch('Logitech');
        result.current.setPage(2);
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.search).toBe('');
      expect(result.current.filters.category).toBe('ALL');
      expect(result.current.filters.status).toBe('ALL');
      expect(result.current.filters.warehouse).toBe('ALL');
      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('Sorting operations', () => {
    it('sorts by onHand ascending and descending', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setSort('onHand', 'asc');
      });

      expect(result.current.filteredProducts[0].onHand).toBe(0); // prod-3
      expect(result.current.filteredProducts[2].onHand).toBe(25); // prod-1

      act(() => {
        result.current.setSort('onHand', 'desc');
      });

      expect(result.current.filteredProducts[0].onHand).toBe(25);
      expect(result.current.filteredProducts[2].onHand).toBe(0);
    });

    it('sorts by SKU ascending and descending', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setSort('sku', 'desc');
      });

      expect(result.current.filteredProducts[0].sku).toBe('SKU-CCC-003');
      expect(result.current.filteredProducts[2].sku).toBe('SKU-AAA-001');
    });
  });

  describe('Pagination operations', () => {
    it('paginates according to pageSize and currentPage', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.setPageSize(2);
      });

      expect(result.current.totalPages).toBe(2);
      expect(result.current.paginatedProducts.length).toBe(2);

      act(() => {
        result.current.setPage(2);
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.paginatedProducts.length).toBe(1);
    });
  });

  describe('CRUD operations & Validation', () => {
    const validFormData: ProductFormData = {
      sku: 'SKU-NEW-999',
      name: 'Tai nghe Bluetooth Sony WH-1000XM5',
      category: 'Thiết bị & Linh kiện',
      unit: 'Chiếc',
      barcode: '8936009999',
      imageUrl: '',
      description: 'Chống ồn chủ động cao cấp',
      reorderLevel: 5,
      initialStock: 12,
      primaryWarehouse: 'WH-HN-01',
      status: 'active',
    };

    it('rejects adding product with empty or invalid name (< 3 chars)', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      let res: ReturnType<typeof result.current.addProduct> = { success: false };
      act(() => {
        res = result.current.addProduct({
          ...validFormData,
          name: 'ab',
        });
      });

      expect(res.success).toBe(false);
      expect(res.errors?.name).toBeDefined();
    });

    it('rejects adding product with duplicate SKU', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      let res: ReturnType<typeof result.current.addProduct> = { success: false };
      act(() => {
        res = result.current.addProduct({
          ...validFormData,
          sku: 'SKU-AAA-001', // Already exists in mockTestProducts
        });
      });

      expect(res.success).toBe(false);
      expect(res.errors?.sku).toContain('đã tồn tại');
    });

    it('rejects negative reorder level or initial stock', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      let res: ReturnType<typeof result.current.addProduct> = { success: false };
      act(() => {
        res = result.current.addProduct({
          ...validFormData,
          reorderLevel: -5,
          initialStock: -1,
        });
      });

      expect(res.success).toBe(false);
      expect(res.errors?.reorderLevel).toBeDefined();
      expect(res.errors?.initialStock).toBeDefined();
    });

    it('successfully adds new product and prepends to list', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      let res: ReturnType<typeof result.current.addProduct> = { success: false };
      act(() => {
        res = result.current.addProduct(validFormData);
      });

      expect(res.success).toBe(true);
      expect(res.product?.sku).toBe('SKU-NEW-999');
      expect(result.current.products.length).toBe(4);
      expect(result.current.products[0].sku).toBe('SKU-NEW-999');
      expect(result.current.products[0].onHand).toBe(12);
    });

    it('allows updating product with same SKU', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      let res: ReturnType<typeof result.current.updateProduct> = { success: false };
      act(() => {
        res = result.current.updateProduct('prod-1', {
          ...validFormData,
          sku: 'SKU-AAA-001', // Same SKU as prod-1 itself
          name: 'Bàn phím cơ DareU Cập nhật V2',
        });
      });

      expect(res.success).toBe(true);
      expect(res.product?.name).toBe('Bàn phím cơ DareU Cập nhật V2');
    });

    it('rejects updating product to an existing SKU of another product', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      let res: ReturnType<typeof result.current.updateProduct> = { success: false };
      act(() => {
        res = result.current.updateProduct('prod-1', {
          ...validFormData,
          sku: 'SKU-BBB-002', // Belongs to prod-2
        });
      });

      expect(res.success).toBe(false);
      expect(res.errors?.sku).toContain('đã tồn tại');
    });

    it('deletes product by ID correctly', () => {
      const { result } = renderHook(() => useProducts(mockTestProducts));

      act(() => {
        result.current.deleteProduct('prod-1');
      });

      expect(result.current.products.length).toBe(2);
      expect(result.current.products.find((p) => p.id === 'prod-1')).toBeUndefined();
    });
  });
});
