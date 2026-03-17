# Care Connect Pro

Full‑stack appointment and care coordination platform. The repo now contains a single React (Vite) frontend in `client/` and an Express/MongoDB backend in `server/`. The previous root-level "MediCare Pro" Vite app has been removed.

## Project Structure
```
care-connect-pro-main/
├── client/   # Vite React app (Care Connect UI)
├── server/   # Express API (shared by local dev + Vercel serverless)
└── api/      # Vercel serverless entry that wraps the Express app
```

## Prerequisites
- Node.js >= 18
- npm
- MongoDB Atlas connection string

## Environment Variables

### Backend (`server/.env`)
```
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5174
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/care-connect?retryWrites=true&w=majority
JWT_SECRET=replace_with_secure_secret_key
```

### Frontend (`client/.env`)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Development

Backend (Express + MongoDB)
```bash
cd server
npm install
cp .env.example .env   # fill values
npm run dev            # watches with nodemon at http://localhost:5000
```

Frontend (Care Connect UI)
```bash
cd client
npm install
cp .env.example .env   # set VITE_API_BASE_URL
npm run dev            # Vite dev server on http://localhost:5174
npm run build          # production build → client/dist
```

> Note: There is no root-level `npm run dev` anymore; run commands inside `client/` or `server/`.

## Vercel Deployment
This repo includes `vercel.json` to deploy both the client (static Vite build) and the API (serverless function) on Vercel.

1) Set environment variables in Vercel (Project Settings → Environment Variables): `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN=https://<your-vercel-domain>`, `NODE_ENV=production`, and `VITE_API_BASE_URL=https://<your-vercel-domain>/api`.
2) Vercel install/build steps are defined in `vercel.json` (`installCommand` installs `client/`, `server/`, and `api`; build runs the `client` build). The `api` package depends on the `server` package (`file:../server`) so the Express app and its dependencies are bundled into the serverless function.
3) Connect the repo to Vercel or run `vercel --prod` from the repo root. API routes are served from `/api/*` (see `api/index.mjs`).

> File uploads stored under `/server/uploads` are not persistent on Vercel’s serverless runtime. Use an external bucket (S3, Cloud Storage) in production.

## Deployment Notes
- Backend: set `NODE_ENV=production`, align `CLIENT_ORIGIN` with your deployed frontend domain, and host `server/uploads` if using local file storage.
- Frontend: set `VITE_API_BASE_URL` to the deployed API (include `/api`) and deploy the `client/dist` output to your static host or CDN.

## API Overview (selected)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Appointments: `POST /api/appointments`, `GET /api/appointments/me`, doctor/admin updates with `PATCH /api/appointments/:id/status|notes`, cancel with `PATCH /api/appointments/:id/cancel`
- Departments: admin CRUD at `/api/departments`
- Users: `POST /api/users/profile-image` (multipart `image`)
- Stats: admin `GET /api/stats/overview`
- Prescriptions: `POST /api/prescriptions/pdf` returns a PDF stream

Security highlights: Helmet, rate limiting, CORS whitelist, input validation (express-validator), sanitization (mongo-sanitize, xss-clean), centralized error handling.

## Defaults
- Frontend: http://localhost:5174
- Backend: http://localhost:5000
