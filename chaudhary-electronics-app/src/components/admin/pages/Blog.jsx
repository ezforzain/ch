import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { resolveImageUrl } from '../../../lib/api';

function mapFromApi(doc) {
  return {
    id: doc._id,
    title: doc.title,
    category: doc.category,
    tags: (doc.tags || []).join(', '),
    status: doc.isPublished ? 'Published' : 'Draft',
    date: doc.createdAt ? doc.createdAt.slice(0, 10) : '',
    seoTitle: doc.seo?.title || '',
    seoDesc: doc.seo?.description || '',
    body: doc.content,
    image: resolveImageUrl(doc.coverImage?.url),
    archived: !doc.isPublished,
  };
}

function mapToApi(draft) {
  return {
    title: draft.title,
    category: draft.category,
    tags: draft.tags !== undefined ? draft.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    isPublished: draft.status !== undefined ? draft.status === 'Published' : undefined,
    seo: draft.seoTitle !== undefined || draft.seoDesc !== undefined ? { title: draft.seoTitle || '', description: draft.seoDesc || '' } : undefined,
    content: draft.body,
  };
}

export default function Blog() {
  const adapter = useApiCollection({
    page: 'blog',
    endpoint: '/blog',
    mapFromApi,
    mapToApi,
    imageFields: [{ formField: 'coverImage', draftKey: 'image' }],
    archiveToApi: (archived) => ({ isPublished: !archived }),
    statusToApi: (status) => ({ isPublished: status === 'Published' }),
  });
  return <CollectionTable admin={adapter} page="blog" schema={schemas.blog} />;
}
