import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.name,
    city: doc.addresses?.[0]?.city || '',
    phone: doc.phone || '',
    email: doc.email,
    archived: !doc.isActive,
  };
}

export default function Customers() {
  const adapter = useApiCollection({ page: 'customers', endpoint: '/customers', mapFromApi });
  return <CollectionTable admin={adapter} page="customers" schema={schemas.customers} />;
}
