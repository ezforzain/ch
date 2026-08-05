import { useLang } from '../../i18n/LangContext';
import { faqs } from '../../data/faq';
import Bi from '../ui/Bi';

/**
 * FAQ / accordion section, mounted in Home.jsx. Uses native <details>/<summary>
 * for accessible, JS-free expand/collapse; Tailwind's `open:` variant drives
 * the chevron rotation and answer reveal.
 */
export default function FAQSection() {
  const { lang } = useLang();

  return (
    <section id="faq" aria-labelledby="faq-h" className="px-5 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[820px]">
        <div className="mb-8 text-center">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-acc">
            <Bi en="FAQ" ur="عمومی سوالات" />
          </span>
          <h2
            id="faq-h"
            className={`mt-3 font-[680] tracking-[-0.035em] ${
              lang === 'ur' ? 'text-[clamp(28px,3.8vw,46px)] leading-[1.12]' : 'text-[clamp(29px,3.6vw,48px)] leading-[1.05]'
            }`}
          >
            <Bi en="Questions we hear a lot" ur="اکثر پوچھے جانے والے سوالات" />
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((item) => (
            <details
              key={item.id}
              className="group rounded-[20px] border border-line bg-[#FBFAF7] px-5 py-4 open:pb-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-[650] tracking-[-0.01em] text-ink">
                <Bi as="span" en={item.q.en} ur={item.q.ur} />
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 text-mut transition-transform duration-300 group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-mut">
                <Bi en={item.a.en} ur={item.a.ur} />
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
