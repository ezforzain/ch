import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Bi from '../ui/Bi';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { slugifyCategory } from '../../data/catalogue';
import { useProducts } from '../../context/ProductsContext';
import ProductCard from './ProductCard';
import CartDrawer from './CartDrawer';
import CompareModal from './CompareModal';
import Pagination from './Pagination';

const PER_PAGE = 8;

// --- search: tokenize + naive singularize + haystack match — transcribed from catalogueVals() ---
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9× ]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function tokenize(query) {
  return normalizeText(query)
    .split(' ')
    .filter(Boolean)
    .map((t) => (t.length > 3 && t.slice(-1) === 's' ? t.slice(0, -1) : t));
}

function productHaystack(p) {
  return normalizeText(
    p.name +
      ' ' +
      p.cat +
      ' ' +
      p.note +
      ' ' +
      (p.seller || '') +
      ' ' +
      (p.tag || '') +
      ' ' +
      (p.id || '') +
      ' ' +
      (p.fb || '').replace(/,/g, ' ') +
      ' ' +
      Object.keys(p.specs || {})
        .map((k) => k + ' ' + p.specs[k])
        .join(' '),
  );
}

function matchesFilters(p, category, tokens, brand, minPrice, maxPrice) {
  const min = minPrice === '' ? null : Number(minPrice);
  const max = maxPrice === '' ? null : Number(maxPrice);
  return (
    (category === 'All' || p.cat === category) &&
    (!tokens.length || tokens.every((t) => productHaystack(p).indexOf(t) >= 0)) &&
    (brand === 'All' || p.seller === brand) &&
    (min === null || Number.isNaN(min) || p.price >= min) &&
    (max === null || Number.isNaN(max) || p.price <= max)
  );
}

/**
 * The marketplace grid — rendered at the /marketplace route (see src/pages/Marketplace.jsx).
 * Owns search/sort/filter/pagination state; cart + wishlist now live in CartContext (shared
 * with the /product/:id page) instead of local state, and the selected category is derived
 * from the URL (?category=<slug>) via react-router's useSearchParams instead of the old
 * #category/<slug> hash convention, so it composes with normal <Link>s from anywhere in the
 * app and gets real back/forward support. All math/formatting is delegated to `lib/format.js`
 * and `data/catalogue.js` — this file is state + wiring.
 */
