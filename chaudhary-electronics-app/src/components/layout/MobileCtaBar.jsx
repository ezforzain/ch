import { useScrollY } from '../../hooks/useScrollY';
import Bi from '../ui/Bi';

/** Floating bottom CTA bar, mirroring [data-mobilebar] (lines 629-632) and its show/hide
 * logic in the source's onScroll handler (lines 1030-1033): hidden near the very top of the
 * page and hidden again once nearing the bottom, visible in between. */
export default function MobileCtaBar() {
  const scrollY = useScrollY();

  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
  const scrollHeight = typeof document !== 'undefined' ? document.body.scrollHeight : 0;
  const show = scrollY > vh * 1.1 && scrollY < scrollHeight - vh * 1.9;

  return (
    <div
      className="fixed left-1/2 z-[880] hidden max-[1239px]:flex w-[calc(100%-24px)] max-w-[380px] items-center gap-1.5 rounded-full border border-[rgba(245,242,236,0.14)] bg-[rgba(15,14,11,0.9)] p-1.5 shadow-[0_18px_50px_-16px_rgba(0,0,0,0.6)] backdrop-blur-[18px] transition-transform duration-[550ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        transform: `translateX(-50%) translateY(${show ? '0' : '150%'})`,
      }}
    >
      <a
        href="#quote"
        className="flex h-11 flex-1 items-center justify-center truncate rounded-full border border-[rgba(245,242,236,0.18)] px-2 text-[12.5px] font-semibold whitespace-nowrap text-[rgba(245,242,236,0.85)] transition-colors hover:bg-white/5"
      >
        <Bi en="Free site survey" ur="مفت سروے" />
      </a>
      <a
        href="#quote"
        className="flex h-11 flex-1 items-center justify-center truncate rounded-full bg-acc px-2 text-[12.5px] font-bold whitespace-nowrap text-ink"
      >
        <Bi en="Get a quote" ur="کوٹیشن لیں" />
      </a>
    </div>
  );
}
