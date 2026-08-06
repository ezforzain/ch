import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Moon, PackageCheck, ShieldCheck, Sun, Users, Zap } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import Bi from '../ui/Bi';

/** Decorative brand-panel graphic for the split variant — a power/energy glyph orbited
 * by icon chips for security, orders and the marketplace's buyer/seller community. */
function BrandIllustration() {
  return (
    <div aria-hidden="true" className="relative mx-auto grid h-[220px] w-[220px] flex-shrink-0 place-items-center">
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.28),transparent_70%)] blur-2xl" />
      <span className="absolute inset-2 rounded-full border border-dashed border-[rgba(245,242,236,0.16)]" />
      <span className="grid h-24 w-24 place-items-center rounded-full border border-acc/30 bg-acc/15">
        <Zap className="h-9 w-9 text-acc" strokeWidth={1.75} />
      </span>
      <span className="animate-ce-float absolute top-1 left-2 grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(245,242,236,0.14)] bg-[rgba(245,242,236,0.06)] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]">
        <ShieldCheck className="h-5 w-5 text-paper/80" />
      </span>
      <span
        className="animate-ce-float absolute right-0 bottom-8 grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(245,242,236,0.14)] bg-[rgba(245,242,236,0.06)] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]"
        style={{ animationDelay: '1.2s' }}
      >
        <PackageCheck className="h-5 w-5 text-paper/80" />
      </span>
      <span
        className="animate-ce-float absolute bottom-0 left-8 grid h-10 w-10 place-items-center rounded-2xl border border-[rgba(245,242,236,0.14)] bg-[rgba(245,242,236,0.06)] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]"
        style={{ animationDelay: '2.4s' }}
      >
        <Users className="h-4 w-4 text-paper/80" />
      </span>
    </div>
  );
}

const TRUST_BULLETS = [
  { en: 'Wide range of solar & backup power products', ur: 'سولر اور بیک اپ پاور پروڈکٹس کی وسیع رینج' },
  { en: 'Secure, encrypted account access', ur: 'محفوظ اور خفیہ کردہ اکاؤنٹ رسائی' },
  { en: 'Fast order tracking & real support', ur: 'تیز آرڈر ٹریکنگ اور حقیقی سپورٹ' },
];

/**
 * Shared shell for every standalone auth page (Login, Register, Forgot/Reset Password) —
 * deliberately chrome-free (no public Navbar/Footer) so the form stays the sole focus, a
 * common pattern for auth pages (Stripe/Linear do the same). Two variants share the same
 * dark-mode toggle, lang toggle, back-to-home link and background blobs:
 *  - 'compact' (default): single centered card with a title/subtitle — Forgot/Reset Password.
 *  - 'split': two-column card with a branding panel — Login/Register, which render their
 *    own heading inside `children` instead of using `title`/`subtitle`.
 * Previously two near-duplicate files (AuthShell + AuthSplitShell); merged here so both
 * variants can't visually drift apart from each other.
 */
