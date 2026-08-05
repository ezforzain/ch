import { useCallback, useEffect, useState } from 'react';
import { seedData } from '../../data/admin/seedData';
import { schemas } from '../../data/admin/schemas';
import { ADMIN_DATA_KEY } from '../../data/admin/theme';
import { useToast } from '../../context/ToastContext';

// Mirrors source's `loadData()`: seed merged with whatever is saved,
// saved keys win over seed keys.
function loadInitial() {
  const seed = seedData();
  try {
    const raw = localStorage.getItem(ADMIN_DATA_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return seed;
    return { ...seed, ...parsed };
  } catch {
    return seed;
  }
}

/**
 * Central admin data store. Loads seedData() merged with localStorage,
 * persists on every change, syncs across tabs via the `storage` event, and
 * exposes generic CRUD helpers that operate on any collection key — mirrors
 * source's data-mutation methods (commitModal/deleteRow/bulkDelete/
 * bulkArchive/archiveRow/duplicateRow/bulkSetStatus) 1:1.
 */
export function useAdminData() {
  const [data, setData] = useState(loadInitial);
  const showToast = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(data));
    } catch (err) {
      // Previously silently swallowed — that hid write failures (e.g. quota
      // exceeded) entirely, making changes look saved when they weren't
      // actually persisted. Surface it instead.
      console.error('Failed to save admin data to Local Storage:', err);
      showToast('Could not save changes locally. Storage may be full.');
    }
  }, [data, showToast]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key !== ADMIN_DATA_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        setData((d) => ({ ...d, ...parsed }));
      } catch {
        /* ignore malformed cross-tab payload */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addRecord = useCallback((page, draft) => {
    setData((s) => {
      const schema = schemas[page];
      const rows = s[page].slice();
      const id = schema?.idPrefix ? schema.idPrefix + (2290 + rows.length + 1) : 'R' + Date.now().toString(36);
      rows.push({ id, archived: false, createdDate: new Date().toISOString().slice(0, 10), ...draft });
      return { ...s, [page]: rows };
    });
  }, []);

  const editRecord = useCallback((page, draft) => {
    setData((s) => {
      const rows = s[page].slice();
      const idx = rows.findIndex((r) => r.id === draft.id);
      if (idx > -1) rows[idx] = { ...rows[idx], ...draft };
      return { ...s, [page]: rows };
    });
  }, []);

  const deleteRecord = useCallback((page, id) => {
    setData((s) => ({ ...s, [page]: s[page].filter((r) => r.id !== id) }));
  }, []);

  const bulkDelete = useCallback((page, ids) => {
    setData((s) => ({ ...s, [page]: s[page].filter((r) => !ids.includes(r.id)) }));
  }, []);

  const bulkArchive = useCallback((page, ids, archived) => {
    setData((s) => ({ ...s, [page]: s[page].map((r) => (ids.includes(r.id) ? { ...r, archived } : r)) }));
  }, []);

  const archiveRecord = useCallback((page, row) => {
    setData((s) => ({ ...s, [page]: s[page].map((r) => (r.id === row.id ? { ...r, archived: !r.archived } : r)) }));
  }, []);

  const duplicateRecord = useCallback((page, row) => {
    setData((s) => {
      const schema = schemas[page];
      const titleKey = schema?.fields?.[0] ? schema.fields[0].key : 'name';
      const copy = { ...row, id: 'R' + Date.now().toString(36), [titleKey]: (row[titleKey] || '') + ' (Copy)' };
      return { ...s, [page]: [...s[page], copy] };
    });
  }, []);

  const bulkSetStatus = useCallback((page, ids, status) => {
    setData((s) => ({ ...s, [page]: s[page].map((r) => (ids.includes(r.id) ? { ...r, status } : r)) }));
  }, []);

  // --- gallery-specific helpers (source's toggleGalleryFiles/replaceGalleryItem/deleteGalleryItem/reorderGallery) ---
  const addGalleryImages = useCallback((dataUrls) => {
    const items = dataUrls.map((url, i) => ({ id: 'G' + Date.now() + i, url }));
    setData((s) => ({ ...s, gallery: [...s.gallery, ...items] }));
    return items.length;
  }, []);

  const replaceGalleryItem = useCallback((id, url) => {
    setData((s) => ({ ...s, gallery: s.gallery.map((g) => (g.id === id ? { ...g, url } : g)) }));
  }, []);

  const deleteGalleryItem = useCallback((id) => {
    setData((s) => ({ ...s, gallery: s.gallery.filter((g) => g.id !== id) }));
  }, []);

  const reorderGallery = useCallback((fromId, toId) => {
    setData((s) => {
      const items = s.gallery.slice();
      const fromIdx = items.findIndex((g) => g.id === fromId);
      const toIdx = items.findIndex((g) => g.id === toId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return s;
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      return { ...s, gallery: items };
    });
  }, []);

  const restoreAll = useCallback((newData) => {
    setData(newData);
  }, []);

  return {
    data,
    setData,
    addRecord,
    editRecord,
    deleteRecord,
    bulkDelete,
    bulkArchive,
    archiveRecord,
    duplicateRecord,
    bulkSetStatus,
    addGalleryImages,
    replaceGalleryItem,
    deleteGalleryItem,
    reorderGallery,
    restoreAll,
  };
}
