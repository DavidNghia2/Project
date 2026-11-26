import React, { useState } from 'react';
import {
  Barcode,
  Eye,
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';
import type { Product } from '../types';
import { Badge, Button, Tooltip } from '../../../design-system';

export interface ProductTableProps {
  products: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  sortBy: 'name' | 'sku' | 'onHand';
  sortDir: 'asc' | 'desc';
  onSort: (key: 'name' | 'sku' | 'onHand') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  canMutate?: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  totalItems,
  totalPages,
  currentPage,
  pageSize,
  sortBy,
  sortDir,
  onSort,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onDelete,
  canMutate = true,
}) => {
  const { t, language } = useTranslation();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const renderSortIcon = (columnKey: 'name' | 'sku' | 'onHand') => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
    );
  };

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg shadow-2xs bg-white">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <caption className="sr-only">{t('products.table.caption')}</caption>
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              <th scope="col" className="py-3 px-4 w-14 text-center">
                {t('products.table.colImage')}
              </th>
              <th scope="col" className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => onSort('sku')}
                  className="flex items-center gap-1.5 group font-semibold focus-visible:outline-none focus-visible:text-blue-600 text-left"
                >
                  <span>{t('products.table.colSku')}</span>
                  {renderSortIcon('sku')}
                </button>
              </th>
              <th scope="col" className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => onSort('name')}
                  className="flex items-center gap-1.5 group font-semibold focus-visible:outline-none focus-visible:text-blue-600 text-left"
                >
                  <span>{t('products.table.colName')}</span>
                  {renderSortIcon('name')}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 hidden md:table-cell">
                {t('products.table.colCategory')}
              </th>
              <th scope="col" className="py-3 px-4 hidden sm:table-cell">
                {t('products.table.colUnit')}
              </th>
              <th scope="col" className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => onSort('onHand')}
                  className="flex items-center gap-1.5 group font-semibold focus-visible:outline-none focus-visible:text-blue-600 text-left"
                >
                  <span>{t('products.table.colOnHand')}</span>
                  {renderSortIcon('onHand')}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 hidden lg:table-cell text-center">
                {t('products.table.colReorder')}
              </th>
              <th scope="col" className="py-3 px-4 text-center">
                {t('products.table.colStatus')}
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                {t('products.table.colActions')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Package className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">{t('products.table.emptyTitle')}</p>
                    <p className="text-xs text-slate-400">{t('products.table.emptyDesc')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((item) => {
                const isOutOfStock = item.onHand === 0;
                const isLowStock = item.onHand <= item.reorderLevel;
                const displayCategory = translateDomainLabel(language, 'categories', item.category);
                const displayUnit = translateDomainLabel(language, 'units', item.unit);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/40 transition-colors duration-100 group"
                  >
                    {/* Image Thumbnail */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="w-10 h-10 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden flex items-center justify-center mx-auto shrink-0 shadow-2xs">
                        {item.imageUrl && !imageErrors[item.id] ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            onError={() => handleImageError(item.id)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>

                    {/* SKU & Barcode */}
                    <td className="py-2.5 px-4">
                      <span className="font-mono font-bold text-blue-600 block text-xs">
                        {item.sku}
                      </span>
                      {item.barcode && (
                        <span className="text-[11px] text-[#94A3B8] font-mono flex items-center gap-1 mt-0.5">
                          <Barcode className="w-3 h-3 text-slate-400 shrink-0" />
                          {item.barcode}
                        </span>
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-4 max-w-xs">
                      <button
                        type="button"
                        onClick={() => onView(item)}
                        className="font-medium text-[#0F172A] hover:text-blue-600 text-left line-clamp-2 focus-visible:outline-none focus-visible:underline cursor-pointer"
                        title={item.name}
                      >
                        {item.name}
                      </button>
                      <span className="text-[11px] text-[#64748B] block md:hidden mt-0.5">
                        {displayCategory}
                        <span className="sm:hidden"> • {displayUnit}</span>
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-4 hidden md:table-cell text-xs text-[#475569]">
                      {displayCategory}
                    </td>

                    {/* Unit */}
                    <td className="py-2.5 px-4 hidden sm:table-cell text-xs text-[#64748B]">
                      {displayUnit}
                    </td>

                    {/* On-Hand Stock with warning badge */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isOutOfStock
                              ? 'text-red-600'
                              : isLowStock
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {item.onHand.toLocaleString()}
                        </span>
                        {isOutOfStock ? (
                          <Badge variant="error" size="sm">
                            {t('products.table.badgeOutOfStock')}
                          </Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" size="sm">
                            {t('products.table.badgeLowStock')}
                          </Badge>
                        ) : null}
                      </div>
                      <span className="block lg:hidden text-[11px] font-mono text-[#64748B] mt-0.5 whitespace-nowrap">
                        {t('products.table.colReorder')}: {item.reorderLevel.toLocaleString()}
                      </span>
                    </td>

                    {/* Reorder Level */}
                    <td className="py-2.5 px-4 hidden lg:table-cell text-center font-mono text-xs text-[#64748B]">
                      {item.reorderLevel.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={item.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
                        {item.status === 'active'
                          ? t('products.table.statusActive')
                          : t('products.table.statusInactive')}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Tooltip content={t('products.table.viewTitle')}>
                          <button
                            type="button"
                            onClick={() => onView(item)}
                            className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 p-2 sm:p-1.5 text-[#64748B] hover:text-blue-600 hover:bg-blue-50 active:scale-95 rounded-md transition-[color,background-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
                            aria-label={t('products.table.viewAria', { sku: item.sku })}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        {canMutate && (
                          <>
                            <Tooltip content={t('products.table.editTitle')}>
                              <button
                                type="button"
                                onClick={() => onEdit(item)}
                                className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 p-2 sm:p-1.5 text-[#64748B] hover:text-amber-600 hover:bg-amber-50 active:scale-95 rounded-md transition-[color,background-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
                                aria-label={t('products.table.editAria', { sku: item.sku })}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content={t('products.table.deleteTitle')}>
                              <button
                                type="button"
                                onClick={() => onDelete(item)}
                                className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 p-2 sm:p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 active:scale-95 rounded-md transition-[color,background-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-red-600 outline-none cursor-pointer"
                                aria-label={t('products.table.deleteAria', { sku: item.sku })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 text-xs text-[#64748B] px-1">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <span>
            {t('products.table.showingPrefix')} <strong>{startIndex}</strong> {t('products.table.showingTo')}{' '}
            <strong>{endIndex}</strong> {t('products.table.showingOf')}{' '}
            <strong>{totalItems}</strong> {t('products.table.showingUnit')}
          </span>

          <div className="flex items-center gap-1.5">
            <label htmlFor="pageSizeSelect" className="text-[11px] text-[#94A3B8]">
              {t('products.table.pageSizeLabel')}
            </label>
            <select
              id="pageSizeSelect"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="min-h-11 sm:min-h-0 sm:h-7 px-2 sm:px-1.5 border border-[#CBD5E1] rounded bg-white text-base sm:text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value={5}>{t('products.table.perPageOption', { size: 5 })}</option>
              <option value={10}>{t('products.table.perPageOption', { size: 10 })}</option>
              <option value={20}>{t('products.table.perPageOption', { size: 20 })}</option>
            </select>
          </div>
        </div>

        {/* Page Nav Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            iconLeft={<ChevronLeft className="w-3.5 h-3.5" />}
          >
            {t('products.table.prevBtn')}
          </Button>

          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`
                  min-w-10 min-h-10 sm:min-w-7 sm:min-h-7 w-10 h-10 sm:w-7 sm:h-7 rounded text-xs font-medium transition-colors cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
                  ${
                    currentPage === p
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-[#475569] hover:bg-[#F1F5F9]'
                  }
                `}
                aria-current={currentPage === p ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            iconRight={<ChevronRight className="w-3.5 h-3.5" />}
          >
            {t('products.table.nextBtn')}
          </Button>
        </div>
      </div>
    </div>
  );
};
