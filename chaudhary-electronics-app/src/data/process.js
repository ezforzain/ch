// Verbatim from the "Five steps, no surprises" Process section in
// Chaudhary Electronics.dc.html (lines 490-503). English-only in source (no data-lang="ur"
// spans inside the step cards; only the section heading is bilingual, handled in Process.jsx).
// Step 5 ("Aftercare") is visually distinct in source: a warm gradient card instead of the
// flat translucent card used for steps 1-4 — captured here via `accent: true`.

export const processSteps = [
  {
    n: '01',
    title: 'Free survey',
    desc: 'We measure the roof, read six bills.',
    accent: false,
  },
  {
    n: '02',
    title: 'Written quote',
    desc: 'Layout, brands, model numbers, one price.',
    accent: false,
  },
  {
    n: '03',
    title: 'Net metering',
    desc: 'We file with the DISCO and track it.',
    accent: false,
  },
  {
    n: '04',
    title: 'Installation',
    desc: '3–5 days for a home. Our own crew.',
    accent: false,
  },
  {
    n: '05',
    title: 'Aftercare',
    desc: 'Free first-year checkups. We stay reachable.',
    accent: true,
  },
];
