import { useMemo } from 'react';
import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useProducts } from '../../../context/ProductsContext';

/**
 * /admin/products — same generic CollectionTable, but backed by the shared
 * ProductsContext (src/context/ProductsContext.jsx) instead of the admin
 * panel's own isolated localStorage blob. This is what makes a product
 * added/edited/deleted here immediately correct on the public Marketplace
 * and in the Dashboard's product counts — they all read the same store.
 *
 * CollectionTable only ever calls `admin.data[page]` and
 * `admin.<verb>Record(page, ...)` — this adapter just re-shapes the
 * ProductsContext API to match that interface so CollectionTable itself
 * needs no product-specific branching.
 */
export default function Products() {
  const store = useProducts();

  const adapter = useMemo(
    () => ({
      data: { products: store.products },
      addRecord: (_page, draft) => store.addProduct(draft),
      editRecord: (_page, draft) => store.editProduct(draft.id, draft),
      deleteRecord: (_page, id) => store.deleteProduct(id),
      duplicateRecord: (_page, row) => store.duplicateProduct(row),
      archiveRecord: (_page, row) => store.archiveProduct(row),
      bulkDelete: (_page, ids) => store.bulkDeleteProducts(ids),
      bulkArchive: (_page, ids, archived) => store.bulkArchiveProducts(ids, archived),
      bulkSetStatus: (_page, ids, status) => store.bulkSetStatusProducts(ids, status),
    }),
    [store],
  );

  return <CollectionTable admin={adapter} page="products" schema={schemas.products} />;
}
