// Transcribed exactly from source `schemas` object in Admin Panel.dc.html.
// Drives CollectionTable (columns) and RecordModal (fields) for all 15
// generic schema-driven collections.

import { CATEGORIES } from '../catalogue';

export const schemas = {
  leads: {
    label: 'Leads',
    singular: 'Lead',
    hideDuplicateArchive: true,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'city', label: 'City' },
      { key: 'source', label: 'Source' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'tel' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'source', label: 'Source', type: 'select', options: ['Website', 'WhatsApp', 'Call', 'Planner', 'Referral'] },
      { key: 'status', label: 'Status', type: 'select', options: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'] },
    ],
  },
  customers: {
    label: 'Customers',
    singular: 'Customer',
    // Real customers are self-registered accounts (see server's Auth module) — admin views
    // and can't fabricate one from here, matching the backend's actual capability.
    readonly: true,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'city', label: 'City' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
    ],
  },
  services: {
    label: 'Services',
    singular: 'Service',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'desc', label: 'Description' },
      { key: 'price', label: 'Price' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'desc', label: 'Description', type: 'textarea' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'image', label: 'Image', type: 'file' },
    ],
  },
  projects: {
    label: 'Projects',
    singular: 'Project',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'city', label: 'City' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Residential', 'Commercial', 'Security'] },
      { key: 'city', label: 'Location', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Completed', 'In progress', 'Pending'] },
      { key: 'image', label: 'Image', type: 'file', required: true },
    ],
  },
  orders: {
    label: 'Orders',
    singular: 'Order',
    // Orders are placed by customers at checkout, not fabricated by admins — this page is
    // for reviewing and updating status, so the create form only exposes what's real.
    hideAdd: true,
    hideDuplicateArchive: true,
    columns: [
      { key: 'orderNumber', label: 'Order ID' },
      { key: 'customer', label: 'Customer' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [{ key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] }],
    idPrefix: 'ORD-',
  },
  appointments: {
    label: 'Appointments',
    singular: 'Appointment',
    hideDuplicateArchive: true,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'service', label: 'Service' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'tel', required: true },
      { key: 'service', label: 'Service', type: 'text' },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Confirmed', 'Completed', 'Cancelled'] },
    ],
    hasCalendar: true,
  },
  messages: {
    label: 'Messages',
    singular: 'Message',
    hideDuplicateArchive: true,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'preview', label: 'Message' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'preview', label: 'Message', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['Unread', 'Read', 'Replied'] },
    ],
  },
  blog: {
    label: 'Blog',
    singular: 'Post',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'date', label: 'Date' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'tags', label: 'Tags', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Published'] },
      { key: 'seoTitle', label: 'SEO title', type: 'text' },
      { key: 'seoDesc', label: 'SEO description', type: 'textarea' },
      { key: 'image', label: 'Cover image', type: 'file', required: true },
      { key: 'body', label: 'Body', type: 'richtext', required: true },
    ],
  },
  testimonials: {
    label: 'Testimonials',
    singular: 'Testimonial',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'quote', label: 'Quote' },
      { key: 'rating', label: 'Rating' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'quote', label: 'Quote', type: 'textarea', required: true },
      { key: 'rating', label: 'Rating', type: 'text' },
      { key: 'image', label: 'Portrait', type: 'file' },
    ],
  },
  team: {
    label: 'Team Members',
    singular: 'Member',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'phone', label: 'Phone' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'tel' },
      { key: 'image', label: 'Photo', type: 'file' },
    ],
  },
  cities: {
    label: 'Cities',
    singular: 'City',
    columns: [
      { key: 'name', label: 'City' },
      { key: 'region', label: 'Region' },
      { key: 'count', label: 'Projects' },
    ],
    fields: [
      { key: 'name', label: 'City', type: 'text' },
      { key: 'region', label: 'Region', type: 'text' },
    ],
  },
  faqs: {
    label: 'FAQs',
    singular: 'FAQ',
    columns: [
      { key: 'q', label: 'Question' },
      { key: 'category', label: 'Category' },
      { key: 'a', label: 'Answer' },
    ],
    fields: [
      { key: 'q', label: 'Question', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'a', label: 'Answer', type: 'textarea' },
    ],
  },
  users: {
    label: 'Users & Roles',
    singular: 'User',
    // Accounts are created via registration (or by seeding), not fabricated here — this page
    // reviews and updates real accounts. Granting admin/superadmin is itself restricted to
    // superadmins by the backend (server/src/controllers/user.controller.js).
    hideAdd: true,
    hideDuplicateArchive: true,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role', type: 'status' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'role', label: 'Role', type: 'select', options: ['Customer', 'Seller', 'Admin', 'Superadmin'] },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Suspended'] },
    ],
  },
  activity: {
    label: 'Activity Logs',
    singular: 'Entry',
    columns: [
      { key: 'who', label: 'User' },
      { key: 'what', label: 'Action' },
      { key: 'when', label: 'When' },
    ],
    fields: [],
    readonly: true,
  },
  products: {
    label: 'Products',
    singular: 'Product',
    // NOTE: 'cat'/'gallery'/'note'/'seller' (not 'category'/'images'/'shortDesc'/'brand')
    // are used as the field keys here so this schema writes directly into the
    // same shared product shape the public Marketplace reads — see
    // src/context/ProductsContext.jsx. Labels are unchanged; only the
    // underlying storage keys are renamed, so the form looks identical.
    categoryFilterKey: 'cat',
    saveLabel: 'Save Product',
    hideDuplicateArchive: true,
    columns: [
      { key: 'img', label: 'Image', type: 'image' },
      { key: 'name', label: 'Product Name' },
      { key: 'cat', label: 'Category' },
      { key: 'price', label: 'Price' },
      { key: 'stock', label: 'Stock' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'createdDate', label: 'Date Added' },
    ],
    fields: [
      { key: 'name', label: 'Product Name', type: 'text', required: true },
      {
        key: 'cat',
        label: 'Category',
        type: 'select',
        options: CATEGORIES.filter((c) => c !== 'All'),
        required: true,
      },
      { key: 'seller', label: 'Brand', type: 'text' },
      { key: 'price', label: 'Price (PKR)', type: 'text', required: true },
      { key: 'stock', label: 'Stock Quantity', type: 'text', required: true },
      { key: 'gallery', label: 'Product Images', type: 'multifile', required: true },
      { key: 'note', label: 'Short Description', type: 'textarea', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Draft', 'Out of Stock'] },
    ],
  },
};

// Order matches source `genericPages` array — pages rendered via the generic
// CollectionTable (products/appointments/users get their own page wrapper
// composed around the same table logic).
export const genericPages = [
  'leads', 'customers', 'services', 'products', 'projects', 'orders', 'appointments',
  'messages', 'blog', 'testimonials', 'team', 'cities', 'faqs', 'users', 'activity',
];
