// Transcribed exactly from source `navDefs` (sidebar, 18 items — dashboard is
// the index route so it isn't in the array below the same way the others
// are routed, but is kept first for identical ordering/labels/icons) plus
// `settingsTabDefs` / `settingsFieldDefs` / default `permissions` state.

export const navDefs = [
  ['dashboard', 'Dashboard', '◆'],
  ['leads', 'Leads', '◈'],
  ['customers', 'Customers', '◎'],
  ['services', 'Services', '⚙'],
  ['products', 'Products', '▥'],
  ['sellers', 'Sellers', '⛁'],
  ['projects', 'Projects', '▣'],
  ['orders', 'Orders', '▤'],
  ['appointments', 'Appointments', '◷'],
  ['messages', 'Messages', '✉'],
  ['blog', 'Blog', '✎'],
  ['gallery', 'Gallery', '▦'],
  ['testimonials', 'Testimonials', '❝'],
  ['team', 'Team Members', '☺'],
  ['cities', 'Cities', '⌖'],
  ['faqs', 'FAQs', '?'],
  ['settings', 'Settings', '⚒'],
  ['users', 'Users & Roles', '⚿'],
  ['activity', 'Activity Logs', '≡'],
  ['reports', 'Reports', '▲'],
];

export const settingsTabs = [
  ['company', 'Company info'],
  ['branding', 'Branding'],
  ['smtp', 'SMTP'],
  ['social', 'Social links'],
  ['seo', 'SEO'],
  ['analytics', 'Analytics'],
  ['backup', 'Backup'],
];

export const settingsFieldDefs = {
  company: [
    ['companyName', 'Company name', 'Chaudhary Electronics'],
    ['companyPhone', 'Phone', '0300 1234567'],
    ['companyAddress', 'Address', 'Main Boulevard, Lahore'],
  ],
  branding: [
    ['brandColor', 'Accent color (hex)', '#E2A347'],
    ['logoUrl', 'Logo URL', ''],
  ],
  smtp: [
    ['smtpHost', 'SMTP host', 'smtp.mailserver.com'],
    ['smtpUser', 'SMTP username', ''],
    ['smtpPass', 'SMTP password', ''],
  ],
  social: [
    ['fb', 'Facebook URL', ''],
    ['ig', 'Instagram URL', ''],
    ['wa', 'WhatsApp number', ''],
  ],
  seo: [
    ['metaTitle', 'Meta title', 'Chaudhary Electronics'],
    ['metaDesc', 'Meta description', 'Solar, wiring and security experts in Lahore.'],
  ],
  analytics: [
    ['gaId', 'Google Analytics ID', ''],
    ['pixelId', 'Facebook Pixel ID', ''],
  ],
  backup: [],
};

export const permModules = ['Dashboard', 'Leads', 'Orders', 'Settings', 'Users'];

export const defaultPermissions = {
  Admin: ['Dashboard', 'Leads', 'Orders', 'Settings', 'Users'],
  Editor: ['Dashboard', 'Leads', 'Orders'],
  Viewer: ['Dashboard'],
};