export default function AuthShell({ variant = 'compact', title, subtitle, children }) {
  const { toggleLang, lang } = useLang();
  const [dark, setDark] = useState(false);
  const isSplit = variant === 'split';

  const backgroundBlobs = (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 dark:opacity-100"
    >
      <span className="animate-ce-drift-a absolute -top-[10%] -left-[10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.3),transparent_70%)] blur-3xl" />
      <span className="animate-ce-drift-b absolute top-[30%] -right-[14%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.16),transparent_70%)] blur-3xl" />
    </div>
  );

  const topBar = (
    <div
      className={
        isSplit
          ? 'relative z-10 mx-auto mb-6 flex w-full max-w-[1040px] items-center justify-between'
          : 'relative z-10 mb-7 flex w-full max-w-[420px] items-center justify-between'
      }
    >
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-[14px] font-semibold text-mut transition-colors duration-200 hover:text-ink dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
      >
        <span aria-hidden="true">←</span>
        <Bi en="Back to home" ur="ہوم پیج پر واپس" />
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleLang}
          aria-label="Switch language"
          className="rounded-full border border-line px-3 py-[7px] text-[12.5px] font-semibold text-mut transition-colors duration-200 hover:text-ink dark:border-[rgba(245,242,236,0.16)] dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
        >
          {lang === 'en' ? 'اردو' : 'EN'}
        </button>
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={dark}
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-line text-mut transition-colors duration-200 hover:text-ink dark:border-[rgba(245,242,236,0.16)] dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  if (isSplit) {
    return (
      <div
        className={`relative min-h-screen overflow-hidden bg-paper px-4 py-8 transition-colors duration-500 sm:px-6 lg:py-12 dark:bg-dark ${dark ? 'dark' : ''}`}
      >
        {backgroundBlobs}
        {topBar}

        <div className="relative z-10 mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-line bg-[#FBFAF7] shadow-[0_30px_80px_-30px_rgba(23,21,15,0.35)] transition-colors duration-500 lg:grid-cols-[0.95fr_1.05fr] dark:border-[rgba(245,242,236,0.12)] dark:bg-[rgba(23,21,15,0.72)] dark:shadow-[0_30px_90px_-30px_rgba(0,0,0,0.75)] dark:backdrop-blur-xl">
          {/* Branding panel — full illustration on desktop, compact header on mobile */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-paper lg:flex">
            <span
              aria-hidden="true"
              className="animate-ce-drift-c absolute -top-[20%] -left-[20%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.2),transparent_70%)] blur-3xl"
            />
            <div className="relative z-10 flex items-center gap-3">
              <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-[14px] bg-acc text-[16px] font-semibold tracking-[-0.02em] text-ink">
                CE
              </span>
              <Bi
                as="span"
                en={'Chaudhary\nElectronics'}
                ur={'چوہدری\nالیکٹرانکس'}
                className="text-[15px] leading-[1.15] font-semibold whitespace-pre-line tracking-[-0.01em]"
              />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 py-6 text-center">
              <BrandIllustration />
              <div>
                <Bi
                  as="h2"
                  en="Your marketplace for solar, backup power & security."
                  ur="سولر، بیک اپ پاور اور سیکیورٹی کی مارکیٹ پلیس۔"
                  className="text-[22px] font-[650] tracking-[-0.02em] text-paper text-balance"
                />
                <Bi
                  as="p"
                  en="Sign in to track orders, manage your account and shop trusted products."
                  ur="آرڈرز ٹریک کرنے، اکاؤنٹ منظم کرنے اور قابلِ اعتماد پروڈکٹس خریدنے کے لیے سائن ان کریں۔"
                  className="mt-2 text-[14px] leading-[1.6] text-paper/60"
                />
              </div>
            </div>

            <ul className="relative z-10 flex flex-col gap-3">
              {TRUST_BULLETS.map((item) => (
                <li key={item.en} className="flex items-center gap-2.5 text-[13.5px] text-paper/75">
                  <Check className="h-4 w-4 flex-shrink-0 text-acc" strokeWidth={2.75} />
                  <Bi en={item.en} ur={item.ur} />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center gap-3 bg-ink px-6 py-7 text-paper lg:hidden">
            <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[13px] bg-acc text-[15px] font-semibold tracking-[-0.02em] text-ink">
              CE
            </span>
            <div>
              <Bi as="p" en="Chaudhary Electronics" ur="چوہدری الیکٹرانکس" className="text-[15px] font-semibold" />
              <Bi
                as="p"
                en="Solar, backup power & security marketplace"
                ur="سولر، بیک اپ پاور اور سیکیورٹی مارکیٹ پلیس"
                className="text-[12.5px] text-paper/60"
              />
            </div>
          </div>

          {/* Form panel */}
          <div className="relative flex flex-col justify-center p-6 sm:p-10 lg:p-12">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-5 py-12 transition-colors duration-500 dark:bg-dark ${dark ? 'dark' : ''}`}
    >
      {backgroundBlobs}
      {topBar}

      <div className="relative z-10 w-full max-w-[420px] rounded-[28px] border border-line bg-[#FBFAF7] p-8 shadow-[0_30px_80px_-30px_rgba(23,21,15,0.35)] transition-colors duration-500 dark:border-[rgba(245,242,236,0.12)] dark:bg-[rgba(23,21,15,0.72)] dark:shadow-[0_30px_90px_-30px_rgba(0,0,0,0.75)] dark:backdrop-blur-xl">
        <div className="mb-7 flex flex-col items-center gap-4 text-center">
          <span className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-[16px] bg-ink text-[19px] font-semibold tracking-[-0.02em] text-paper dark:bg-acc dark:text-ink">
            CE
          </span>
          <div>
            <Bi as="h1" en={title.en} ur={title.ur} className="text-[26px] font-[680] tracking-[-0.03em] text-ink dark:text-paper" />
            {subtitle && (
              <Bi
                as="p"
                en={subtitle.en}
                ur={subtitle.ur}
                className="mt-1.5 text-[14.5px] leading-[1.5] text-mut dark:text-[rgba(245,242,236,0.55)]"
              />
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