export default function MarketplaceSection() {
  const showToast = useToast();
  const navigate = useNavigate();
  const { products: CATALOGUE, categories: liveCategories, findById } = useProducts();
  const { wishlist, cartLines, wishItems, cartUnits, addToCart, setLineQty, toggleWish, checkout } = useCart();

  // Real categories now come from the database (ProductsContext), not a hardcoded list —
  // 'All' is a UI-only pseudo-category prepended for the filter chips/select.
  const CATEGORIES = useMemo(() => ['All', ...liveCategories.map((c) => c.name)], [liveCategories]);

  const [searchParams, setSearchParams] = useSearchParams();
  const category = useMemo(() => {
    const slug = searchParams.get('category');
    if (!slug) return 'All';
    return CATEGORIES.find((c) => slugifyCategory(c) === slug) || 'All';
  }, [searchParams, CATEGORIES]);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [brand, setBrand] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [sheet, setSheet] = useState(null); // 'drawer' | 'compare' | null
  const [drawerKind, setDrawerKind] = useState('cart'); // 'cart' | 'wish'
  const [compare, setCompare] = useState([]); // [id] — not persisted, matches source

  const loadTimer = useRef(null);

  const softLoad = useCallback((patch) => {
    setLoading(true);
    if ('search' in patch) setSearch(patch.search);
    if ('sort' in patch) setSort(patch.sort);
    if ('brand' in patch) setBrand(patch.brand);
    if ('minPrice' in patch) setMinPrice(patch.minPrice);
    if ('maxPrice' in patch) setMaxPrice(patch.maxPrice);
    if ('page' in patch) setPage(patch.page);
    clearTimeout(loadTimer.current);
    loadTimer.current = setTimeout(() => setLoading(false), 260);
  }, []);

  useEffect(() => () => clearTimeout(loadTimer.current), []);

  const pickCategory = (cat) => {
    setLoading(true);
    clearTimeout(loadTimer.current);
    loadTimer.current = setTimeout(() => setLoading(false), 260);
    setPage(1);
    setSearchParams(cat === 'All' ? {} : { category: slugifyCategory(cat) });
  };

  const clearFilters = () => {
    setSearchParams({});
    softLoad({ search: '', brand: 'All', minPrice: '', maxPrice: '', page: 1 });
  };

  // --- filter / sort / paginate ---
  const { items, all, pageCount, pageClamped } = useMemo(() => {
    const tokens = tokenize(search);
    let filtered = CATALOGUE.filter((p) => matchesFilters(p, category, tokens, brand, minPrice, maxPrice));
    if (sort === 'low') filtered = filtered.slice().sort((a, b) => a.price - b.price);
    else if (sort === 'high') filtered = filtered.slice().sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered = filtered.slice().sort((a, b) => b.rating - a.rating);
    else if (sort === 'latest') filtered = filtered.slice().sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''));
    else filtered = filtered.slice().sort((a, b) => b.pop - a.pop);

    const count = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const clamped = Math.min(Math.max(1, page || 1), count);
    return {
      all: filtered,
      pageCount: count,
      pageClamped: clamped,
      items: filtered.slice((clamped - 1) * PER_PAGE, clamped * PER_PAGE),
    };
  }, [search, sort, category, brand, minPrice, maxPrice, page, CATALOGUE]);

  // --- distinct seller/brand values for the brand filter — derived from CATALOGUE only ---
  const brands = useMemo(
    () => Array.from(new Set(CATALOGUE.map((p) => p.seller).filter(Boolean))).sort(),
    [CATALOGUE],
  );

  const isEmpty = !loading && items.length === 0;
  const priceRangeInverted =
    minPrice !== '' && maxPrice !== '' && !Number.isNaN(Number(minPrice)) && !Number.isNaN(Number(maxPrice)) && Number(minPrice) > Number(maxPrice);
  const resultLabel =
    all.length === 0
      ? 'No products found'
      : all.length +
        (all.length === 1 ? ' product' : ' products') +
        (category === 'All' ? ' across ' + (CATEGORIES.length - 1) + ' categories' : ' in ' + category) +
        (pageCount > 1 ? ' · page ' + pageClamped + ' of ' + pageCount : '');

  const chips = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        cat,
        count: cat === 'All' ? CATALOGUE.length : CATALOGUE.filter((p) => p.cat === cat).length,
      })),
    [CATALOGUE, CATEGORIES],
  );

  const toggleCompare = (id) => {
    setCompare((prev) => {
      const has = prev.indexOf(id) >= 0;
      if (!has && prev.length >= 3) {
        showToast('Compare up to three products');
        return prev;
      }
      const next = has ? prev.filter((x) => x !== id) : prev.concat([id]);
      if (!has && next.length >= 2) showToast(`${next.length} products ready to compare`);
      return next;
    });
  };

  // --- overlay open/close ---
  const openDetail = (id) => navigate(`/product/${id}`);
  const closeAll = () => setSheet(null);
  const openCart = () => {
    setDrawerKind('cart');
    setSheet('drawer');
  };
  const openWishlist = () => {
    setDrawerKind('wish');
    setSheet('drawer');
  };
  const openCompare = () => setSheet('compare');

  const compareProducts = useMemo(() => compare.map((id) => findById(id)).filter(Boolean), [compare, findById]);

  return (
    <section id="products" aria-labelledby="mk-h" className="px-5 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-acc">
              <Bi en="Marketplace" ur="مارکیٹ پلیس" />
            </span>
            <h2 id="mk-h" className="mt-3 text-[clamp(31px,4.1vw,56px)] font-[680] leading-[1.02] tracking-[-0.035em]">
              <Bi en="Everything we stock" ur="ہمارا مکمل اسٹاک" />
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCompare}
              aria-label="Open comparison"
              className="flex h-[46px] items-center gap-2 rounded-full border border-line bg-[#FBFAF7] px-4 text-sm font-semibold text-ink transition-colors hover:bg-black/5"
            >
              <Bi en="Compare" ur="موازنہ" />
              {compareProducts.length > 0 && (
                <span className="grid min-w-[21px] place-items-center rounded-full bg-ink px-1.5 py-0.5 text-[11.5px] font-bold text-paper" data-tnum>
                  {compareProducts.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={openWishlist}
              aria-label="Open wishlist"
              className="flex h-[46px] items-center gap-2 rounded-full border border-line bg-[#FBFAF7] px-4 text-sm font-semibold text-ink transition-colors hover:bg-black/5"
            >
              <span aria-hidden="true">♥</span>
              <Bi en="Saved" ur="محفوظ" />
              {wishItems.length > 0 && (
                <span className="grid min-w-[21px] place-items-center rounded-full bg-ink px-1.5 py-0.5 text-[11.5px] font-bold text-paper" data-tnum>
                  {wishItems.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label="Open cart"
              className="flex h-[46px] items-center gap-2 rounded-full border-none bg-ink px-[18px] text-sm font-[650] text-paper transition-transform hover:-translate-y-0.5"
            >
              <Bi en="Cart" ur="کارٹ" />
              {cartUnits > 0 && (
                <span className="grid min-w-[21px] place-items-center rounded-full bg-acc px-1.5 py-0.5 text-[11.5px] font-bold text-[#17150F]" data-tnum>
                  {cartUnits}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <label className="flex h-12 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-line bg-[#FBFAF7] px-4">
            <span aria-hidden="true" className="text-mut">⌕</span>
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search panels, inverters, batteries…"
              value={search}
              onChange={(e) => softLoad({ search: e.target.value, page: 1 })}
              className="min-w-0 flex-1 border-none bg-transparent text-[15px] outline-none"
            />
          </label>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(e) => softLoad({ sort: e.target.value, page: 1 })}
            className="h-12 cursor-pointer rounded-full border border-line bg-[#FBFAF7] px-3.5 text-[14.5px]"
          >
            <option value="popular">Most popular</option>
            <option value="latest">Newest first</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
          <select
            aria-label="Filter by brand"
            value={brand}
            onChange={(e) => softLoad({ brand: e.target.value, page: 1 })}
            className="h-12 cursor-pointer rounded-full border border-line bg-[#FBFAF7] px-3.5 text-[14.5px]"
          >
            <option value="All">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <label className="flex h-12 items-center gap-2 rounded-full border border-line bg-[#FBFAF7] px-4">
            <span className="whitespace-nowrap text-[13px] text-mut">
              <Bi en="Price" ur="قیمت" />
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              aria-label="Minimum price"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => softLoad({ minPrice: e.target.value, page: 1 })}
              className="w-[76px] min-w-0 border-none bg-transparent text-[14.5px] outline-none"
            />
            <span aria-hidden="true" className="text-mut">–</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              aria-label="Maximum price"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => softLoad({ maxPrice: e.target.value, page: 1 })}
              className="w-[76px] min-w-0 border-none bg-transparent text-[14.5px] outline-none"
            />
          </label>
        </div>

        <div aria-label="Product categories" className="flex gap-2.5 overflow-x-auto py-1 pb-3.5">
          {chips.map(({ cat, count }) => {
            const selected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={selected}
                onClick={() => pickCategory(cat)}
                style={
                  selected
                    ? { background: 'var(--color-ink)', color: '#F5F2EC', borderColor: 'var(--color-ink)' }
                    : { background: '#FBFAF7', color: 'var(--color-ink)', borderColor: 'var(--color-line)' }
                }
                className="inline-flex flex-shrink-0 items-center gap-[7px] whitespace-nowrap rounded-full border px-[17px] py-[11px] text-[13.5px] font-semibold transition-colors"
              >
                {cat} <span className="opacity-[0.55]">{count}</span>
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="mb-4 text-xs font-semibold uppercase tracking-[0.07em] text-mut">
          {resultLabel}
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(272px,1fr))] sm:gap-6">
            {Array.from({ length: Math.min(PER_PAGE, Math.max(4, items.length || 8)) }, (_, i) => (
              <div key={i} aria-hidden="true" className="overflow-hidden rounded-[26px] border border-line bg-[#FBFAF7]">
                <div
                  className="animate-ce-shimmer aspect-square"
                  style={{
                    background: 'linear-gradient(100deg,#EDE8DF 30%,#F6F3EC 50%,#EDE8DF 70%)',
                    backgroundSize: '200% 100%',
                  }}
                />
                <div className="flex flex-col gap-2.5 p-5">
                  <div className="h-2.5 w-[38%] rounded-full bg-[#EDE8DF]" />
                  <div className="h-3.5 w-[82%] rounded-full bg-[#EDE8DF]" />
                  <div className="h-3 w-[60%] rounded-full bg-[#EDE8DF]" />
                  <div className="mt-2 h-4 w-[44%] rounded-full bg-[#EDE8DF]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(272px,1fr))] sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
            {items.map((p) => (
              <div key={p.id} className="w-[78vw] max-w-[300px] flex-shrink-0 snap-start sm:w-auto sm:max-w-none">
                <ProductCard
                  product={p}
                  wished={wishlist.indexOf(p.id) >= 0}
                  compared={compare.indexOf(p.id) >= 0}
                  onOpen={() => openDetail(p.id)}
                  onToggleWish={() => toggleWish(p.id)}
                  onToggleCompare={() => toggleCompare(p.id)}
                  onAddToCart={() => addToCart(p.id, 1)}
                />
              </div>
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center gap-3.5 rounded-3xl border border-dashed border-[rgba(23,21,15,0.18)] px-5 py-[70px] text-center">
            <span aria-hidden="true" className="text-2xl opacity-40">⌕</span>
            <span className="text-xl font-[650] tracking-[-0.02em]">
              <Bi en="Nothing matches that yet" ur="کوئی نتیجہ نہیں ملا" />
            </span>
            <span className="max-w-[400px] text-[15px] leading-[1.6] text-mut">
              {priceRangeInverted ? (
                <Bi
                  en="Your minimum price is higher than your maximum — adjust the range and try again."
                  ur="آپ کی کم از کم قیمت زیادہ سے زیادہ قیمت سے زیادہ ہے — رینج درست کریں۔"
                />
              ) : (
                <Bi
                  en="We stock far more than we list online. Tell us what you need and we will source it."
                  ur="ہمارے پاس اس سے کہیں زیادہ اسٹاک ہے۔ بتائیں کیا چاہیے، ہم منگوا دیں گے۔"
                />
              )}
            </span>
            <span className="flex flex-wrap justify-center gap-2.5">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-line bg-transparent px-5 py-3.5 text-[14.5px] font-semibold text-ink transition-colors hover:bg-black/5"
              >
                <Bi en="Clear filters" ur="فلٹر ہٹائیں" />
              </button>
              <a href="/#quote" className="rounded-full bg-ink px-5 py-3.5 text-[14.5px] font-[650] text-paper">
                <Bi en="Request it" ur="درخواست کریں" />
              </a>
            </span>
          </div>
        )}

        {!loading && pageCount > 1 && (
          <Pagination
            page={pageClamped}
            pageCount={pageCount}
            onGo={(n) => softLoad({ page: n })}
            onPrev={() => pageClamped > 1 && softLoad({ page: pageClamped - 1 })}
            onNext={() => pageClamped < pageCount && softLoad({ page: pageClamped + 1 })}
          />
        )}
      </div>

      <CartDrawer
        open={sheet === 'drawer'}
        onClose={closeAll}
        kind={drawerKind}
        cartLines={cartLines}
        wishItems={wishItems}
        onOpenProduct={(id) => {
          closeAll();
          openDetail(id);
        }}
        onIncQty={(id) => {
          const line = cartLines.find((l) => l.id === id);
          if (line) setLineQty(id, line.qty + 1);
        }}
        onDecQty={(id) => {
          const line = cartLines.find((l) => l.id === id);
          if (line) setLineQty(id, line.qty - 1);
        }}
        onRemoveCartLine={(id) => setLineQty(id, 0)}
        onRemoveWish={toggleWish}
        onAddToCartFromWish={(id) => addToCart(id, 1)}
        onCheckout={checkout}
      />

      <CompareModal open={sheet === 'compare'} onClose={closeAll} products={compareProducts} onRemove={toggleCompare} />
    </section>
  );
}
