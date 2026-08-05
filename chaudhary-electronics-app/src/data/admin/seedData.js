// Transcribed exactly from source `seedData()` in Admin Panel.dc.html.
// Called once by useAdminData() and merged under whatever is in
// localStorage['chaudhary_admin_data_v1'] — mirrors source's loadData().

function mk(rows) {
  return rows.map((r, i) => ({
    id: r.id || 'R' + i + Math.random().toString(36).slice(2, 5),
    archived: false,
    ...r,
  }));
}

export function seedData() {
  return {
    leads: mk([
      { name: 'Ahmed Raza', phone: '0300 1234567', city: 'Lahore', source: 'Facebook', status: 'New' },
      { name: 'Bilal Khan', phone: '0321 9876543', city: 'Rawalpindi', source: 'Website', status: 'Contacted' },
      { name: 'Sana Malik', phone: '0333 4567890', city: 'Faisalabad', source: 'Referral', status: 'Quoted' },
      { name: 'Usman Tariq', phone: '0312 2223344', city: 'Multan', source: 'Walk-in', status: 'Completed' },
      { name: 'Ayesha Noor', phone: '0345 1119988', city: 'Lahore', source: 'Website', status: 'New' },
    ]),
    customers: mk([
      { name: 'Bilal Ahmed', city: 'Lahore', phone: '0300 5551212', email: 'bilal@example.com' },
      { name: 'Rizwan Textiles', city: 'Lahore', phone: '0321 4448899', email: 'info@rizwantextiles.com' },
      { name: 'Ayesha Noor', city: 'Karachi', phone: '0333 7776655', email: 'ayesha.noor@example.com' },
      { name: 'Hamid Traders', city: 'Faisalabad', phone: '0301 2223311', email: 'hamid@traders.pk' },
    ]),
    services: mk([
      { name: 'Solar systems', desc: 'On-grid, off-grid and hybrid installs.', price: 'From PKR 350,000' },
      { name: 'Backup / UPS', desc: 'Battery backup solutions for homes and offices.', price: 'From PKR 45,000' },
      { name: 'Wiring & rewiring', desc: 'Full-house wiring, safety audits.', price: 'From PKR 60,000' },
      { name: 'CCTV & security', desc: 'Camera install and monitoring setup.', price: 'From PKR 25,000' },
    ]),
    projects: mk([
      { name: 'DHA Phase 6', city: 'Lahore', status: 'Completed' },
      { name: 'Saddar Rewiring', city: 'Rawalpindi', status: 'In progress' },
      { name: 'Gulberg Solar 8kW', city: 'Lahore', status: 'Pending' },
      { name: 'Model Town CCTV', city: 'Lahore', status: 'Completed' },
    ]),
    orders: mk([
      { id: 'ORD-2291', customer: 'Bilal Ahmed', amount: 'PKR 42,500', status: 'Paid' },
      { id: 'ORD-2292', customer: 'Ayesha Noor', amount: 'PKR 18,000', status: 'Pending' },
      { id: 'ORD-2293', customer: 'Hamid Traders', amount: 'PKR 96,300', status: 'Refunded' },
    ]),
    appointments: mk([
      { name: 'Ahmed Raza', service: 'Solar survey', date: '2026-08-06', status: 'Scheduled' },
      { name: 'Sana Malik', service: 'Wiring quote', date: '2026-08-08', status: 'Scheduled' },
      { name: 'Usman Tariq', service: 'CCTV install', date: '2026-08-03', status: 'Completed' },
      { name: 'Bilal Khan', service: 'UPS consult', date: '2026-08-12', status: 'Cancelled' },
    ]),
    messages: mk([
      { name: 'Ahmed Raza', preview: 'Interested in a 5kW hybrid system.', date: '2026-08-02', status: 'Unread' },
      { name: 'Sana Malik', preview: 'Wiring quote please.', date: '2026-08-01', status: 'Unread' },
      { name: 'Usman Tariq', preview: 'Thanks for the quick install!', date: '2026-07-29', status: 'Read' },
    ]),
    blog: mk([
      {
        title: 'Net metering guide', category: 'Solar', tags: 'net-metering, solar', status: 'Published', date: '2026-07-20',
        seoTitle: 'Net metering in Pakistan', seoDesc: 'How net metering works and how to apply.',
        body: 'Net metering lets you sell surplus solar power back to the grid.',
      },
      {
        title: 'CCTV placement tips', category: 'Security', tags: 'cctv, security', status: 'Draft', date: '2026-07-30',
        seoTitle: '', seoDesc: '', body: 'Placing cameras at entry points and blind corners is key.',
      },
    ]),
    testimonials: mk([
      { name: 'Bilal Ahmed', quote: 'June bill was PKR 84,000. Now 6,200.', rating: '5' },
      { name: 'Rizwan Textiles', quote: 'Zero stoppages in two years.', rating: '5' },
      { name: 'Ayesha Noor', quote: 'Professional install, clean wiring.', rating: '4' },
    ]),
    team: mk([
      { name: 'Sana Chaudhary', role: 'Managing Director', phone: '0300 1112233' },
      { name: 'Ali Rehman', role: 'Head Engineer', phone: '0321 4445566' },
      { name: 'Fatima Yousaf', role: 'Client Relations', phone: '0333 7778899' },
    ]),
    cities: mk([
      { name: 'Lahore', region: 'Punjab', count: 62 },
      { name: 'Rawalpindi', region: 'Punjab', count: 24 },
      { name: 'Faisalabad', region: 'Punjab', count: 15 },
    ]),
    faqs: mk([
      { q: 'How long does install take?', category: 'Solar', a: '3-5 days typically.' },
      { q: 'Do you help with net metering?', category: 'Solar', a: 'Yes, we file on your behalf.' },
      { q: 'Do you offer warranty?', category: 'General', a: '2 years on installation, per manufacturer on equipment.' },
    ]),
    users: mk([
      { name: 'Sana Chaudhary', role: 'Admin', email: 'sana@chaudharyelectronics.pk', status: 'Active' },
      { name: 'Ali Rehman', role: 'Editor', email: 'ali@chaudharyelectronics.pk', status: 'Active' },
      { name: 'Fatima Yousaf', role: 'Viewer', email: 'fatima@chaudharyelectronics.pk', status: 'Suspended' },
    ]),
    activity: mk([
      { who: 'Sana Chaudhary', what: 'marked project "DHA Phase 6" complete', when: '2 hours ago' },
      { who: 'System', what: 'received a new lead from Facebook', when: '3 hours ago' },
      { who: 'Ali Rehman', what: 'published blog post "Net metering guide"', when: 'yesterday' },
      { who: 'System', what: 'order ORD-2293 refunded', when: '2 days ago' },
    ]),
    // NOTE: products are intentionally NOT seeded here. There is exactly one
    // product store in this app — src/context/ProductsContext.jsx (seeded
    // from src/data/catalogue.js) — shared by the Admin Panel's Products
    // page, the Dashboard's product counts, and the public Marketplace.
    // A second products array here would recreate the "two separate product
    // lists" bug (admin edits invisible to the storefront) this file was
    // fixed to remove.
    gallery: [
      'photo-1509391366360-2e959784a276',
      'photo-1621905251189-08b45249b6c2',
      'photo-1497440001374-f26997328c1b',
      'photo-1466692476868-aef1dfb1e735',
    ].map((im, i) => ({ id: 'G' + i, url: `https://images.unsplash.com/${im}?auto=format&fit=crop&w=300&q=70` })),
  };
}
