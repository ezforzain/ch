import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { resolveImageUrl } from '../../../lib/api';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.name,
    role: doc.role,
    phone: doc.phone,
    image: resolveImageUrl(doc.photo?.url),
    archived: !doc.isActive,
  };
}

function mapToApi(draft) {
  return { name: draft.name, role: draft.role, phone: draft.phone };
}

export default function Team() {
  const adapter = useApiCollection({
    page: 'team',
    endpoint: '/team',
    mapFromApi,
    mapToApi,
    imageFields: [{ formField: 'photo', draftKey: 'image' }],
    archiveToApi: (archived) => ({ isActive: !archived }),
  });
  return <CollectionTable admin={adapter} page="team" schema={schemas.team} />;
}
