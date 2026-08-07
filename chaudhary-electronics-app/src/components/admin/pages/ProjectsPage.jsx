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
    // Fallback for any pre-migration record saved before Project had a `status` field.
    status: doc.status || (doc.isPublished ? 'Completed' : 'Pending'),
    image: resolveImageUrl(doc.image?.url),
    // `archived` (public-site visibility) is intentionally independent of `status` (workflow
    // state) — a project can be "In progress" and already published, or "Completed" and
    // unpublished.
    archived: !doc.isPublished,
  };
}

function mapToApi(draft) {
  return {
    title: draft.name,
    location: draft.city,
    category: draft.category,
    status: draft.status,
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
    statusToApi: (status) => ({ status }),
  });
  return <CollectionTable admin={adapter} page="projects" schema={schemas.projects} />;
}
