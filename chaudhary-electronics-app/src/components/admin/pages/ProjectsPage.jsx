import { useEffect, useMemo, useState } from 'react';
import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { api, resolveImageUrl } from '../../../lib/api';

const NOT_SET = 'Not set';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.title,
    // doc.location is either a populated { _id, name, province } City, or null.
    city: doc.location?.name || NOT_SET,
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

export default function ProjectsPage() {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/cities?limit=100&sort=sortOrder,name')
      .then((res) => {
        if (cancelled) return;
        setCities(res.data.filter((c) => c.isActive !== false));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const cityIdByName = useMemo(() => new Map(cities.map((c) => [c.name, c._id])), [cities]);

  const mapToApi = useMemo(
    () => (draft) => ({
      title: draft.name,
      // '' clears a previously-picked city (see Project.js's location setter) — undefined
      // would leave whatever was already stored untouched instead.
      location: draft.city && draft.city !== NOT_SET ? cityIdByName.get(draft.city) || '' : '',
      category: draft.category,
      status: draft.status,
    }),
    [cityIdByName],
  );

  const adapter = useApiCollection({
    page: 'projects',
    endpoint: '/projects',
    mapFromApi,
    mapToApi,
    imageFields: [{ formField: 'image', draftKey: 'image' }],
    archiveToApi: (archived) => ({ isPublished: !archived }),
    statusToApi: (status) => ({ status }),
  });

  const liveSchema = useMemo(
    () => ({
      ...schemas.projects,
      fields: schemas.projects.fields.map((f) =>
        f.key === 'city' ? { ...f, options: [NOT_SET, ...cities.map((c) => c.name)] } : f,
      ),
    }),
    [cities],
  );

  return <CollectionTable admin={adapter} page="projects" schema={liveSchema} />;
}
