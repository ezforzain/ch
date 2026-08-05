// Verbatim from the trust-badge strip in Chaudhary Electronics.dc.html (lines 135-144).
// English-only in source (no data-lang spans). The track is duplicated once so the
// ce-marquee keyframes (translateX(0) -> translateX(-50%)) loop seamlessly.
const BADGES = [
  'Net metering filed for you',
  '10-year workmanship warranty',
  'Tier-1 panels only',
  '48-hour service response',
  'Lahore · Rawalpindi · Faisalabad',
];

function Track() {
  return (
    <div className="flex items-center gap-[52px] pr-[52px] font-sans text-[12px] tracking-[0.09em] text-mut uppercase">
      {BADGES.map((badge) => (
        <span key={badge} className="flex items-center gap-[52px]">
          {badge}
          <span className="text-acc">◆</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="overflow-hidden border-b border-line py-[22px]">
      <div className="flex w-max animate-ce-marquee">
        <Track />
        <Track />
      </div>
    </section>
  );
}
