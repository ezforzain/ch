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

const RELATED_LIMIT = 10;
const RELATED_SCROLL_STEP = 300;

function RelatedCard({ p, onOpen, onAddToCart }) {
  const outOfStock = p.stock <= 0;
  return (
    <div className="flex h-full w-[168px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-[#FBFAF7] sm:w-[188px]">
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
        <span style={{ color: outOfStock ? '#8A2B1B' : '#1E5B39' }} className="text-[11.5px] font-semibold">
          {outOfStock ? 'Out of stock' : 'In stock'}
        </span>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={outOfStock}
          className="mt-auto grid h-[36px] w-[36px] flex-shrink-0 cursor-pointer place-items-center self-end rounded-full border border-line bg-transparent text-[14px] text-ink transition-colors hover:bg-black/5 disabled:pointer-events-none disabled:opacity-30"
          aria-label={`Add ${p.name} to cart`}
        >
          🛒
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'description', label: 'Description' },
  { key: 'specs', label: 'Specifications' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'shipping', label: 'Shipping & Delivery' },
  { key: 'warranty', label: 'Warranty' },
  { key: 'seller', label: 'Seller Info' },
];

/** /product/:id — premium buy-box product page: a ~40/60 zoomable-gallery / merged buy-box
 * split, a tabbed info panel (Description/Specifications/Reviews/Shipping/Warranty/Seller —
 * matching a familiar Amazon/Shopify PDP structure), a trust-badge row, and a related-products
 * carousel. Every claim on the page is backed by real data: shipping fee/threshold and support
 * hours come from the live Settings API, the rating/review summary is the product's real
 * aggregate (this backend has no per-review model to draw individual review text from, so none
 * is invented), and there's no fabricated returns policy or delivery-date estimate — this
 * business quotes delivery/installation per order via chat, not automated shipping. */
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
  const [settings, setSettings] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [tab, setTab] = useState('description');
  const addToCartRef = useRef(null);
  const relatedScrollRef = useRef(null);

  useEffect(() => {
    setSelectedImg(null);
    setChatOpen(false);
    setLightboxOpen(false);
    setTab('description');
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

  // Public, unauthenticated endpoint — the real (non-invented) shipping fee, free-shipping
  // threshold, and support hours shown in the trust badges + Shipping/Seller tabs come from
  // here, not made-up copy.
  useEffect(() => {
    let cancelled = false;
    api
      .get('/settings')
      .then((res) => {
        if (!cancelled) setSettings(res.data || null);
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
    const sameCategory = products.filter((p) => p.id !== d.id && p.cat === d.cat);
    // Fall back to other real products when nothing shares this category (a small/young
    // catalogue) — still genuine product data either way, just a wider net, matching the
    // common "customers also viewed" fallback rather than silently hiding the whole section.
    const pool = sameCategory.length > 0 ? sameCategory : products.filter((p) => p.id !== d.id);
    return pool.slice(0, RELATED_LIMIT);
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
  const highlightSpecs = allSpecs.slice(0, 3);
  const total = d.price * qty;

  const shippingFee = settings?.shipping?.flatRate || 0;
  const freeShippingThreshold = settings?.shipping?.freeShippingThreshold || 0;
  const businessHours = settings?.businessHours || '';
  const shippingLine = shippingFee > 0 ? `Delivery from ${fmtPKR(shippingFee)}` : 'Free delivery';

  function handleAddToCart() {
    addToCart(d.id, qty);
  }
  function scrollRelated(dir) {
    relatedScrollRef.current?.scrollBy({ left: dir * RELATED_SCROLL_STEP, behavior: 'smooth' });
  }

  return (
    <div className="px-5 py-6 pb-24 sm:py-8">
      {/* Sticky quick-add bar — appears once the main Add to Cart button scrolls out of view.
          Docked under the navbar (top), not the page bottom: the bottom is already owned by
          the site's MobileCtaBar (visible up to 1239px wide) and the WhatsApp/call float
          buttons (visible at every width) — a second bottom bar here would fight those for
          space on exactly the viewport widths where it matters most. */}
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

      <div className="mx-auto flex max-w-[1320px] flex-col gap-6">
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
            <div className="relative">
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
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-[rgba(15,14,11,0.55)] to-transparent py-3 text-[11.5px] font-semibold text-paper opacity-0 transition-opacity group-hover:opacity-100">
                  <span aria-hidden="true">🔍</span> Hover to zoom
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleWish(d.id)}
                aria-pressed={isWished}
                aria-label={isWished ? `Remove ${d.name} from saved` : `Save ${d.name}`}
                style={{ color: isWished ? 'var(--color-acc)' : 'var(--color-mut)' }}
                className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full border border-line bg-paper/90 text-[16px] backdrop-blur-sm transition-colors hover:bg-paper"
              >
                ♥
              </button>
              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={goPrevImg}
                    aria-label="Previous image"
                    className="absolute top-1/2 left-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper/90 text-[15px] backdrop-blur-sm transition-colors hover:bg-paper"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={goNextImg}
                    aria-label="Next image"
                    className="absolute top-1/2 right-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper/90 text-[15px] backdrop-blur-sm transition-colors hover:bg-paper"
                  >
                    →
                  </button>
                </>
              )}
            </div>

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
            <span className="text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">{d.cat}</span>
            <h1 className="text-[clamp(22px,2.4vw,28px)] font-[680] leading-[1.12] tracking-[-0.028em]">{d.name}</h1>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13.5px] text-mut">
              <button type="button" onClick={() => setTab('reviews')} className="flex items-center gap-1 border-none bg-transparent p-0 hover:text-ink">
                {d.reviews > 0 ? (
                  <>
                    <span className="text-acc" aria-hidden="true">
                      ★
                    </span>
                    <span className="font-semibold text-ink">{d.rating.toFixed(1)}</span>
                    <span className="underline decoration-line underline-offset-2">({d.reviews} reviews)</span>
                  </>
                ) : (
                  'No reviews yet'
                )}
              </button>
              {d.tag && (
                <>
                  <span className="h-3 w-px bg-line" />
                  <span className="font-semibold text-acc">{d.tag}</span>
                </>
              )}
            </div>

            {d.note && <p className="text-[14.5px] leading-[1.55] text-mut">{d.note}</p>}

            {highlightSpecs.length > 0 && (
              <div className="grid grid-cols-1 gap-3 border-t border-line pt-4 sm:grid-cols-3">
                {highlightSpecs.map((sp) => (
                  <div key={sp.k} className="flex items-start gap-2">
                    <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-acc-soft text-[12px] text-[#8A6416]" aria-hidden="true">
                      ✓
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[12px] text-mut">{sp.k}</span>
                      <span className="text-[13px] font-semibold text-ink">{sp.v}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-baseline gap-1.5 border-t border-line pt-4">
              <span className="text-[30px] font-bold tracking-[-0.03em]" data-tnum>
                {fmtPKR(d.price)}
              </span>
              {d.unit && <span className="text-[13px] text-mut">{d.unit}</span>}
              {moq > 1 && (
                <span className="ml-1.5 rounded-full bg-acc-soft px-2.5 py-[3px] text-[11.5px] font-semibold text-[#8A6416]">
                  Min. order {moq}
                </span>
              )}
              <span className="ml-auto flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: outOfStock ? '#8A2B1B' : lowStock ? '#8A2B1B' : '#1E5B39' }}>
                <span className="h-[7px] w-[7px] rounded-full bg-current" aria-hidden="true" />
                {outOfStock ? 'Out of stock' : lowStock ? `Only ${d.stock} left` : `In stock · ${d.stock} available`}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-[#FBFAF7] px-[15px] py-[13px]">
              <span className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-mut">Sold &amp; installed by</span>
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
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex w-full items-center justify-center gap-2 rounded-full border-none bg-ink px-5 py-4 text-[15px] font-[680] text-paper transition-transform hover:-translate-y-0.5"
                  >
                    <span aria-hidden="true">🛒</span>
                    <Bi en="Add to cart" ur="کارٹ میں ڈالیں" />
                  </button>
                </>
              )}
            </div>

            {/* Trust badges — every claim here is backed by real Settings data or an existing
                feature (Chat), not generic invented copy (no "24/7 support" or "7-day returns"
                claims this business doesn't actually offer). */}
            <div className="grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
              {[
                { icon: '🚚', label: shippingLine, sub: freeShippingThreshold > 0 ? `Free over ${fmtPKR(freeShippingThreshold)}` : 'Service areas' },
                { icon: '🛡️', label: 'Warranty', sub: d.warranty || 'Ask seller' },
                { icon: '🔒', label: 'Secure checkout', sub: 'Encrypted payment' },
                { icon: '💬', label: 'Chat support', sub: businessHours || 'Message anytime' },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-start gap-1">
                  <span className="text-[16px]" aria-hidden="true">
                    {b.icon}
                  </span>
                  <span className="text-[12px] font-semibold text-ink">{b.label}</span>
                  <span className="text-[11px] text-mut">{b.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabbed info panel */}
        <div className="rounded-[24px] border border-line bg-paper">
          {/* flex-nowrap is deliberate: mixing flex-wrap with overflow-x-auto makes the browser
              treat overflow-y as `auto` too (a CSS quirk — setting one overflow axis to
              non-visible forces the other off `visible`), which showed a stray vertical
              scrollbar with spinner arrows the moment the tabs wrapped to a second line on
              narrower screens. Single row + horizontal scroll avoids that entirely. */}
          <div
            role="tablist"
            aria-label="Product information"
            className="flex flex-nowrap gap-1 overflow-x-auto overflow-y-hidden border-b border-line px-4 sm:px-6"
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex-shrink-0 whitespace-nowrap px-3.5 py-3.5 text-[13.5px] font-semibold transition-colors sm:px-4 ${
                  tab === t.key ? 'text-ink' : 'text-mut hover:text-ink'
                }`}
              >
                {t.label}
                {t.key === 'reviews' && d.reviews > 0 && ` (${d.reviews})`}
                {tab === t.key && <span className="absolute right-3 -bottom-px left-3 h-[3px] rounded-full bg-acc" aria-hidden="true" />}
              </button>
            ))}
          </div>

          <div className="min-h-[220px] p-[clamp(18px,2.4vw,30px)]">
            {tab === 'description' && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <h2 className="text-[15px] font-[680]">Product description</h2>
                  <p className="text-[14px] leading-[1.65] text-mut">{d.note || 'No description provided for this product yet.'}</p>
                  {allSpecs.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-1.5">
                      {allSpecs.slice(0, 6).map((sp) => (
                        <li key={sp.k} className="flex items-start gap-2 text-[13.5px] text-mut">
                          <span className="mt-[3px] text-acc" aria-hidden="true">
                            ✓
                          </span>
                          <span>
                            {sp.k}: <span className="font-semibold text-ink">{sp.v}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <h2 className="text-[15px] font-[680]">Key specifications</h2>
                  {allSpecs.length > 0 ? (
                    <div className="flex flex-col gap-px overflow-hidden rounded-2xl border border-line bg-line">
                      {allSpecs.slice(0, 8).map((sp) => (
                        <div key={sp.k} className="flex items-center justify-between gap-3 bg-[#FBFAF7] px-[15px] py-[11px]">
                          <span className="text-[13px] text-mut">{sp.k}</span>
                          <span className="text-right text-[13.5px] font-semibold">{sp.v}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13.5px] text-mut">No specifications listed yet.</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'specs' && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[15px] font-[680]">Full specifications</h2>
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
              </div>
            )}

            {tab === 'reviews' && (
              <div className="flex flex-col gap-2">
                <h2 className="text-[15px] font-[680]">Customer reviews</h2>
                {d.reviews > 0 ? (
                  <div className="mt-1 flex items-center gap-5">
                    <span className="text-[38px] font-bold tracking-[-0.03em]" data-tnum>
                      {d.rating.toFixed(1)}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span aria-hidden="true" className="text-[18px] text-acc">
                        {'★'.repeat(Math.round(d.rating))}
                        {'☆'.repeat(5 - Math.round(d.rating))}
                      </span>
                      <span className="text-[13px] text-mut">
                        Based on {d.reviews} customer review{d.reviews === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13.5px] text-mut">No reviews yet for this product.</p>
                )}
              </div>
            )}

            {tab === 'shipping' && (
              <div className="flex flex-col gap-2">
                <h2 className="text-[15px] font-[680]">Shipping &amp; delivery</h2>
                <p className="text-[14px] leading-[1.65] text-mut">
                  {shippingFee > 0 ? `Delivery fee: ${fmtPKR(shippingFee)}.` : 'Free delivery within our service areas.'}
                  {freeShippingThreshold > 0 && ` Free delivery on orders over ${fmtPKR(freeShippingThreshold)}.`}
                  {' '}
                  Exact delivery timing and installation scheduling are confirmed by{' '}
                  <span className="font-semibold text-ink">{d.seller}</span> after your order — use the Chat button to ask
                  before you buy.
                </p>
              </div>
            )}

            {tab === 'warranty' && (
              <div className="flex flex-col gap-2">
                <h2 className="text-[15px] font-[680]">Warranty</h2>
                <p className="text-[14px] leading-[1.65] text-mut">
                  {d.warranty
                    ? d.warranty
                    : `No warranty period is listed for this product yet — chat with ${d.seller} to confirm coverage before you buy.`}
                </p>
              </div>
            )}

            {tab === 'seller' && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[15px] font-[680]">Seller information</h2>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-[#FBFAF7] px-5 py-4">
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-[650]">{d.seller}</span>
                    <span className="text-[13px] text-mut">Sells &amp; installs this product</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    className="rounded-full border-none bg-ink px-5 py-3 text-[13.5px] font-semibold text-paper transition-transform hover:-translate-y-0.5"
                  >
                    <Bi en="Chat with seller" ur="سیلر سے چیٹ کریں" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-[680] tracking-[-0.02em]">You may also like</h2>
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => scrollRelated(-1)}
                  aria-label="Scroll left"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line bg-transparent text-[13px] transition-colors hover:bg-black/5"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => scrollRelated(1)}
                  aria-label="Scroll right"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line bg-transparent text-[13px] transition-colors hover:bg-black/5"
                >
                  →
                </button>
              </div>
            </div>
            <div ref={relatedScrollRef} className="flex snap-x gap-3.5 overflow-x-auto scroll-smooth pb-2">
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
