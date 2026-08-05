import { useLang } from '../../i18n/LangContext';
import { imgFallback } from '../../lib/format';
import { services } from '../../data/services';
import Bi from '../ui/Bi';

export default function Services() {
  const { lang } = useLang();

  return (
    <section id="services" className="px-5 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-[34px] flex flex-wrap items-end justify-between gap-5">
          <Bi
            as="h2"
            en={
              <>
                Seven services.
                <br />
                One team.
              </>
            }
            ur={
              <>
                سات خدمات۔
                <br />
                ایک ٹیم۔
              </>
            }
            className={`m-0 font-sans font-[680] tracking-[-0.035em] ${
              lang === 'ur' ? 'text-[clamp(30px,4vw,54px)] leading-[1.12]' : 'text-[clamp(31px,4.1vw,56px)] leading-[1.02]'
            }`}
          />
          <a href="#quote" className="text-[14.5px] font-semibold text-mut hover:text-acc">
            Ask about any of them →
          </a>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[14px]">
          {services.map((s) => (
            <a
              key={s.id}
              href={s.href}
              className={`group relative flex flex-col justify-end overflow-hidden rounded-[26px] text-paper transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-[6px] ${
                s.span === 2 ? 'col-span-2 p-[26px]' : 'p-[22px]'
              } ${s.shadow ? 'shadow-[0_26px_60px_-32px_rgba(23,21,15,0.5)]' : ''}`}
              style={{ minHeight: `${s.minH}px` }}
            >
              <img
                loading="lazy"
                decoding="async"
                src={s.img}
                onError={imgFallback(s.fb)}
                alt={s.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, rgba(15,14,11,${s.span === 2 ? 0.15 : 0.1}), rgba(15,14,11,${s.gradEnd}))`,
                }}
              />
              {s.badge && (
                <span className="absolute top-5 left-5 rounded-full bg-acc px-3 py-[6px] font-sans text-[10.5px] tracking-[0.06em] text-ink">
                  {s.badge}
                </span>
              )}
              <div className="relative">
                <div className={`font-sans ${s.titleClass}`}>{s.title}</div>
                <div className={s.descClass}>{s.desc}</div>
                <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[rgba(245,242,236,0.85)] transition-colors group-hover:text-acc">
                  Learn more <span aria-hidden="true">→</span>
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-[46px]">
          <Bi
            as="h3"
            en="Quick comparison"
            ur="فوری موازنہ"
            className="m-0 mb-4 font-sans text-[20px] font-[650] tracking-[-0.022em]"
          />
          <div className="overflow-x-auto rounded-[20px] border border-line bg-[#FBFAF7]">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">
                    Service
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">
                    Typical cost
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">
                    Install time
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.075em] text-mut">
                    Best for
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-b-0">
                    <th scope="row" className="whitespace-nowrap px-5 py-[13px] text-left text-[14px] font-semibold text-ink">
                      {s.title}
                    </th>
                    <td className="px-5 py-[13px] text-[13.5px] text-ink" data-tnum>
                      {s.cost}
                    </td>
                    <td className="px-5 py-[13px] text-[13.5px] text-ink">{s.installTime}</td>
                    <td className="px-5 py-[13px] text-[13.5px] text-mut">{s.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
