# Hospital Management System — Backend API

REST API for a hospital management platform built with **Node.js (ESM)**, **Express 4**, **Sequelize 6** and **PostgreSQL**. It covers user/role management, departments, doctors, patients, wards and beds, admissions (admit / transfer / discharge / cancel, transactional), appointments, clinical records (medical records, prescriptions, laboratory tests), a pharmacy marketplace (categories, products, orders with stock control), billing with payments, and role-based dashboards.

## Tech stack

- Node.js 18+ (developed on 24), Express 4, ESM modules
- PostgreSQL, Sequelize ORM (migrations + seeders)
- JWT auth (Bearer or cookie), bcrypt password hashing, helmet, CORS, rate limiting, morgan
- Validation with **Zod**; tests with **Jest + Supertest**
- Admin CLI for managing admin users

## Project structure

```
config/                    # removed — merged into src/config/environment.js
migrations/                # 17 schema migrations (FK-ordered)
seeders/                   # 10 demo-data seeders (tracked via SequelizeData)
postman/                   # Postman collection + environment
scripts/
  build-postman.mjs        # regenerates the Postman collection
src/
  config/                  # environment.js (single DB/CLI config source) + database.js (Sequelize bootstrap)
  middleware/              # auth (JWT), role guard, zod validation, error handling
  models/                  # 17 models; associations centralised in models/index.js
  routes/                  # 17 resource routers
  controllers/             # handlers + patient-scope enforcement
  services/                # business logic (admissions, orders, billing, patients)
  utils/                   # ApiError, responses, pagination, patient-number generator
  validators/              # zod schemas
  scripts/
    manageAdmin.js         # admin CLI (create/list/promote, reset password)
tests/                     # Jest + Supertest integration suite
```

## Getting started

```bash
npm install
cp .env.example .env       # then edit DB credentials
npm run db:reset           # drop, create, migrate and seed the database
npm run dev                # start with file watching
```

The server prints `Hospital API running on port 5000`. Health check: `GET /health`.

### Environment variables (`.env`)

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` / `test` / `production` |
| `PORT` | `5000` | HTTP port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `hospital_db` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | — | Database password |
| `DB_SSL` | `false` | TLS mode: `require` for TLS, or `verify-ca` / `verify-full` with `DATABASE_CA` |
| `DATABASE_CA` | — | Path to the PostgreSQL CA certificate when using `verify-ca` or `verify-full` |
| `JWT_SECRET` | — | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

Since migrations/seeders run with `sequelize-cli` (`.sequelizerc` points to the same `src/config/environment.js` used by the app), the dispatch `DB_*` variables drive both the CLI and the application runtime from a single source of truth.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` / `npm start` | Run the API (watch mode / plain). |
| `npm run db:migrate` | Apply pending migrations. |
| `npm run db:migrate:undo` | Revert the last migration batch. |
| `npm run db:seed` | Apply pending seeders. |
| `npm run db:seed:undo` | Revert seeders in reverse order. |
| `npm run db:create` / `db:drop` | Create/drop the database. |
| `npm run db:reset` | Drop → create → migrate → seed. |
| `npm run lint` | ESLint over `src/`. |
| `npm test` | Jest + Supertest suite against a dedicated `_test` database. |
| `node scripts/build-postman.mjs` | Regenerate `postman/hospital-api.postman_collection.json`. |

## Demo data

`npm run db:seed` loads a consistent dataset (passwords are `Password123!`):

| Role | Email |
|---|---|
| admin | `admin@hospital.com` |
| doctor | `dr.amelia@hospital.com`, `dr.james@hospital.com`, `dr.sophia@hospital.com`, `dr.daniel@hospital.com`, `dr.priya@hospital.com`, `dr.lucas@hospital.com` |
| nurse | `nurse.grace@hospital.com` |
| receptionist | `frontdesk@hospital.com` |
| pharmacist | `pharmacy@hospital.com` |
| laboratory staff | `lab.tech@hospital.com` |
| accountant | `accounts@hospital.com` |
| patient | `patient.amy@hospital.com`, `patient.ben@hospital.com`, `patient.clara@hospital.com`, `patient.david@hospital.com`, `patient.eve@hospital.com`, `patient.fred@hospital.com` |

Seed content: 6 doctors, 8 departments, 6 patients, 7 wards (42 beds), 3 active/discharged admissions with a transfer, appointments, medical records, prescriptions, laboratory tests, 9 product categories / 26 products, 3 orders and 4 bills in mixed statuses.

## Admin CLI

```bash
node src/scripts/manageAdmin.js create --name "System Admin" --email admin@hospital.com --password Secret123 --phone +233200000000
node src/scripts/manageAdmin.js list
node src/scripts/manageAdmin.js promote --email user@hospital.com --role admin
node src/scripts/manageAdmin.js reset-password --email admin@hospital.com --password NewSecret123
```

