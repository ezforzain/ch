import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { resolveImageUrl } from '../../../lib/api';

function mapFromApi(doc) {
  return {
    id: doc._id,
    name: doc.name,
    quote: doc.quote,
    rating: String(doc.rating ?? 5),
    image: resolveImageUrl(doc.portrait?.url),
    archived: !doc.isPublished,
  };
}

function mapToApi(draft) {
  return {
    name: draft.name,
    quote: draft.quote,
    rating: draft.rating !== undefined ? Number(draft.rating) || 5 : undefined,
  };
}

export default function Testimonials() {
  const adapter = useApiCollection({
    page: 'testimonials',
    endpoint: '/testimonials',
    mapFromApi,
    mapToApi,
    imageFields: [{ formField: 'portrait', draftKey: 'image' }],
    archiveToApi: (archived) => ({ isPublished: !archived }),
  });
  return <CollectionTable admin={adapter} page="testimonials" schema={schemas.testimonials} />;
}
