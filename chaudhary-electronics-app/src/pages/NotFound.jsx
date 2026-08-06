import { Link } from 'react-router-dom';
import Bi from '../components/ui/Bi';

/** On-brand 404, mounted as the public route group's catch-all (inside PublicLayout,
 * so it still gets Navbar/Footer) — the site should never hand a visitor a blank page. */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-5 py-24 text-center">
      <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-acc">
        <Bi en="Error 404" ur="ایرر 404" />
      </span>
      <span className="text-[clamp(64px,10vw,120px)] font-[680] leading-none tracking-[-0.04em] text-ink">
        404
      </span>
      <span className="max-w-[440px] text-[17px] leading-[1.6] text-mut">
        <Bi
          en="We couldn't find that page. It may have moved, or the link might be out of date."
          ur="یہ صفحہ نہیں ملا۔ ہو سکتا ہے یہ منتقل ہو گیا ہو یا لنک پرانا ہو۔"
        />
      </span>
      <span className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-full bg-ink px-6 py-3.5 text-[14.5px] font-[650] text-paper transition-transform hover:-translate-y-0.5"
        >
          <Bi en="Back to home" ur="ہوم پیج پر واپس" />
        </Link>
        <Link
          to="/marketplace"
          className="rounded-full border border-line bg-transparent px-6 py-3.5 text-[14.5px] font-semibold text-ink transition-colors hover:bg-black/5"
        >
          <Bi en="Browse marketplace" ur="مارکیٹ پلیس دیکھیں" />
        </Link>
      </span>
    </div>
  );
}
