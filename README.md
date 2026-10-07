# Carebridge Health

A full-stack healthcare platform with two layers: a public marketing site (UCLA Health–style:
find a doctor, services, health library, pharmacy, virtual care, news) and seven role-based
intranet portals for patients, clinicians, nurses, pharmacists, lab techs, front-desk staff and
administrators. Everything shown in the portals is real data from a PostgreSQL-backed REST API —
authentication, admissions, appointments, clinical records, pharmacy stock, billing and
dashboards — not localStorage mock data.

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  Frontend (React 18 + Vite + Tailwind v4)                              │
│  · Public pages  → hydrate from /api/public/site|doctors|products      │
│  · Portals       → hydrate from /api/bootstrap  (JWT bearer token)     │
│  · Store (src/lib/db.js) mirrors API state; page actions call the API, │
│    then re-hydrate the store from the latest server payload.           │
│  · Only local-only UI state (shopping cart, consents, newsletter)      │
│    stays in browser memory/localStorage.                               │
└────────────────────────────────────────────────────────────────────────┘
                                   │  HTTP + JSON (Bearer JWT)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Backend (Express 4 + Sequelize 6 + PostgreSQL)                        │
│  · JWT auth, bcrypt, helmet, CORS, rate limiting, Zod validation       │
│  · Role guards + patient data scoping at the controller level          │
│  · Transactional admissions (admit/transfer/discharge/cancel), order   │
│    stock control with row locks, billing payments                      │
│  · Migrations + seeders; Jest + Supertest integration suite             │
└────────────────────────────────────────────────────────────────────────┘
```

Patient-side data is scoped server-side: a patient sees only their own records, staff see all
records in their domain. The `/api/bootstrap` endpoint assembles the whole workspace for the
logged-in user in one call.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6 (code-split lazy routes), Tailwind CSS v4, Vite 5 |
| Backend | Node.js (ESM), Express 4, Sequelize 6, PostgreSQL, JWT (`jsonwebtoken`) |
| Validation / errors | Zod schemas; normalized `{ success, message, errors }` responses |
| Quality | ESLint, Jest + Supertest (backend), `vite build` + node test (frontend) |

## Repo layout

```
package.json            root dev/build/test scripts (concurrently dev)
backend/
  migrations/           versioned Sequelize schema migrations (FK-ordered)
  seeders/              demo-data seeders (6 doctors, 6 patients, 7 wards,
                        42 beds, appointments, records, pharmacy, billing…)
  postman/              Postman collection + environment (token auto-store)
  scripts/build-postman.mjs
  src/
    app.js / server.js  Express bootstrap + route mounting
    config/             environment.js (CLI+runtime single source) + database.js
    middleware/         auth (JWT), role guard, Zod validation, error handling
    models/             models + centralised associations in models/index.js
    routes/             24 resource routers
    controllers/        handlers + patient-scope enforcement
    services/           admissions, orders, billing, patients
    validators/         Zod schemas (registration, users, assets, clinical…)
    utils/              ApiError, apiResponse, pagination, patient-number
    scripts/manageAdmin.js   admin CLI (create/list/promote, reset password)
  tests/                Jest + Supertest suite (owns hospital_db_test)
  README.md             full endpoint-by-endpoint API reference
frontend/
  src/
    App.jsx             router, lazy chunks, ErrorBoundary, portal layout
    lib/api.js          fetch wrapper + JWT token in localStorage
    lib/auth.jsx        AuthProvider, session idle-timeout, demo quick-login
    lib/db.js           server-backed cache store + actions (mutations → API)
    lib/rbac.js         role → portal nav + action permissions
    lib/format.js       NGN currency, Lagos time, dates, initials
    components/         ui/, layout/, shared/, portal/ (booking flow)
    pages/Public/       marketing pages
    pages/Auth/         login / signup / MFA / reset-password
    pages/Patient/ Provider/ Nurse/ Pharmacist/ Lab/ Admin/ FrontDesk/
  scripts/generate-theme.mjs   design tokens for Tailwind
```

## Getting started

Requirements: Node.js 18+ (developed on 24) and a running PostgreSQL instance.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # edit DB_USER/DB_PASSWORD (and JWT_SECRET)
npm run db:reset            # drop → create → migrate → seed (fresh dataset)
npm run dev                 # API on :5000  → health check GET /health

# 2. Frontend (separate terminal)
cd ../frontend
npm install
npm run dev                 # Vite on :5173

# 3. Or everything from the repo root
npm run dev                 # runs API + Vite concurrently
```

The API serves only JSON. In production, build the frontend with `npm run build` and serve it
behind any static host / CDN; run the API with `npm start`.

