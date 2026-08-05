import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { fmtPKR } from '../../../lib/format';
import { titleCase, toLowerKey } from '../../../lib/adminMappers';

function mapFromApi(doc) {
  return {
    id: doc._id,
    orderNumber: doc.orderNumber,
    customer: doc.customer?.name || doc.contactName,
    amount: fmtPKR(doc.total),
    status: titleCase(doc.status),
    archived: false,
  };
}

export default function Orders() {
  const adapter = useApiCollection({
    page: 'orders',
    endpoint: '/orders',
    mapFromApi,
    mapToApi: (draft) => ({ status: draft.status ? toLowerKey(draft.status) : undefined }),
    statusToApi: (status) => ({ status: toLowerKey(status) }),
  });
  return <CollectionTable admin={adapter} page="orders" schema={schemas.orders} />;
}
