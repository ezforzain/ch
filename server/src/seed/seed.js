/* eslint-disable no-console */
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { City } from '../models/City.js';
import { FAQ } from '../models/FAQ.js';
import { Service } from '../models/Service.js';
import { Setting } from '../models/Setting.js';
import mongoose from 'mongoose';
import slugify from 'slugify';

const DESTROY = process.argv.includes('--destroy');

async function run() {
  await connectDB();

  if (DESTROY) {
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      City.deleteMany(),
      FAQ.deleteMany(),
      Service.deleteMany(),
      Setting.deleteMany(),
    ]);
    console.log('[seed] All seeded collections cleared.');
    await mongoose.disconnect();
    return;
  }

  // --- Super admin (idempotent — safe to run repeatedly) ---
  const superAdminEmail = process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@chaudharyelectronics.pk';
  const existing = await User.findOne({ email: superAdminEmail });
  if (!existing) {
    await User.create({
      name: process.env.SEED_SUPERADMIN_NAME || 'Super Admin',
      email: superAdminEmail,
      password: process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'superadmin',
      isActive: true,
      isEmailVerified: true,
    });
    console.log(`[seed] Super admin created: ${process.env.SEED_SUPERADMIN_EMAIL}`);
  } else {
    console.log('[seed] Super admin already exists — skipped.');
  }

  // --- One of each role, for quickly testing RBAC without registering by hand ---
  const demoUsers = [
    { name: 'Site Admin', email: 'admin@chaudharyelectronics.pk', password: 'Admin@1234', role: 'admin' },
    {
      name: 'Ahmed Traders',
      email: 'seller@chaudharyelectronics.pk',
      password: 'Seller@1234',
      role: 'seller',
      sellerProfile: { businessName: 'Ahmed Traders', status: 'approved' },
    },
    { name: 'Bilal Ahmed', email: 'customer@chaudharyelectronics.pk', password: 'Customer@1234', role: 'customer' },
  ];
  for (const u of demoUsers) {
    const found = await User.findOne({ email: u.email });
    if (!found) {
      await User.create({ ...u, isActive: true, isEmailVerified: true });
      console.log(`[seed] Demo ${u.role} created: ${u.email}`);
    }
  }

  // --- Categories — MUST match src/data/catalogue.js's CATEGORIES list on the frontend
  // exactly (minus "All"), since the admin Products form's category dropdown is that fixed
  // list and ProductsContext looks up each category's id by this exact name. ---
  const categoryNames = [
    'Solar Panels',
    'Inverters',
    'Batteries',
    'Air Conditioners',
    'Fans & Lighting',
    'Wires & Cables',
    'Switchgear',
    'Tools & Accessories',
  ];
  for (const name of categoryNames) {
    const slug = slugify(name, { lower: true, strict: true });
    await Category.updateOne({ name }, { $setOnInsert: { name, slug } }, { upsert: true });
  }
  console.log(`[seed] ${categoryNames.length} categories ensured.`);

  // --- Cities served ---
  const cityNames = ['Lahore', 'Rawalpindi', 'Islamabad', 'Faisalabad', 'Multan', 'Karachi', 'Peshawar', 'Gujranwala'];
  for (const name of cityNames) {
    await City.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }
  console.log(`[seed] ${cityNames.length} cities ensured.`);

  // --- Settings singleton ---
  const settingsExists = await Setting.findOne();
  if (!settingsExists) {
    await Setting.create({});
    console.log('[seed] Default settings document created.');
  }

  // --- Services offered ---
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany([
      {
        name: 'Solar Installation',
        description: 'Grid-tied and hybrid solar systems, sized and installed by our own engineers.',
        costEstimate: 'PKR 250,000 - 1,200,000',
        installTime: '3-5 days',
        bestFor: 'Homes and small businesses looking to cut their electricity bill.',
        sortOrder: 1,
      },
      {
        name: 'Backup / UPS',
        description: 'Battery backup and UPS systems for seamless power during outages.',
        costEstimate: 'PKR 80,000 - 400,000',
        installTime: '1-2 days',
        bestFor: 'Areas with frequent load-shedding.',
        sortOrder: 2,
      },
      {
        name: 'Wiring & Rewiring',
        description: 'Full electrical wiring, rewiring and panel upgrades to modern safety standards.',
        costEstimate: 'Quoted after site survey',
        installTime: '2-7 days',
        bestFor: 'New construction or older properties with outdated wiring.',
        sortOrder: 3,
      },
      {
        name: 'CCTV & Security',
        description: 'HD camera installation with remote viewing from anywhere.',
        costEstimate: 'PKR 45,000 - 300,000',
        installTime: '1 day',
        bestFor: 'Homes, shops and warehouses.',
        sortOrder: 4,
      },
    ]);
    console.log('[seed] Sample services created.');
  }

  // --- A couple of FAQs so the public FAQ section has real data immediately ---
  const faqCount = await FAQ.countDocuments();
  if (faqCount === 0) {
    await FAQ.insertMany([
      {
        question: 'How long does a typical solar installation take?',
        answer: 'Most residential systems are installed within 3-5 working days once the site survey is complete.',
        sortOrder: 1,
      },
      {
        question: 'Do you offer financing?',
        answer: 'Yes — installment plans are available for qualifying systems. Ask your sales engineer for details.',
        sortOrder: 2,
      },
    ]);
    console.log('[seed] Sample FAQs created.');
  }

  console.log('\n[seed] Done. Log in with:');
  console.log(`  Super admin: ${process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@chaudharyelectronics.pk'} / ${process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123'}`);
  console.log('  Admin:       admin@chaudharyelectronics.pk / Admin@1234');
  console.log('  Seller:      seller@chaudharyelectronics.pk / Seller@1234');
  console.log('  Customer:    customer@chaudharyelectronics.pk / Customer@1234');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
