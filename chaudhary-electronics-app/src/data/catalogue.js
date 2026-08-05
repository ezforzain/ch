// Hardcoded product catalogue, transcribed 1:1 from `this.catalogue` in the
// source `.dc.html`'s marketplace script. Field names, values, ordering and
// wording are preserved exactly — this content is English-only in the
// source (no Urdu variants exist for product names/notes/specs anywhere in
// the original), so it is left untranslated here too.

export const CATEGORIES = [
  'All',
  'Solar Panels',
  'Inverters',
  'Batteries',
  'Air Conditioners',
  'Fans & Lighting',
  'Wires & Cables',
  'Switchgear',
  'Tools & Accessories',
];

export const CATALOGUE = [
  { id: 'p1', name: '585 W N-Type Bifacial Module', cat: 'Solar Panels', price: 27500, unit: '/ panel', note: '25-year performance warranty, IEC certified', tag: 'TIER 1', img: 'photo-1509391366360-2e959784a276', gallery: ['photo-1509391366360-2e959784a276', 'photo-1508514177221-188b1cf16e9d', 'photo-1508514177221-188b1cf16e9d'], fb: 'solar,panel', pop: 10, rating: 4.8, reviews: 126, stock: 340, seller: 'Chaudhary Electronics', warranty: '25 years performance / 12 years product', specs: { Power: '585 W', Type: 'N-Type bifacial mono', Efficiency: '22.8%', Dimensions: '2278 × 1134 × 30 mm', Weight: '32 kg', Cells: '144 half-cut' } },
  { id: 'p2', name: '620 W Mono PERC Module', cat: 'Solar Panels', price: 29800, note: 'High yield in Punjab heat, 12-year product warranty', img: 'photo-1508514177221-188b1cf16e9d', gallery: ['photo-1508514177221-188b1cf16e9d', 'photo-1509391366360-2e959784a276', 'photo-1509391366360-2e959784a276'], fb: 'solar,panel', pop: 7, rating: 4.6, reviews: 74, stock: 180, seller: 'Chaudhary Electronics', warranty: '25 years performance / 12 years product', specs: { Power: '620 W', Type: 'Mono PERC', Efficiency: '22.1%', Dimensions: '2382 × 1134 × 35 mm', Weight: '34 kg', Cells: '156 half-cut' } },
  { id: 'p3', name: '8 kW Hybrid Inverter, Wi-Fi', cat: 'Inverters', price: 385000, note: 'Net-metering ready, app monitoring, 5-year warranty', tag: 'POPULAR', img: 'photo-1621905251918-48416bd8575a', gallery: ['photo-1621905251918-48416bd8575a', 'photo-1613665813446-82a78c468a1d'], fb: 'inverter,electronics', pop: 9, rating: 4.9, reviews: 212, stock: 24, seller: 'Chaudhary Electronics', warranty: '5 years', specs: { Capacity: '8 kW', Phase: 'Single', MPPT: 'Dual', 'Battery support': '48 V lithium / tubular', Monitoring: 'Wi-Fi + mobile app', Efficiency: '97.6%' } },
  { id: 'p4', name: '5 kW On-Grid Inverter', cat: 'Inverters', price: 245000, note: 'Dual MPPT, ideal for a 5-marla home', img: 'photo-1613665813446-82a78c468a1d', gallery: ['photo-1613665813446-82a78c468a1d', 'photo-1621905251918-48416bd8575a'], fb: 'inverter,solar', pop: 6, rating: 4.5, reviews: 88, stock: 31, seller: 'Chaudhary Electronics', warranty: '5 years', specs: { Capacity: '5 kW', Phase: 'Single', MPPT: 'Dual', 'Battery support': 'None (on-grid)', Monitoring: 'Wi-Fi', Efficiency: '98.1%' } },
  { id: 'p5', name: '12 kW Three-Phase Inverter', cat: 'Inverters', price: 690000, note: 'For plazas, clinics and small factories', img: 'photo-1508514177221-188b1cf16e9d', gallery: ['photo-1508514177221-188b1cf16e9d', 'photo-1613665813446-82a78c468a1d'], fb: 'inverter,industrial', pop: 4, rating: 4.7, reviews: 41, stock: 9, seller: 'CE Commercial Division', warranty: '5 years', specs: { Capacity: '12 kW', Phase: 'Three', MPPT: 'Dual', 'Battery support': 'Optional', Monitoring: 'Wi-Fi + RS485', Efficiency: '98.4%' } },
  { id: 'p6', name: '5.1 kWh Lithium LFP Wall Pack', cat: 'Batteries', price: 295000, note: '6,000 cycles, stackable, BMS included', tag: 'POPULAR', img: 'photo-1621905251918-48416bd8575a', gallery: ['photo-1621905251918-48416bd8575a', 'photo-1621905251918-48416bd8575a'], fb: 'battery,lithium', pop: 9, rating: 4.8, reviews: 164, stock: 18, seller: 'Chaudhary Electronics', warranty: '8 years', specs: { Capacity: '5.12 kWh', Chemistry: 'LiFePO4', Cycles: '6,000 @ 80% DoD', Voltage: '51.2 V', Mounting: 'Wall / stackable', BMS: 'Built-in with app' } },
  { id: 'p7', name: '10.2 kWh Lithium Tower', cat: 'Batteries', price: 560000, note: 'Whole-home backup, floor standing', img: 'photo-1621905251918-48416bd8575a', gallery: ['photo-1621905251918-48416bd8575a', 'photo-1509391366360-2e959784a276'], fb: 'battery,storage', pop: 5, rating: 4.7, reviews: 52, stock: 7, seller: 'Chaudhary Electronics', warranty: '8 years', specs: { Capacity: '10.24 kWh', Chemistry: 'LiFePO4', Cycles: '6,000 @ 80% DoD', Voltage: '51.2 V', Mounting: 'Floor tower', BMS: 'Built-in with app' } },
  { id: 'p8', name: '200 Ah Tubular Battery', cat: 'Batteries', price: 62000, note: 'Budget backup, 18-month replacement warranty', img: 'photo-1621905251918-48416bd8575a', gallery: ['photo-1621905251918-48416bd8575a'], fb: 'battery,lead', pop: 6, rating: 4.1, reviews: 97, stock: 64, seller: 'Bund Road Battery House', warranty: '18 months replacement', specs: { Capacity: '200 Ah', Chemistry: 'Lead-acid tubular', Cycles: '1,200 @ 50% DoD', Voltage: '12 V', Mounting: 'Floor', Maintenance: 'Top-up water quarterly' } },
  { id: 'p9', name: '1.5 Ton DC Inverter AC', cat: 'Air Conditioners', price: 178000, note: 'Solar-friendly, T3 compressor, heat & cool', img: 'photo-1559302504-64aae6ca6b6d', gallery: ['photo-1559302504-64aae6ca6b6d'], fb: 'air,conditioner', pop: 8, rating: 4.6, reviews: 143, stock: 22, seller: 'Chaudhary Electronics', warranty: '10 years compressor', specs: { Capacity: '1.5 Ton', Type: 'DC inverter, heat & cool', 'Running watts': '1,100–1,400 W', Compressor: 'T3 rotary', 'Energy rating': 'A++', Refrigerant: 'R410a' } },
  { id: 'p10', name: '1 Ton DC Inverter AC', cat: 'Air Conditioners', price: 142000, note: 'Right-sized for a bedroom on solar', img: 'photo-1559302504-64aae6ca6b6d', gallery: ['photo-1559302504-64aae6ca6b6d'], fb: 'air,conditioner,room', pop: 5, rating: 4.4, reviews: 61, stock: 15, seller: 'Chaudhary Electronics', warranty: '10 years compressor', specs: { Capacity: '1 Ton', Type: 'DC inverter, heat & cool', 'Running watts': '750–980 W', Compressor: 'T3 rotary', 'Energy rating': 'A++', Refrigerant: 'R410a' } },
  { id: 'p11', name: 'DC Ceiling Fan, 56"', cat: 'Fans & Lighting', price: 14500, note: 'Runs on 28 W — four fans on one panel', tag: 'LOW WATT', img: 'photo-1559302504-64aae6ca6b6d', gallery: ['photo-1559302504-64aae6ca6b6d'], fb: 'ceiling,fan', pop: 8, rating: 4.5, reviews: 210, stock: 120, seller: 'Chaudhary Electronics', warranty: '2 years', specs: { Sweep: '56 inch', Power: '28 W', Input: '12–24 V DC', RPM: '340', Remote: 'Included', Body: 'Aluminium' } },
  { id: 'p12', name: '18 W LED Panel Light', cat: 'Fans & Lighting', price: 1450, unit: '/ piece', note: 'Flicker-free, 2-year warranty', img: 'photo-1557597774-9d273605dfa9', gallery: ['photo-1557597774-9d273605dfa9'], fb: 'led,light', pop: 6, rating: 4.3, reviews: 178, stock: 500, seller: 'Chaudhary Electronics', warranty: '2 years', specs: { Power: '18 W', Lumens: '1,620 lm', 'Colour temp': '6500 K', Driver: 'Isolated, flicker-free', Cutout: '170 mm', Life: '30,000 hrs' } },
  { id: 'p13', name: '6 mm² Copper Cable, 100 yd', cat: 'Wires & Cables', price: 38500, unit: '/ coil', note: 'Pure copper, PVC insulated, PSQCA marked', img: 'photo-1621905251918-48416bd8575a', gallery: ['photo-1621905251918-48416bd8575a'], fb: 'copper,cable', pop: 5, rating: 4.6, reviews: 66, stock: 85, seller: 'Chaudhary Electronics', warranty: 'Manufacturer assured', specs: { Section: '6 mm²', Conductor: '99.97% pure copper', Insulation: 'PVC 70°C', Length: '100 yards', Rating: '1100 V', Standard: 'PSQCA / IEC 60227' } },
  { id: 'p14', name: 'Solar DC Cable, 4 mm²', cat: 'Wires & Cables', price: 21000, unit: '/ coil', note: 'UV-stable, rated for rooftop runs', img: 'photo-1621905251918-48416bd8575a', gallery: ['photo-1621905251918-48416bd8575a'], fb: 'solar,cable', pop: 4, rating: 4.4, reviews: 39, stock: 110, seller: 'Chaudhary Electronics', warranty: 'Manufacturer assured', specs: { Section: '4 mm²', Conductor: 'Tinned copper', Insulation: 'XLPE, UV stable', Length: '100 metres', Rating: '1500 V DC', Standard: 'EN 50618' } },
  { id: 'p15', name: '63 A 4-Pole MCCB', cat: 'Switchgear', price: 18900, note: 'Short-circuit protection for the main DB', img: 'photo-1621905251918-48416bd8575a', gallery: ['photo-1621905251918-48416bd8575a'], fb: 'breaker,switchgear', pop: 4, rating: 4.5, reviews: 28, stock: 47, seller: 'Chaudhary Electronics', warranty: '2 years', specs: { Current: '63 A', Poles: '4', 'Breaking capacity': '25 kA', Voltage: '415 V AC', Mounting: 'DIN rail', Standard: 'IEC 60947-2' } },
  { id: 'p16', name: 'Solar DC Isolator + SPD Box', cat: 'Switchgear', price: 26500, note: 'Surge protection between array and inverter', img: 'photo-1613665813446-82a78c468a1d', gallery: ['photo-1613665813446-82a78c468a1d'], fb: 'electrical,box', pop: 3, rating: 4.4, reviews: 19, stock: 33, seller: 'Chaudhary Electronics', warranty: '2 years', specs: { Rating: '1000 V DC / 32 A', 'SPD type': 'Type 2', Enclosure: 'IP65 polycarbonate', Strings: '2 in / 1 out', Indicator: 'Surge status window', Standard: 'IEC 61643-31' } },
  { id: 'p17', name: '4-Camera 4K IP Kit + NVR', cat: 'Tools & Accessories', price: 148000, unit: 'fitted', note: 'Night colour, 2 TB storage, phone viewing', img: 'photo-1557597774-9d273605dfa9', gallery: ['photo-1557597774-9d273605dfa9', 'photo-1557597774-9d273605dfa9'], fb: 'cctv,camera', pop: 7, rating: 4.7, reviews: 104, stock: 12, seller: 'CE Security Systems', warranty: '2 years', specs: { Cameras: '4 × 8 MP IP', Recorder: '4-channel NVR', Storage: '2 TB surveillance HDD', Night: 'Full-colour to 30 m', Viewing: 'iOS / Android app', Install: 'Included within city' } },
  { id: 'p18', name: 'Panel Mounting Structure', cat: 'Tools & Accessories', price: 9500, unit: '/ kW', note: 'Hot-dip galvanised, wind rated', img: 'photo-1508514177221-188b1cf16e9d', gallery: ['photo-1508514177221-188b1cf16e9d', 'photo-1509391366360-2e959784a276'], fb: 'solar,mount', pop: 5, rating: 4.5, reviews: 57, stock: 200, seller: 'Chaudhary Electronics', warranty: '10 years against rust', specs: { Material: 'Hot-dip galvanised iron', 'Wind rating': '150 km/h', Tilt: '15–30° adjustable', Type: 'Roof / ground mount', Coating: '80 micron zinc', Fixings: 'Stainless steel included' } },
];

/**
 * Builds an Unsplash source URL the same way the source's `imgUrl()` does —
 * but first passes through anything that's already a real URL (http(s):// or
 * a data: URI). Seed catalogue images are bare Unsplash photo ids ('photo-...'),
 * but products added/edited through the Admin Panel store full data: URLs
 * (from FileReader) or full URLs, so this needs to handle both shapes.
 */
export function imgUrl(id, w) {
  if (!id) return '';
  if (/^(https?:|data:|blob:)/.test(id)) return id;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

export function findById(id) {
  return CATALOGUE.find((p) => p.id === id);
}

/** category name -> URL slug, matches source's `slug()` (used for `#category/<slug>`). */
export function slugifyCategory(c) {
  return c
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
