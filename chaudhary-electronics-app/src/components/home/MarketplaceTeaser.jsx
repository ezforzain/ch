import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Bi from '../ui/Bi';
import { useProducts } from '../../context/ProductsContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../marketplace/ProductCard';

const TEASER_COUNT = 8;

/** Home's lightweight marketplace preview — top products only, no search/filter/
 * pagination state, so the full state engine (MarketplaceSection) only ever runs once,
 * at /marketplace. Reuses ProductCard as-is and shares cart/wishlist with the rest of
 * the app via CartContext. Compare isn't available from here (it's a full-marketplace
 * feature) — tapping it sends the shopper to /marketplace instead. */
export default function MarketplaceTeaser() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { products } = useProducts();
  const { wishlist, toggleWish, addToCart } = useCart();

  const featured = useMemo(
    () =>
      products
        .slice()
        .sort((a, b) => b.pop - a.pop)
        .slice(0, TEASER_COUNT),
    [products],
  );

  if (!featured.length) return null;

  return (
    <section id="products" aria-labelledby="mk-teaser-h" className="px-5 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-acc">
              <Bi en="Marketplace" ur="مارکیٹ پلیس" />
            </span>
            <h2 id="mk-teaser-h" className="mt-3 text-[clamp(31px,4.1vw,56px)] font-[680] leading-[1.02] tracking-[-0.035em]">
              <Bi en="Everything we stock" ur="ہمارا مکمل اسٹاک" />
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="flex h-[46px] items-center gap-2 rounded-full border-none bg-ink px-[18px] text-sm font-[650] text-paper transition-transform hover:-translate-y-0.5"
          >
            <Bi en="View all products" ur="تمام پروڈکٹس دیکھیں" /> <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(272px,1fr))] sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
          {featured.map((p) => (
            <div key={p.id} className="w-[78vw] max-w-[300px] flex-shrink-0 snap-start sm:w-auto sm:max-w-none">
              <ProductCard
                product={p}
                wished={wishlist.indexOf(p.id) >= 0}
                compared={false}
                onOpen={() => navigate(`/product/${p.id}`)}
                onToggleWish={() => toggleWish(p.id)}
                onToggleCompare={() => {
                  showToast('Open the full marketplace to compare products');
                  navigate('/marketplace');
                }}
                onAddToCart={() => addToCart(p.id, 1)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
