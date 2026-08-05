# Chaudhary Electronics — Backend API

Production REST API for the Chaudhary Electronics website: Node.js + Express + MongoDB (Mongoose), JWT auth with role-based access control, bcrypt password hashing, image uploads (Cloudinary or local disk), input validation, centralized error handling, pagination/search/filter/sort on every list endpoint, and dashboard/report analytics.

This is a **separate service** from the React frontend (`chaudhary-electronics-app/`) — it does not touch or modify any frontend UI code. It's meant to run alongside the frontend as `http://localhost:5000` while the frontend runs at `http://localhost:5173`.

## 1. Requirements

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a connection string to Atlas/any MongoDB instance
- (Optional) A Cloudinary account, if you want uploaded images stored in the cloud instead of on local disk
- (Optional) SMTP credentials, if you want real password-reset emails instead of them being printed to the console

## 2. Setup

```bash
cd server
npm install
cp .env.example .env      # then fill in values — see "Environment variables" below
npm run seed               # creates a super admin + one admin/seller/customer + starter content
npm run dev                 # starts the API on http://localhost:5000 with auto-reload
```

Health check: `GET http://localhost:5000/health`

### Seeded accounts (from `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@chaudharyelectronics.pk` | `SuperAdmin@123` |
| Admin | `admin@chaudharyelectronics.pk` | `Admin@1234` |
| Seller | `seller@chaudharyelectronics.pk` | `Seller@1234` |
| Customer | `customer@chaudharyelectronics.pk` | `Customer@1234` |

**Change these passwords (or delete/recreate the users) before deploying anywhere real.** `npm run seed:destroy` wipes the seeded collections if you want to start over.

### Environment variables

