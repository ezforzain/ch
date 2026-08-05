import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';

function mapFromApi(doc) {
  return {
    id: doc._id,
    who: doc.userName,
    what: `${doc.action} ${doc.module}${doc.targetId ? ` (${doc.targetId.slice(-6)})` : ''}`,
    when: new Date(doc.createdAt).toLocaleString(),
    archived: false,
  };
}

export default function ActivityLogs() {
  const adapter = useApiCollection({ page: 'activity', endpoint: '/activity', mapFromApi, sort: '-createdAt' });
  return <CollectionTable admin={adapter} page="activity" schema={schemas.activity} />;
}
