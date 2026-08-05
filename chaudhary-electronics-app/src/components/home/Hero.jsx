import { useLang } from '../../i18n/LangContext';
import { useParallax } from '../../hooks/useParallax';
import { useCountUp } from '../../hooks/useCountUp';
import { fmtNum, imgFallback } from '../../lib/format';
import Bi from '../ui/Bi';

function Stat({ target, suffix, unitEn, unitUr, labelEn, labelUr, size }) {
  const { lang } = useLang();
  const [ref, value] = useCountUp(target);
  return (
    <div className="bg-[rgba(15,14,11,0.5)] px-6 py-[22px]">
      <div
        className="flex items-baseline gap-[6px] font-sans font-[680] tracking-[-0.035em]"
        style={{ fontSize: size }}
      >
        <span
          ref={ref}
          data-tnum
          className="[direction:ltr] [unicode-bidi:isolate] whitespace-nowrap tabular-nums"
        >
          {fmtNum(value)}
          {suffix}
        </span>
        {(unitEn || unitUr) && (
          <span className="text-[17px] whitespace-nowrap text-[rgba(245,242,236,0.62)]">
            <Bi en={unitEn} ur={unitUr} className={lang === 'ur' ? 'text-[15px]' : ''} />
          </span>
        )}
      </div>
      <div className="mt-[2px] text-[12.5px] text-[rgba(245,242,236,0.6)]">
        <Bi en={labelEn} ur={labelUr} />
      </div>
    </div>
  );
}

function CertifiedBadge() {
  return (
    <span className="inline-flex items-center gap-2.5 self-start rounded-full border border-[rgba(245,242,236,0.15)] bg-[rgba(15,14,11,0.5)] py-[9px] pr-5 pl-3 backdrop-blur-[14px]">
      <span
        aria-hidden="true"
        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-[rgba(226,163,71,0.18)] text-[13px] font-bold text-acc"
      >
        ✓
      </span>
      <span className="text-[13.5px] leading-none font-semibold whitespace-nowrap text-paper">
        <Bi en="Certified Installers" ur="سرٹیفائیڈ انسٹالرز" />
      </span>
    </span>
  );
}

export default function Hero() {
  const { lang } = useLang();
  const parallaxRef = useParallax(0.14);

  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative flex min-h-screen min-h-[100svh] flex-col justify-end overflow-hidden bg-dark px-5 pt-[130px] pb-[30px] text-paper"
    >
      {/* Subtle drifting glow layer — sits behind the parallax photo/gradients, shows
          through mostly along the darker top/bottom edges via mix-blend-screen. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="animate-ce-drift-a absolute -top-[12%] -left-[12%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.38),transparent_70%)] blur-3xl mix-blend-screen" />
        <span className="animate-ce-drift-b absolute top-[28%] -right-[16%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.22),transparent_70%)] blur-3xl mix-blend-screen" />
        <span className="animate-ce-drift-c absolute -bottom-[18%] left-[18%] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(245,242,236,0.14),transparent_70%)] blur-3xl mix-blend-screen" />
      </div>

      <img
        ref={parallaxRef}
        src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2400&q=80"
        onError={imgFallback('solar,panels,roof')}
        alt="Rooftop solar installation"
        fetchpriority="high"
        className="absolute inset-0 h-[110%] w-full object-cover opacity-[0.62]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,14,11,0.74)_0%,rgba(15,14,11,0.22)_42%,rgba(15,14,11,0.93)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_30%_20%,rgba(226,163,71,0.16),transparent_70%)]" />

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-10">
        <div className="flex max-w-[900px] flex-col gap-[26px]">
          <span className="inline-flex items-center gap-[9px] self-start rounded-full border border-[rgba(245,242,236,0.2)] bg-[rgba(245,242,236,0.1)] py-[9px] pr-4 pl-3 font-sans text-[12.5px] font-semibold tracking-[0.075em] uppercase backdrop-blur-[10px]">
            <span className="h-[7px] w-[7px] rounded-full bg-acc shadow-[0_0_12px_var(--color-acc)]" />
            Since 2009 · 4,200+ installations
          </span>

          <Bi
            as="h1"
            en={
              <>
                Your last
                <br />
                electricity bill.
              </>
            }
            ur={
              <>
                آپ کا آخری
                <br />
                بجلی کا بل۔
              </>
            }
            className={`m-0 font-sans font-bold tracking-[-0.04em] text-balance ${
              lang === 'ur' ? 'text-[clamp(40px,7vw,92px)] leading-[1.08]' : 'text-[clamp(50px,7.6vw,104px)] leading-[0.95]'
            }`}
          />

          <Bi
            as="p"
            en="Solar, backup power, wiring and security — installed and maintained by our own engineers."
            ur="سولر، بیک اپ، وائرنگ اور سیکیورٹی — ہمارے اپنے انجینئرز کی تنصیب اور مینٹینینس۔"
            className={`m-0 max-w-[560px] text-[clamp(17px,1.6vw,20px)] text-[rgba(245,242,236,0.78)] ${
              lang === 'ur' ? 'leading-[1.7]' : 'leading-[1.6]'
            }`}
          />

          <div className="mt-2 flex flex-wrap gap-[14px]">
            <a
              href="#planner"
              className="inline-flex items-center gap-[11px] rounded-full bg-acc px-8 py-5 text-[16.5px] font-bold text-ink shadow-[0_20px_48px_-16px_rgba(226,163,71,0.85)] transition-[transform,box-shadow] duration-[350ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-[3px] hover:shadow-[0_26px_56px_-16px_rgba(226,163,71,0.95)]"
            >
              <Bi en="Size my system in 30 seconds" ur="۳۰ سیکنڈ میں سسٹم چنیں" />
              <span className="text-[18px]">→</span>
            </a>
            <a
              href="#quote"
              className="inline-flex items-center rounded-full border border-[rgba(245,242,236,0.26)] bg-[rgba(245,242,236,0.1)] px-8 py-5 text-[16.5px] font-semibold whitespace-nowrap text-paper backdrop-blur-[12px] transition-[background,transform] duration-300 hover:-translate-y-[3px] hover:bg-[rgba(245,242,236,0.2)]"
            >
              <Bi en="Free site survey" ur="مفت سروے" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-px overflow-hidden rounded-[22px] border border-[rgba(245,242,236,0.15)] bg-[rgba(245,242,236,0.15)] backdrop-blur-[14px]">
          <Stat target={16} suffix="" labelEn="Years" labelUr="سال کا تجربہ" size="32px" />
          <Stat target={4200} suffix="+" labelEn="Projects" labelUr="منصوبے" size="34px" />
          <Stat target={38} suffix="" unitEn="MW" unitUr="میگاواٹ" labelEn="Installed" labelUr="نصب شدہ" size="34px" />
          <Stat target={10} suffix="" unitEn="yr" unitUr="سال" labelEn="Warranty" labelUr="وارنٹی" size="34px" />
        </div>

        <CertifiedBadge />

        <div className="flex h-6 justify-center overflow-hidden">
          <span className="w-px h-5 animate-ce-hint bg-[linear-gradient(180deg,transparent,var(--color-acc))]" />
        </div>
      </div>
    </section>
  );
}
