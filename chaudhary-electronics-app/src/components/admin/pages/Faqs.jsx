import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';

function mapFromApi(doc) {
  return { id: doc._id, q: doc.question, category: doc.category, a: doc.answer, archived: !doc.isActive };
}

function mapToApi(draft) {
  return { question: draft.q, category: draft.category, answer: draft.a };
}

export default function Faqs() {
  const adapter = useApiCollection({
    page: 'faqs',
    endpoint: '/faqs',
    mapFromApi,
    mapToApi,
    archiveToApi: (archived) => ({ isActive: !archived }),
  });
  return <CollectionTable admin={adapter} page="faqs" schema={schemas.faqs} />;
}
