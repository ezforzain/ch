# Chaudhary Electronics

Monorepo containing the public website + admin panel (`chaudhary-electronics-app/`) and its REST API backend (`server/`).

- **Frontend**: React 18 + Vite + Tailwind CSS v4 + React Router. Deployed to **Vercel**.
- **Backend**: Node.js + Express + Mongoose (MongoDB). Deployed to **Render**.
- **Database**: MongoDB Atlas.
- **Image uploads**: Cloudinary in production (local disk in development — see `server/README.md`).

## Local development

```bash
# Backend
cd server
npm install
cp .env.example .env   # fill in values
npm run seed
npm run dev             # http://localhost:5000

# Frontend (separate terminal)
cd chaudhary-electronics-app
npm install
npm run dev              # http://localhost:5173
```

Full backend setup, folder structure and API reference: [`server/README.md`](server/README.md).

## Deployment

- Backend → Render, root directory `server/`, see `server/render.yaml`.
- Frontend → Vercel, root directory `chaudhary-electronics-app/`.
- Environment variables for both are documented in `server/.env.example` and `chaudhary-electronics-app/.env.example`.
