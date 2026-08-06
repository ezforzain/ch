import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileCtaBar from './MobileCtaBar';
import WhatsAppFloatButton from './WhatsAppFloatButton';

/** Shared chrome for every public page (Home, Marketplace, Product Details, Privacy,
 * Terms, 404) — Navbar + Footer + the floating CTA/WhatsApp buttons render once here
 * instead of being hand-copied into each page. `key={pathname}` on `<main>` makes the
 * existing `.animate-ce-page-in` mount animation (src/index.css) re-fire on every route
 * change, giving the whole public site a consistent, low-cost page transition. */
export default function PublicLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1300] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-[14.5px] focus:font-semibold focus:text-paper focus:shadow-[0_12px_28px_-8px_rgba(23,21,15,0.55)]"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" key={pathname} className="animate-ce-page-in">
        <Outlet />
      </main>
      <Footer />
      <MobileCtaBar />
      <WhatsAppFloatButton />
    </>
  );
}
