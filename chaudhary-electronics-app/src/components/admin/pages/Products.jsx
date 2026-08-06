import { useMemo } from 'react';
import CollectionTable from '../table/CollectionTable';
import ProductFormDrawer from '../products/ProductFormDrawer';
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
      loading: store.loading,
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

  // Category names now come from the database (ProductsContext fetches /categories), not a
  // hardcoded list — clone the schema so the form's Category dropdown always reflects
  // whatever categories currently exist, without mutating the shared schemas.products object.
  const liveSchema = useMemo(
    () => ({
      ...schemas.products,
      fields: schemas.products.fields.map((f) =>
        f.key === 'cat' ? { ...f, options: store.categories.map((c) => c.name) } : f,
      ),
    }),
    [store.categories],
  );

  return (
    <CollectionTable
      admin={adapter}
      page="products"
      schema={liveSchema}
      renderModal={({ mode, row, onClose, onSubmit }) => (
        <ProductFormDrawer mode={mode} row={row} categories={store.categories} onClose={onClose} onSubmit={onSubmit} />
      )}
    />
  );
}
