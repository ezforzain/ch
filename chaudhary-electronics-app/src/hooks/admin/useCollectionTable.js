import { useCallback, useMemo, useState } from 'react';

const PAGE_SIZE = 8;

const initialState = {
  search: '',
  sortKey: null,
  sortDir: 'asc',
  pageNum: 1,
  statusFilter: 'all',
  categoryFilter: 'all',
  selected: [],
  showArchived: false,
};

/**
 * Reusable search/filter/sort/pagination/bulk-select logic for
 * CollectionTable — mirrors source's getTableState/patchTableState/
 * filteredSortedRows/buildActiveTable (the data-shaping half; markup lives
 * in the component). Table UI state resets whenever `schema` changes (i.e.
 * when navigating to a different collection page), matching source's
 * per-page `state.table[page]` bucket behavior from the user's perspective.
 */
export function useCollectionTable(schema, rows) {
  const [state, setState] = useState(initialState);

  const patch = useCallback((p) => setState((s) => ({ ...s, ...p })), []);

  const statusCol = useMemo(() => schema.columns.find((c) => c.type === 'status') || null, [schema]);

  const statusOptions = useMemo(() => {
    if (!statusCol) return null;
    return ['all', ...new Set(rows.map((r) => r[statusCol.key]).filter(Boolean))];
  }, [rows, statusCol]);

  const categoryOptions = useMemo(() => {
    if (!schema.categoryFilterKey) return null;
    return ['all', ...new Set(rows.map((r) => r[schema.categoryFilterKey]).filter(Boolean))];
  }, [rows, schema.categoryFilterKey]);

  const filteredRows = useMemo(() => {
    let out = rows.filter((r) => (state.showArchived ? true : !r.archived));
    if (state.search) {
      const q = state.search.toLowerCase();
      out = out.filter((r) => schema.columns.some((c) => String(r[c.key] || '').toLowerCase().includes(q)));
    }
    if (state.statusFilter && state.statusFilter !== 'all' && statusCol) {
      out = out.filter((r) => r[statusCol.key] === state.statusFilter);
    }
    if (schema.categoryFilterKey && state.categoryFilter && state.categoryFilter !== 'all') {
      out = out.filter((r) => r[schema.categoryFilterKey] === state.categoryFilter);
    }
    if (state.sortKey) {
      out = out.slice().sort((a, b) => {
        const av = String(a[state.sortKey] || '');
        const bv = String(b[state.sortKey] || '');
        return state.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return out;
  }, [rows, schema, state.showArchived, state.search, state.statusFilter, state.categoryFilter, state.sortKey, state.sortDir, statusCol]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageNum = Math.min(state.pageNum || 1, totalPages);
  const pageRows = filteredRows.slice((pageNum - 1) * PAGE_SIZE, (pageNum - 1) * PAGE_SIZE + PAGE_SIZE);
  const ids = pageRows.map((r) => r.id);
  const allSelected = ids.length > 0 && ids.every((id) => state.selected.includes(id));

  const onSearch = useCallback((e) => patch({ search: e.target.value, pageNum: 1 }), [patch]);
  const onStatusFilter = useCallback((e) => patch({ statusFilter: e.target.value, pageNum: 1 }), [patch]);
  const onCategoryFilter = useCallback((e) => patch({ categoryFilter: e.target.value, pageNum: 1 }), [patch]);
  const toggleArchived = useCallback(() => patch({ showArchived: !state.showArchived, pageNum: 1 }), [patch, state.showArchived]);
  const setSort = useCallback(
    (key) => setState((s) => ({ ...s, sortKey: key, sortDir: s.sortKey === key && s.sortDir === 'asc' ? 'desc' : 'asc' })),
    [],
  );
  const toggleSelect = useCallback(
    (id) => setState((s) => ({ ...s, selected: s.selected.includes(id) ? s.selected.filter((x) => x !== id) : [...s.selected, id] })),
    [],
  );
  const toggleSelectAll = useCallback(() => {
    setState((s) => {
      const all = ids.every((id) => s.selected.includes(id));
      return { ...s, selected: all ? [] : ids };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);
  const clearSelection = useCallback(() => patch({ selected: [] }), [patch]);
  const onPrev = useCallback(() => patch({ pageNum: pageNum - 1 }), [patch, pageNum]);
  const onNext = useCallback(() => patch({ pageNum: pageNum + 1 }), [patch, pageNum]);

  return {
    state,
    patch,
    statusCol,
    statusOptions,
    categoryOptions,
    filteredRows,
    pageRows,
    pageNum,
    totalPages,
    ids,
    allSelected,
    onSearch,
    onStatusFilter,
    onCategoryFilter,
    toggleArchived,
    setSort,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    onPrev,
    onNext,
  };
}
