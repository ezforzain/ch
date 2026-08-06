import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

async function urlToFile(url, filename) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

/**
 * Generic REST-backed adapter matching the exact shape CollectionTable expects from its
 * `admin` prop (see src/hooks/admin/useAdminData.js and src/context/ProductsContext.jsx,
 * which this generalizes). One hook call per admin module wires that module's page to a
 * real backend endpoint instead of the shared mock localStorage store — search/filter/
 * sort/pagination stay entirely client-side in useCollectionTable, unaffected.
 *
 * @param page          the schema/page key, e.g. 'leads' — becomes the `data[page]` key
 * @param endpoint       API path, e.g. '/leads'
 * @param mapFromApi    backend doc -> frontend row (must include `id` and whatever
 *                       schema.columns/fields reference)
 * @param mapToApi       frontend draft -> backend create/update payload (plain object)
 * @param imageFields   [{ formField, draftKey }] — draftKey holds a dataURL/URL string
 *                       (or array of them) from RecordModal's file/multifile inputs;
 *                       omit entirely for modules with no image field
 * @param archiveToApi   (nextArchived: boolean) -> partial backend payload, or omit if
 *                       the module has no archive concept
 * @param statusToApi    (status: string) -> partial backend payload, for bulk-status
 */
export function useApiCollection({
  page,
  endpoint,
  mapFromApi,
  mapToApi = (draft) => draft,
  imageFields = [],
  archiveToApi = null,
  statusToApi = null,
  sort = '-createdAt',
}) {
  const showToast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${endpoint}?limit=200&sort=${sort}`);
      setRows(res.data.map(mapFromApi));
    } catch (err) {
      console.error(`Failed to load ${endpoint}:`, err);
      showToast('Could not load data from the server — is the backend running?');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const buildPayload = useCallback(
    async (draft) => {
      const mapped = mapToApi(draft);
      if (!imageFields.length) return { body: mapped, isForm: false };

      const fd = new FormData();
      Object.entries(mapped).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
      });
      for (const { formField, draftKey } of imageFields) {
        const val = draft[draftKey];
        if (!val) continue;
        if (Array.isArray(val)) {
          const files = await Promise.all(val.map((u, i) => urlToFile(u, `${formField}-${i}.jpg`)));
          files.forEach((f) => fd.append(formField, f));
        } else if (typeof val === 'string') {
          fd.append(formField, await urlToFile(val, `${formField}.jpg`));
        }
      }
      return { body: fd, isForm: true };
    },
    [mapToApi, imageFields],
  );

  const addRecord = useCallback(
    async (_p, draft) => {
      try {
        const { body, isForm } = await buildPayload(draft);
        const res = await api.post(endpoint, body, { isForm });
        setRows((r) => [mapFromApi(res.data), ...r]);
        return mapFromApi(res.data);
      } catch (err) {
        showToast(err.message || 'Could not create record.');
        return null;
      }
    },
    [buildPayload, endpoint, mapFromApi, showToast],
  );

  const editRecord = useCallback(
    async (_p, draft) => {
      try {
        const { body, isForm } = await buildPayload(draft);
        const res = await api.patch(`${endpoint}/${draft.id}`, body, { isForm });
        const updated = mapFromApi(res.data);
        setRows((r) => r.map((row) => (row.id === draft.id ? updated : row)));
        return updated;
      } catch (err) {
        showToast(err.message || 'Could not update record.');
        return null;
      }
    },
    [buildPayload, endpoint, mapFromApi, showToast],
  );

  const deleteRecord = useCallback(
    async (_p, id) => {
      try {
        await api.delete(`${endpoint}/${id}`);
        setRows((r) => r.filter((row) => row.id !== id));
      } catch (err) {
        showToast(err.message || 'Could not delete record.');
      }
    },
    [endpoint, showToast],
  );

  const duplicateRecord = useCallback(
    async (p, row) => {
      const { id: _id, createdDate: _cd, ...rest } = row;
      const titleKey = ['name', 'title', 'question'].find((k) => rest[k] !== undefined) || 'name';
      await addRecord(p, { ...rest, [titleKey]: `${rest[titleKey] || ''} (Copy)` });
    },
    [addRecord],
  );

  const archiveRecord = useCallback(
    async (_p, row) => {
      if (!archiveToApi) return;
      try {
        const res = await api.patch(`${endpoint}/${row.id}`, archiveToApi(!row.archived));
        setRows((r) => r.map((x) => (x.id === row.id ? mapFromApi(res.data) : x)));
      } catch (err) {
        showToast(err.message || 'Could not update record.');
      }
    },
    [archiveToApi, endpoint, mapFromApi, showToast],
  );

  const bulkDelete = useCallback(
    async (_p, ids) => {
      await Promise.all(ids.map((id) => api.delete(`${endpoint}/${id}`).catch(() => null)));
      setRows((r) => r.filter((row) => !ids.includes(row.id)));
    },
    [endpoint],
  );

  const bulkArchive = useCallback(
    async (_p, ids, archived) => {
      if (!archiveToApi) return;
      await Promise.all(ids.map((id) => api.patch(`${endpoint}/${id}`, archiveToApi(archived)).catch(() => null)));
      await load();
    },
    [archiveToApi, endpoint, load],
  );

  const bulkSetStatus = useCallback(
    async (_p, ids, status) => {
      if (!statusToApi) return;
      await Promise.all(ids.map((id) => api.patch(`${endpoint}/${id}`, statusToApi(status)).catch(() => null)));
      await load();
    },
    [statusToApi, endpoint, load],
  );

  return useMemo(
    () => ({
      data: { [page]: rows },
      loading,
      addRecord,
      editRecord,
      deleteRecord,
      duplicateRecord,
      archiveRecord,
      bulkDelete,
      bulkArchive,
      bulkSetStatus,
      refetch: load,
    }),
    [page, rows, loading, addRecord, editRecord, deleteRecord, duplicateRecord, archiveRecord, bulkDelete, bulkArchive, bulkSetStatus, load],
  );
}
