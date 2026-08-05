import Bi from '../ui/Bi';

// Certification/accreditation badges relevant to a Pakistani solar
// installer. Rendered with an inline shield-check SVG — no external assets.
const CERTS = [
  { id: 'nepra', en: 'NEPRA Registered', ur: 'نیپرا رجسٹرڈ' },
  { id: 'aedb', en: 'AEDB Certified', ur: 'اے ای ڈی بی سرٹیفائیڈ' },
  { id: 'tier1', en: 'Tier-1 Panel Partner', ur: 'ٹائیر 1 پینل پارٹنر' },
  { id: 'iso', en: 'ISO 9001 Certified', ur: 'آئی ایس او 9001 سرٹیفائیڈ' },
];

function ShieldCheckIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0 text-acc"
      aria-hidden="true"
    >
      <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export default function Certifications() {
  return (
    <section aria-labelledby="certs-h" className="px-5 py-[clamp(48px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div
          id="certs-h"
          className="mb-6 text-center text-[11.5px] font-semibold uppercase tracking-[0.1em] text-mut"
        >
          <Bi en="Registered, certified and accountable" ur="رجسٹرڈ، سرٹیفائیڈ اور قابلِ اعتماد" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
          {CERTS.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-[18px] border border-line bg-[#FBFAF7] px-5 py-4"
            >
              <ShieldCheckIcon />
              <span className="text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
                <Bi en={c.en} ur={c.ur} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
