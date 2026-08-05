/**
 * Page-number button row for the marketplace grid (8 items/page). Mirrors the
 * source's `pages`/`prevPage`/`nextPage` — the parent only renders this when
 * `pageCount > 1 && !loading` (source's `pagerShow`).
 */
export default function Pagination({ page, pageCount, onGo, onPrev, onNext }) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous page"
        disabled={page <= 1}
        style={{ opacity: page > 1 ? 1 : 0.4 }}
        className="grid h-11 w-11 place-items-center rounded-full border border-line bg-[#FBFAF7] text-base text-ink transition-colors hover:bg-black/5"
      >
        ←
      </button>
      {pages.map((n) => {
        const current = n === page;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onGo(n)}
            aria-label={`Page ${n}`}
            aria-current={current ? 'page' : undefined}
            data-tnum
            className={`h-11 min-w-[44px] rounded-full px-3 text-sm font-[650] transition-colors ${
              current ? 'border border-ink bg-ink text-paper' : 'border border-line bg-[#FBFAF7] text-ink'
            }`}
          >
            {n}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next page"
        disabled={page >= pageCount}
        style={{ opacity: page < pageCount ? 1 : 0.4 }}
        className="grid h-11 w-11 place-items-center rounded-full border border-line bg-[#FBFAF7] text-base text-ink transition-colors hover:bg-black/5"
      >
        →
      </button>
    </div>
  );
}