## API overview

All routes (except public auth/register, auth/login and `/health`) require a `Bearer` token.

### Auth
`POST /api/auth/register` (public — always creates a `patient` and auto-generates a patient profile) · `POST /api/auth/login` · `GET /api/auth/me` · `PUT /api/auth/update-profile` · `PUT /api/auth/change-password`

### Users (admin)
`GET/POST /api/users` · `GET/PUT/DELETE /api/users/:id`

### Departments (write: admin)
`GET /api/departments` · `GET/PUT/DELETE /api/departments/:id` · `POST /api/departments`

### Doctors
`GET /api/doctors` · `GET/PUT/DELETE /api/doctors/:id` · `POST /api/doctors`

### Patients
`GET /api/patients` (staff see all, patients see only their own) · `GET /api/patients/me/profile` · `GET/PUT/DELETE /api/patients/:id` · `POST /api/patients`

### Wards & beds (write: admin; bed status: admin + nurse)
`GET /api/wards?withBeds=true` · `GET/PUT/DELETE /api/wards/:id` · `POST /api/wards` · `GET /api/beds?status=available` · `GET/PUT/DELETE /api/beds/:id` · `POST /api/beds`

### Admissions (staff: admin, receptionist, doctor, nurse)
`GET /api/admissions?...` · `GET /api/admissions/:id` · `POST /api/admissions` · `PUT /api/admissions/:id` · `PUT /api/admissions/:id/transfer` · `PUT /api/admissions/:id/discharge` · `PUT /api/admissions/:id/cancel` · `DELETE /api/admissions/:id`

Transfers and discharges are transactional: bed occupancy is updated atomically, transfers write an audit row in `patient_transfers`, and duplicate active admissions conflict with a `409`.

### Appointments (patients can self-book)
`GET /api/appointments` · `GET/PUT/DELETE /api/appointments/:id` · `POST /api/appointments`

### Medical records (write: admin, doctor, nurse)
`GET /api/medical-records` · `GET/PUT/DELETE /api/medical-records/:id` · `POST /api/medical-records`

### Prescriptions (create: admin, doctor; update: + pharmacist, nurse)
`GET /api/prescriptions` · `GET/PUT/DELETE /api/prescriptions/:id` · `POST /api/prescriptions`

### Laboratory (create: admin, doctor, nurse; update: + laboratory staff)
`GET /api/laboratory` · `GET/PUT/DELETE /api/laboratory/:id` · `POST /api/laboratory` — completing a test stamps `completedAt`.

### Pharmacy catalog (write: admin, pharmacist)
`GET/POST /api/product-categories` · `PUT/DELETE /api/product-categories/:id` · `GET/POST /api/products` · `GET/PUT/DELETE /api/products/:id`

### Orders
`GET /api/orders` · `GET /api/orders/:id` · `POST /api/orders` (any authenticated user) · `PUT /api/orders/:id/verify-prescription` (admin, pharmacist) · `PUT /api/orders/:id/status` (admin, pharmacist)

Order totals are computed server-side (`subtotal`, flat `deliveryFee`, `total`; free delivery above the threshold). Stock is decremented inside a transaction with row locks (`FOR UPDATE`); insufficient stock returns `409 Insufficient stock for "<product>"` and leaves stock untouched. Orders containing prescription-only medicine start with `prescriptionStatus=pending` and cannot advance to `processing` until approved by a pharmacist. Cancelled/rejected orders restore stock.

### Billing (admin, accountant, receptionist)
`GET /api/billing` · `GET/PUT/DELETE /api/billing/:id` · `POST /api/billing` · `POST /api/billing/:id/payments` — payments are applied transactionally and update `amountPaid`, `balance` and `status`.

### Dashboards
`GET /api/dashboard/admin` · `GET /api/dashboard/doctor` · `GET /api/dashboard/nurse` · `GET /api/dashboard/pharmacy` · `GET /api/dashboard/patient`

## Postman

Import `postman/hospital-api.postman_collection.json` together with `postman/hospital-api.environment.json`, select the **Hospital API Local** environment, and run the **Login** request once — the response token is stored into `{{token}}` automatically.

## Testing

```bash
npm test
```

The Jest suite provisions a dedicated database (`hospital_db_test`), applies all migrations + seeders, and exercises auth, role guards, patient scoping, ward/bed management, the admission lifecycle, order pricing and stock control, prescription verification, billing payments, clinical workflows and dashboards. Re-running the suite rebuilds the test database from scratch.

## Error handling

Errors are normalised as:

```json
{
  "success": false,
  "message": "Human readable message",
  "errors": [{ "field": "name", "message": "Required" }]
}
```

Common statuses: `400` validation/input, `401` auth, `403` role denied, `404` missing resource, `409` conflicting state, `500` unexpected.