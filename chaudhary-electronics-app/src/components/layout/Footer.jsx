import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useToast } from '../../context/ToastContext';
import Bi from '../ui/Bi';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function IconFacebook() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-7.5H16l.5-3H13.5V8.4c0-.87.24-1.46 1.5-1.46H16.6V4.34C16.33 4.3 15.4 4.22 14.32 4.22c-2.24 0-3.77 1.37-3.77 3.88v2.4H8v3h2.55V21h2.95z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconYoutube() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M22 12s0-3.2-.41-4.7a2.9 2.9 0 0 0-2-2C17.9 5 12 5 12 5s-5.9 0-7.59.3a2.9 2.9 0 0 0-2 2C2 8.8 2 12 2 12s0 3.2.41 4.7a2.9 2.9 0 0 0 2 2C6.1 19 12 19 12 19s5.9 0 7.59-.3a2.9 2.9 0 0 0 2-2C22 15.2 22 12 22 12z" />
      <path d="M10 15.2V8.8l5.5 3.2-5.5 3.2z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconLinkedin() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.94 8.5H4V20h2.94V8.5zM5.47 4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM20 13.28c0-3.1-1.66-4.54-3.87-4.54a3.34 3.34 0 0 0-3.03 1.67V8.5H10.1c.04.86 0 11.5 0 11.5h2.99v-6.42c0-.34.02-.69.12-.93.28-.68.9-1.39 1.96-1.39 1.38 0 1.93 1.05 1.93 2.6V20H20v-6.72z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { name: 'Facebook', href: '#', Icon: IconFacebook },
  { name: 'Instagram', href: '#', Icon: IconInstagram },
  { name: 'YouTube', href: '#', Icon: IconYoutube },
  { name: 'LinkedIn', href: '#', Icon: IconLinkedin },
];

// Originally verbatim from <footer> in Chaudhary Electronics.dc.html (lines 597-627), which
// carries no data-lang="ur" spans anywhere, so all of that original content stays plain
// (English-only) regardless of language, exactly as the source does. Everything added below
// (newsletter, social links, map, legal links) is new and uses <Bi> for bilingual copy.
export default function Footer() {
  const { lang } = useLang();
  const showToast = useToast();
  const [email, setEmail] = useState('');

  function handleSubscribe(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      showToast(lang === 'ur' ? 'براہ کرم درست ای میل درج کریں' : 'Please enter a valid email address');
      return;
    }
    showToast('Subscribed!');
    setEmail('');
  }

  return (
    <footer
      className="bg-dark px-5 pt-14 sm:pt-12 text-[rgba(245,242,236,0.65)]"
      style={{ paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))' }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 sm:gap-7">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-6 gap-y-8 sm:gap-7">
          <div className="flex flex-col gap-[10px]">
            <span className="flex items-center gap-[9px]">
              <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-acc text-[12.5px] font-semibold text-ink">
                CE
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-paper">
                Chaudhary Electronics
              </span>
            </span>
            <span className="max-w-[260px] text-[14.5px] leading-[1.6]">
              Solar, backup, wiring and security across Pakistan since 2009.
            </span>
          </div>

          <div className="flex flex-col gap-2 text-[14px]">
            <span className="text-[11.5px] font-semibold tracking-[0.075em] text-[rgba(245,242,236,0.58)] uppercase">
              Services
            </span>
            <a href="/#services" className="text-[rgba(245,242,236,0.65)] hover:text-acc">
              Solar installation
            </a>
            <a href="/#services" className="text-[rgba(245,242,236,0.65)] hover:text-acc">
              Backup &amp; UPS
            </a>
            <a href="/#services" className="text-[rgba(245,242,236,0.65)] hover:text-acc">
              CCTV &amp; security
            </a>
          </div>

          <div className="flex flex-col gap-2 text-[14px]">
            <span className="text-[11.5px] font-semibold tracking-[0.075em] text-[rgba(245,242,236,0.58)] uppercase">
              Company
            </span>
            <a href="/#planner" className="text-[rgba(245,242,236,0.65)] hover:text-acc">
              Solar Planner
            </a>
            <a href="/#work" className="text-[rgba(245,242,236,0.65)] hover:text-acc">
              Our work
            </a>
            <a href="/#products" className="text-[rgba(245,242,236,0.65)] hover:text-acc">
              Marketplace
            </a>
          </div>

          <div className="flex flex-col gap-2 text-[14px]">
            <span className="text-[11.5px] font-semibold tracking-[0.075em] text-[rgba(245,242,236,0.58)] uppercase">
              Contact
            </span>
            <a href="tel:+920000000000" className="text-[rgba(245,242,236,0.65)] hover:text-acc">
              +92 300 000 0000
            </a>
            <a
              href="mailto:info@chaudharyelectronics.pk"
              className="text-[rgba(245,242,236,0.65)] hover:text-acc"
            >
              info@chaudharyelectronics.pk
            </a>
            <span>Bund Road, Lahore</span>
          </div>

          <div className="flex flex-col gap-3 text-[14px]">
            <span className="text-[11.5px] font-semibold tracking-[0.075em] text-[rgba(245,242,236,0.58)] uppercase">
              <Bi en="Stay updated" ur="اپ ڈیٹس حاصل کریں" />
            </span>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <label className="sr-only" htmlFor="footer-newsletter-email">
                <Bi en="Email address" ur="ای میل ایڈریس" />
              </label>
              <div className="flex items-center gap-1.5 rounded-full border border-[rgba(245,242,236,0.16)] bg-[rgba(245,242,236,0.06)] p-1.5 pl-4">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === 'ur' ? 'آپ کا ای میل' : 'you@email.com'}
                  className="min-w-0 flex-1 border-none bg-transparent text-[16px] sm:text-[13.5px] text-paper outline-none placeholder:text-[rgba(245,242,236,0.4)]"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 rounded-full bg-acc px-4 py-2 text-[12.5px] font-bold whitespace-nowrap text-ink transition-transform hover:-translate-y-px"
                >
                  <Bi en="Subscribe" ur="سبسکرائب" />
                </button>
              </div>
            </form>

            <span className="mt-1 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  title={name}
                  className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-[rgba(245,242,236,0.16)] bg-[rgba(245,242,236,0.06)] text-[rgba(245,242,236,0.75)] transition-colors hover:border-acc hover:text-acc"
                >
                  <Icon />
                </a>
              ))}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 border-t border-[rgba(245,242,236,0.1)] pt-5 text-[11px] text-[rgba(245,242,236,0.58)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-[14px]">
          <span>© {new Date().getFullYear()} Chaudhary Electronics</span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/privacy" className="hover:text-acc">
              <Bi en="Privacy Policy" ur="پرائیویسی پالیسی" />
            </Link>
            <Link to="/terms" className="hover:text-acc">
              <Bi en="Terms & Conditions" ur="شرائط و ضوابط" />
            </Link>
          </span>
          <span>Placeholder photography &amp; figures</span>
        </div>
      </div>
    </footer>
  );
}
