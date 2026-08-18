import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Bi from '../ui/Bi';
import ProductCard from '../marketplace/ProductCard';
import { useProducts } from '../../context/ProductsContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const COUNT = 8;

/** Mobile storefront's "Featured Products" row — the primary #products anchor on small
 * screens (Navbar/QuickSearch both jump to "#products"; the desktop layout points that
 * same id at <MarketplaceTeaser /> instead — see src/pages/Home.jsx). Prefers
 * admin-flagged featured products; falls back to the most popular ones so the section
 * never renders empty just because nothing's been flagged yet. */
export default function FeaturedProducts() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { products } = useProducts();
  const { wishlist, toggleWish, addToCart } = useCart();

  const featured = useMemo(() => {
    const flagged = products.filter((p) => p.featured);
    const pool = flagged.length ? flagged : products;
    return pool.slice().sort((a, b) => b.pop - a.pop).slice(0, COUNT);
  }, [products]);

  if (!featured.length) return null;

  return (
    <section id="products" aria-labelledby="feat-h" className="px-5 py-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 id="feat-h" className="text-[13px] font-bold tracking-[-0.01em] text-ink">
          <Bi en="Featured Products" ur="نمایاں پروڈکٹس" />
        </h2>
        <Link to="/marketplace" className="flex items-center gap-1 text-[12.5px] font-semibold text-acc">
          <Bi en="View all" ur="سب دیکھیں" /> <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1">
        {featured.map((p) => (
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
    </section>
  );
}
