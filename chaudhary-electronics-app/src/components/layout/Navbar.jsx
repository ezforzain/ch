import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useScrollY } from '../../hooks/useScrollY';
import { useAutoHideHeader } from '../../hooks/useAutoHideHeader';
import Bi from '../ui/Bi';
import QuickSearch from './QuickSearch';

// Scroll-spy watches these ids (source: #services/#work/#planner/#products/#quote).
const SPY_IDS = ['services', 'work', 'planner', 'products', 'quote'];

// Source thresholds (componentDidMount's onResize, lines 1043-1050):
// links/CTA collapse into the hamburger below 1240px; the wordmark text hides below 460px
// (measured empirically — the pill overflows for a ~20-40px band right at the point the
// wordmark/quote pill first appear, so each breakpoint sits past where content stops clipping,
// not at the exact width the extra element would first fit "in theory").
const COMPACT_BREAKPOINT = 1240;
const WORDMARK_BREAKPOINT = 460;
// Below this, the pill has no room left for a persistent "Quote" button next to
// search/lang/hamburger — narrow phones fall back to MobileCtaBar + the hamburger's
// own "Get a quote" for a persistent CTA instead.
const COMPACT_QUOTE_BREAKPOINT = 540;

// href is prefixed with "/" (not a bare "#fragment") so the link still lands on
// the right homepage section when clicked from a different route (e.g. /privacy).
const NAV_LINKS = [
  { id: 'services', href: '/#services', en: 'Services', ur: 'خدمات' },
  { id: 'work', href: '/#work', en: 'Our work', ur: 'ہمارا کام' },
  { id: 'planner', href: '/#planner', en: 'Solar Planner', ur: 'سولر پلانر' },
  { id: 'products', href: '/#products', en: 'Products', ur: 'پروڈکٹس' },
];