All of these live in `.env` (copy from `.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no (default 5000) | API port |
| `CLIENT_URL` | no (default `http://localhost:5173`) | Allowed CORS origin + link base for password-reset emails |
| `MONGO_URI` | no (default local) | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | **yes** | Long random strings signing the two JWTs. Generate with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | no | Token lifetimes (defaults: 15m / 30d) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | no | If **all three** are set, uploads go to Cloudinary. If any are blank, uploads are written to `server/uploads/` and served from `/uploads/...`. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | no | If set, password-reset emails are actually sent. If blank, the email is printed to the server console instead — the reset flow is still fully testable without a mail provider. |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | no | General API rate limit (auth endpoints have their own tighter limit, hardcoded to 20 requests / 15 min) |
| `SEED_SUPERADMIN_*` | no | Used only by `npm run seed` |

## 3. Folder structure

```
server/
├── src/
│   ├── config/           env loading, MongoDB connection, Cloudinary config
│   ├── models/            22 Mongoose schemas (see "Modules" below)
│   ├── controllers/       one per module + handlerFactory.js (shared CRUD logic)
│   ├── routes/             one per module + index.js (mounts everything under /api/v1)
│   ├── middleware/        auth (JWT + RBAC), upload (multer), validate, error, rate-limit
│   ├── validators/        express-validator chains, one per module
│   ├── utils/              ApiError, sendResponse, APIFeatures (pagination/filter/search/sort),
│   │                        JWT signing, image storage (Cloudinary/local), email
│   ├── seed/               npm run seed / seed:destroy
│   ├── app.js              Express app: security middleware, routes, error handling
│   └── server.js           DB connect + listen + graceful shutdown
├── uploads/                 local image storage (used when Cloudinary isn't configured)
├── .env / .env.example
└── package.json
```

### Why a `handlerFactory.js`?

22 modules with hand-written list/get/create/update/delete controllers would mean the same ~40 lines of pagination/filtering/error-handling logic copy-pasted 22 times. Instead, most modules (Category, Lead, Project, Service, Appointment, BlogPost, GalleryItem, Testimonial, TeamMember, City, FAQ...) compose their controller from `handlerFactory.js`'s `getAll/getOne/createOne/updateOne/deleteOne` (and the image-aware variants `createOneWithImages`/`updateOneWithImages`), passing just their Mongoose model and a couple of options. Modules with real custom logic — Auth, Product (ownership rules), Order (stock/checkout), Dashboard (aggregations), Users/Sellers/Customers (role-scoped views) — have their own hand-written controllers.

## 4. Architecture notes

- **Auth**: access token (short-lived, 15 min) returned in the JSON body — the frontend attaches it as `Authorization: Bearer <token>`. Refresh token (long-lived, 30 days) is set as an **httpOnly cookie**, scoped to `/api/v1/auth`, so it's never readable from JS (XSS-resistant). `POST /api/v1/auth/refresh` reads that cookie and issues a new access token.
- **RBAC**: four roles — `superadmin`, `admin`, `seller`, `customer` — stored on `User.role`. Routes are protected with `protect` (must be logged in) and `authorize('admin', 'superadmin')` (must have one of these roles). Only a **superadmin** can grant admin/superadmin roles to another user. Sellers can only create/edit/delete their **own** products and only see orders/dashboard figures scoped to their own listings.
- **Passwords**: hashed with bcrypt (cost factor 12) in a Mongoose `pre('save')` hook — plaintext passwords never touch the database. Password-reset tokens are random 32-byte values; only their SHA-256 hash is stored, so a database leak alone can't be used to reset accounts.
- **Validation**: every mutating endpoint runs an `express-validator` chain before touching the database; failures return `400` with a structured `errors: [{ field, message }]` array. Mongoose schema validation is a second layer of defense (enforced even if a request bypasses the HTTP layer, e.g. from another internal script).
- **Errors**: everything funnels through one `errorHandler` — Mongoose `ValidationError`/`CastError`/duplicate-key, JWT errors, and Multer errors are all normalized into the same `{ success: false, message, errors? }` shape.
- **Pagination/filter/search/sort**: every list endpoint accepts `?page=&limit=&sort=&fields=&search=&<field>=<value>&<field>[gte]=...` — see `utils/APIFeatures.js`.
- **File uploads**: `multer` buffers files in memory, then `utils/storeImage.js` sends them to Cloudinary (if configured) or writes them to `server/uploads/<folder>/`, returning a uniform `{ url, publicId, provider }` regardless of which backend is active — controllers never need to know which one is in use.

## 5. API reference

Base URL: `http://localhost:5000/api/v1`

Auth column: 🌐 = public, 🔒 = any logged-in user, 🔒admin = admin/superadmin, 🔒seller = seller only, 🔒super = superadmin only.

### Auth (`/auth`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | 🌐 | `{ name, email, phone?, password, role?: 'customer'\|'seller', businessName? }` |
| POST | `/auth/login` | 🌐 | `{ identifier: email\|phone, password }` |
| POST | `/auth/logout` | 🌐 | Clears the refresh cookie |
| POST | `/auth/refresh` | 🌐 (cookie) | Issues a new access token |
| GET | `/auth/me` | 🔒 | Current user |
| PATCH | `/auth/update-password` | 🔒 | `{ currentPassword, newPassword }` |
| POST | `/auth/forgot-password` | 🌐 | `{ email }` — always returns a generic success message |
| POST | `/auth/reset-password` | 🌐 | `{ token, password }` |

### Users / Sellers / Customers
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/users?role=` | 🔒admin | All users, filterable by role |
| GET/PATCH/DELETE | `/users/:id` | 🔒admin (DELETE 🔒super) | |
| PATCH | `/users/me` | 🔒 | Self profile update (+ optional `avatar` file) |
| POST/DELETE | `/users/me/addresses[/:addressId]` | 🔒 | Customer address book |
| GET | `/sellers`, `/sellers/:id` | 🔒admin | |
| GET | `/sellers/me/stats` | 🔒seller | Own product/order/revenue stats |
| PATCH | `/sellers/:id/status` | 🔒admin | Approve/reject/suspend a seller |
| GET | `/customers`, `/customers/:id` | 🔒admin | `:id` includes order history + spend |

### Catalog & Marketplace
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/categories`, `/categories/:id` | 🌐 | |
| POST/PATCH/DELETE | `/categories[/:id]` | 🔒admin | |
| GET | `/products`, `/products/:id` | 🌐 | Search/filter/sort/paginate |
| POST | `/products` | 🔒admin/🔒seller | multipart: `image` (1), `gallery` (up to 8) + fields |
| PATCH/DELETE | `/products/:id` | 🔒admin/owner-seller | |
| POST | `/orders` | 🔒 (customer) | `{ items:[{productId,qty}], contactName, contactPhone, shippingAddress, city?, paymentMethod? }` — validates stock, decrements it |
| GET | `/orders/me` | 🔒 (customer) | |
| GET | `/orders/seller` | 🔒seller | Orders containing this seller's items |
| GET | `/orders`, `/orders/:id` | 🔒admin (or owner/involved seller for `:id`) | |
| PATCH | `/orders/:id/status` | 🔒admin | `{ status?, paymentStatus? }` |

### Leads, Projects, Services, Appointments, Messages
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/leads` | 🌐 | QuoteForm / Solar Planner submissions |
| GET/PATCH/DELETE | `/leads[/:id]` | 🔒admin | |
| GET | `/projects`, `/projects/:id` | 🌐 | Portfolio/"recent installations" |
| POST/PATCH/DELETE | `/projects[/:id]` | 🔒admin | multipart: `image`, `beforeImage` |
| GET | `/services`, `/services/:id` | 🌐 | |
| POST/PATCH/DELETE | `/services[/:id]` | 🔒admin | multipart: `image` |
| POST | `/appointments` | 🌐 | Site-survey / consultation booking |
| GET/PATCH/DELETE | `/appointments[/:id]` | 🔒admin | |
| POST | `/messages` | 🌐 (optional auth) | Contact-us / product inquiry |
| GET/DELETE | `/messages[/:id]` | 🔒admin | |
| PATCH | `/messages/:id/read`, `/messages/:id/reply` | 🔒admin | |

### Content
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/blog`, `/blog/:id`, `/blog/slug/:slug` | 🌐 | `/slug/:slug` also increments view count |
| POST/PATCH/DELETE | `/blog[/:id]` | 🔒admin | multipart: `coverImage` |
| GET | `/gallery[/:id]` | 🌐 | POST/PATCH 🔒admin, multipart: `image` |
| GET | `/testimonials[/:id]` | 🌐 | POST/PATCH 🔒admin, multipart: `portrait` |
| GET | `/team[/:id]` | 🌐 | POST/PATCH 🔒admin, multipart: `photo` |
| GET | `/cities[/:id]` | 🌐 | POST/PATCH/DELETE 🔒admin |
| GET | `/faqs[/:id]` | 🌐 | POST/PATCH/DELETE 🔒admin |

### Notifications, Settings, Dashboard, Reports, Uploads
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/notifications` | 🔒 | Own + role-broadcast notifications, includes `meta.unreadCount` |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | 🔒 | |
| DELETE | `/notifications/:id` | 🔒 | |
| GET | `/settings` | 🌐 | Site-wide contact info, WhatsApp number, socials, etc. |
| PATCH | `/settings` | 🔒admin | |
| GET | `/dashboard/summary` | 🔒admin/🔒seller | Seller sees only their own figures |
| GET | `/dashboard/sales-trend?days=30` | 🔒admin/🔒seller | Daily revenue/order series for charting |
| GET | `/dashboard/top-products?limit=5` | 🔒admin/🔒seller | |
| GET | `/dashboard/order-status-breakdown` | 🔒admin/🔒seller | |
| GET | `/reports/sales?from=&to=` | 🔒admin | Totals + breakdown by status |
| GET | `/reports/leads`, `/reports/appointments`, `/reports/users-growth` | 🔒admin | |
| POST | `/uploads/image`, `/uploads/images` | 🔒 | Standalone upload, independent of any module |

Every response follows `{ success, message, data?, meta?, errors? }`. List endpoints return `meta: { page, limit, total, pages }`.

## 6. Testing

There's no formal test suite committed (Jest/Supertest wiring is a natural next step) — this was instead verified end-to-end with a 61-assertion smoke-test script exercising every module: registration/login for all four roles, RBAC rejections (customer blocked from admin routes, admin blocked from granting admin), product creation with real multipart image uploads, a full order placing → stock-decrement → multi-role-visibility → status-update flow, public lead/appointment/message capture with resulting admin notifications, every content module's image-bearing create endpoint, dashboard/report aggregations (both admin-wide and seller-scoped), and validation/404 edge cases. All 61 passed against a live local MongoDB instance.

## 7. Known simplifications (by design, given scope)

- **Multi-seller orders**: if a customer's cart contains products from two different sellers, both sellers currently see the *entire* order (not just their own line items) via `GET /orders/seller`. Splitting orders per seller is a reasonable follow-up if that becomes a real requirement.
- **Reports are JSON, not files**: `/reports/*` return aggregated JSON for the frontend to render/export client-side, not server-generated PDF/CSV. Straightforward to add if needed.
- **API docs are this README**, not an interactive Swagger/OpenAPI UI — kept the dependency surface smaller; can be added later without touching any route logic.
