import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Bi from '../components/ui/Bi';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Lightbox from '../components/ui/Lightbox';
import QuantityInput from '../components/ui/QuantityInput';
import ChatPanel from '../components/marketplace/ChatPanel';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useScrollY } from '../hooks/useScrollY';
import { api } from '../lib/api';
import { fmtPKR, imgFallback } from '../lib/format';
import { imgUrl, slugifyCategory } from '../data/catalogue';

const RELATED_LIMIT = 6;

function RelatedCard({ p, onOpen, onAddToCart }) {
  const outOfStock = p.stock <= 0;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-[#FBFAF7]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${p.name}`}
        className="block aspect-square w-full cursor-pointer overflow-hidden border-none bg-[#EAE5DB] p-0"
      >
        <img
          loading="lazy"
          decoding="async"
          src={imgUrl(p.img, 300)}
          onError={imgFallback(p.fb, 5)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </button>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <button
          type="button"
          onClick={onOpen}
          className="line-clamp-2 min-h-[2.6em] border-none bg-transparent p-0 text-left text-[13.5px] font-[650] leading-[1.3] text-ink hover:text-acc"
        >
          {p.name}
        </button>
        <span className="text-[15px] font-bold" data-tnum>
          {fmtPKR(p.price)}
        </span>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={outOfStock}
          className="mt-auto h-[38px] rounded-full border border-line bg-transparent text-[12.5px] font-semibold text-ink transition-colors hover:bg-black/5 disabled:pointer-events-none disabled:opacity-40"
        >
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}

/** /product/:id — premium buy-box product page: a ~40/60 zoomable-gallery / merged buy-box
 * split, key-highlight chips + full specs, warranty/shipping/installation info (real Settings
 * data, no invented delivery dates), a rating summary (no fabricated review text — this
 * backend only stores an aggregate rating/count, not individual reviews), a related-products
 * rail from the same category, and a scroll-triggered sticky quick-add bar docked under the
 * navbar (not the page bottom, which the site's MobileCtaBar/WhatsApp button already own). */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, findById, fetchProductById, loading } = useProducts();
  const { addToCart, wishlist, toggleWish } = useCart();
  const showToast = useToast();
  const scrollY = useScrollY();

  const d = findById(id);
  const [selectedImg, setSelectedImg] = useState(null);
  const [qty, setQty] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shipping, setShipping] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addToCartRef = useRef(null);

  useEffect(() => {
    setSelectedImg(null);
    setChatOpen(false);
    setLightboxOpen(false);
    window.scrollTo({ top: 0 });
  }, [id]);

  useEffect(() => {
    if (!d && !loading) fetchProductById(id);
  }, [d, loading, id, fetchProductById]);

  // Quantity starts at the product's minimum order quantity (not a hardcoded 1) — depends on
  // `d` itself, which may only become available a tick after the id-change effect above.
  useEffect(() => {
    if (!d) return;
    const moq = Math.max(1, Number(d.moq) || 1);
    setQty(Math.min(moq, Math.max(1, d.stock)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d?.id]);

  // Public, unauthenticated endpoint — used for the real (non-invented) shipping fee/
  // free-shipping-threshold shown in the Shipping & Delivery card below.
  useEffect(() => {
    let cancelled = false;
    api
      .get('/settings')
      .then((res) => {
        if (!cancelled) setShipping(res.data.shipping || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!addToCartRef.current) return;
    const rect = addToCartRef.current.getBoundingClientRect();
    setShowStickyBar(rect.bottom < 0);
  }, [scrollY]);

  const relatedProducts = useMemo(() => {
    if (!d) return [];
    return products.filter((p) => p.id !== d.id && p.cat === d.cat).slice(0, RELATED_LIMIT);
  }, [products, d]);

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
  const allSpecs = Object.keys(d.specs || {}).map((k) => ({ k, v: d.specs[k] }));
  const highlightSpecs = allSpecs.slice(0, 4);
  const total = d.price * qty;

  const shippingFee = shipping?.flatRate || 0;
  const freeShippingThreshold = shipping?.freeShippingThreshold || 0;

  function handleAddToCart() {
    addToCart(d.id, qty);
  }

  return (
    <div className="px-5 py-6 sm:py-8">
      {/* Sticky quick-add bar — appears once the main Add to Cart button scrolls out of view.
          Docked under the navbar (not the page bottom, already owned by MobileCtaBar/
          WhatsAppFloatButton) so it never competes with those for space. */}
      <div
        className="fixed inset-x-0 top-[100px] z-[300] border-b border-line bg-paper/95 backdrop-blur-md transition-transform duration-300"
        style={{ transform: showStickyBar ? 'translateY(0)' : 'translateY(-120%)' }}
      >
        <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-5 py-2.5">
          <img src={imgUrl(d.img, 100)} alt="" className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{d.name}</span>
          <span className="hidden text-[15px] font-bold sm:block" data-tnum>
            {fmtPKR(d.price)}
          </span>
          {!outOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-shrink-0 rounded-full border-none bg-ink px-4 py-2.5 text-[13px] font-[680] text-paper transition-transform hover:-translate-y-0.5 sm:px-5"
            >
              <Bi en="Add to cart" ur="کارٹ میں ڈالیں" />
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1320px] flex-col gap-5">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Marketplace', to: '/marketplace' },
            { label: d.cat, to: `/marketplace?category=${slugifyCategory(d.cat)}` },
            { label: d.name },
          ]}
        />

        {/* Gallery (~40%) + merged buy box (~60%) */}
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-9">
          <div className="flex flex-col gap-3 lg:sticky lg:top-[104px]">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={`Enlarge image of ${d.name}`}
              className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[22px] border border-line bg-[#EAE5DB] p-0"
            >
              <img
                loading="lazy"
                decoding="async"
                src={imgUrl(activeImg, 900)}
                alt={d.name}
                onError={imgFallback('product', 1)}
                className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.06]"
              />
              <span className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full border border-[rgba(245,242,236,0.25)] bg-[rgba(15,14,11,0.55)] text-[14px] text-paper opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                ⤢
              </span>
            </button>

            {gallery.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {gallery.map((g, i) => (
                  <button
                    key={`${g}-${i}`}
                    type="button"
                    onClick={() => setSelectedImg(g)}
                    aria-label={`View image ${i + 1} of ${d.name}`}
                    aria-current={activeImg === g}
                    style={{ borderColor: activeImg === g ? 'var(--color-acc)' : 'transparent' }}
                    className="h-[54px] w-[54px] flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-[#EAE5DB] p-0 transition-opacity hover:opacity-90"
                  >
                    <img loading="lazy" decoding="async" src={imgUrl(g, 160)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Merged buy box */}
          <div className="flex flex-col gap-4 rounded-[24px] border border-line bg-paper p-[clamp(18px,2.2vw,28px)] shadow-[0_24px_64px_-48px_rgba(23,21,15,0.4)]">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">{d.cat}</span>
              <button
                type="button"
                onClick={() => toggleWish(d.id)}
                aria-pressed={isWished}
                aria-label={isWished ? `Remove ${d.name} from saved` : `Save ${d.name}`}
                style={{ color: isWished ? 'var(--color-acc)' : 'var(--color-mut)' }}
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-line bg-transparent text-[16px] transition-colors hover:bg-black/5"
              >
                ♥
              </button>
            </div>

            <h1 className="text-[clamp(22px,2.4vw,28px)] font-[680] leading-[1.12] tracking-[-0.028em]">{d.name}</h1>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13.5px] text-mut">
              <a href="#reviews" className="flex items-center gap-1 hover:text-ink">
                {d.reviews > 0 ? (
                  <>
                    <span className="text-acc" aria-hidden="true">
                      ★
                    </span>
                    <span className="font-semibold text-ink">{d.rating.toFixed(1)}</span>({d.reviews})
                  </>
                ) : (
                  'No reviews yet'
                )}
              </a>
              <span className="h-3 w-px bg-line" />
              <span style={{ color: outOfStock ? '#8A2B1B' : lowStock ? '#8A2B1B' : '#1E5B39' }} className="font-semibold">
                {outOfStock ? 'Out of stock' : lowStock ? `Only ${d.stock} in stock` : 'In stock'}
              </span>
              {d.tag && (
                <>
                  <span className="h-3 w-px bg-line" />
                  <span className="font-semibold text-acc">{d.tag}</span>
                </>
              )}
            </div>

            <div className="flex items-baseline gap-1.5 border-t border-line pt-3.5">
              <span className="text-[30px] font-bold tracking-[-0.03em]" data-tnum>
                {fmtPKR(d.price)}
              </span>
              {d.unit && <span className="text-[13px] text-mut">{d.unit}</span>}
              {moq > 1 && (
                <span className="ml-1.5 rounded-full bg-acc-soft px-2.5 py-[3px] text-[11.5px] font-semibold text-[#8A6416]">
                  Min. order {moq}
                </span>
              )}
            </div>

            {d.note && <p className="text-[14.5px] leading-[1.6] text-mut">{d.note}</p>}

            {highlightSpecs.length > 0 && (
              <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {highlightSpecs.map((sp) => (
                  <div key={sp.k} className="flex items-baseline gap-1.5 text-[13px]">
                    <span aria-hidden="true" className="text-acc">
                      ✓
                    </span>
                    <span className="text-mut">{sp.k}:</span>
                    <span className="font-semibold text-ink">{sp.v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity + Add to cart, merged into this same card */}
            <div className="flex flex-col gap-3 border-t border-line pt-4" ref={addToCartRef}>
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
                      <span className="text-[21px] font-bold tracking-[-0.025em]" data-tnum>
                        {fmtPKR(total)}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 rounded-full border-none bg-ink px-5 py-4 text-[15px] font-[680] text-paper transition-transform hover:-translate-y-0.5"
                    >
                      <Bi en="Add to cart" ur="کارٹ میں ڈالیں" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatOpen(true)}
                      className="flex-shrink-0 rounded-full border border-line bg-transparent px-5 py-4 text-[14px] font-semibold text-ink transition-colors hover:bg-black/5"
                    >
                      <Bi en="Chat" ur="چیٹ" />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5 border-t border-line pt-3.5 text-[13px] text-mut">
              <span className="text-mut/80">Sold &amp; installed by</span>
              <span className="font-[650] text-ink">{d.seller}</span>
            </div>
          </div>
        </div>

        {/* Specifications / Warranty & Delivery / Reviews */}
        <div className="mt-2 grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
          <section className="flex flex-col gap-3 rounded-[22px] border border-line bg-paper p-[clamp(18px,2.2vw,26px)]">
            <h2 className="text-[17px] font-[680] tracking-[-0.02em]">Specifications</h2>
            {allSpecs.length > 0 ? (
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
                {allSpecs.map((sp) => (
                  <div key={sp.k} className="flex items-center justify-between gap-3 bg-[#FBFAF7] px-[15px] py-[11px]">
                    <span className="text-[13px] text-mut">{sp.k}</span>
                    <span className="text-right text-[13.5px] font-semibold">{sp.v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13.5px] text-mut">No detailed specifications listed for this product.</p>
            )}
          </section>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <section className="flex h-full flex-col gap-1.5 rounded-[22px] border border-line bg-[#FBFAF7] p-5">
              <span className="text-[20px]" aria-hidden="true">
                🛡️
              </span>
              <h3 className="text-[14.5px] font-[650]">Warranty</h3>
              <p className="text-[13px] leading-[1.55] text-mut">
                {d.warranty || 'Contact the seller for warranty details on this product.'}
              </p>
            </section>

            <section className="flex h-full flex-col gap-1.5 rounded-[22px] border border-line bg-[#FBFAF7] p-5">
              <span className="text-[20px]" aria-hidden="true">
                🚚
              </span>
              <h3 className="text-[14.5px] font-[650]">Shipping &amp; delivery</h3>
              <p className="text-[13px] leading-[1.55] text-mut">
                {shippingFee > 0 ? `Delivery: ${fmtPKR(shippingFee)}` : 'Free delivery within our service areas.'}
                {freeShippingThreshold > 0 && ` Free on orders over ${fmtPKR(freeShippingThreshold)}.`}
                {' '}
                Exact timing confirmed by the seller after your order.
              </p>
            </section>

            <section className="flex h-full flex-col gap-1.5 rounded-[22px] border border-line bg-[#FBFAF7] p-5 sm:col-span-2 lg:col-span-1">
              <span className="text-[20px]" aria-hidden="true">
                🔧
              </span>
              <h3 className="text-[14.5px] font-[650]">Installation &amp; support</h3>
              <p className="text-[13px] leading-[1.55] text-mut">
                Need install pricing, sizing advice, or a site visit? Chat with{' '}
                <span className="font-semibold text-ink">{d.seller}</span> directly.
              </p>
            </section>
          </div>
        </div>

        {/* Reviews — aggregate rating only; this backend doesn't store individual reviews, so
            nothing here is invented placeholder content. */}
        <section id="reviews" className="scroll-mt-[110px] rounded-[22px] border border-line bg-paper p-[clamp(18px,2.2vw,26px)]">
          <h2 className="mb-3 text-[17px] font-[680] tracking-[-0.02em]">Reviews</h2>
          {d.reviews > 0 ? (
            <div className="flex items-center gap-5">
              <span className="text-[38px] font-bold tracking-[-0.03em]" data-tnum>
                {d.rating.toFixed(1)}
              </span>
              <div className="flex flex-col gap-1">
                <span aria-hidden="true" className="text-[18px] text-acc">
                  {'★'.repeat(Math.round(d.rating))}
                  {'☆'.repeat(5 - Math.round(d.rating))}
                </span>
                <span className="text-[13px] text-mut">Based on {d.reviews} customer review{d.reviews === 1 ? '' : 's'}</span>
              </div>
            </div>
          ) : (
            <p className="text-[13.5px] text-mut">No reviews yet for this product.</p>
          )}
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="flex flex-col gap-3.5">
            <h2 className="text-[17px] font-[680] tracking-[-0.02em]">You may also like</h2>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
              {relatedProducts.map((p) => (
                <RelatedCard
                  key={p.id}
                  p={p}
                  onOpen={() => navigate(`/product/${p.id}`)}
                  onAddToCart={() => addToCart(p.id, 1)}
                />
              ))}
            </div>
          </section>
        )}
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
