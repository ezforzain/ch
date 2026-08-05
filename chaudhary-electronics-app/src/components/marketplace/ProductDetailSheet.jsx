import Bi from '../ui/Bi';
import Modal from '../ui/Modal';
import Stepper from '../ui/Stepper';
import { fmtPKR, imgFallback } from '../../lib/format';
import { imgUrl } from '../../data/catalogue';

/**
 * Product detail modal — source: `data-sheet="detail"`. Gallery thumbnails,
 * specs table, qty stepper, add-to-cart, "open chat". All product content
 * (name/note/specs/seller/stock text) is English-only in the source, same
 * as the product cards — only "Chat"/"Add to cart" are bilingual there.
 */
export default function ProductDetailSheet({
  product: d,
  open,
  onClose,
  selectedImg,
  onSelectImg,
  qty,
  onQtyChange,
  onAddToCart,
  onOpenChat,
}) {
  if (!d) return null;
  const gallery = d.gallery && d.gallery.length ? d.gallery : [d.img];
  const activeImg = selectedImg || d.img;
  const outOfStock = d.stock <= 0;
  const lowStock = d.stock > 0 && d.stock <= 12;
  const specRows = Object.keys(d.specs || {})
    .map((k) => ({ k, v: d.specs[k] }))
    .concat([{ k: 'Warranty', v: d.warranty }]);

  return (
    <Modal open={open} onClose={onClose} align="center" labelledBy="detail-name">
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-[940px] overflow-y-auto rounded-[28px] bg-paper shadow-[0_50px_110px_-30px_rgba(0,0,0,0.7)]"
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          <div className="flex flex-col gap-3 bg-[#FBFAF7] p-5">
            <img
              loading="lazy"
              decoding="async"
              src={imgUrl(activeImg, 1000)}
              alt={d.name}
              onError={imgFallback('product', 1)}
              className="aspect-[4/3] w-full rounded-[18px] bg-[#EAE5DB] object-cover"
            />
            <div className="flex flex-wrap gap-2.5">
              {gallery.map((g, i) => (
                <button
                  key={`${g}-${i}`}
                  type="button"
                  onClick={() => onSelectImg(g)}
                  aria-label={`View image of ${d.name}`}
                  style={{ borderColor: activeImg === g ? 'var(--color-acc)' : 'transparent' }}
                  className="h-[52px] w-[66px] cursor-pointer overflow-hidden rounded-xl border-2 bg-[#EAE5DB] p-0"
                >
                  <img loading="lazy" decoding="async" src={imgUrl(g, 200)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3.5 p-[clamp(20px,2.6vw,30px)]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">{d.cat}</span>
            <span id="detail-name" className="text-[clamp(22px,2.6vw,29px)] font-[680] leading-[1.1] tracking-[-0.03em]">
              {d.name}
            </span>
            <span className="flex flex-wrap items-center gap-2.5 text-[13.5px] text-mut">
              <span>
                {d.reviews > 0 ? (
                  <>
                    <span className="text-acc" aria-hidden="true">★</span> {d.rating.toFixed(1)} ({d.reviews})
                  </>
                ) : (
                  'No reviews yet'
                )}
              </span>
              <span className="h-3 w-px bg-line" />
              <span style={{ color: outOfStock ? '#8A2B1B' : lowStock ? '#8A2B1B' : '#1E5B39' }} className="font-semibold">
                {outOfStock ? 'Out of stock' : lowStock ? `Only ${d.stock} in stock` : 'In stock'}
              </span>
            </span>
            <span className="text-[15px] leading-[1.6] text-mut">{d.note}</span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-[28px] font-bold tracking-[-0.03em]" data-tnum>{fmtPKR(d.price)}</span>
              {d.unit && <span className="text-[13px] text-mut">{d.unit}</span>}
            </span>

            <div className="flex flex-col gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {specRows.map((sp) => (
                <div key={sp.k} className="flex items-center justify-between gap-3.5 bg-[#FBFAF7] px-[15px] py-[11px]">
                  <span className="text-[13px] text-mut">{sp.k}</span>
                  <span className="text-right text-[13.5px] font-semibold">{sp.v}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-[#FBFAF7] px-[15px] py-[13px]">
              <span className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-mut">Sold &amp; installed by</span>
                <span className="text-[14.5px] font-[650]">{d.seller}</span>
              </span>
              <button
                type="button"
                onClick={onOpenChat}
                className="whitespace-nowrap rounded-full border border-line bg-transparent px-4 py-[11px] text-[13.5px] font-semibold text-ink transition-colors hover:bg-black/5"
              >
                <Bi en="Chat" ur="چیٹ" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {!outOfStock && <Stepper value={qty} onChange={onQtyChange} min={1} max={d.stock} />}
              <button
                type="button"
                onClick={onAddToCart}
                disabled={outOfStock}
                className="min-w-[150px] flex-1 rounded-full border-none bg-ink px-5 py-4 text-[15px] font-[680] text-paper transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
              >
                {outOfStock ? <Bi en="Out of stock" ur="اسٹاک ختم" /> : <Bi en="Add to cart" ur="کارٹ میں ڈالیں" />}
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="self-start border-none bg-transparent py-2.5 text-[13.5px] font-semibold text-mut transition-colors hover:text-ink"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
