import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { resolveImageUrl } from '../../../lib/api';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.title,
    city: doc.location,
    category: doc.category,
    // Project has no distinct "status" concept server-side, only isPublished — folds onto
    // the closest existing option so the table/status pill still reads sensibly.
    status: doc.isPublished ? 'Completed' : 'Pending',
    image: resolveImageUrl(doc.image?.url),
    archived: !doc.isPublished,
  };
}

function mapToApi(draft) {
  return {
    title: draft.name,
    location: draft.city,
    category: draft.category,
    isPublished: draft.status !== undefined ? draft.status !== 'Pending' : undefined,
  };
}

export default function ProjectsPage() {
  const adapter = useApiCollection({
    page: 'projects',
    endpoint: '/projects',
    mapFromApi,
    mapToApi,
    imageFields: [{ formField: 'image', draftKey: 'image' }],
    archiveToApi: (archived) => ({ isPublished: !archived }),
    statusToApi: (status) => ({ isPublished: status !== 'Pending' }),
  });
  return <CollectionTable admin={adapter} page="projects" schema={schemas.projects} />;
}
