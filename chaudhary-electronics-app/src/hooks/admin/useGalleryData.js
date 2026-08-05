import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { api, resolveImageUrl } from '../../lib/api';

async function dataUrlToFile(dataUrl, filename) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

function mapFromApi(doc) {
  return { id: doc._id, url: resolveImageUrl(doc.image?.url), sortOrder: doc.sortOrder ?? 0 };
}

/** Real-backend equivalent of useAdminData's gallery slice — same {id,url} item shape and
 * same method names (addGalleryImages/replaceGalleryItem/deleteGalleryItem/reorderGallery),
 * so Gallery.jsx's drag-and-drop UI needs no changes, only its data source does. */
export function useGalleryData() {
  const showToast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/gallery?limit=200&sort=sortOrder');
      setItems(res.data.map(mapFromApi));
    } catch (err) {
      console.error('Failed to load gallery:', err);
      showToast('Could not load gallery from the server.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const addGalleryImages = useCallback(
    async (dataUrls) => {
      let ok = 0;
      for (let i = 0; i < dataUrls.length; i++) {
        try {
          const file = await dataUrlToFile(dataUrls[i], `gallery-${Date.now()}-${i}.jpg`);
          const fd = new FormData();
          fd.append('image', file);
          const res = await api.post('/gallery', fd, { isForm: true });
          setItems((prev) => [...prev, mapFromApi(res.data)]);
          ok++;
        } catch (err) {
          showToast(err.message || 'One image failed to upload.');
        }
      }
      return ok;
    },
    [showToast],
  );

  const replaceGalleryItem = useCallback(
    async (id, dataUrl) => {
      try {
        const file = await dataUrlToFile(dataUrl, `gallery-${id}.jpg`);
        const fd = new FormData();
        fd.append('image', file);
        const res = await api.patch(`/gallery/${id}`, fd, { isForm: true });
        setItems((prev) => prev.map((g) => (g.id === id ? mapFromApi(res.data) : g)));
      } catch (err) {
        showToast(err.message || 'Could not replace image.');
      }
    },
    [showToast],
  );

  const deleteGalleryItem = useCallback(
    async (id) => {
      try {
        await api.delete(`/gallery/${id}`);
        setItems((prev) => prev.filter((g) => g.id !== id));
      } catch (err) {
        showToast(err.message || 'Could not delete image.');
      }
    },
    [showToast],
  );

  const reorderGallery = useCallback((fromId, toId) => {
    setItems((prev) => {
      const arr = prev.slice();
      const fromIdx = arr.findIndex((g) => g.id === fromId);
      const toIdx = arr.findIndex((g) => g.id === toId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prev;
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      // Persist the new order (fire-and-forget — the local reorder above already reflects
      // the intended state regardless of these individual requests' timing).
      arr.forEach((g, i) => {
        if (g.sortOrder !== i) api.patch(`/gallery/${g.id}`, { sortOrder: i }).catch(() => {});
      });
      return arr.map((g, i) => ({ ...g, sortOrder: i }));
    });
  }, []);

  return { data: { gallery: items }, loading, addGalleryImages, replaceGalleryItem, deleteGalleryItem, reorderGallery };
}
