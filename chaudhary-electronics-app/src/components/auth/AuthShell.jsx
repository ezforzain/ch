import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import Bi from '../ui/Bi';

/** Shared shell for every standalone auth page (Login, Forgot/Reset Password) — same
 * dark-mode-capable centered card, back-to-home link, and lang/dark toggles, so each page
 * only supplies its own title/subtitle/form. Extracted from Login.jsx's markup verbatim. */
export default function AuthShell({ title, subtitle, children }) {
  const { toggleLang, lang } = useLang();
  const [dark, setDark] = useState(false);

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-5 py-12 transition-colors duration-500 dark:bg-dark ${dark ? 'dark' : ''}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 dark:opacity-100"
      >
        <span className="animate-ce-drift-a absolute -top-[10%] -left-[10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.3),transparent_70%)] blur-3xl" />
        <span className="animate-ce-drift-b absolute top-[30%] -right-[14%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(226,163,71,0.16),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mb-7 flex w-full max-w-[420px] items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-mut transition-colors hover:text-ink dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
        >
          <span aria-hidden="true">←</span>
          <Bi en="Back to home" ur="ہوم پیج پر واپس" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            aria-label="Switch language"
            className="rounded-full border border-line px-3 py-[7px] text-[12.5px] font-semibold text-mut transition-colors hover:text-ink dark:border-[rgba(245,242,236,0.16)] dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
          >
            {lang === 'en' ? 'اردو' : 'EN'}
          </button>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={dark}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-line text-mut transition-colors hover:text-ink dark:border-[rgba(245,242,236,0.16)] dark:text-[rgba(245,242,236,0.6)] dark:hover:text-paper"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

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
