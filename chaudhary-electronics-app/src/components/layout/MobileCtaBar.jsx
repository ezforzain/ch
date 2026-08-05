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
      className="fixed bottom-[14px] left-1/2 z-[880] hidden max-[1239px]:flex items-center gap-2 rounded-full border border-[rgba(245,242,236,0.14)] bg-[rgba(15,14,11,0.88)] py-2 pr-2 pl-[18px] shadow-[0_18px_50px_-16px_rgba(0,0,0,0.6)] backdrop-blur-[18px] transition-transform duration-[550ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
      style={{ transform: `translateX(-50%) translateY(${show ? '0' : '150%'})` }}
    >
      <span className="text-[13.5px] whitespace-nowrap text-[rgba(245,242,236,0.78)]">
        <Bi en="Free site survey" ur="مفت سروے" />
      </span>
      <a
        href="#quote"
        className="rounded-full bg-acc px-[17px] py-[10px] text-[13.5px] font-bold whitespace-nowrap text-ink"
      >
        <Bi en="Get a quote" ur="کوٹیشن" />
      </a>
    </div>
  );
}
