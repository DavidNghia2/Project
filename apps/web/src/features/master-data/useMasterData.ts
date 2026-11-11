import { useState, useMemo, useCallback } from 'react';
import type {
  MasterStatus,
  ProductReferenceSummary,
  ValidationErrors,
} from './types';

export interface BaseMasterItem {
  id: string;
  code: string;
  name: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UseMasterDataConfig<TItem extends BaseMasterItem, TForm> {
  initialItems: TItem[];
  idPrefix: string;
  validate: (form: TForm, existing: TItem[], currentId?: string) => ValidationErrors;
  mapFormToCreate: (form: TForm, id: string, now: string) => TItem;
  mapFormToUpdate: (existing: TItem, form: TForm, now: string) => TItem;
  matchesSearch: (item: TItem, normalizedQuery: string) => boolean;
  matchesSecondaryFilter?: (item: TItem, secondaryFilter: string) => boolean;
  getReferences?: (item: TItem) => ProductReferenceSummary[];
}

export interface CrudResult<TItem> {
  success: boolean;
  errors?: ValidationErrors;
  item?: TItem;
}

export interface DeleteResult {
  success: boolean;
  blockedByReferences?: boolean;
  references?: ProductReferenceSummary[];
}

export function useMasterData<TItem extends BaseMasterItem, TForm>({
  initialItems,
  idPrefix,
  validate,
  mapFormToCreate,
  mapFormToUpdate,
  matchesSearch,
  matchesSecondaryFilter,
  getReferences,
}: UseMasterDataConfig<TItem, TForm>) {
  const [items, setItems] = useState<TItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [secondaryFilter, setSecondaryFilter] = useState<string>('ALL');

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (query && !matchesSearch(item, query)) {
        return false;
      }
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      if (
        secondaryFilter !== 'ALL' &&
        matchesSecondaryFilter &&
        !matchesSecondaryFilter(item, secondaryFilter)
      ) {
        return false;
      }
      return true;
    });
  }, [items, search, statusFilter, secondaryFilter, matchesSearch, matchesSecondaryFilter]);

  const addItem = useCallback(
    (form: TForm): CrudResult<TItem> => {
      const errors = validate(form, items);
      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

      const now = new Date().toISOString();
      const newId = `${idPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newItem = mapFormToCreate(form, newId, now);
      setItems((prev) => [newItem, ...prev]);
      return { success: true, item: newItem };
    },
    [items, idPrefix, validate, mapFormToCreate]
  );

  const updateItem = useCallback(
    (id: string, form: TForm): CrudResult<TItem> => {
      const errors = validate(form, items, id);
      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

      const existing = items.find((item) => item.id === id);
      if (!existing) {
        return { success: false };
      }

      const now = new Date().toISOString();
      const updated = mapFormToUpdate(existing, form, now);

      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));

      return { success: true, item: updated };
    },
    [items, validate, mapFormToUpdate]
  );

  const deleteItem = useCallback(
    (id: string, forceConfirm = false): DeleteResult => {
      const target = items.find((i) => i.id === id);
      if (!target) {
        return { success: false };
      }

      const refs = getReferences ? getReferences(target) : [];
      if (refs.length > 0 && !forceConfirm) {
        return {
          success: false,
          blockedByReferences: true,
          references: refs,
        };
      }

      setItems((prev) => prev.filter((i) => i.id !== id));
      return { success: true };
    },
    [items, getReferences]
  );

  const resetFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('ALL');
    setSecondaryFilter('ALL');
  }, []);

  const isFiltered =
    search.trim() !== '' || statusFilter !== 'ALL' || secondaryFilter !== 'ALL';

  return {
    items,
    filteredItems,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    secondaryFilter,
    setSecondaryFilter,
    isFiltered,
    resetFilters,
    addItem,
    updateItem,
    deleteItem,
    getItemReferences: (item: TItem) => (getReferences ? getReferences(item) : []),
  };
}
