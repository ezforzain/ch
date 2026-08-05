// Verbatim from the Testimonials section in Chaudhary Electronics.dc.html (lines 506-527).
// No Urdu copy exists in source for testimonial quotes/names/locations.
//
// Each card is clickable (role="button", Enter/Space via caseKey) and opens the shared
// lightbox showing a larger version of the referenced install photo — the exact photo id
// and caption text come from the caseBilal/caseRizwan/caseHafiz handlers (lines 1541-1543),
// built via imgUrl(id, 1600) => https://images.unsplash.com/{id}?auto=format&fit=crop&w=1600&q=80
//
// rating: added for the new star-rating display (new feature, not in source). Values 4-5,
// consistent with these being genuine positive testimonials.

export const testimonials = [
  {
    id: 'bilal',
    quote:
      '"June bill was PKR 84,000. This June: 6,200. The house never went dark once."',
    name: 'Bilal Ahmed',
    location: 'DHA Phase 6, Lahore',
    portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    portraitFb: 'portrait,man',
    rating: 5,
    dark: false,
    verified: true,
    ariaLabel: 'View the 10 kW hybrid installation in DHA Phase 6, Lahore',
    case: {
      img: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1600&q=80',
      caption: '10 kW Hybrid · DHA Phase 6, Lahore — bill down from PKR 84,000 to 6,200',
    },
  },
  {
    id: 'rizwan',
    quote:
      '"They designed around our shift timings. Two years, zero electrical stoppages."',
    name: 'Rizwan Textiles',
    location: 'Sundar Estate, Lahore',
    portrait: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    portraitFb: 'portrait,businessman',
    rating: 5,
    dark: true,
    verified: true,
    ariaLabel: 'View the 180 kW on-grid project at Sundar Estate, Lahore',
    case: {
      img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1600&q=80',
      caption: '180 kW On-Grid · Sundar Estate, Lahore — two years, zero electrical stoppages',
    },
  },
  {
    id: 'hafiz',
    quote:
      '"Rewired three floors without closing the shop for a day. Eight cameras I check from Dubai."',
    name: 'Hafiz Traders',
    location: 'Saddar, Rawalpindi',
    portrait: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    portraitFb: 'portrait,shopkeeper',
    rating: 4,
    dark: false,
    verified: true,
    ariaLabel: 'View the wiring and CCTV project in Saddar, Rawalpindi',
    case: {
      img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1600&q=80',
      caption: 'Wiring + 8-camera CCTV · Saddar, Rawalpindi',
    },
  },
];
