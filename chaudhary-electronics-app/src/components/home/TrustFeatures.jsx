import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import Bi from '../ui/Bi';

const FEATURES = [
  {
    Icon: ShieldCheck,
    titleEn: 'Secure Payment',
    titleUr: 'محفوظ ادائیگی',
    descEn: 'Cash on delivery or verified transfer',
    descUr: 'کیش آن ڈیلیوری یا تصدیق شدہ ٹرانسفر',
  },
  {
    Icon: Truck,
    titleEn: 'Fast Delivery',
    titleUr: 'تیز ڈیلیوری',
    descEn: 'Nationwide dispatch, tracked orders',
    descUr: 'ملک بھر میں ترسیل، ٹریک آرڈرز',
  },
  {
    Icon: RotateCcw,
    titleEn: 'Easy Returns',
    titleUr: 'آسان واپسی',
    descEn: 'Hassle-free replacement window',
    descUr: 'بلا جھجک تبدیلی کی سہولت',
  },
  {
    Icon: BadgeCheck,
    titleEn: 'Genuine Products',
    titleUr: 'اصلی پروڈکٹس',
    descEn: '100% authentic, warranty backed',
    descUr: '100% اصلی، وارنٹی کے ساتھ',
  },
];

/** Mobile storefront's trust strip — the standard e-commerce reassurance grid
 * (payment/delivery/returns/authenticity), placed right after Deals/Best Sellers so it
 * backs up the buy buttons the shopper just scrolled past. */
export default function TrustFeatures() {
  return (
    <section aria-labelledby="trust-h" className="px-5 py-8">
      <h2 id="trust-h" className="sr-only">
        <Bi en="Why shop with us" ur="ہم سے خریداری کیوں کریں" />
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map(({ Icon, titleEn, titleUr, descEn, descUr }) => (
          <div key={titleEn} className="flex flex-col gap-2.5 rounded-2xl border border-line bg-[#FBFAF7] p-4">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-acc-soft text-ink">
              <Icon className="h-[19px] w-[19px]" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="text-[13.5px] leading-[1.2] font-bold tracking-[-0.01em] text-ink">
              <Bi en={titleEn} ur={titleUr} />
            </span>
            <span className="text-[12px] leading-[1.4] text-mut">
              <Bi en={descEn} ur={descUr} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