export default function Navbar() {
  const { lang, toggleLang } = useLang();
  const scrollY = useScrollY();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));

  // Scroll-spy: highlight the nav link for whichever watched section is
  // currently crossing the middle band of the viewport.
  useEffect(() => {
    const els = SPY_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Global Cmd/Ctrl+K shortcut to open quick search.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const compact = width < COMPACT_BREAKPOINT;
  const showWordmark = width >= WORDMARK_BREAKPOINT;
  const showCompactQuote = compact && width >= COMPACT_QUOTE_BREAKPOINT;

  // onResize in source also forces the menu closed once the layout is no longer compact
  useEffect(() => {
    if (!compact) setMenuOpen(false);
  }, [compact]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // pill background/shadow scroll transition (source onScroll, lines 1024-1028)
  const solid = scrollY > 40;
  const pillBackground = solid ? 'rgba(245,242,236,0.92)' : 'rgba(245,242,236,0.7)';
  const pillBoxShadow = `${solid ? '0 14px 46px -14px rgba(23,21,15,0.34)' : '0 12px 44px -14px rgba(23,21,15,0.3)'}, 0 1px 0 rgba(255,255,255,0.7) inset`;

  // YouTube/Amazon-style auto-hide: slides up out of view on scroll-down, slides back down on
  // the very next scroll-up. `forceVisible` keeps it shown while the mobile menu is open —
  // sliding the bar away out from under its own open dropdown would be broken, not smooth.
  const headerHidden = useAutoHideHeader(scrollY, { forceVisible: menuOpen });

  return (
    <nav
      className="pointer-events-none fixed top-[14px] left-1/2 z-[900] flex w-[calc(100%-20px)] max-w-[1320px] flex-col items-center gap-[10px] transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
      // Inline style (not a Tailwind class) because it must combine the constant horizontal
      // centering with a dynamic vertical hide/show offset in one `transform` — two separate
      // transform-producing declarations (class + style) would just have the second silently
      // clobber the first rather than composing.
      style={{ transform: `translate(-50%, ${headerHidden ? 'calc(-100% - 24px)' : '0'})` }}
    >
      <div
        className="box-border flex h-[76px] w-full items-center justify-between gap-1 rounded-[22px] border border-[rgba(23,21,15,0.09)] px-9 [backdrop-filter:blur(16px)_saturate(1.5)] transition-[box-shadow,background] duration-500 ease-in-out pointer-events-auto"
        style={{ background: pillBackground, boxShadow: pillBoxShadow }}
      >
        <a href="/#top" className="flex flex-shrink-0 items-center gap-3">
          <span className="grid h-[46px] w-[46px] place-items-center rounded-[13px] bg-ink text-[16.5px] font-semibold tracking-[-0.02em] text-paper">
            CE
          </span>
          {showWordmark && (
            <span className="whitespace-nowrap text-[17.5px] leading-[1.18] font-bold tracking-[-0.025em]">
              Chaudhary
              <br />
              <span className="text-[12px] font-normal tracking-[0.05em] text-mut uppercase">
                Electronics
              </span>
            </span>
          )}
        </a>

        {!compact && (
          <div className="flex items-center gap-9">
            {NAV_LINKS.map((link) => {
              const active = activeId === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative px-[2px] py-2 text-[15.5px] font-semibold whitespace-nowrap transition-[color,transform] duration-300 hover:-translate-y-px hover:text-ink ${
                    active ? 'text-ink' : 'text-mut'
                  }`}
                >
                  <Bi en={link.en} ur={link.ur} />
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-[3px] left-0 h-[3px] w-full rounded-full bg-acc transition-opacity duration-300 ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </a>
              );
            })}
            <Link
              to="/marketplace"
              className="px-[2px] py-2 text-[15.5px] font-semibold whitespace-nowrap text-mut transition-[color,transform] duration-300 hover:-translate-y-px hover:text-ink"
            >
              <Bi en="Marketplace" ur="مارکیٹ پلیس" />
            </Link>
          </div>
        )}

        <div className="flex flex-shrink-0 items-center gap-[14px]">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            title="Search"
            aria-label="Search"
            className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full border border-line bg-white/50 text-[16px] text-mut transition-[color,box-shadow] duration-250 hover:text-ink hover:shadow-[0_6px_16px_-6px_rgba(23,21,15,0.25)]"
          >
            <span aria-hidden="true">⌕</span>
          </button>

          <button
            type="button"
            onClick={toggleLang}
            title="English / اردو"
            aria-label="Switch language"
            aria-pressed={lang === 'ur'}
            className="flex h-12 items-center gap-[3px] rounded-full border border-line bg-white/50 p-1 transition-shadow duration-250 hover:shadow-[0_6px_16px_-6px_rgba(23,21,15,0.25)]"
          >
            <span
              className={`flex h-10 items-center justify-center rounded-full px-[15px] text-[13.5px] leading-none font-bold ${
                lang === 'en' ? 'bg-ink text-paper' : 'bg-transparent text-mut'
              }`}
            >
              EN
            </span>
            <span
              className={`flex h-10 items-center justify-center overflow-hidden rounded-full px-[15px] font-urdu text-[14.5px] leading-none ${
                lang === 'ur' ? 'bg-ink text-paper' : 'bg-transparent text-mut'
              }`}
            >
              اردو
            </span>
          </button>

          {!compact && (
            <a
              href="/#quote"
              className={`flex h-[50px] flex-shrink-0 items-center justify-center rounded-full bg-ink px-[26px] text-[15px] font-bold whitespace-nowrap text-paper transition-[transform,box-shadow] duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_28px_-8px_rgba(23,21,15,0.55)] ${
                activeId === 'quote' ? 'ring-2 ring-acc ring-offset-2 ring-offset-[#F5F2EC]' : ''
              }`}
            >
              <Bi en="Get a quote" ur="کوٹیشن لیں" />
            </a>
          )}

          {showCompactQuote && (
            <a
              href="/#quote"
              aria-label="Get a quote"
              className="flex h-12 flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-ink px-4 text-[13.5px] font-bold text-paper transition-transform hover:-translate-y-px"
            >
              <Bi en="Quote" ur="کوٹیشن" />
            </a>
          )}

          {compact && (
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu-panel"
              className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-full border-none bg-ink"
            >
              <span
                className="block h-[1.8px] w-4 rounded-[2px] bg-paper transition-transform duration-300"
                style={{ transform: menuOpen ? 'translateY(3px) rotate(45deg)' : 'none' }}
              />
              <span
                className="block h-[1.8px] w-4 rounded-[2px] bg-paper transition-transform duration-300"
                style={{ transform: menuOpen ? 'translateY(-3px) rotate(-45deg)' : 'none' }}
              />
            </button>
          )}
        </div>
      </div>

      {compact && (
        <div
          id="mobile-menu-panel"
          aria-hidden={!menuOpen}
          className={`grid w-full transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
            menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div
              className={`box-border flex w-full flex-col gap-[2px] rounded-[26px] border border-[rgba(23,21,15,0.09)] bg-[rgba(245,242,236,0.94)] p-[10px] pointer-events-auto shadow-[0_22px_60px_-18px_rgba(23,21,15,0.35)] [backdrop-filter:blur(24px)_saturate(1.5)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
              }`}
            >
              {NAV_LINKS.map((link) => {
                const active = activeId === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    tabIndex={menuOpen ? undefined : -1}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-[15px] text-[16px] font-semibold transition-colors duration-250 hover:bg-[rgba(23,21,15,0.05)] hover:text-ink ${
                      active ? 'text-ink' : ''
                    }`}
                  >
                    {active && <span aria-hidden="true" className="h-[7px] w-[7px] flex-shrink-0 rounded-full bg-acc" />}
                    <Bi en={link.en} ur={link.ur} />
                  </a>
                );
              })}
              <Link
                to="/marketplace"
                tabIndex={menuOpen ? undefined : -1}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-4 py-[15px] text-[16px] font-semibold transition-colors duration-250 hover:bg-[rgba(23,21,15,0.05)] hover:text-ink"
              >
                <Bi en="Marketplace" ur="مارکیٹ پلیس" />
              </Link>
              <a
                href="/#quote"
                tabIndex={menuOpen ? undefined : -1}
                onClick={() => setMenuOpen(false)}
                className="mt-[6px] rounded-full bg-ink px-4 py-[17px] text-center text-[15.5px] font-bold text-paper"
              >
                <Bi en="Get a quote" ur="کوٹیشن لیں" />
              </a>
            </div>
          </div>
        </div>
      )}

      <QuickSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
