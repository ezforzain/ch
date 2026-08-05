import { useScrollY } from '../../hooks/useScrollY';
import { waLink } from '../../lib/format';

// Same WhatsApp number used by QuoteForm/MarketplaceSection, and the same
// tel: number the Footer and QuoteForm's "call directly" card already link to.
const WHATSAPP_NUMBER = '920000000000';
const WHATSAPP_MESSAGE = 'Assalam o Alaikum, I have a question about your services.';
const PHONE_TEL = '+920000000000';

/**
 * Site-wide floating actions: WhatsApp chat + Call now. Fixed to the bottom
 * right so they never sit under the centered, pill-shaped MobileCtaBar — and
 * when that bar is visible (same show/hide scroll math as MobileCtaBar.jsx:
 * shown once scrolled past ~1.1 viewport heights, hidden again near the
 * bottom of the page) these lift further up the screen so the two never
 * overlap on narrow viewports either.
 */
export default function WhatsAppFloatButton() {
  const scrollY = useScrollY();
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
  const scrollHeight = typeof document !== 'undefined' ? document.body.scrollHeight : 0;
  const ctaBarVisible = scrollY > vh * 1.1 && scrollY < scrollHeight - vh * 1.9;

  return (
    <div
      className="fixed right-5 z-[870] flex flex-col items-end gap-3 transition-[bottom] duration-[550ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] sm:right-6"
      style={{ bottom: ctaBarVisible ? '92px' : '22px' }}
    >
      <a
        href={`tel:${PHONE_TEL}`}
        aria-label="Call now"
        title="Call now"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-[0_14px_36px_-12px_rgba(23,21,15,0.6)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(23,21,15,0.7)]"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </a>

      <a
        href={waLink(WHATSAPP_NUMBER, WHATSAPP_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_44px_-14px_rgba(37,211,102,0.8)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-14px_rgba(37,211,102,0.9)]"
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="currentColor">
          <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.386.7 4.61 1.902 6.478L4 29l7.72-1.87A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.818a9.77 9.77 0 0 1-4.982-1.364l-.357-.212-4.583 1.11 1.128-4.47-.234-.367A9.78 9.78 0 0 1 5.2 15c0-5.965 4.847-10.818 10.804-10.818S26.8 9.035 26.8 15 21.961 24.818 16.004 24.818z" />
          <path d="M21.6 17.63c-.298-.15-1.76-.868-2.033-.968-.273-.099-.472-.148-.67.15-.199.297-.767.967-.94 1.166-.174.198-.348.223-.646.074-.298-.15-1.257-.463-2.394-1.475-.885-.789-1.482-1.764-1.656-2.062-.174-.297-.019-.458.13-.606.135-.134.298-.347.447-.52.15-.174.199-.298.298-.497.1-.198.05-.372-.025-.521-.074-.15-.67-1.612-.918-2.208-.242-.581-.487-.503-.67-.512l-.571-.01a1.1 1.1 0 0 0-.795.372c-.273.298-1.04 1.017-1.04 2.48 0 1.462 1.065 2.876 1.213 3.074.15.198 2.096 3.2 5.079 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.76-.72 2.008-1.414.248-.694.248-1.29.174-1.414-.075-.124-.273-.198-.571-.347z" />
        </svg>
      </a>
    </div>
  );
}
