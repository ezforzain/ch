import { useEffect } from 'react';
import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { useProducts } from '../../../context/ProductsContext';
import { resolveImageUrl } from '../../../lib/api';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.name,
    description: doc.description || '',
    sortOrder: doc.sortOrder ?? 0,
    image: resolveImageUrl(doc.image?.url),
    archived: !doc.isActive,
  };
}

function mapToApi(draft) {
  return {
    name: draft.name,
    description: draft.description || '',
    sortOrder: draft.sortOrder !== '' && draft.sortOrder !== undefined ? Number(draft.sortOrder) || 0 : 0,
  };
}

/**
 * /admin/categories — real product categories (server's Category model/API), which also
 * back the public Marketplace's category filter and the Products page's Category field
 * (see ProductsContext.jsx's `categories`). Archive/unarchive here doubles as
 * publish/unpublish: an inactive category simply stops appearing in those pickers.
 */
export default function Categories() {
  const { refetchCategories } = useProducts();
  const adapter = useApiCollection({
    page: 'categories',
    endpoint: '/categories',
    mapFromApi,
    mapToApi,
    imageFields: [{ formField: 'image', draftKey: 'image' }],
    archiveToApi: (archived) => ({ isActive: !archived }),
  });

  // Keep the public Marketplace / Products dropdown in sync with admin edits, since they
  // read from a separate fetch (ProductsContext) rather than this page's own adapter.
  useEffect(() => {
    refetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter.data.categories]);

  return <CollectionTable admin={adapter} page="categories" schema={schemas.categories} />;
}
