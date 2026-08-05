import { useLang } from '../../i18n/LangContext';
import Bi from '../ui/Bi';

const POINTS = [
  {
    en: 'Spread the cost over 12–36 months through our partner banks.',
    ur: 'ہمارے پارٹنر بینکوں کے ذریعے 12 سے 36 ماہ میں ادائیگی کریں۔',
  },
  {
    en: "No hidden markup — the price you're quoted is the price you pay in installments.",
    ur: 'کوئی چھپا ہوا مارک اپ نہیں — جو قیمت بتائی جائے وہی قسطوں میں ادا ہوگی۔',
  },
  {
    en: 'Approval typically comes through the same week as your solar survey.',
    ur: 'منظوری عموماً آپ کے سولر سروے کے اسی ہفتے مل جاتی ہے۔',
  },
];

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-[2px] flex-shrink-0 text-acc"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Financing/installments section, mounted in Home.jsx. */
export default function FinancingSection() {
  const { lang } = useLang();

  return (
    <section aria-labelledby="financing-h" className="px-5 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[1200px] overflow-hidden rounded-[28px] border border-[rgba(226,163,71,0.3)] bg-[linear-gradient(135deg,rgba(226,163,71,0.16),rgba(226,163,71,0.03))] px-[clamp(28px,5vw,56px)] py-[clamp(40px,6vw,64px)]">
        <div className="grid grid-cols-[1.15fr_1fr] items-center gap-10 max-[820px]:grid-cols-1">
          <div>
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-acc">
              <Bi en="Financing" ur="فنانسنگ" />
            </span>
            <h2
              id="financing-h"
              className={`mt-3 font-[680] tracking-[-0.035em] ${
                lang === 'ur' ? 'text-[clamp(27px,3.4vw,42px)] leading-[1.14]' : 'text-[clamp(28px,3.4vw,44px)] leading-[1.06]'
              }`}
            >
              <Bi en="0% markup installment plans" ur="0% مارک اپ پر قسطیں" />
            </h2>
            <p className="mt-4 max-w-[480px] text-[15.5px] leading-[1.6] text-mut">
              <Bi
                en="Solar and backup systems don't have to be paid for upfront. We work with partner banks so you can spread the cost without extra markup."
                ur="سولر اور بیک اپ سسٹم کی مکمل ادائیگی پیشگی ضروری نہیں۔ ہم پارٹنر بینکوں کے ساتھ کام کرتے ہیں تاکہ آپ بغیر اضافی مارک اپ کے قسطوں میں ادائیگی کر سکیں۔"
              />
            </p>
            <a
              href="#quote"
              className="mt-6 inline-flex h-14 items-center justify-center rounded-full bg-ink px-7 text-[15px] font-[650] text-paper transition-transform hover:-translate-y-0.5"
            >
              <Bi en="Ask about financing" ur="فنانسنگ کے بارے میں پوچھیں" />
            </a>
          </div>

          <ul className="flex flex-col gap-3">
            {POINTS.map((p) => (
              <li
                key={p.en}
                className="flex items-start gap-3 rounded-[16px] border border-line bg-[#FBFAF7] p-4 text-[14.5px] leading-[1.5] text-ink"
              >
                <CheckIcon />
                <Bi as="span" en={p.en} ur={p.ur} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
