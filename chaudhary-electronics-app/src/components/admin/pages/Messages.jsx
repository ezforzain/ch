import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { titleCase, toLowerKey } from '../../../lib/adminMappers';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.name,
    preview: doc.body,
    date: doc.createdAt ? doc.createdAt.slice(0, 10) : '',
    status: titleCase(doc.status),
    archived: false,
  };
}

function mapToApi(draft) {
  return {
    name: draft.name,
    body: draft.preview,
    status: draft.status ? toLowerKey(draft.status) : undefined,
  };
}

export default function Messages() {
  const adapter = useApiCollection({
    page: 'messages',
    endpoint: '/messages',
    mapFromApi,
    mapToApi,
    statusToApi: (status) => ({ status: toLowerKey(status) }),
  });
  return <CollectionTable admin={adapter} page="messages" schema={schemas.messages} />;
}
