import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Truck } from 'lucide-react';
import Bi from '../ui/Bi';
import QuickSearch from '../layout/QuickSearch';
import { useLang } from '../../i18n/LangContext';
import { imgFallback } from '../../lib/format';

/**
 * Mobile storefront's hero/banner — the "marketplace-first" top of Home on small screens
 * (see src/pages/Home.jsx, which renders this instead of the desktop <Hero /> below `lg`).
 * Owns its own QuickSearch instance (rather than reaching into Navbar's) since Navbar's
 * search-open state is local to that component — this is simpler than lifting it into a
 * new context just for one extra trigger, and QuickSearch itself is a stateless overlay
 * that's cheap to mount twice.
 */
export default function StorefrontHero() {
  const { lang } = useLang();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative flex flex-col justify-end overflow-hidden bg-dark px-5 pt-[100px] pb-8 text-paper"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="animate-ce-drift-a absolute -top-[10%] -left-[20%] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.4),transparent_70%)] blur-3xl mix-blend-screen" />
        <span className="animate-ce-drift-b absolute top-[20%] -right-[24%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.22),transparent_70%)] blur-3xl mix-blend-screen" />
      </div>

      <img
        src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80"
        onError={imgFallback('electronics,gadgets')}
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.4]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,14,11,0.75)_0%,rgba(15,14,11,0.35)_45%,rgba(15,14,11,0.96)_100%)]" />

      <div className="relative flex flex-col gap-5">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(245,242,236,0.2)] bg-[rgba(245,242,236,0.1)] py-2 pr-4 pl-3 text-[11.5px] font-semibold tracking-[0.075em] uppercase backdrop-blur-[10px]">
          <span className="h-[6px] w-[6px] rounded-full bg-acc shadow-[0_0_10px_var(--color-acc)]" />
          <Bi en="Chaudhary Electronics Marketplace" ur="چوہدری الیکٹرانکس مارکیٹ پلیس" />
        </span>

        <Bi
          as="h1"
          en={
            <>
              Genuine electronics,
              <br />
              delivered to your door.
            </>
          }
          ur={
            <>
              اصلی الیکٹرانکس،
              <br />
              آپ کے دروازے تک۔
            </>
          }
          className={`m-0 font-sans font-bold tracking-[-0.03em] text-balance ${
            lang === 'ur' ? 'text-[34px] leading-[1.22]' : 'text-[38px] leading-[1.06]'
          }`}
        />

        <Bi
          as="p"
          en="Solar equipment, appliances, tools and accessories — genuine stock, fair prices, fast local delivery."
          ur="سولر آلات، اپلائنسز، اوزار اور لوازمات — اصلی مال، مناسب قیمت، تیز مقامی ڈیلیوری۔"
          className={`m-0 max-w-[440px] text-[15px] text-[rgba(245,242,236,0.78)] ${lang === 'ur' ? 'leading-[1.7]' : 'leading-[1.55]'}`}
        />

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-[52px] w-full items-center gap-3 rounded-full border border-[rgba(245,242,236,0.18)] bg-[rgba(245,242,236,0.1)] px-5 text-left backdrop-blur-[10px] transition-colors active:bg-[rgba(245,242,236,0.16)]"
        >
          <Search className="h-[18px] w-[18px] flex-shrink-0 text-[rgba(245,242,236,0.6)]" aria-hidden="true" />
          <span className="truncate text-[14.5px] text-[rgba(245,242,236,0.6)]">
            <Bi en="Search for products, brands and more…" ur="پروڈکٹس، برانڈز تلاش کریں…" />
          </span>
        </button>

        <div className="flex gap-2.5">
          <Link
            to="/marketplace"
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-acc text-[15px] font-bold text-ink shadow-[0_18px_40px_-16px_rgba(226,163,71,0.85)] transition-transform active:scale-[0.97]"
          >
            <Bi en="Shop now" ur="ابھی خریدیں" />
            <span aria-hidden="true">→</span>
          </Link>
          <a
            href="#deals"
            className="flex h-[52px] flex-1 items-center justify-center rounded-full border border-[rgba(245,242,236,0.26)] bg-[rgba(245,242,236,0.1)] text-[15px] font-semibold text-paper backdrop-blur-[10px] transition-transform active:scale-[0.97]"
          >
            <Bi en="Today's deals" ur="آج کی ڈیلز" />
          </a>
        </div>

        <div className="mt-1 flex items-center gap-4 text-[12px] text-[rgba(245,242,236,0.65)]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-[15px] w-[15px] text-acc" aria-hidden="true" />
            <Bi en="Genuine products" ur="اصلی پروڈکٹس" />
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="h-[15px] w-[15px] text-acc" aria-hidden="true" />
            <Bi en="Fast delivery" ur="تیز ڈیلیوری" />
          </span>
        </div>
      </div>

      <QuickSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </section>
  );
}
