import React, { useState } from 'react';
import { Plus, Package, AlertTriangle, Boxes, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Alert } from '../design-system';
import {
  useProducts,
  ProductFilters,
  ProductTable,
  ProductFormModal,
  ProductDetailModal,
  ProductDeleteModal,
  type Product,
  type ProductFormData,
} from '../features/products';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const ProductsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const canEditCatalog = capabilities.canManageCatalog;

  const {
    products,
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
  } = useProducts();

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // KPI Calculations
  const totalCatalogCount = products.length;
  const activeCount = products.filter((p) => p.status === 'active').length;
  const lowStockCount = products.filter((p) => p.onHand <= p.reorderLevel).length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.onHand, 0);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setSelectedProduct(prod);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleOpenDetail = (prod: Product) => {
    setSelectedProduct(prod);
    setDetailOpen(true);
  };

  const handleOpenDelete = (prod: Product) => {
    setSelectedProduct(prod);
    setDeleteOpen(true);
  };

  const handleFormSubmit = (formData: ProductFormData) => {
    if (formMode === 'create') {
      const res = addProduct(formData);
      if (res.success) {
        showToast(`Đã thêm mới thành công sản phẩm ${formData.name} (SKU: ${formData.sku})!`);
      }
      return res;
    } else if (selectedProduct) {
      const res = updateProduct(selectedProduct.id, formData);
      if (res.success) {
        showToast(`Đã cập nhật thông tin sản phẩm SKU ${formData.sku}!`);
      }
      return res;
    }
    return { success: false };
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      showToast(`Đã xóa sản phẩm ${selectedProduct.name} khỏi danh mục kho.`);
      setDeleteOpen(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('pages.productsTitle')}
        description={t('pages.productsDesc')}
        actions={
          canEditCatalog ? (
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreate}
              id="btn-add-product"
            >
              {language === 'vi' ? 'Thêm sản phẩm mới' : 'Add New Product'}
            </Button>
          ) : undefined
        }
      />

      {!canEditCatalog && <RoleScopeNotice role={activeRole} context="catalog" />}

      {/* Success Feedback Alert */}
      {toastMessage && (
        <Alert
          variant="success"
          title="Thao tác thành công"
          message={toastMessage}
          dismissible
          onDismiss={() => setToastMessage(null)}
        />
      )}

      {/* Quick KPIs Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#64748B] block font-medium">Tổng số mặt hàng</span>
            <span className="font-mono text-lg font-bold text-[#0F172A]">{totalCatalogCount} SKUs</span>
          </div>
        </div>

        <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#64748B] block font-medium">Đang kinh doanh</span>
            <span className="font-mono text-lg font-bold text-emerald-700">{activeCount} mặt hàng</span>
          </div>
        </div>

        <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#64748B] block font-medium">Cảnh báo tồn thấp</span>
            <span className="font-mono text-lg font-bold text-amber-600">{lowStockCount} mặt hàng</span>
          </div>
        </div>

        <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#64748B] block font-medium">Tổng tồn khả dụng</span>
            <span className="font-mono text-lg font-bold text-purple-700">{totalStockUnits.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Table Card with Search & Filters */}
      <Card padding="md" className="space-y-4">
        <ProductFilters
          filters={filters}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onStatusChange={setStatus}
          onWarehouseChange={setWarehouse}
          onReset={resetFilters}
          totalFiltered={totalItems}
          totalProducts={products.length}
        />

        <ProductTable
          products={paginatedProducts}
          totalItems={totalItems}
          totalPages={totalPages}
          currentPage={currentPage}
          pageSize={filters.pageSize}
          sortBy={filters.sortBy}
          sortDir={filters.sortDir}
          onSort={(key) => setSort(key)}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onView={handleOpenDetail}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          canMutate={canEditCatalog}
        />
      </Card>

      {/* Modals */}
      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialProduct={selectedProduct}
        mode={formMode}
      />

      <ProductDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        product={selectedProduct}
        onEdit={handleOpenEdit}
        canEdit={canEditCatalog}
      />

      <ProductDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        product={selectedProduct}
      />
    </div>
  );
};
