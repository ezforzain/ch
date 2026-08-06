import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from './ToastContext';
import { api, resolveImageUrl } from '../lib/api';

const ProductsContext = createContext(null);

function backendToFrontend(p) {
  const gallery = (p.gallery && p.gallery.length ? p.gallery : p.image ? [p.image] : [])
    .map((g) => resolveImageUrl(g?.url))
    .filter(Boolean);
  return {
    id: p._id,
    name: p.name || 'Untitled product',
    cat: p.category?.name || 'Tools & Accessories',
    price: Number(p.price) || 0,
    unit: p.unit || '',
    note: p.description || '',
    tag: p.tag || '',
    img: resolveImageUrl(p.image?.url) || gallery[0] || '',
    gallery,
    fb: 'electronics,product',
    pop: Number(p.popularity) || 0,
    rating: Number(p.rating) || 0,
    reviews: Number(p.numReviews) || 0,
    stock: Number(p.stock) || 0,
    seller: p.brand || 'Chaudhary Electronics',
    warranty: p.warranty || '',
    specs: p.specs && typeof p.specs === 'object' ? p.specs : {},
    status: p.status === 'active' ? 'Active' : p.status === 'archived' ? 'Draft' : 'Draft',
    archived: p.status === 'archived',
    featured: !!p.isFeatured,
    createdDate: p.createdAt ? p.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
  };
}

// The admin form's Status options ('Active'/'Draft'/'Out of Stock') don't map 1:1 onto the
// backend's status enum ('active'/'draft'/'archived') — "Out of Stock" is really a `stock`
// value of 0 on this backend, not a distinct status, so it folds into 'draft' here.
function frontendStatusToBackend(status) {
  if (status === 'Active') return 'active';
  return 'draft';
}

/** Fetches a data: URL, http(s) URL, or already-resolved local upload URL and turns it back
 * into a File — used so images already in a product's gallery (shown as plain URLs in the
 * admin form) can be resent as real multipart files alongside any newly-picked ones,
 * matching whatever gallery state the admin form ends up with exactly. */
async function urlToFile(url, filename) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

/**
 * The single shared product store — read by the public Marketplace and the Admin Panel's
 * Products page/Dashboard, backed by the real backend (server/) instead of localStorage.
 * A product created/edited/deleted here is immediately correct everywhere else because
 * everything reads from the same `products` state, refetched after every mutation.
 */
