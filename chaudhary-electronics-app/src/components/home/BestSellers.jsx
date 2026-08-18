import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import Bi from '../ui/Bi';
import ProductCard from '../marketplace/ProductCard';
import { useProducts } from '../../context/ProductsContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const COUNT = 8;

function ProductRow({ products, wishlist, toggleWish, addToCart, navigate, showToast }) {
  return (
    <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1">
      {products.map((p) => (
        <div key={p.id} className="w-[62vw] max-w-[240px] flex-shrink-0 snap-start">
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
  );
}

/** Mobile storefront's "Deals" / "Best Sellers" row — the target of the hero's "Today's
 * deals" link (`#deals`). Deals only renders when a product actually carries a discount
 * (`originalPrice` > `price`, same rule ProductCard uses for its "Sale" badge) — none of
 * the seed catalogue does, so on a fresh install this quietly collapses to just Best
 * Sellers instead of showing an empty/fake deals row. Best Sellers is sorted by review
 * count rather than Featured's popularity score, so the two rows aren't just the same
 * products twice. */
export default function BestSellers() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { products } = useProducts();
  const { wishlist, toggleWish, addToCart } = useCart();

  const deals = useMemo(
    () =>
      products
        .filter((p) => Number(p.originalPrice) > Number(p.price))
        .sort((a, b) => b.pop - a.pop)
        .slice(0, COUNT),
    [products],
  );

  const bestSellers = useMemo(
    () =>
      products
        .slice()
        .sort((a, b) => b.reviews - a.reviews)
        .slice(0, COUNT),
    [products],
  );

  if (!bestSellers.length) return null;

  const rowProps = { wishlist, toggleWish, addToCart, navigate, showToast };

  return (
    <section id="deals" aria-labelledby="deals-h" className="px-5 py-8">
      {deals.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="h-[17px] w-[17px] text-[#B23B1E]" aria-hidden="true" />
            <h2 id="deals-h" className="text-[13px] font-bold tracking-[-0.01em] text-ink">
              <Bi en="Today's Deals" ur="آج کی ڈیلز" />
            </h2>
          </div>
          <ProductRow products={deals} {...rowProps} />
        </div>
      )}

      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-[13px] font-bold tracking-[-0.01em] text-ink">
          <Bi en="Best Sellers" ur="زیادہ فروخت ہونے والے" />
        </h2>
        <Link to="/marketplace" className="flex items-center gap-1 text-[12.5px] font-semibold text-acc">
          <Bi en="View all" ur="سب دیکھیں" /> <span aria-hidden="true">→</span>
        </Link>
      </div>
      <ProductRow products={bestSellers} {...rowProps} />
    </section>
  );
}
