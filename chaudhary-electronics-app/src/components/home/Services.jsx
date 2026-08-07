import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { imgFallback, imgOrFallback } from '../../lib/format';
import { api, resolveImageUrl } from '../../lib/api';
import Bi from '../ui/Bi';

const COMPACT_TITLE = 'text-[22px] font-[660] tracking-[-0.028em]';
const COMPACT_DESC = 'mt-[5px] text-[14px] text-[rgba(245,242,236,0.72)]';

// Presentation-only tile layout (span/height/type sizing) that the backend Service model has
// no equivalent for — cycled by position (admin-controlled via sortOrder) so the bento grid
// keeps its varied look regardless of how many services are configured.
const LAYOUTS = [
  { span: 2, minH: 340, gradEnd: 0.88, shadow: true, titleClass: 'text-[clamp(24px,2.6vw,32px)] font-semibold tracking-[-0.03em]', descClass: 'mt-[6px] text-[15.5px] text-[rgba(245,242,236,0.78)]' },
  { span: 1, minH: 340, gradEnd: 0.85, titleClass: COMPACT_TITLE, descClass: COMPACT_DESC },
  { span: 1, minH: 340, gradEnd: 0.85, titleClass: COMPACT_TITLE, descClass: COMPACT_DESC },
  { span: 1, minH: 280, gradEnd: 0.85, titleClass: COMPACT_TITLE, descClass: COMPACT_DESC },
  { span: 1, minH: 280, gradEnd: 0.85, titleClass: COMPACT_TITLE, descClass: COMPACT_DESC },
  { span: 2, minH: 280, gradEnd: 0.86, titleClass: 'text-[clamp(22px,2.4vw,28px)] font-semibold tracking-[-0.03em]', descClass: 'mt-[5px] text-[15.5px] text-[rgba(245,242,236,0.78)]' },
  { span: 1, minH: 280, gradEnd: 0.85, titleClass: COMPACT_TITLE, descClass: COMPACT_DESC },
];

function backendToService(s, i) {
  const layout = LAYOUTS[i % LAYOUTS.length];
  return {
    id: s._id,
    // No linked-category field exists on the backend Service model to safely derive a
    // matching /marketplace?category= slug, so route every tile to the quote form instead —
    // works for any service, unlike a guessed category match that could point at the wrong
    // (or a nonexistent) marketplace category.
    href: '#quote',
    img: imgOrFallback(resolveImageUrl(s.image?.url), 'electronics,service,work'),
    fb: 'electronics,service,work',
    alt: s.name,
    badge: i === 0 ? 'MOST REQUESTED' : null,
    title: s.name,
    desc: s.description || '',
    cost: s.costEstimate || '—',
    installTime: s.installTime || '—',
    bestFor: s.bestFor || '—',
    ...layout,
  };
}

export default function Services() {
  const { lang } = useLang();
  const [services, setServices] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/services?limit=100&sort=sortOrder')
      .then((res) => {
        if (cancelled) return;
        setServices(res.data.filter((s) => s.isActive !== false).map(backendToService));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!services.length) return null;

  return (
    <section id="services" className="px-5 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-[34px] flex flex-wrap items-end justify-between gap-5">
          <Bi
            as="h2"
            en={
              <>
                Seven services.
                <br />
                One team.
              </>
            }
            ur={
              <>
                سات خدمات۔
                <br />
                ایک ٹیم۔
              </>
            }
            className={`m-0 font-sans font-[680] tracking-[-0.035em] ${
              lang === 'ur' ? 'text-[clamp(30px,4vw,54px)] leading-[1.12]' : 'text-[clamp(31px,4.1vw,56px)] leading-[1.02]'
            }`}
          />
          <a href="#quote" className="text-[14.5px] font-semibold text-mut hover:text-acc">
            Ask about any of them →
          </a>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[14px]">
          {services.map((s) => (
            <Link
              key={s.id}
              to={s.href}
              className={`group relative flex flex-col justify-end overflow-hidden rounded-[26px] text-paper transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-[6px] ${
                s.span === 2 ? 'col-span-2 p-[26px]' : 'p-[22px]'
              } ${s.shadow ? 'shadow-[0_26px_60px_-32px_rgba(23,21,15,0.5)]' : ''}`}
              style={{ minHeight: `${s.minH}px` }}
            >
              <img
                loading="lazy"
                decoding="async"
                src={s.img}
                onError={imgFallback(s.fb)}
                alt={s.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, rgba(15,14,11,${s.span === 2 ? 0.15 : 0.1}), rgba(15,14,11,${s.gradEnd}))`,
                }}
              />
              {s.badge && (
                <span className="absolute top-5 left-5 rounded-full bg-acc px-3 py-[6px] font-sans text-[10.5px] tracking-[0.06em] text-ink">
                  {s.badge}
                </span>
              )}
              <div className="relative">
                <div className={`font-sans ${s.titleClass}`}>{s.title}</div>
                <div className={s.descClass}>{s.desc}</div>
                <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[rgba(245,242,236,0.85)] transition-colors group-hover:text-acc">
                  Learn more <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-[46px]">
          <Bi
            as="h3"
            en="Quick comparison"
            ur="فوری موازنہ"
            className="m-0 mb-4 font-sans text-[20px] font-[650] tracking-[-0.022em]"
          />
          <div className="overflow-x-auto rounded-[20px] border border-line bg-[#FBFAF7]">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">
                    Service
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">
                    Typical cost
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">
                    Install time
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">
                    Best for
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-b-0">
                    <th scope="row" className="whitespace-nowrap px-5 py-[13px] text-left text-[14px] font-semibold text-ink">
                      {s.title}
                    </th>
                    <td className="px-5 py-[13px] text-[13.5px] text-ink" data-tnum>
                      {s.cost}
                    </td>
                    <td className="px-5 py-[13px] text-[13.5px] text-ink">{s.installTime}</td>
                    <td className="px-5 py-[13px] text-[13.5px] text-mut">{s.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
