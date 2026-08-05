import Bi from '../ui/Bi';
import { fmtPKR, imgFallback } from '../../lib/format';
import { imgUrl } from '../../data/catalogue';

/**
 * Single product tile in the marketplace grid. Product content (name, note,
 * category, specs) is English-only in the source catalogue — no Urdu
 * variants exist there — so only the surrounding chrome ("Add to cart")
 * is bilingual, matching the source exactly.
 */
export default function ProductCard({ product: p, wished, compared, onOpen, onToggleWish, onToggleCompare, onAddToCart }) {
  const tag = p.tag || p.cat;
  const isPopularTag = p.tag === 'POPULAR';
  const outOfStock = p.stock <= 0;
  const lowStock = p.stock > 0 && p.stock <= 12;

  // "New" badge: shown for products created within the last 30 days. Every
  // product in the shared store has a `createdDate` (see
  // ProductsContext.jsx's normalizeProduct), so this works for both seeded
  // and admin-added products — seeded items just won't qualify unless their
  // createdDate happens to be recent.
  const isNew = (() => {
    if (!p.createdDate) return false;
    const created = new Date(p.createdDate);
    if (Number.isNaN(created.getTime())) return false;
    const ageDays = (Date.now() - created.getTime()) / 86400000;
    return ageDays >= 0 && ageDays <= 30;
  })();

  // "Sale" badge: opt-in — only appears when a product carries an
  // `originalPrice` greater than its current `price`. No existing catalogue
  // item sets this field, so this is purely forward-looking (an admin could
  // set it later); it never fires for the current 18 seeded products.
  const isSale = Number(p.originalPrice) > Number(p.price);

  return (
    <article
      style={{ borderColor: compared ? 'var(--color-acc)' : 'var(--color-line)' }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border bg-[#FBFAF7] shadow-[0_26px_60px_-32px_rgba(23,21,15,0.35)] transition-all duration-[450ms] hover:-translate-y-2 hover:shadow-[0_40px_80px_-32px_rgba(23,21,15,0.42)]"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View details for ${p.name}`}
        className="relative block aspect-square w-full cursor-pointer overflow-hidden border-none bg-[#EAE5DB] p-0"
      >
        <img
          loading="lazy"
          decoding="async"
          src={imgUrl(p.img, 700)}
          alt={p.name}
          onError={imgFallback(p.fb, 7)}
          className="h-full w-full object-cover transition-transform duration-[550ms] group-hover:scale-[1.08]"
        />
        <span className="absolute left-3.5 top-3.5 flex flex-wrap items-start gap-1.5">
          <span
            style={{
              background: isPopularTag ? 'var(--color-acc)' : 'rgba(23,21,15,0.82)',
              color: isPopularTag ? '#17150F' : '#F5F2EC',
            }}
            className="rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-[0.05em] shadow-[0_6px_16px_-6px_rgba(23,21,15,0.35)]"
          >
            {tag}
          </span>
          {isNew && (
            <span className="rounded-full bg-[#2E7D46] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.05em] text-white shadow-[0_6px_16px_-6px_rgba(23,21,15,0.35)]">
              New
            </span>
          )}
          {isSale && (
            <span className="rounded-full bg-[#B23B1E] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.05em] text-white shadow-[0_6px_16px_-6px_rgba(23,21,15,0.35)]">
              Sale
            </span>
          )}
        </span>
        {outOfStock && (
          <span className="absolute bottom-3.5 left-3.5 rounded-full bg-[rgba(23,21,15,0.85)] px-3 py-1.5 text-[11px] font-bold text-white">
            Out of stock
          </span>
        )}
        {lowStock && (
          <span className="absolute bottom-3.5 left-3.5 rounded-full bg-[rgba(138,43,27,0.92)] px-3 py-1.5 text-[11px] font-bold text-white">
            Only {p.stock} left
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={onToggleWish}
        aria-label={`${wished ? 'Remove' : 'Save'} ${p.name}`}
        aria-pressed={wished}
        style={{ color: wished ? 'var(--color-acc)' : 'rgba(23,21,15,0.3)' }}
        className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border-none bg-[rgba(251,250,247,0.94)] text-[17px] leading-none shadow-[0_8px_20px_-8px_rgba(23,21,15,0.5)] backdrop-blur-md transition-transform hover:scale-110"
      >
        ♥
      </button>

      <div className="flex flex-1 flex-col gap-2 p-[22px]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">{p.cat}</span>
        <button
          type="button"
          onClick={onOpen}
          className="border-none bg-transparent p-0 text-left font-[680] text-[18.5px] leading-[1.25] tracking-[-0.024em] text-ink transition-colors hover:text-acc"
        >
          {p.name}
        </button>
        <span className="flex items-center gap-1.5 text-[13px] text-mut">
          {p.reviews > 0 ? (
            <>
              <span className="text-acc" aria-hidden="true">★</span>
              {p.rating.toFixed(1)} <span className="opacity-[0.65]">({p.reviews})</span>
            </>
          ) : (
            <span className="opacity-[0.65]">No reviews yet</span>
          )}
        </span>
        <span className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-3.5">
          <span className="text-[19px] font-bold" data-tnum>{fmtPKR(p.price)}</span>
          {isSale && (
            <span className="text-[13px] text-mut line-through" data-tnum>
              {fmtPKR(p.originalPrice)}
            </span>
          )}
          {p.unit && <span className="text-[12.5px] text-mut">{p.unit}</span>}
        </span>
        <span className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={outOfStock}
            className="h-[46px] flex-1 whitespace-nowrap rounded-full border-none bg-ink text-[13.5px] font-bold text-paper transition-all hover:-translate-y-px hover:bg-[#2A261D] disabled:pointer-events-none disabled:bg-[rgba(23,21,15,0.25)]"
          >
            {outOfStock ? <Bi en="Out of stock" ur="اسٹاک ختم" /> : <Bi en="Add to cart" ur="کارٹ میں" />}
          </button>
          <button
            type="button"
            onClick={onToggleCompare}
            aria-pressed={compared}
            aria-label={`${compared ? 'Remove from' : 'Add to'} comparison: ${p.name}`}
            title="Compare"
            style={{
              borderColor: compared ? 'var(--color-acc)' : 'var(--color-line)',
              background: compared ? 'var(--color-acc)' : 'transparent',
              color: compared ? '#17150F' : 'var(--color-ink)',
            }}
            className="h-[46px] w-[46px] flex-shrink-0 rounded-full border text-base transition-all"
          >
            ⇄
          </button>
        </span>
      </div>
    </article>
  );
}