## Environment variables (backend `.env`)

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` / `test` / `production` |
| `PORT` | `5000` | HTTP port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `hospital_db` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | — | Database password |
| `DB_SSL` | off | Enable TLS for the connection (required in production) |
| `DB_LOGGING` | `false` | Enable SQL query logging |
| `JWT_SECRET` | — | Secret used to sign JWTs (long, random, server-only) |
| `JWT_EXPIRES_IN` | `7d` | Access-token lifetime |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated allowed browser origins |

All `DB_*` values are environment-only — never use a `VITE_` prefix. In production the API
refuses to start when TLS is disabled or `JWT_SECRET` is missing/short.

## Demo accounts

The login page offers one-click **demo sign-in per role** that calls `POST /api/auth/demo`
(development only — the endpoint returns `403` when `NODE_ENV=production`). The backend picks
the oldest seeded user for the requested role.

You can also log in directly with the seeded accounts (all passwords are `Password123!`):

**Staff**

| Role | Email |
|---|---|
| Administrator | `admin@hospital.com` |
| Doctor | `dr.amelia@hospital.com` · `dr.james@hospital.com` · `dr.sophia@hospital.com` · `dr.daniel@hospital.com` · `dr.priya@hospital.com` · `dr.lucas@hospital.com` |
| Nurse | `nurse.grace@hospital.com` |
| Pharmacist | `pharmacy@hospital.com` |
| Laboratory tech | `lab.tech@hospital.com` |
| Front desk | `frontdesk@hospital.com` |
| Accountant | `accounts@hospital.com` |

**Patients**

`patient.amy@hospital.com` · `patient.ben@hospital.com` · `patient.clara@hospital.com` ·
`patient.david@hospital.com` · `patient.eve@hospital.com` · `patient.fred@hospital.com`

Public signup (`/auth/signup`) always creates a **patient** account and auto-generates a patient
profile; split `firstName`/`lastName`/`dateOfBirth` are accepted and persisted. To provision
staff manually without the portal API, use the admin CLI:

```bash
cd backend
node src/scripts/manageAdmin.js create --name "System Admin" --email admin@hospital.com --password Secret123 --phone +233200000000
node src/scripts/manageAdmin.js promote --email user@hospital.com --role admin
node src/scripts/manageAdmin.js reset-password --email admin@hospital.com --password NewSecret123
node src/scripts/manageAdmin.js list
```

## Roles → portals

| Backend role | Frontend key | Portal base | Highlights |
|---|---|---|---|
| patient | `patient` | `/portal/patient` | Book appointments, messages, prescriptions, pharmacy, labs, billing, visits |
| doctor | `provider` | `/portal/provider` | Schedule, patient charts, orders, lab results review |
| nurse | `nurse` | `/portal/nurse` | Check-in queue, vitals, patient wards |
| pharmacist | `pharmacist` | `/portal/pharmacist` | Prescription queue, fulfillment, online orders, product catalog |
| laboratory_staff | `lab_tech` | `/portal/lab` | Lab order queue, results entry |
| admin, accountant | `admin` | `/portal/admin` | Master schedule, check-ins, admissions, wards & beds, departments, billing, staff, users, medical records, reports |
| receptionist | `front_desk` | `/portal/front-desk` | Check-ins, scheduling |

RBAC is enforced twice: the frontend gates UI (nav + permissions in `lib/rbac.js`) and the
backend guards every route (role middleware + Zod) so a forged client cannot escalate.

## How the portals stay in sync

1. On load, the frontend reads the JWT from localStorage (`carebridge_token`).
   - With a token → `GET /api/bootstrap` → store hydrated with the full role-scoped workspace.
   - Without a token → public pages hydrate from `/api/public/site`, `/doctors`, `/products`.
2. Every mutation (book appointment, admit patient, mark order, pay bill…) calls the REST API;
   the store then re-hydrates from the returned/latest payload.
3. Role-scoped bootstrap means a patient's store never contains other patients' data; patient
   IDs are matched via the `patientUserIdByPatientId` map so portals filter with the login
   user's id while the DB uses patient-record ids.
4. Idle sessions auto-logout (configurable timer in `lib/auth.jsx`); logout also wipes the
   local store and re-hydrates the public cache.

## Public site routes

`/` · `/about` · `/find-a-doctor` (?search=) · `/find-a-location` · `/services` (+ `/services/:id`) ·
`/health-library` · `/virtual-care` · `/clinical-trials` · `/news-and-insights` · `/patient-stories` ·
`/international` · `/departments` · `/community-equity` · `/contact` · `/donate` · `/search` ·
`/pharmacy` · `/auth/login` · `/auth/signup` · `/auth/mfa` · `/auth/reset-password`

## Backend API

Everything except `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/demo`,
`/api/public/*` and `/health` requires a `Bearer` token. Response shape:
`{ success, message, data }`; errors: `{ success: false, message, errors[] }`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/demo` · `GET /api/auth/me` · `PUT /api/auth/update-profile` · `PUT /api/auth/change-password` · `POST /api/auth/forgot-password` |
| Bootstrap | `GET /api/bootstrap` (full role-scoped workspace for the session) |
| Public | `GET /api/public/site` · `/doctors` · `/products` · `/wards` · `POST /api/public/newsletter` |
| Users (`admin`) | `GET/POST /api/users` · `GET/PUT/DELETE /api/users/:id` (cannot delete yourself) |
| Departments (`admin`) | `GET/POST` · `GET/PUT/DELETE /api/departments/:id` |
| Doctors (`admin`) | `GET/POST` · `GET/PUT/DELETE /api/doctors/:id` |
| Patients | `GET` (patients scoped to self) · `GET /me/profile` · `GET/PUT/DELETE /:id` · `POST` |
| Wards & beds (`admin`; bed status + nurse) | `GET /api/wards?withBeds=true` · `GET/POST` · `GET/PUT/DELETE /:id` · `/api/beds` same pattern |
| Admissions | `GET` · `POST` · `PUT /:id/transfer` · `PUT /:id/discharge` · `PUT /:id/cancel` · `PUT/DELETE /:id` (transactional, audit trail, 409 on duplicate active) |
| Appointments | `GET/POST` · `GET/PUT/DELETE /api/appointments/:id` (patients self-book) |
| Medical records | `GET/POST` · `GET/PUT/DELETE /api/medical-records/:id` (write: admin, doctor, nurse) |
| Prescriptions | `GET/POST` · `GET/PUT/DELETE /:id` (create: admin/doctor; update: +pharmacist/nurse) |
| Laboratory | `GET/POST` · `GET/PUT/DELETE /api/laboratory/:id` (complete stamps `completedAt`) |
| Pharmacy catalog | `/api/product-categories` + `/api/products` full CRUD (write: admin, pharmacist) |
| Orders | `GET`, `POST` (any user) · `PUT /:id/verify-prescription` · `PUT /:id/status` · `PUT/DELETE /:id` — server-side pricing, transactional stock decrement, prescription-gated flow |
| Billing | `GET/POST` · `GET/PUT/DELETE /api/billing/:id` · `POST /api/billing/:id/payments` (transactional, updates paid/balance/status) |
| Messages / Notifications | `GET/POST` · thread / message endpoints; unread counts precomputed |
| Check-ins | `GET/POST` · `PUT /api/checkins/:id` |
| Reports / Audit logs (`admin`) | `GET /api/reports/*` · `GET /api/audit-logs` |
| Dashboards | `GET /api/dashboard/admin|doctor|nurse|pharmacy|patient` |
| Images | `GET /api/images/*` (doctor/patient photos) |

See [`backend/README.md`](backend/README.md) for the full endpoint map, error statuses, Postman
collection, and the admin CLI reference.

## Testing & linting

```bash
npm test                 # backend: Jest + Supertest against a dedicated hospital_db_test DB
npm --prefix backend run lint
npm --prefix frontend run build    # generates design tokens + production bundle
```

The backend suite rebuilds its test database from migrations + seeders and covers auth, role
guards, patient scoping, the admission lifecycle, order pricing/stock control, prescription
verification, billing payments, clinical workflows and dashboards.

## Production notes

- Build the frontend (`npm run build`) and serve it behind HTTPS; deploy the API with
  `npm start`.
- Set `NODE_ENV=production`, `DATABASE_SSL=true`, a long random `JWT_SECRET`, and your
  `CORS_ORIGIN`. Never enable demo auth (`POST /api/auth/demo` already refuses in production).
- Provision staff via the portal or admin CLI before launch; patients register themselves.
- Wire up backups, monitoring, staff provisioning, email verification, MFA and operational
  privacy controls before using real patient information.
- Password-reset email, MFA and step-up verification are marked unavailable in the UI; this
  codebase is not by itself a compliance certification and should not hold real patient data
  until the remaining operational work is complete.

## Notes

- Dates render in Africa/Lagos time; the storefront formats currency as NGN while seed billing
  values are authored as plain numbers (seed phone numbers are `+233` Ghana-format).
- Emergencies: dial **112** (header strip + footer).
- Public-site editorial content (health library, news, stories, clinical trials) is seeded
  demo content, and the medical/NDPA/translation flows are simulated for demonstration.# carebrigde-health-fullstack
