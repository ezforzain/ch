import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Bi from '../components/ui/Bi';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Lightbox from '../components/ui/Lightbox';
import QuantityInput from '../components/ui/QuantityInput';
import ChatPanel from '../components/marketplace/ChatPanel';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { fmtPKR, imgFallback } from '../lib/format';
import { imgUrl, slugifyCategory } from '../data/catalogue';

/** /product/:id — full product detail page. Content is the gallery + specs + seller/chat +
 * quantity/add-to-cart layout the old modal used to render, redesigned as a premium
 * two-column "buy box" page: sticky info column on desktop, a zoomable image gallery with a
 * Lightbox viewer, and a QuantityInput (ui/QuantityInput.jsx) that replaces the old plain
 * Stepper with a directly-editable field, press-and-hold, and live MOQ/stock validation. */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { findById, fetchProductById, loading } = useProducts();
  const { addToCart, wishlist, toggleWish } = useCart();
  const showToast = useToast();

  const d = findById(id);
  const [selectedImg, setSelectedImg] = useState(null);
  const [qty, setQty] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Transient UI state resets whenever the visited product changes.
  useEffect(() => {
    setSelectedImg(null);
    setChatOpen(false);
    setLightboxOpen(false);
  }, [id]);

  useEffect(() => {
    if (!d && !loading) fetchProductById(id);
  }, [d, loading, id, fetchProductById]);

  // Quantity starts at the product's minimum order quantity (not a hardcoded 1) — depends on
  // `d` itself, which may only become available a tick after the `id` effect above (first
  // visit to a product outside the initial 100-item cache triggers an async fetch).
  useEffect(() => {
    if (!d) return;
    const moq = Math.max(1, Number(d.moq) || 1);
    setQty(Math.min(moq, Math.max(1, d.stock)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d?.id]);

  if (!d) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 py-20 text-center">
        <span className="text-[15px] text-mut">
          {loading ? (
            <Bi en="Loading product…" ur="پروڈکٹ لوڈ ہو رہا ہے…" />
          ) : (
            <Bi en="This product could not be found." ur="یہ پروڈکٹ نہیں ملی۔" />
          )}
        </span>
        {!loading && (
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-paper"
          >
            <Bi en="Back to marketplace" ur="مارکیٹ پلیس پر واپس" />
          </button>
        )}
      </div>
    );
  }

  const gallery = d.gallery && d.gallery.length ? d.gallery : [d.img];
  const activeImg = selectedImg || d.img;
  const activeIndex = Math.max(0, gallery.indexOf(activeImg));
  const hasMultipleImages = gallery.length > 1;
  const goPrevImg = () => setSelectedImg(gallery[(activeIndex - 1 + gallery.length) % gallery.length]);
  const goNextImg = () => setSelectedImg(gallery[(activeIndex + 1) % gallery.length]);

  const moq = Math.max(1, Number(d.moq) || 1);
  // A product whose stock can't even cover its own minimum order is effectively unbuyable —
  // treat that the same as out-of-stock rather than handing QuantityInput an impossible
  // min > max range.
  const outOfStock = d.stock <= 0 || d.stock < moq;
  const lowStock = !outOfStock && d.stock <= 12;
  const isWished = wishlist.includes(d.id);
  const specRows = Object.keys(d.specs || {})
    .map((k) => ({ k, v: d.specs[k] }))
    .concat([{ k: 'Warranty', v: d.warranty }])
    .filter((sp) => sp.v);

  const total = d.price * qty;

  return (
    <div className="px-5 py-8 sm:py-10">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Marketplace', to: '/marketplace' },
            { label: d.cat, to: `/marketplace?category=${slugifyCategory(d.cat)}` },
            { label: d.name },
          ]}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={`Enlarge image of ${d.name}`}
              className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[26px] border border-line bg-[#EAE5DB] p-0 shadow-[0_30px_80px_-44px_rgba(23,21,15,0.4)]"
            >
              <img
                loading="lazy"
                decoding="async"
                src={imgUrl(activeImg, 1200)}
                alt={d.name}
                onError={imgFallback('product', 1)}
                className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04]"
              />
              <span className="absolute right-3.5 bottom-3.5 grid h-10 w-10 place-items-center rounded-full border border-[rgba(245,242,236,0.25)] bg-[rgba(15,14,11,0.55)] text-[15px] text-paper opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                ⤢
              </span>
            </button>

            {gallery.length > 1 && (
              <div className="flex flex-wrap gap-2.5">
                {gallery.map((g, i) => (
                  <button
                    key={`${g}-${i}`}
                    type="button"
                    onClick={() => setSelectedImg(g)}
                    aria-label={`View image ${i + 1} of ${d.name}`}
                    aria-current={activeImg === g}
                    style={{ borderColor: activeImg === g ? 'var(--color-acc)' : 'transparent' }}
                    className="h-[62px] w-[76px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-[#EAE5DB] p-0 transition-opacity hover:opacity-90"
                  >
                    <img loading="lazy" decoding="async" src={imgUrl(g, 200)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-[104px]">
            <div className="flex flex-col gap-3.5 rounded-[28px] border border-line bg-paper p-[clamp(20px,2.6vw,30px)] shadow-[0_30px_80px_-48px_rgba(23,21,15,0.35)]">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">{d.cat}</span>
                <button
                  type="button"
                  onClick={() => toggleWish(d.id)}
                  aria-pressed={isWished}
                  aria-label={isWished ? `Remove ${d.name} from saved` : `Save ${d.name}`}
                  style={{ color: isWished ? 'var(--color-acc)' : 'var(--color-mut)' }}
                  className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-line bg-transparent text-[17px] transition-colors hover:bg-black/5"
                >
                  ♥
                </button>
              </div>

              <h1 className="text-[clamp(24px,2.8vw,32px)] font-[680] leading-[1.1] tracking-[-0.03em]">{d.name}</h1>

              <span className="flex flex-wrap items-center gap-2.5 text-[13.5px] text-mut">
                <span>
                  {d.reviews > 0 ? (
                    <>
                      <span className="text-acc" aria-hidden="true">
                        ★
                      </span>{' '}
                      {d.rating.toFixed(1)} ({d.reviews})
                    </>
                  ) : (
                    'No reviews yet'
                  )}
                </span>
                <span className="h-3 w-px bg-line" />
                <span
                  style={{ color: outOfStock ? '#8A2B1B' : lowStock ? '#8A2B1B' : '#1E5B39' }}
                  className="font-semibold"
                >
                  {outOfStock ? 'Out of stock' : lowStock ? `Only ${d.stock} in stock` : 'In stock'}
                </span>
              </span>

              {d.note && <p className="text-[15px] leading-[1.6] text-mut">{d.note}</p>}

              <span className="flex items-baseline gap-1.5 pt-1">
                <span className="text-[32px] font-bold tracking-[-0.03em]" data-tnum>
                  {fmtPKR(d.price)}
                </span>
                {d.unit && <span className="text-[13px] text-mut">{d.unit}</span>}
              </span>
              {moq > 1 && (
                <span className="w-fit rounded-full bg-acc-soft px-3 py-1 text-[12px] font-semibold text-[#8A6416]">
                  Minimum order: {moq}
                </span>
              )}

              {specRows.length > 0 && (
                <div className="mt-1 flex flex-col gap-px overflow-hidden rounded-2xl border border-line bg-line">
                  {specRows.map((sp) => (
                    <div key={sp.k} className="flex items-center justify-between gap-3.5 bg-[#FBFAF7] px-[15px] py-[11px]">
                      <span className="text-[13px] text-mut">{sp.k}</span>
                      <span className="text-right text-[13.5px] font-semibold">{sp.v}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-[#FBFAF7] px-[15px] py-[13px]">
                <span className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-mut">
                    Sold &amp; installed by
                  </span>
                  <span className="text-[14.5px] font-[650]">{d.seller}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  className="whitespace-nowrap rounded-full border border-line bg-transparent px-4 py-[11px] text-[13.5px] font-semibold text-ink transition-colors hover:bg-black/5"
                >
                  <Bi en="Chat" ur="چیٹ" />
                </button>
              </div>
            </div>

            {/* Quantity + add to cart */}
            <div className="flex flex-col gap-3.5 rounded-[28px] border border-line bg-[#FBFAF7] p-[clamp(18px,2.4vw,26px)]">
              {outOfStock ? (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-full border-none bg-ink px-5 py-4 text-[15px] font-[680] text-paper opacity-40"
                >
                  <Bi en="Out of stock" ur="اسٹاک ختم" />
                </button>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-mut">Quantity</span>
                      <QuantityInput
                        value={qty}
                        onChange={setQty}
                        min={moq}
                        max={d.stock}
                        onInvalid={(msg) => msg && showToast(msg)}
                      />
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-mut">Total</span>
                      <span className="text-[22px] font-bold tracking-[-0.025em]" data-tnum>
                        {fmtPKR(total)}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(d.id, qty)}
                    className="w-full rounded-full border-none bg-ink px-5 py-4 text-[15px] font-[680] text-paper transition-transform hover:-translate-y-0.5"
                  >
                    <Bi en="Add to cart" ur="کارٹ میں ڈالیں" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        image={imgUrl(activeImg, 1600)}
        caption={d.name}
        onPrev={hasMultipleImages ? goPrevImg : undefined}
        onNext={hasMultipleImages ? goNextImg : undefined}
      />
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} product={d} />
    </div>
  );
}
