import { useState, useMemo, useCallback } from 'react';
import { translateKey } from '../../i18n/translate';
import { useHookLanguage } from '../../i18n/useTranslation';
import type { Product, ProductFormData, ProductFilterState, ValidationErrors } from './types';
import { INITIAL_PRODUCTS, WAREHOUSES_LIST } from './mockData';

export function useProducts(initialList: Product[] = INITIAL_PRODUCTS) {
  const language = useHookLanguage('vi');
  const [products, setProducts] = useState<Product[]>(initialList);
  const [filters, setFilters] = useState<ProductFilterState>({
    search: '',
    category: 'ALL',
    status: 'ALL',
    warehouse: 'ALL',
    sortBy: 'name',
    sortDir: 'asc',
    page: 1,
    pageSize: 5,
  });

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.search.trim()) {
        const query = filters.search.trim().toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesBarcode = p.barcode ? p.barcode.includes(query) : false;
        if (!matchesName && !matchesSku && !matchesBarcode) {
          return false;
        }
      }

      if (filters.category !== 'ALL' && p.category !== filters.category) {
        return false;
      }

      if (filters.status !== 'ALL' && p.status !== filters.status) {
        return false;
      }

      if (filters.warehouse !== 'ALL') {
        const whStock = p.warehouses.find((w) => w.warehouseCode === filters.warehouse);
        if (!whStock || whStock.quantity <= 0) {
          return false;
        }
      }

      return true;
    });
  }, [products, filters.search, filters.category, filters.status, filters.warehouse]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
      } else if (filters.sortBy === 'sku') {
        comparison = a.sku.localeCompare(b.sku, 'en', { sensitivity: 'base' });
      } else if (filters.sortBy === 'onHand') {
        comparison = a.onHand - b.onHand;
      }
      return filters.sortDir === 'desc' ? -comparison : comparison;
    });
  }, [filteredProducts, filters.sortBy, filters.sortDir]);

  // Pagination Logic
  const totalItems = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));
  const currentPage = Math.min(Math.max(1, filters.page), totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * filters.pageSize;
    return sortedProducts.slice(startIndex, startIndex + filters.pageSize);
  }, [sortedProducts, currentPage, filters.pageSize]);

  // Validation function
  const validate = useCallback(
    (formData: ProductFormData, currentId?: string): ValidationErrors => {
      const errors: ValidationErrors = {};

      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        errors.name = translateKey(language, 'products.validation.nameRequired');
      } else if (trimmedName.length < 3) {
        errors.name = translateKey(language, 'products.validation.nameMin');
      }

      const trimmedSku = formData.sku.trim().toUpperCase();
      if (!trimmedSku) {
        errors.sku = translateKey(language, 'products.validation.skuRequired');
      } else if (trimmedSku.length < 3) {
        errors.sku = translateKey(language, 'products.validation.skuMin');
      } else {
        const duplicate = products.find(
          (p) => p.sku.toUpperCase() === trimmedSku && p.id !== currentId
        );
        if (duplicate) {
          errors.sku = translateKey(language, 'products.validation.skuDuplicate', {
            sku: trimmedSku,
          });
        }
      }

      if (!formData.category || formData.category === 'ALL') {
        errors.category = translateKey(language, 'products.validation.categoryRequired');
      }

      if (!formData.unit) {
        errors.unit = translateKey(language, 'products.validation.unitRequired');
      }

      if (formData.reorderLevel === undefined || formData.reorderLevel < 0 || isNaN(formData.reorderLevel)) {
        errors.reorderLevel = translateKey(language, 'products.validation.reorderInvalid');
      }

      if (formData.initialStock === undefined || formData.initialStock < 0 || isNaN(formData.initialStock)) {
        errors.initialStock = translateKey(language, 'products.validation.initialStockInvalid');
      }

      if (!currentId && (!formData.primaryWarehouse || formData.primaryWarehouse === 'ALL')) {
        errors.primaryWarehouse = translateKey(language, 'products.validation.warehouseRequired');
      }

      return errors;
    },
    [products, language]
  );

  // CRUD: Add Product
  const addProduct = useCallback(
    (formData: ProductFormData): { success: boolean; errors?: ValidationErrors; product?: Product } => {
      const validationErrors = validate(formData);
      if (Object.keys(validationErrors).length > 0) {
        return { success: false, errors: validationErrors };
      }

      const newId = `prod-${Date.now()}`;

      const warehouses: Product['warehouses'] = WAREHOUSES_LIST.map((w) => ({
        warehouseCode: w.code,
        warehouseName: w.name,
        quantity: w.code === formData.primaryWarehouse ? Number(formData.initialStock) : 0,
      }));

      const newProduct: Product = {
        id: newId,
        sku: formData.sku.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        unit: formData.unit,
        barcode: formData.barcode.trim() || `893${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        imageUrl: formData.imageUrl.trim() || undefined,
        description: formData.description.trim() || undefined,
        reorderLevel: Number(formData.reorderLevel),
        onHand: Number(formData.initialStock),
        status: formData.status,
        warehouses,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProducts((prev) => [newProduct, ...prev]);
      return { success: true, product: newProduct };
    },
    [validate]
  );

  // CRUD: Update Product
  const updateProduct = useCallback(
    (
      id: string,
      formData: ProductFormData
    ): { success: boolean; errors?: ValidationErrors; product?: Product } => {
      const validationErrors = validate(formData, id);
      if (Object.keys(validationErrors).length > 0) {
        return { success: false, errors: validationErrors };
      }

      let updatedRecord: Product | undefined;

      setProducts((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;

          updatedRecord = {
            ...item,
            sku: formData.sku.trim().toUpperCase(),
            name: formData.name.trim(),
            category: formData.category,
            unit: formData.unit,
            barcode: formData.barcode.trim() || item.barcode,
            imageUrl: formData.imageUrl.trim() || item.imageUrl,
            description: formData.description.trim() || item.description,
            reorderLevel: Number(formData.reorderLevel),
            status: formData.status,
            updatedAt: new Date().toISOString(),
          };
          return updatedRecord;
        })
      );

      return { success: true, product: updatedRecord };
    },
    [validate]
  );

  // CRUD: Delete Product
  const deleteProduct = useCallback((id: string): { success: boolean } => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    return { success: true };
  }, []);

  // Filter / Sort / Page Setters
  const setSearch = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, search: term, page: 1 }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category, page: 1 }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setWarehouse = useCallback((warehouse: string) => {
    setFilters((prev) => ({ ...prev, warehouse, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: 'name' | 'sku' | 'onHand', sortDir?: 'asc' | 'desc') => {
    setFilters((prev) => {
      const nextDir = sortDir ?? (prev.sortBy === sortBy && prev.sortDir === 'asc' ? 'desc' : 'asc');
      return { ...prev, sortBy, sortDir: nextDir };
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'ALL',
      status: 'ALL',
      warehouse: 'ALL',
      sortBy: 'name',
      sortDir: 'asc',
      page: 1,
      pageSize: 5,
    });
  }, []);

  return {
    products,
    filteredProducts: sortedProducts,
    paginatedProducts,
    totalItems,
    totalPages,
    currentPage,
    filters,
    setSearch,
    setCategory,
    setStatus,
    setWarehouse,
    setSort,
    setPage,
    setPageSize,
    resetFilters,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
