import { useEffect, useMemo, useState } from 'react';
import CollectionTable from '../table/CollectionTable';
import { schemas } from '../../../data/admin/schemas';
import { useApiCollection } from '../../../hooks/admin/useApiCollection';
import { api } from '../../../lib/api';

function mapFromApi(doc) {
  return { id: doc._id, name: doc.name, region: doc.province, archived: !doc.isActive };
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

  // Project.location is a real City reference now (not free text), so this can count real
  // links instead of the hardcoded 0 this page used to show. Fetched once per mount — same
  // "fresh on navigate" pattern every other admin page already uses, no live cross-page sync.
  const [projectCountByCity, setProjectCountByCity] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const counts = {};
      let page = 1;
      for (;;) {
        const res = await api.get(`/projects?limit=100&page=${page}&fields=location`).catch(() => null);
        if (!res || cancelled) return;
        res.data.forEach((p) => {
          const id = p.location?._id || p.location;
          if (id) counts[id] = (counts[id] || 0) + 1;
        });
        if (!res.meta || page >= res.meta.pages || res.data.length === 0) break;
        page += 1;
      }
      if (!cancelled) setProjectCountByCity(counts);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveAdapter = useMemo(
    () => ({
      ...adapter,
      data: {
        cities: adapter.data.cities.map((c) => ({ ...c, count: projectCountByCity[c.id] || 0 })),
      },
    }),
    [adapter, projectCountByCity],
  );

  return <CollectionTable admin={liveAdapter} page="cities" schema={schemas.cities} />;
}
