import { Link } from 'react-router-dom';
import {
  BatteryCharging,
  Cable,
  Fan,
  Headphones,
  Laptop,
  Package,
  ShieldCheck,
  Smartphone,
  Sun,
  Tablet,
  Watch,
  Wrench,
  Zap,
} from 'lucide-react';
import Bi from '../ui/Bi';
import { useProducts } from '../../context/ProductsContext';
import { slugifyCategory } from '../../data/catalogue';

// Keyword -> icon, checked in order against the category name (case-insensitive). Falls
// back to Package for anything unmatched, so a category added later in the Admin Panel
// (with a name nobody anticipated here) still renders something sensible instead of a
// blank slot.
const ICON_RULES = [
  [/solar|panel/, Sun],
  [/invert/, Zap],
  [/batter/, BatteryCharging],
  [/air.?cond|\bac\b/, Fan],
  [/fan|light/, Fan],
  [/wire|cable/, Cable],
  [/switch|breaker/, ShieldCheck],
  [/tool|accessor/, Wrench],
  [/phone|mobile/, Smartphone],
  [/laptop|computer|pc\b/, Laptop],
  [/tablet|ipad/, Tablet],
  [/headphone|audio|speaker/, Headphones],
  [/watch|wearable/, Watch],
];

function iconFor(name) {
  const lower = (name || '').toLowerCase();
  const hit = ICON_RULES.find(([re]) => re.test(lower));
  return hit ? hit[1] : Package;
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="animate-ce-shimmer h-16 w-16 rounded-2xl" style={{ background: 'linear-gradient(100deg,#EDE8DF 30%,#F6F3EC 50%,#EDE8DF 70%)', backgroundSize: '200% 100%' }} />
      <div className="h-2.5 w-12 rounded-full bg-[#EDE8DF]" />
    </div>
  );
}

/** Mobile storefront's category grid — driven by the real database categories
 * (ProductsContext), so it always matches whatever the Admin Panel actually has
 * configured instead of a hardcoded, easy-to-drift list. */
export default function ShopByCategory() {
  const { categories, loading } = useProducts();

  if (!loading && categories.length === 0) return null;

  return (
    <section aria-labelledby="shop-cat-h" className="px-5 py-8">
      <h2 id="shop-cat-h" className="mb-4 text-[13px] font-bold tracking-[-0.01em] text-ink">
        <Bi en="Shop by Category" ur="زمرہ جات کے مطابق خریداری" />
      </h2>

      <div className="grid grid-cols-4 gap-x-2 gap-y-5">
        {loading
          ? Array.from({ length: 8 }, (_, i) => <CategorySkeleton key={i} />)
          : categories.map((cat) => {
              const Icon = iconFor(cat.name);
              return (
                <Link
                  key={cat.id}
                  to={`/marketplace?category=${slugifyCategory(cat.name)}`}
                  className="group flex flex-col items-center gap-2 text-center"
                >
                  <span className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-[#FBFAF7] text-ink transition-transform duration-300 group-active:scale-90">
                    {cat.image ? (
                      <img src={cat.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icon className="h-[26px] w-[26px]" strokeWidth={1.75} aria-hidden="true" />
                    )}
                  </span>
                  <span className="line-clamp-2 text-[11.5px] leading-[1.25] font-semibold text-ink">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
