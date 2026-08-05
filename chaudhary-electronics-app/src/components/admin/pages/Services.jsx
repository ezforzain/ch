import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { resolveImageUrl } from '../../../lib/api';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.name,
    desc: doc.description,
    price: doc.costEstimate,
    image: resolveImageUrl(doc.image?.url),
    archived: !doc.isActive,
  };
}

function mapToApi(draft) {
  return { name: draft.name, description: draft.desc, costEstimate: draft.price };
}

export default function Services() {
  const adapter = useApiCollection({
    page: 'services',
    endpoint: '/services',
    mapFromApi,
    mapToApi,
    imageFields: [{ formField: 'image', draftKey: 'image' }],
    archiveToApi: (archived) => ({ isActive: !archived }),
  });
  return <CollectionTable admin={adapter} page="services" schema={schemas.services} />;
}
