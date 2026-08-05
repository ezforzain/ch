import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { titleCase, toLowerKey } from '../../../lib/adminMappers';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.name,
    phone: doc.phone,
    email: doc.email,
    city: doc.city,
    source: titleCase(doc.source),
    status: titleCase(doc.status),
    notes: doc.notes,
    archived: false,
  };
}

function mapToApi(draft) {
  return {
    name: draft.name,
    phone: draft.phone,
    city: draft.city,
    source: draft.source ? toLowerKey(draft.source) : undefined,
    status: draft.status ? toLowerKey(draft.status) : undefined,
  };
}

export default function Leads() {
  const adapter = useApiCollection({
    page: 'leads',
    endpoint: '/leads',
    mapFromApi,
    mapToApi,
    statusToApi: (status) => ({ status: toLowerKey(status) }),
  });
  return <CollectionTable admin={adapter} page="leads" schema={schemas.leads} />;
}
