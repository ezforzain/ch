import Bi from '../ui/Bi';

// Fictional client/partner names (no real Unsplash-style logo assets exist
// for this) rendered as clean typographic wordmarks rather than broken
// <img> tags. Kept generic/plausible for a Pakistani commercial-electronics
// clientele rather than naming real companies.
const CLIENTS = [
  'Ittehad Textile Mills',
  'Al-Noor Departmental Stores',
  'Sundar Estate Industries',
  'Model Town Business Council',
  'Gulberg Medical Complex',
  'Bund Road Traders Association',
];

export default function ClientLogos() {
  return (
    <section aria-labelledby="clients-h" className="px-5 py-[clamp(48px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div
          id="clients-h"
          className="mb-6 text-center text-[11.5px] font-semibold uppercase tracking-[0.1em] text-mut"
        >
          <Bi en="Trusted by businesses across Punjab" ur="پنجاب بھر کے کاروبار ہم پر اعتماد کرتے ہیں" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {CLIENTS.map((name) => (
            <span
              key={name}
              className="inline-flex items-center rounded-full border border-line bg-[#FBFAF7] px-5 py-3 text-[14px] font-semibold tracking-[-0.01em] text-mut transition-colors hover:text-ink"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