export function ProductsProvider({ children }) {
  const showToast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const categoryMapRef = useRef(new Map());

  const loadProducts = useCallback(async () => {
    try {
      const res = await api.get('/products?limit=100&sort=-createdAt');
      setProducts(res.data.map(backendToFrontend));
    } catch (err) {
      console.error('Failed to load products from the API:', err);
      showToast('Could not load products from the server — is the backend running?');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories?limit=100&sort=sortOrder,name');
      const active = res.data.filter((c) => c.isActive !== false);
      categoryMapRef.current = new Map(res.data.map((c) => [c.name, c._id]));
      categoryMapRef.current.set('__first__', res.data[0]?._id);
      setCategories(
        active.map((c) => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          image: resolveImageUrl(c.image?.url),
        })),
      );
    } catch (err) {
      console.error('Failed to load categories from the API:', err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadCategories();
      await loadProducts();
    })();
  }, [loadCategories, loadProducts]);

  const resolveCategoryId = useCallback((catName) => {
    return categoryMapRef.current.get(catName) || categoryMapRef.current.get('__first__') || null;
  }, []);

  const buildFormData = useCallback(
    async (draft) => {
      const fd = new FormData();
      if (draft.name !== undefined) fd.append('name', draft.name);
      if (draft.cat !== undefined) {
        const categoryId = resolveCategoryId(draft.cat);
        // Silently omitting `category` here used to let a stale/unresolvable selection
        // through to the backend, which would then reject the whole request with a bare
        // "Validation failed" — no indication *why*. Fail fast client-side instead, with a
        // message that actually points at the fix (reload categories and retry).
        if (!categoryId) {
          throw new Error('Selected category could not be found. Please refresh the page and try again.');
        }
        fd.append('category', categoryId);
      }
      if (draft.seller !== undefined) fd.append('brand', draft.seller || 'Chaudhary Electronics');
      if (draft.price !== undefined) fd.append('price', String(draft.price).replace(/,/g, ''));
      if (draft.stock !== undefined) fd.append('stock', String(draft.stock).replace(/,/g, ''));
      if (draft.note !== undefined) fd.append('description', draft.note);
      if (draft.status !== undefined) fd.append('status', frontendStatusToBackend(draft.status));
      if (draft.tag) fd.append('tag', draft.tag);
      if (draft.warranty) fd.append('warranty', draft.warranty);
      if (draft.featured !== undefined) fd.append('isFeatured', draft.featured ? 'true' : 'false');

      const galleryEntries = Array.isArray(draft.gallery) && draft.gallery.length ? draft.gallery : draft.img ? [draft.img] : [];
      if (galleryEntries.length) {
        const files = await Promise.all(galleryEntries.map((url, i) => urlToFile(url, `product-${i}.jpg`)));
        fd.append('image', files[0]);
        files.forEach((f) => fd.append('gallery', f));
      }
      return fd;
    },
    [resolveCategoryId],
  );

  const addProduct = useCallback(
    async (draft) => {
      try {
        const fd = await buildFormData({ status: 'Active', ...draft });
        const res = await api.post('/products', fd, { isForm: true });
        const product = backendToFrontend(res.data);
        setProducts((list) => [product, ...list]);
        return { ok: true, data: product };
      } catch (err) {
        const message = err.message || 'Could not create product.';
        if (import.meta.env.DEV) console.error('[ProductsContext] addProduct failed:', err);
        showToast(message);
        return { ok: false, message, status: err.status };
      }
    },
    [buildFormData, showToast],
  );

  const editProduct = useCallback(
    async (id, draft) => {
      try {
        const fd = await buildFormData(draft);
        const res = await api.patch(`/products/${id}`, fd, { isForm: true });
        const product = backendToFrontend(res.data);
        setProducts((list) => list.map((p) => (p.id === id ? product : p)));
        return { ok: true, data: product };
      } catch (err) {
        const message = err.message || 'Could not update product.';
        if (import.meta.env.DEV) console.error('[ProductsContext] editProduct failed:', err);
        showToast(message);
        return { ok: false, message, status: err.status };
      }
    },
    [buildFormData, showToast],
  );

  const deleteProduct = useCallback(
    async (id) => {
      try {
        await api.delete(`/products/${id}`);
        setProducts((list) => list.filter((p) => p.id !== id));
      } catch (err) {
        showToast(err.message || 'Could not delete product.');
      }
    },
    [showToast],
  );

  const duplicateProduct = useCallback(
    async (row) => {
      const { id: _id, createdDate: _createdDate, ...rest } = row;
      return addProduct({ ...rest, name: (row.name || '') + ' (Copy)' });
    },
    [addProduct],
  );

  const archiveProduct = useCallback(
    async (row) => {
      const nextArchived = !row.archived;
      try {
        const res = await api.patch(`/products/${row.id}`, { status: nextArchived ? 'archived' : 'active' });
        const product = backendToFrontend(res.data);
        setProducts((list) => list.map((p) => (p.id === row.id ? product : p)));
      } catch (err) {
        showToast(err.message || 'Could not update product.');
      }
    },
    [showToast],
  );

  const bulkDeleteProducts = useCallback(
    async (ids) => {
      await Promise.all(ids.map((id) => api.delete(`/products/${id}`).catch(() => null)));
      setProducts((list) => list.filter((p) => !ids.includes(p.id)));
    },
    [],
  );

  const bulkArchiveProducts = useCallback(
    async (ids, archived) => {
      const status = archived ? 'archived' : 'active';
      await Promise.all(ids.map((id) => api.patch(`/products/${id}`, { status }).catch(() => null)));
      await loadProducts();
    },
    [loadProducts],
  );

  const bulkSetStatusProducts = useCallback(
    async (ids, status) => {
      const backendStatus = frontendStatusToBackend(status);
      await Promise.all(ids.map((id) => api.patch(`/products/${id}`, { status: backendStatus }).catch(() => null)));
      await loadProducts();
    },
    [loadProducts],
  );

  const findById = useCallback((id) => products.find((p) => p.id === id), [products]);

  // Fallback for direct/deep-link visits to /product/:id — the initial load only fetches
  // the first 100 products (see loadProducts above), so a product outside that window
  // wouldn't otherwise be found by findById. Merges the single fetched product into state
  // rather than replacing it, so it doesn't disturb the rest of the already-loaded list.
  const fetchProductById = useCallback(async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      const product = backendToFrontend(res.data);
      setProducts((list) => (list.some((p) => p.id === id) ? list : [...list, product]));
      return product;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      products,
      loading,
      categories,
      findById,
      fetchProductById,
      addProduct,
      editProduct,
      deleteProduct,
      duplicateProduct,
      archiveProduct,
      bulkDeleteProducts,
      bulkArchiveProducts,
      bulkSetStatusProducts,
      refetch: loadProducts,
      refetchCategories: loadCategories,
    }),
    [
      products,
      loading,
      categories,
      findById,
      fetchProductById,
      addProduct,
      editProduct,
      deleteProduct,
      duplicateProduct,
      archiveProduct,
      bulkDeleteProducts,
      bulkArchiveProducts,
      bulkSetStatusProducts,
      loadProducts,
      loadCategories,
    ],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
