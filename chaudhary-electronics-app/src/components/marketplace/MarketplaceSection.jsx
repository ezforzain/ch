import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Bi from '../ui/Bi';
import { useToast } from '../../context/ToastContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { fmtPKR, waLink } from '../../lib/format';
import { slugifyCategory } from '../../data/catalogue';
import { useProducts } from '../../context/ProductsContext';
import ProductCard from './ProductCard';
import ProductDetailSheet from './ProductDetailSheet';
import CartDrawer from './CartDrawer';
import CompareModal from './CompareModal';
import ChatPanel from './ChatPanel';
import Pagination from './Pagination';

const PER_PAGE = 8;
const WHATSAPP_NUMBER = '920000000000';

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
 * The `#products` marketplace section. Owns search/sort/filter/pagination
 * state, cart + wishlist (persisted to localStorage exactly like the
 * source's `ce_cart_v1`/`ce_wishlist_v1`), the compare list, and which
 * overlay is open. All math/formatting is delegated to `lib/format.js` and
 * `data/catalogue.js` — this file is state + wiring.
 */
export default function MarketplaceSection() {
  const showToast = useToast();
  const sectionRef = useRef(null);
  const { products: CATALOGUE, categories: liveCategories, findById } = useProducts();

  // Real categories now come from the database (ProductsContext), not a hardcoded list —
  // 'All' is a UI-only pseudo-category prepended for the filter chips/select.
  const CATEGORIES = useMemo(() => ['All', ...liveCategories.map((c) => c.name)], [liveCategories]);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [category, setCategory] = useState('All');
  const [brand, setBrand] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [sheet, setSheet] = useState(null); // 'detail' | 'drawer' | 'compare' | 'chat' | null
  const [detailId, setDetailId] = useState(null);
  const [detailImg, setDetailImg] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [drawerKind, setDrawerKind] = useState('cart'); // 'cart' | 'wish'

  const onStorageError = useCallback(
    () => showToast('Your browser blocked local storage — cart/wishlist changes won\'t be saved after you leave.'),
    [showToast],
  );
  const [cart, setCart] = useLocalStorage('ce_cart_v1', [], onStorageError); // [{ id, qty }]
  const [wishlist, setWishlist] = useLocalStorage('ce_wishlist_v1', [], onStorageError); // [id]
  const [compare, setCompare] = useState([]); // [id] — not persisted, matches source

  const loadTimer = useRef(null);

  // source: componentDidMount() prunes stale ids out of the persisted stores
  useEffect(() => {
    setCart((prev) => prev.filter((l) => l && findById(l.id)));
    setWishlist((prev) => prev.filter((id) => findById(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const softLoad = useCallback((patch) => {
    setLoading(true);
    if ('category' in patch) setCategory(patch.category);
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

  // --- hash-based category routing: #category/<slug> — source: categoryFromHash()/routeFromHash() ---
  const categoryFromHash = useCallback(() => {
    const m = (window.location.hash || '').match(/^#category\/(.+)$/);
    if (!m) return null;
    const want = decodeURIComponent(m[1]).toLowerCase();
    return CATEGORIES.find((c) => slugifyCategory(c) === want) || null;
  }, [CATEGORIES]);

  const routeFromHash = useCallback(
    (smooth) => {
      const cat = categoryFromHash();
      if (!cat) return false;
      setCategory((prev) => {
        if (prev !== cat) setSearch('');
        return cat;
      });
      const sec = sectionRef.current;
      if (sec) {
        const top = window.scrollY + sec.getBoundingClientRect().top - 84;
        window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
      }
      return true;
    },
    [categoryFromHash],
  );

  useEffect(() => {
    const onHash = () => routeFromHash(true);
    window.addEventListener('hashchange', onHash);
    if (categoryFromHash()) {
      const t = setTimeout(() => routeFromHash(false), 60);
      return () => {
        clearTimeout(t);
        window.removeEventListener('hashchange', onHash);
      };
    }
    return () => window.removeEventListener('hashchange', onHash);
  }, [routeFromHash, categoryFromHash]);

  const pickCategory = (cat) => {
    if (cat === 'All') {
      if (window.location.hash.startsWith('#category/')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      softLoad({ category: 'All', page: 1 });
      return;
    }
    const target = '#category/' + slugifyCategory(cat);
    if (window.location.hash !== target) {
      window.location.hash = target; // triggers hashchange -> routeFromHash
    } else {
      softLoad({ category: cat, page: 1 });
    }
  };

  const clearFilters = () => {
    if (window.location.hash.startsWith('#category/')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    softLoad({ category: 'All', search: '', brand: 'All', minPrice: '', maxPrice: '', page: 1 });
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

  // --- cart / wishlist / compare mutations ---
  const addToCart = (id, qty = 1) => {
    const p = findById(id);
    if (!p) return;
    if (p.stock <= 0) {
      showToast(`${p.name} is out of stock`);
      return;
    }
    setCart((prev) => {
      const next = prev.slice();
      const line = next.find((l) => l.id === id);
      const want = Math.max(1, qty || 1);
      if (line) line.qty = Math.min(p.stock, line.qty + want);
      else next.push({ id, qty: Math.min(p.stock, want) });
      return next;
    });
    showToast(`${p.name} added to cart`);
  };

  const setLineQty = (id, qty) => {
    const p = findById(id);
    setCart((prev) => {
      if (qty <= 0) return prev.filter((l) => l.id !== id);
      return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(p ? p.stock : qty, qty) } : l));
    });
  };

  const toggleWish = (id) => {
    const p = findById(id);
    setWishlist((prev) => {
      const has = prev.indexOf(id) >= 0;
      showToast(p ? (has ? 'Removed from saved' : `${p.name} saved`) : '');
      return has ? prev.filter((x) => x !== id) : prev.concat([id]);
    });
  };

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
  const openDetail = (id) => {
    const p = findById(id);
    setDetailId(id);
    setDetailImg(p ? p.img : null);
    setDetailQty(1);
    setSheet('detail');
  };
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
  const openChat = () => setSheet('chat');

  const detailProduct = detailId ? findById(detailId) : null;
  const cartLines = useMemo(
    () => cart.map((l) => ({ ...l, product: findById(l.id) })).filter((l) => l.product),
    [cart, findById],
  );
  const wishItems = useMemo(() => wishlist.map((id) => findById(id)).filter(Boolean), [wishlist, findById]);
  const compareProducts = useMemo(() => compare.map((id) => findById(id)).filter(Boolean), [compare, findById]);
  const cartUnits = cartLines.reduce((n, l) => n + l.qty, 0);

  const checkout = () => {
    if (!cartLines.length) return;

    // Stock can move (e.g. an admin edit) between adding to cart and checkout — reclamp
    // against current stock before sending, rather than trusting whatever was cached at
    // add-to-cart time.
    const adjustedNames = [];
    const validLines = [];
    cartLines.forEach((l) => {
      const stock = l.product.stock;
      if (stock <= 0) {
        adjustedNames.push(l.product.name);
        return;
      }
      const qty = Math.min(l.qty, stock);
      if (qty !== l.qty) adjustedNames.push(l.product.name);
      validLines.push({ id: l.id, qty });
    });
    if (adjustedNames.length) {
      setCart(validLines);
      showToast(`Stock changed for ${adjustedNames.join(', ')} — cart updated, please review and send again.`);
      return;
    }

    const cartTotal = cartLines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
    const lines = cartLines.map((l) => `• ${l.product.name} × ${l.qty} = ${fmtPKR(l.product.price * l.qty)}`);
    const msg =
      'Assalam o Alaikum, I would like to order:\n' +
      lines.join('\n') +
      '\nSubtotal: ' +
      fmtPKR(cartTotal) +
      '\nPlease confirm availability and installation cost.';
    window.open(waLink(WHATSAPP_NUMBER, msg), '_blank');
    showToast('Order sent — we reply within a few hours');
  };

  return (
    <section id="products" aria-labelledby="mk-h" ref={sectionRef} className="px-5 py-[clamp(64px,8vw,110px)]">
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
              <a href="#quote" className="rounded-full bg-ink px-5 py-3.5 text-[14.5px] font-[650] text-paper">
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

      <ProductDetailSheet
        product={detailProduct}
        open={sheet === 'detail' && !!detailProduct}
        onClose={closeAll}
        selectedImg={detailImg}
        onSelectImg={setDetailImg}
        qty={detailQty}
        onQtyChange={setDetailQty}
        onAddToCart={() => {
          if (detailId) addToCart(detailId, detailQty || 1);
          closeAll();
        }}
        onOpenChat={openChat}
      />

      <CartDrawer
        open={sheet === 'drawer'}
        onClose={closeAll}
        kind={drawerKind}
        cartLines={cartLines}
        wishItems={wishItems}
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

      <ChatPanel open={sheet === 'chat'} onClose={closeAll} product={detailProduct} />
    </section>
  );
}
