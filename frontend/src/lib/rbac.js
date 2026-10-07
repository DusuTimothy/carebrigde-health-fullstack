/* ==========================================================================
   Role-based access control. Roles are enforced at the data layer (mock "api"
   requires a role to access a scope); the UI simply reflects what the API
   allows. New roles can be added here without redesigning the core system.
   ========================================================================== */

export const ROLES = {
  patient: {
    id: 'patient',
    label: 'Patient',
    portalBase: '/portal/patient',
    nav: [
      { to: '/portal/patient', label: 'Dashboard', end: true },
      { to: '/portal/patient/book', label: 'Book a visit' },
      { to: '/portal/patient/appointments', label: 'Appointments' },
      { to: '/portal/patient/messages', label: 'Messages' },
      { to: '/portal/patient/prescriptions', label: 'Prescriptions' },
      { to: '/portal/patient/pharmacy', label: 'Buy drugs' },
      { to: '/portal/patient/labs', label: 'Lab results' },
      { to: '/portal/patient/billing', label: 'Billing & payments' },
    ],
  },
  provider: {
    id: 'provider',
    label: 'Clinician',
    portalBase: '/portal/provider',
    nav: [
      { to: '/portal/provider', label: 'Dashboard', end: true },
      { to: '/portal/provider/schedule', label: 'Schedule' },
      { to: '/portal/provider/messages', label: 'Messages' },
      { to: '/portal/provider/orders', label: 'Orders' },
      { to: '/portal/provider/results', label: 'Results review' },
    ],
  },
  nurse: {
    id: 'nurse',
    label: 'Nurse',
    portalBase: '/portal/nurse',
    nav: [
      { to: '/portal/nurse', label: 'Dashboard', end: true },
      { to: '/portal/nurse/queue', label: 'Patient queue' },
      { to: '/portal/nurse/vitals', label: 'Vitals' },
      { to: '/portal/nurse/patients', label: 'Patient wards' },
    ],
  },
  pharmacist: {
    id: 'pharmacist',
    label: 'Pharmacist',
    portalBase: '/portal/pharmacist',
    nav: [
      { to: '/portal/pharmacist', label: 'Dashboard', end: true },
      { to: '/portal/pharmacist/orders', label: 'Prescription queue' },
      { to: '/portal/pharmacist/online-orders', label: 'Online orders' },
      { to: '/portal/pharmacist/fulfill', label: 'Fulfillment' },
      { to: '/portal/pharmacist/products', label: 'Product catalog' },
    ],
  },
  lab_tech: {
    id: 'lab_tech',
    label: 'Lab Technician',
    portalBase: '/portal/lab',
    nav: [
      { to: '/portal/lab', label: 'Dashboard', end: true },
      { to: '/portal/lab/orders', label: 'Order queue' },
      { to: '/portal/lab/results', label: 'Results' },
    ],
  },
  admin: {
    id: 'admin',
    label: 'Administrator',
    portalBase: '/portal/admin',
    nav: [
      { to: '/portal/admin', label: 'Dashboard', end: true },
      { to: '/portal/admin/schedule', label: 'Master schedule' },
      { to: '/portal/admin/checkins', label: 'Check-in queue' },
      { to: '/portal/admin/patients', label: 'Patient wards' },
      { to: '/portal/admin/admissions', label: 'Admissions' },
      { to: '/portal/admin/wards', label: 'Wards & beds' },
      { to: '/portal/admin/departments', label: 'Departments' },
      { to: '/portal/admin/billing', label: 'Billing & claims' },
      { to: '/portal/admin/staff', label: 'Staff' },
      { to: '/portal/admin/users', label: 'Users' },
      { to: '/portal/admin/records', label: 'Medical records' },
      { to: '/portal/admin/content', label: 'Content' },
      { to: '/portal/admin/settings/tls', label: 'TLS & CA' },
      { to: '/portal/admin/reports', label: 'Reports' },
    ],
  },
  front_desk: {
    id: 'front_desk',
    label: 'Front Desk',
    portalBase: '/portal/front-desk',
    nav: [
      { to: '/portal/front-desk', label: 'Dashboard', end: true },
      { to: '/portal/front-desk/checkins', label: 'Check-ins' },
      { to: '/portal/front-desk/scheduling', label: 'Scheduling' },
    ],
  },
};

/* Scopes the mock API layer checks against */
export const SCOPES = {
  'patient:book': ['patient'],
  'patient:billing': ['patient'],
  'patient:records': ['patient', 'provider', 'admin'],
  'provider:chart': ['provider'],
  'provider:orders': ['provider', 'nurse'],
  'admin:schedule': ['admin', 'front_desk'],
  'admin:staff': ['admin'],
  'admin:reports': ['admin'],
  'nurse:checkins': ['nurse', 'front_desk', 'admin'],
  'pharmacy:fulfill': ['pharmacist'],
  'lab:process': ['lab_tech'],
  'lab:review': ['provider', 'lab_tech'],
  'audit:read': ['admin'],
  'consent:manage': ['admin', 'front_desk'],
};

/* Backend stores roles as admin/doctor/nurse/receptionist/pharmacist/
   laboratory_staff/accountant/patient. The UI keys match the RBAC map above,
   so we normalize backend roles to UI keys at hydration time. Two backend
   roles intentionally collapse: receptionist -> front_desk and
   laboratory_staff -> lab_tech; accountant gets the admin portal (billing,
   records and reports live under the administrator workspace). */
export const BACKEND_ROLE_TO_KEY = {
  patient: 'patient',
  doctor: 'provider',
  nurse: 'nurse',
  receptionist: 'front_desk',
  pharmacist: 'pharmacist',
  laboratory_staff: 'lab_tech',
  accountant: 'admin',
  admin: 'admin',
};

export const ROLE_KEY_TO_BACKEND = {
  patient: 'patient',
  provider: 'doctor',
  nurse: 'nurse',
  front_desk: 'receptionist',
  pharmacist: 'pharmacist',
  lab_tech: 'laboratory_staff',
  admin: 'admin',
};

export function roleKeyOf(backendRole) {
  return BACKEND_ROLE_TO_KEY[backendRole] ?? 'patient';
}

export function backendRoleOf(roleKey) {
  return ROLE_KEY_TO_BACKEND[roleKey] ?? 'patient';
}

export function can(user, scope) {
  if (!user) return false;
  const allowed = SCOPES[scope];
  return allowed ? allowed.includes(user.role) : true;
}

export function roleOf(user) {
  return user ? ROLES[user.role] ?? null : null;
}