import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';

function mapFromApi(doc) {
  return { id: doc._id, name: doc.name, region: doc.province, count: 0, archived: !doc.isActive };
}

function mapToApi(draft) {
  return { name: draft.name, province: draft.region };
}

export default function Cities() {
  const adapter = useApiCollection({
    page: 'cities',
    endpoint: '/cities',
    mapFromApi,
    mapToApi,
    archiveToApi: (archived) => ({ isActive: !archived }),
  });
  return <CollectionTable admin={adapter} page="cities" schema={schemas.cities} />;
}
