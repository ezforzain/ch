import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { titleCase, toLowerKey } from '../../../lib/adminMappers';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.name,
    phone: doc.phone,
    service: doc.serviceType,
    date: doc.preferredDate ? doc.preferredDate.slice(0, 10) : '',
    status: titleCase(doc.status),
    archived: false,
  };
}

function mapToApi(draft) {
  return {
    name: draft.name,
    phone: draft.phone,
    serviceType: draft.service,
    preferredDate: draft.date,
    status: draft.status ? toLowerKey(draft.status) : undefined,
  };
}

/** /admin/appointments — same generic CollectionTable, driven by schema.hasCalendar
 * (appointments is the only collection with it), now backed by the real Appointments API
 * instead of the shared mock store. */
export default function Appointments() {
  const adapter = useApiCollection({
    page: 'appointments',
    endpoint: '/appointments',
    mapFromApi,
    mapToApi,
    statusToApi: (status) => ({ status: toLowerKey(status) }),
  });
  return <CollectionTable admin={adapter} page="appointments" schema={schemas.appointments} />;
}
