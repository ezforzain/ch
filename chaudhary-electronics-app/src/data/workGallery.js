// Verbatim from the #work "Recent installations" bento gallery in
// Chaudhary Electronics.dc.html (lines 216-246). No Urdu copy exists in source for these
// items — only the section heading/eyebrow is bilingual (handled in WorkGallery.jsx itself).
//
// The lightbox caption mirrors the source's openShot() handler, which reads the clicked
// image's `alt` text verbatim (cap.textContent = img.alt) — note this sometimes differs in
// wording/casing from the overlay title shown on the tile itself.
//
// Grid: grid-template-columns: repeat(4, 1fr); grid-auto-rows: 110px;
// colSpan/rowSpan below map straight to each button's grid-column/grid-row span.
// captionClass/titleClass are transcribed per-tile (the hero tile has its own larger caption
// padding/title size + a subtitle line; the two-column tiles and one-column tiles each share
// one treatment among themselves).
//
// New fields (not present in source, added for the filter/before-after/details features):
// - category: one of 'Residential' | 'Commercial' | 'Security', derived sensibly from each
//   item's existing caption/context, used to drive the chip filter row.
// - beforeImg/beforeFb: an optional "before" photo for a before/after toggle inside the
//   lightbox. Only added for the 2-3 items where a before shot makes visual sense (bare
//   roof/site vs. finished install). Uses the same imgFallback() pattern as every other
//   <img> in the app for graceful fallback if the chosen Unsplash id doesn't resolve.
// - size/location/completion/savings: plausible, invented project details (consistent with
//   each item's existing caption) shown in the new "Project details" popup.

const CAPTION_LG = 'pt-8 px-[18px] pb-4'; // 32px 18px 16px
const CAPTION_MD = 'pt-7 px-[18px] pb-[14px]'; // 28px 18px 14px
const CAPTION_SM = 'pt-[26px] px-[14px] pb-3'; // 26px 14px 12px

const TITLE_LG = 'text-[17.5px] font-[650]';
const TITLE_MD = 'text-[16px] font-semibold';
const TITLE_SM = 'text-[14.5px] font-semibold';

export const workGallery = [
  {
    id: 0,
    img: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1200&q=80',
    fb: 'solar,roof,house',
    alt: '10 kW hybrid, DHA Lahore',
    title: '10 kW Hybrid · DHA Lahore',
    subtitle: 'Bill down from PKR 84,000 to 6,200',
    colSpan: 2,
    rowSpan: 3,
    captionClass: CAPTION_LG,
    titleClass: TITLE_LG,
    category: 'Residential',
    beforeImg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    beforeFb: 'house,roof,bare',
    details: {
      size: '10 kW Hybrid',
      location: 'DHA Phase 6, Lahore',
      completion: '4 days',
      savings: 'Bill down from PKR 84,000 to 6,200/month',
    },
  },
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80',
    fb: 'solar,farm,array',
    alt: '180 kW on-grid',
    title: '180 kW On-Grid · Sundar Estate',
    subtitle: null,
    colSpan: 2,
    rowSpan: 2,
    captionClass: CAPTION_MD,
    titleClass: TITLE_MD,
    category: 'Commercial',
    beforeImg: 'https://images.unsplash.com/photo-1587582423116-ec07293f0395?auto=format&fit=crop&w=1200&q=80',
    beforeFb: 'factory,roof,bare',
    details: {
      size: '180 kW On-Grid',
      location: 'Sundar Estate, Lahore',
      completion: '3 weeks',
      savings: 'Zero electrical stoppages, 2+ years running',
    },
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80',
    fb: 'inverter,electrical,panel',
    alt: 'Inverter room',
    title: 'Hybrid inverter room',
    subtitle: null,
    colSpan: 1,
    rowSpan: 2,
    captionClass: CAPTION_SM,
    titleClass: TITLE_SM,
    category: 'Residential',
    details: {
      size: 'Inverter room upgrade',
      location: 'DHA Lahore',
      completion: '1 day',
      savings: 'Seamless backup switchover, under 10ms',
    },
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
    fb: 'cctv,camera,building',
    alt: 'CCTV install',
    title: '8-camera retail setup',
    subtitle: null,
    colSpan: 1,
    rowSpan: 2,
    captionClass: CAPTION_SM,
    titleClass: TITLE_SM,
    category: 'Security',
    details: {
      size: '8-camera 4K CCTV',
      location: 'Saddar, Rawalpindi',
      completion: '1 day',
      savings: 'Remote viewing from anywhere',
    },
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=1200&q=80',
    fb: 'engineer,solar,worker',
    alt: 'Our crew on site',
    title: 'Our own crew, every job',
    subtitle: null,
    colSpan: 2,
    rowSpan: 2,
    captionClass: CAPTION_MD,
    titleClass: TITLE_MD,
    category: 'Commercial',
    details: {
      size: 'Full-service install crew',
      location: 'Multiple sites, Punjab',
      completion: 'Ongoing',
      savings: 'In-house team — no subcontracting',
    },
  },
  {
    id: 5,
    img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80',
    fb: 'solar,commercial,rooftop',
    alt: 'Commercial rooftop',
    title: '55 kW plaza rooftop · Faisalabad',
    subtitle: null,
    colSpan: 2,
    rowSpan: 2,
    captionClass: CAPTION_MD,
    titleClass: TITLE_MD,
    category: 'Commercial',
    beforeImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80',
    beforeFb: 'plaza,rooftop,bare',
    details: {
      size: '55 kW Commercial',
      location: 'Plaza rooftop, Faisalabad',
      completion: '10 days',
      savings: 'ROI in under 4 years',
    },
  },
];
