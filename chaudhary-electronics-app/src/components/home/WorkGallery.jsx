import { useMemo, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { imgFallback } from '../../lib/format';
import { workGallery } from '../../data/workGallery';
import Bi from '../ui/Bi';
import Lightbox from '../ui/Lightbox';
import Modal from '../ui/Modal';

const ALL = 'All';

export default function WorkGallery() {
  const { lang } = useLang();
  const [openIndex, setOpenIndex] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(workGallery.map((i) => i.category)))],
    [],
  );

  const filtered = category === ALL ? workGallery : workGallery.filter((i) => i.category === category);
  const openItem = openIndex !== null ? filtered[openIndex] : null;
  const goPrev = () => setOpenIndex((i) => (i - 1 + filtered.length) % filtered.length);
  const goNext = () => setOpenIndex((i) => (i + 1) % filtered.length);

  return (
    <section id="work" className="bg-dark px-5 py-[clamp(64px,8vw,110px)] text-paper">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-[30px] flex flex-wrap items-end justify-between gap-5">
          <Bi
            as="h2"
            en="Recent installations"
            ur="حالیہ تنصیبات"
            className={`m-0 font-sans font-[680] tracking-[-0.035em] ${
              lang === 'ur' ? 'text-[clamp(30px,4vw,54px)] leading-[1.12]' : 'text-[clamp(31px,4.1vw,56px)] leading-[1.02]'
            }`}
          />
          <span className="font-sans text-[11.5px] tracking-[0.06em] text-[rgba(245,242,236,0.45)]">
            TAP ANY PHOTO TO ENLARGE
          </span>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={active}
                className={`inline-flex items-center whitespace-nowrap rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                  active
                    ? 'border-transparent bg-acc text-ink'
                    : 'border-[rgba(245,242,236,0.18)] bg-[rgba(245,242,236,0.06)] text-[rgba(245,242,236,0.65)] hover:border-[rgba(245,242,236,0.35)] hover:text-paper'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 auto-rows-[110px] gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, i) => {
            const open = () => setOpenIndex(i);
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                  }
                }}
                aria-label={`Enlarge photo: ${item.alt}`}
                className="group relative cursor-pointer overflow-hidden rounded-[22px] border-none bg-[#1A1712] p-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:scale-[1.015]"
                style={{ gridColumn: `span ${item.colSpan}`, gridRow: `span ${item.rowSpan}` }}
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src={item.img}
                  onError={imgFallback(item.fb)}
                  alt={item.alt}
                  className="h-full w-full object-cover"
                />
                {item.beforeImg && (
                  <span className="absolute top-3 left-3 rounded-full border border-[rgba(245,242,236,0.25)] bg-[rgba(15,14,11,0.55)] px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.04em] text-paper backdrop-blur-sm">
                    BEFORE / AFTER
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailsItem(item);
                  }}
                  aria-label={`View project details: ${item.title}`}
                  className="absolute top-3 right-3 rounded-full border border-[rgba(245,242,236,0.25)] bg-[rgba(15,14,11,0.55)] px-3 py-1.5 text-[11.5px] font-semibold text-paper opacity-90 backdrop-blur-sm transition-colors hover:bg-acc hover:text-ink"
                >
                  Details
                </button>
                <span
                  className={`absolute inset-x-0 bottom-0 block bg-[linear-gradient(transparent,rgba(15,14,11,0.9))] text-left ${item.captionClass}`}
                >
                  <span className={`block text-paper ${item.titleClass}`}>{item.title}</span>
                  {item.subtitle && (
                    <span className="mt-[3px] block text-[13px] text-[rgba(245,242,236,0.65)]">
                      {item.subtitle}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Lightbox
        open={!!openItem}
        onClose={() => setOpenIndex(null)}
        image={openItem?.img}
        caption={openItem?.alt}
        beforeImage={openItem?.beforeImg}
        beforeFb={openItem?.beforeFb}
        afterFb={openItem?.fb}
        onPrev={filtered.length > 1 ? goPrev : undefined}
        onNext={filtered.length > 1 ? goNext : undefined}
      />

      <Modal open={!!detailsItem} onClose={() => setDetailsItem(null)} align="center" labelledBy="work-details-title">
        {detailsItem && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] rounded-[26px] bg-paper p-7 text-ink shadow-[0_50px_110px_-30px_rgba(0,0,0,0.7)]"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <span id="work-details-title" className="text-[19px] font-[680] tracking-[-0.024em]">
                {detailsItem.title}
              </span>
              <button
                type="button"
                onClick={() => setDetailsItem(null)}
                aria-label="Close"
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-line bg-transparent text-base text-ink"
              >
                ✕
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">System size</dt>
                <dd className="mt-1 text-[14.5px] font-semibold">{detailsItem.details.size}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">Location</dt>
                <dd className="mt-1 text-[14.5px] font-semibold">{detailsItem.details.location}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">Completion time</dt>
                <dd className="mt-1 text-[14.5px] font-semibold">{detailsItem.details.completion}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">Result</dt>
                <dd className="mt-1 text-[14.5px] font-semibold">{detailsItem.details.savings}</dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </section>
  );
}
