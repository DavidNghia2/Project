import React from 'react';
import { Checkbox } from './Checkbox';
import { Skeleton } from './Loading';
import { EmptyState } from './EmptyState';

export interface Column<T = Record<string, unknown>> {
  key: string;
  label: React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  emptyAction?: React.ReactNode;
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectRow?: (id: string | number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  getRowId?: (record: T, index: number) => string | number;
  caption?: string;
  className?: string;
}

export function Table<T = Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display at this time.',
  emptyAction,
  onSort,
  sortBy,
  sortDir,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  getRowId = (record: T, index: number) => {
    if (record && typeof record === 'object' && 'id' in record) {
      return (record as { id: string | number }).id;
    }
    return index;
  },
  caption,
  className = '',
}: TableProps<T>) {
  const totalRows = data.length;
  const numSelected = selectedRows.length;
  const isAllSelected = totalRows > 0 && numSelected === totalRows;
  const isIndeterminate = numSelected > 0 && numSelected < totalRows;

  const handleHeaderCheckboxChange = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  const handleSortClick = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    const isCurrent = sortBy === column.key;
    const newDir = isCurrent && sortDir === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDir);
  };

  const alignClasses = {
    left: 'text-left justify-start',
    center: 'text-center justify-center',
    right: 'text-right justify-end',
  };

  return (
    <div
      className={`w-full overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm font-sans ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-[#0F172A]" aria-busy={loading}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              {selectable && (
                <th scope="col" className="w-12 px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={handleHeaderCheckboxChange}
                      aria-label="Select all rows"
                    />
                  </div>
                </th>
              )}

              {columns.map((column) => {
                const isSorted = sortBy === column.key;
                const alignment = column.align || 'left';

                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={{ width: column.width }}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#475569] ${
                      column.sortable ? 'cursor-pointer select-none hover:bg-[#F1F5F9]' : ''
                    }`}
                    onClick={() => handleSortClick(column)}
                    aria-sort={
                      isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                  >
                    <div className={`flex items-center gap-1.5 ${alignClasses[alignment]}`}>
                      <span>{column.label}</span>
                      {column.sortable && (
                        <span className="inline-flex text-[#94A3B8]">
                          {isSorted ? (
                            sortDir === 'asc' ? (
                              <svg className="w-3.5 h-3.5 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            )
                          ) : (
                            <svg className="w-3.5 h-3.5 opacity-40 hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              // 5 Skeleton rows with pulse
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skeleton-row-${rIdx}`} className="bg-white">
                  {selectable && (
                    <td className="w-12 px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center">
                        <Skeleton width={16} height={16} rounded="sm" />
                      </div>
                    </td>
                  )}
                  {columns.map((_, cIdx) => (
                    <td key={`skeleton-col-${cIdx}`} className="px-4 py-3.5">
                      <Skeleton
                        height={16}
                        width={cIdx === 0 ? '60%' : cIdx === columns.length - 1 ? '40%' : '80%'}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-8 text-center"
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((record, index) => {
                const rowId = getRowId(record, index);
                const isSelected = selectedRows.includes(rowId);
                const isEven = index % 2 === 1;

                return (
                  <tr
                    key={String(rowId)}
                    className={`
                      transition-colors duration-100
                      ${
                        isSelected
                          ? 'bg-[#EFF6FF]'
                          : isEven
                          ? 'bg-[#F8FAFC]'
                          : 'bg-white'
                      }
                      hover:bg-[#EFF6FF]/60
                    `}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3 text-center align-middle">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isSelected}
                            onChange={(checked) => onSelectRow?.(rowId, checked)}
                            aria-label={`Select row ${index + 1}`}
                          />
                        </div>
                      </td>
                    )}

                    {columns.map((column) => {
                      const alignment = column.align || 'left';
                      const rawValue =
                        record && typeof record === 'object'
                          ? (record as Record<string, unknown>)[column.key]
                          : undefined;

                      const renderedContent = column.render
                        ? column.render(rawValue, record, index)
                        : (rawValue as React.ReactNode);

                      return (
                        <td
                          key={column.key}
                          className={`px-4 py-3 text-sm text-[#0F172A] align-middle ${alignClasses[alignment]}`}
                        >
                          {renderedContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
