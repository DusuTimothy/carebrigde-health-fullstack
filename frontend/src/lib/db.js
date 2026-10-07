import { useSyncExternalStore } from 'react';
import { slotTimeToDate } from './seed.js';
import { uid } from './format.js';
import { apiRequest } from './api.js';
import { roleKeyOf } from './rbac.js';

/* ==========================================================================
   Server-backed cache store.
   Hydrates from the authenticated /api/bootstrap payload, then mirrors the
   small set of state kept locally (shopping carts, consents, newsletter
   subscriptions not stored server-side). The public useDB()/getState()/actions
   surface is unchanged so pages keep working against real data.
   ========================================================================== */

const EMPTY = {
  users: {},
  patients: {},
  providers: {},
  doctors: {},
  wards: [],
  beds: [],
  admissions: [],
  transfers: [],
  serviceLines: [],
  bookingSpecialties: [],
  appointments: [],
  encounters: [],
  prescriptions: [],
  labResults: [],
  labOrders: [],
  threads: [],
  invoices: [],
  notifications: [],
  facilities: [],
  staffRoster: [],
  checkins: [],
  pharmacyQueue: [],
  drugCatalog: [],
  pharmacyOrders: [],
  pharmacyCarts: {},
  labInstruments: [],
  reports: { revenueByMonth: [], occupancyByFacility: [], claims: [], summary: {} },
  news: [],
  healthLibrary: [],
  clinicalTrials: [],
  stories: [],
  departments: [],
  clinicalDepartments: [],
  locations: [],
  community: { mission: '', programs: [] },
  auditLog: [],
  newsletterSubscribers: [],
  consents: [],
  patientIdByUserId: {},
  hydrated: false,
};

let state = EMPTY;
const listeners = new Set();

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function getState() {
  return state;
}

export function useDB() {
  const snapshot = useSyncExternalStore(subscribe, getState);
  return [snapshot, actions];
}

let refreshTimer = null;
let refreshInFlight = null;

export function resetDB() {
  state = EMPTY;
  listeners.forEach((l) => l());
}

/* ---------------- small helpers ---------------- */

const splitName = (name = '') => {
  const [first, ...rest] = String(name).trim().split(/\s+/);
  return { firstName: first || '', lastName: rest.join(' ') };
};

const initialsOf = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

const pad = (n) => String(n).padStart(2, '0');
const toDateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeInput = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const addDays = (iso, n) => new Date(new Date(iso).getTime() + n * 86400000).toISOString();
const addYear = (iso) => addDays(iso, 365);
const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const SPECIALTY_SLUG = {
  Cardiology: 'spec-cardio',
  'General Surgery': 'spec-ortho',
  'Orthopedic Surgery': 'spec-ortho',
  Pediatrics: 'spec-pedia',
  'Internal Medicine': 'spec-primary',
  'Family Medicine': 'spec-primary',
  'Emergency Medicine': 'spec-urgent',
  Neurology: 'spec-neuro',
  'Obstetrics & Gynecology': 'spec-obgyn',
  Dermatology: 'spec-derma',
  Endocrinology: 'spec-endocr',
  Psychiatry: 'spec-behavioral',
};
const specialistSlug = (specialization) =>
  SPECIALTY_SLUG[specialization] ||
  `spec-${String(specialization || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

const parseList = (s) =>
  String(s || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

const DEFAULT_PATIENT_INSURANCE = {
  memberId: '',
  group: 'NHIS',
  plan: 'Comprehensive Plan',
  copay: 100,
  deductibleMet: 0,
  outOfPocketMax: 1000,
  verified: true,
};

/* ---------------- normalization ---------------- */

export function hydrateFromBootstrap(payload = {}) {
  const next = { ...EMPTY };

  const roleBackend = payload.user?.role || 'patient';
  next.sessionUserId = payload.user?.id || null;
  next.roleBackend = roleBackend;
  next.userRaw = payload.user || null;
  next.sessionUser = payload.user
    ? {
        id: payload.user.id,
        name: payload.user.name,
        firstName: splitName(payload.user.name).firstName,
        lastName: splitName(payload.user.name).lastName,
        email: payload.user.email || '',
        role: roleKeyOf(payload.user.role),
        roleBackend: payload.user.role,
        initials: initialsOf(payload.user.name),
      }
    : null;

  /* users */
  const ingestUser = (u) => {
    if (!u || next.users[u.id]) return;
    const { firstName, lastName } = splitName(u.name);
    next.users[u.id] = {
      ...u,
      firstName,
      lastName,
      role: roleKeyOf(u.role),
      roleBackend: u.role,
      initials: initialsOf(u.name),
      imageUrl: u.imageUrl || null,
    };
  };
  (payload.team || []).forEach(ingestUser);
  Object.values(payload.doctors || {}).forEach((d) => ingestUser(d.user));
  Object.values(payload.patients || {}).forEach((p) => ingestUser(p.user));

  /* providers */
  Object.values(payload.doctors || {}).forEach((d) => {
    const firstName = d.firstName || d.user?.name?.split(' ')[0] || '';
    const lastName = d.lastName || d.user?.name?.split(' ').slice(1).join(' ') || '';
    const name = `${firstName} ${lastName}`.trim();
    next.providers[d.id] = {
      id: d.id,
      userId: d.userId,
      firstName,
      lastName,
      name,
      title: 'Registered clinician',
      specialty: specialistSlug(d.specialization),
      specialtyName: d.specialization || 'General Practice',
      rating: num(d.rating),
      reviews: num(d.reviews),
      languages: d.languages || ['English'],
      acceptsNewPatients: d.acceptsNewPatients !== false,
      bookOnline: d.bookOnline !== false,
      location: d.location || 'Carebridge Medical Centre',
      bio: d.bio || '',
      image: d.imageUrl || null,
      imageUrl: d.imageUrl || null,
      departmentId: d.departmentId,
      email: d.email,
      phone: d.phone,
      availability: d.availability || 'available',
      user: d.user || null,
    };
  });

  /* patients keyed by userId */
  Object.values(payload.patients || {}).forEach((p) => {
    const user = p.user || {};
    const { firstName, lastName } = splitName(user.name);
    next.patients[p.userId] = {
      id: p.id,
      userId: p.userId,
      patientNumber: p.patientNumber,
      firstName: p.firstName || firstName,
      lastName: p.lastName || lastName,
      name: `${p.firstName || firstName} ${p.lastName || lastName}`.trim(),
      dob: p.dateOfBirth,
      gender: p.gender || 'not_specified',
      phone: p.phone || user.phone || '',
      email: p.email || user.email || '',
      bloodGroup: p.bloodGroup || 'O+',
      address: { street: p.address || '', city: '', state: '', zip: '' },
      addressRaw: p.address || '',
      emergencyContact: {
        name: p.emergencyContactName || 'Not specified',
        phone: p.emergencyContactPhone || '',
        relation: 'Emergency contact',
      },
      insurance: p.insuranceProvider
        ? {
            provider: p.insuranceProvider,
            memberId: p.insuranceNumber || '',
            effectiveDate: addDays(p.createdAt || new Date().toISOString(), -365).slice(0, 10),
            ...DEFAULT_PATIENT_INSURANCE,
          }
        : null,
      allergies: parseList(p.allergies),
      medications: [],
      conditions: [],
      paymentMethods: [],
      memberSince: p.createdAt || user.createdAt || null,
      reason: '',
    };
    next.patientIdByUserId[p.userId] = p.id;
  });

  /* map any patient record back to its owning user id */
  const puid = (rec) => rec?.patient?.user?.id || next.patientIdByUserId?.[rec?.patientId] || null;

  /* departments (catalog comes from siteContents; clinical list from the backend) */
  next.clinicalDepartments = payload.departments || [];
  (payload.siteContents?.departmentsCatalog || []).forEach((d, i) => {
    next.departments.push({ ...d, id: d.id || String(i + 1) });
  });

  /* appointments */
  (payload.appointments || []).forEach((a) => {
    const time = String(a.appointmentTime || '09:00:00').slice(0, 5);
    next.appointments.push({
      id: a.id,
      providerId: a.doctorId,
      doctorId: a.doctorId,
      patientId: a.patientId,
      patientUserId: puid(a),
      type: 'in-person',
      date: `${a.appointmentDate}T${time}:00`,
      durationMin: 30,
      status: a.status || 'scheduled',
      reason: a.reason || '',
      room: a.notes ? 'To be assigned' : 'To be assigned',
      checkinAt: null,
      patientName: a.patient?.user?.name || null,
      docName: a.doctor ? `${a.doctor.firstName} ${a.doctor.lastName}`.trim() : null,
    });
  });

  /* encounters derived from medical records */
  (payload.medicalRecords || []).forEach((r) => {
    next.encounters.push({
      id: r.id,
      patientId: r.patientId,
      patientUserId: puid(r),
      providerId: r.doctorId,
      date: r.createdAt || r.updatedAt,
      type: 'in-person',
      status: 'completed',
      vitals: { bp: '', hr: 0, temp: 0, weight: 0, height: 0 },
      reason: r.diagnosis || 'Consultation',
      note: r.notes || (r.treatment ? `Treatment: ${r.treatment}` : ''),
      plan: parseList(r.treatment || ''),
      symptoms: r.symptoms || '',
      treatment: r.treatment || '',
    });
  });

  /* prescriptions */
  (payload.prescriptions || []).forEach((r) => {
    const backendStatus = r.status || 'pending';
    next.prescriptions.push({
      id: r.id,
      patientId: r.patientId,
      patientUserId: puid(r),
      providerId: r.doctorId,
      doctorId: r.doctorId,
      medicineId: r.medicineId,
      drug: r.medicine?.name || 'Medication',
      strength: r.dosage || '',
      directions: r.instructions || '',
      frequency: r.frequency || '',
      duration: r.duration || '',
      quantity: 30,
      refillsRemaining: 2,
      prescribedAt: r.createdAt,
      expiresAt: addYear(r.createdAt || new Date().toISOString()),
      status: backendStatus === 'dispensed' || backendStatus === 'rejected' ? backendStatus : 'active',
      backendStatus,
      refillStatus: 'none',
      lastRefill: null,
    });
  });

  /* laboratory tests -> results (completed) / orders (in progress) */
  (payload.laboratoryTests || []).forEach((t) => {
    const completed = t.status === 'completed';
    const components = (t.components || []).map((c) => {
      const lo = c.refLow !== undefined && c.refLow !== null ? num(c.refLow, null) : null;
      const hi = c.refHigh !== undefined && c.refHigh !== null ? num(c.refHigh, null) : null;
      const val = c.value;
      let flag = c.flag || (c.status !== 'normal' && c.status !== undefined ? c.status : null);
      const ref = c.range;
      if (!flag && ref && val !== undefined && val !== null) {
        const match = String(ref).match(/^([<\u2264]?\s*)?([\d.-]+)/);
        flag = flag || null;
      }
      return {
        name: c.name,
        value: String(val ?? ''),
        unit: c.unit || '',
        range: c.range || '',
        component: c.component || null,
        status: c.status || 'normal',
        flag,
      };
    });
    const flagged = components.some((c) => c.status !== 'normal');
    if (completed) {
      next.labResults.push({
        id: t.id,
        patientId: t.patientId,
        patientUserId: puid(t),
        providerId: t.doctorId,
        name: t.testName,
        testName: t.testName,
        orderedAt: t.requestedAt || t.createdAt,
        resultedAt: t.completedAt || t.updatedAt || t.createdAt,
        status: 'final',
        summary: t.resultSummary || (t.result ? String(t.result) : 'Result recorded.'),
        result: t.result || '',
        components,
        flagged,
        signedOff: true,
        signedOffBy: null,
      });
    } else if (t.status !== 'cancelled') {
      next.labOrders.push({
        id: t.id,
        providerId: t.doctorId,
        patientId: t.patientId,
        patientUserId: puid(t),
        name: t.testName,
        testName: t.testName,
        orderedAt: t.requestedAt || t.createdAt,
        status:
          t.status === 'sample-collected' || t.status === 'processing'
            ? 'in_progress'
            : 'pending_collection',
      });
    }
  });

  /* conversations */
  (payload.threads || []).forEach((t) => {
    const msgs = (t.messages || []).map((m) => ({
      id: m.id,
      from: m.senderId,
      body: m.body,
      at: m.createdAt,
      read: m.read,
    }));
    next.threads.push({
      id: t.id,
      subject: t.subject,
      createdBy: t.createdBy,
      participants: (t.participants || []).map((p) => p.id),
      participantDetails: t.participants || [],
      messages: msgs,
      lastMessageAt: t.lastMessageAt || msgs.at(-1)?.at,
      unreadCount:
        t.unreadCount != null
          ? t.unreadCount
          : msgs.filter((m) => !m.read && m.from !== payload.user?.id).length,
    });
  });

  /* notifications */
  (payload.notifications || []).forEach((n) => {
    next.notifications.push({
      id: n.id,
      userId: n.userId,
      type: n.type || 'general',
      title: n.title,
      body: n.body,
      at: n.createdAt,
      read: n.read,
      link: n.link || '',
    });
  });

  /* billing invoices derived from bills */
  (payload.bills || []).forEach((b) => {
    const status = b.status || 'pending';
    next.invoices.push({
      id: b.id,
      patientId: b.patientId,
      patientUserId: puid(b),
      date: b.createdAt,
      dueDate: addDays(b.createdAt, 30),
      description: 'Hospital services',
      provider: 'Carebridge Medical Centre',
      consultationFee: num(b.consultationFee),
      bedFee: num(b.bedFee),
      laboratoryFee: num(b.laboratoryFee),
      pharmacyFee: num(b.pharmacyFee),
      otherCharges: num(b.otherCharges),
      amount: num(b.totalAmount),
      amountPaid: num(b.amountPaid),
      insuranceCovered: 0,
      patientResponsibility: num(b.balance, b.totalAmount),
      status: status === 'paid' ? 'paid' : status === 'cancelled' ? 'cancelled' : 'open',
      backendStatus: status,
      paidAt: status === 'paid' ? b.updatedAt || b.createdAt : null,
      paidWith: null,
    });
  });

  /* check-in queue */
  (payload.checkins || []).forEach((c) => {
    next.checkins.push({
      id: c.id,
      patientId: c.patientId,
      patientUserId: puid(c),
      name: c.patient?.user?.name || `${c.patient?.firstName || ''} ${c.patient?.lastName || ''}`.trim() || 'Patient',
      dob: c.patient?.dateOfBirth,
      providerId: c.doctorId,
      room: c.room || 'Waiting room',
      status: c.status || 'waiting',
      arrivedAt: c.arrivedAt,
      reason: c.reason || '',
      vitals: c.vitals || {},
    });
  });

  /* pharmacy queue derived from open prescriptions */
  (payload.prescriptions || []).forEach((r) => {
    if (r.status === 'dispensed' || r.status === 'rejected') return;
    next.pharmacyQueue.push({
      id: r.id,
      patientId: r.patientId,
      patientUserId: puid(r),
      patientName: r.patient?.user?.name || `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.trim() || 'Patient',
      drug: r.medicine?.name || 'Medication',
      strength: r.dosage || '',
      directions: r.instructions || '',
      status:
        r.status === 'approved'
          ? 'awaiting_verification'
          : r.status === 'pending'
            ? 'ready_to_fill'
            : 'ready_to_fill',
      requestedAt: r.createdAt,
      rxId: r.id,
    });
  });

  /* drug catalog from products */
  (payload.products || []).forEach((p) => {
    next.drugCatalog.push({
      id: p.id,
      name: p.name,
      generic: p.generic || p.brand || '',
      form: p.form || (p.brand ? 'Tablet' : ''),
      strength: p.strength || '',
      pack: p.pack || `${p.stockQuantity} pack`,
      price: num(p.price),
      discountPrice: p.discountPrice != null ? num(p.discountPrice) : null,
      category: p.category?.name || 'General',
      categoryId: p.categoryId,
      requiresPrescription: Boolean(p.requiresPrescription),
      inStock: p.status === 'active' && num(p.stockQuantity) > 0,
      stockQuantity: num(p.stockQuantity),
      manufacturer: p.manufacturer || '',
      imageUrl: p.imageUrl || null,
      description: p.description || p.generic || '',
    });
  });

  /* online pharmacy orders */
  (payload.orders || []).forEach((o) => {
    const items = (o.items || []).map((it) => {
      const prod = it.product || {};
      const pr = num(prod.price);
      const qty = num(it.quantity, 1);
      return {
        drugId: it.productId,
        drug: prod.name || 'Medication',
        strength: `${prod.form || 'Tablet'} · ${prod.strength || ''}`,
        pack: prod.pack || '',
        qty,
        price: pr,
        lineTotal: pr * qty,
      };
    });
    const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
    next.pharmacyOrders.push({
      id: o.id,
      patientId: o.patient ? o.patient.userId : null,
      patientUserId: o.patient ? o.patient.userId : null,
      patientName: o.patient?.user?.name || o.user?.name || 'Patient',
      items,
      subtotal,
      deliveryFee: 0,
      total: subtotal,
      delivery: {
        method: o.deliveryAddress ? 'delivery' : 'pickup',
        address: o.deliveryAddress || 'Carebridge Pharmacy, Ikeja',
        phone: o.user?.phone || '',
        fee: 0,
      },
      status: ORDER_TO_FRONT[o.status] || 'placed',
      backendStatus: o.status,
      placedAt: o.createdAt,
      note: o.notes || '',
    });
  });

  /* roles & roster */
  next.staffRoster = (payload.staffRoster || []).map((u) => ({
    id: u.id,
    userId: u.id,
    roleKey: roleKeyOf(u.role),
    role: roleLabel(u.role),
    name: u.name,
    firstName: splitName(u.name).firstName,
    lastName: splitName(u.name).lastName,
    email: u.email,
    phone: u.phone,
    dept: 'Operations',
    shift: u.role === 'nurse' ? 'Day' : 'Day',
    onDuty: true,
    imageUrl: u.imageUrl || null,
  }));

  /* reports */
  if (roleBackend === 'admin' || roleBackend === 'accountant') {
    next.reports = payload.reports || next.reports;
  }

  /* wards + facilities */
  next.doctors = payload.doctors || {};
  next.wards = payload.wards || [];
  next.wardsIdName = Object.fromEntries((payload.wards || []).map((w) => [w.id, w.name]));
  next.beds = payload.beds || [];
  next.admissions = (payload.admissions || []).map((ad) => ({
    ...ad,
    patientName: ad.patient?.user?.name || `${ad.patient?.firstName || ''} ${ad.patient?.lastName || ''}`.trim(),
    doctorName: ad.doctor ? `${ad.doctor.firstName} ${ad.doctor.lastName}`.trim() : null,
    wardName: ad.ward?.name,
    bedLabel: ad.bed?.label,
  }));
  next.transfers = payload.transfers || [];

  /* site content */
  const sc = payload.siteContents || {};
  next.serviceLines = sc.serviceLines || [];
  next.bookingSpecialties = sc.bookingSpecialties || [];
  next.community = sc.community || next.community;
  next.facilities = sc.facilities || [];
  next.labInstruments = sc.labInstruments || [];

  /* articles / locations / trials / stories */
  let newsSeq = 0;
  let hlSeq = 0;
  (payload.articles || []).forEach((a, i) => {
    if (a.category === 'health_library') {
      hlSeq += 1;
      next.healthLibrary.push({
        ...a,
        id: a.id || `c-${i + 1}`,
        summary: a.excerpt || a.summary || '',
        category: 'Health Library',
        img: a.imageUrl || HEALTH_LIBRARY_IMAGES[`c-${hlSeq}`] || null,
      });
    } else {
      newsSeq += 1;
      next.news.push({
        ...a,
        id: a.id || `n-${newsSeq}`,
        category: 'News',
        img: a.imageUrl || NEWS_IMAGES[`n-${newsSeq}`] || null,
      });
    }
  });
  next.locations = (payload.locations || []).map((l, i) => ({ ...l, id: l.id || `loc-${i + 1}` }));
  next.clinicalTrials = (payload.clinicalTrials || []).map((t, i) => ({
    ...t,
    id: t.id || `ct-${i + 1}`,
  }));
  next.stories = (payload.stories || []).map((s, i) => ({ ...s, id: s.id || `st-${i + 1}` }));

  next.hydrated = true;
  state = next;
  listeners.forEach((l) => l());
  return state;
}

const NEWS_IMAGES = {
  'n-1': '/images/health/heart.jpg',
  'n-2': '/images/health/cancer.jpg',
  'n-3': '/images/health/sports.jpg',
  'n-4': '/images/health/consult.jpg',
  'n-5': '/images/health/lab-2.jpg',
  'n-6': '/images/health/children.jpg',
  'n-7': '/images/health/senior-rehab.jpg',
  'n-8': '/images/health/headneck.jpg',
  'n-9': '/images/health/behavioral.jpg',
  'n-10': '/images/health/scan-mri.jpg',
};

const HEALTH_LIBRARY_IMAGES = {
  'c-1': '/images/health/cancer.jpg',
  'c-2': '/images/health/lab-2.jpg',
  'c-3': '/images/health/consult.jpg',
  'c-4': '/images/health/primary-care.jpg',
  'c-5': '/images/health/physio.jpg',
  'c-6': '/images/health/behavioral.jpg',
  'c-7': '/images/health/scan-mri.jpg',
  'c-8': '/images/health/covid-test.jpg',
  'c-9': '/images/health/pregnancy.jpg',
  'c-10': '/images/health/children.jpg',
  'c-11': '/images/health/headneck.jpg',
  'c-12': '/images/health/heart.jpg',
};

const ORDER_TO_FRONT = {
  pending: 'placed',
  confirmed: 'processing',
  processing: 'processing',
  shipped: 'ready',
  delivered: 'fulfilled',
  cancelled: 'cancelled',
};

const roleLabel = (r) =>
  ({
    admin: 'Administrator',
    doctor: 'Clinician',
    nurse: 'Nurse',
    receptionist: 'Front Desk',
    pharmacist: 'Pharmacist',
    laboratory_staff: 'Lab Technician',
    accountant: 'Accountant',
    patient: 'Patient',
  })[r] || r;

/* ---------------- refresh ---------------- */

export async function refreshStore() {
  try {
    const { data } = await apiRequest('/api/bootstrap');
    if (data?.user && ['admin', 'accountant'].includes(data.user.role)) {
      try {
        const { data: reportData } = await apiRequest('/api/reports');
        data.reports = reportData;
      } catch {
        /* reports stay empty for non-privileged/accountant fallback */
      }
    }
    hydrateFromBootstrap(data);
    return state;
  } catch (error) {
    return state;
  }
}

export async function hydratePublic() {
  try {
    const [site, doctors, products] = await Promise.all([
      apiRequest('/api/public/site'),
      apiRequest('/api/public/doctors'),
      apiRequest('/api/public/products'),
    ]);
    const data = site.data || {};
    const payload = {
      user: null,
      team: [],
      users: {},
      doctors: Object.fromEntries((doctors.data || []).map((d) => [d.id, d])),
      patients: {},
      patientUserIdByPatientId: {},
      products: products.data || [],
      articles: data.articles || [],
      locations: data.locations || [],
      clinicalTrials: data.clinicalTrials || [],
      stories: data.stories || [],
      departments: data.departments || [],
      siteContents: data.siteContents || {},
    };
    hydrateFromBootstrap(payload);
    return state;
  } catch (error) {
    return state;
  }
}

function scheduleRefresh(ms = 250) {
  if (refreshTimer) window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    refreshTimer = null;
    refreshStore();
  }, ms);
}

async function call(path, options) {
  const { data } = await apiRequest(path, options);
  return data;
}

function patch(mutator) {
  state = mutator(state);
  listeners.forEach((l) => l());
}

export function logAudit(stateIn, actor, action, target, detail) {
  return stateIn;
}

const patientRecordId = (userId) => {
  const pid = state.patientIdByUserId?.[userId];
  return pid || userId;
};

/* ---------------- actions ---------------- */

export const actions = {
  async bookAppointment({ patientId, providerId, dayOffset, slotTime, type, reason }) {
    const date = slotTimeToDate(dayOffset, slotTime);
    const body = {
      patientId: patientRecordId(patientId),
      doctorId: providerId,
      appointmentDate: toDateInput(date),
      appointmentTime: toTimeInput(date),
      reason: reason || 'General consultation',
      status: 'scheduled',
    };
    try {
      const created = await call('/api/appointments', { method: 'POST', body: JSON.stringify(body) });
      if (created?.id) {
        const apptDate = created.appointmentDate
          ? `${created.appointmentDate}T${String(created.appointmentTime || '00:00:00').slice(0, 5)}:00`
          : date.toISOString();
        patch((s) => ({
          ...s,
          appointments: [
            ...s.appointments,
            {
              id: created.id,
              providerId,
              doctorId: providerId,
              patientId,
              type: type || 'in-person',
              date: apptDate,
              durationMin: 30,
              status: 'scheduled',
              reason: reason || 'General consultation',
              room: 'To be assigned',
              checkinAt: null,
            },
          ],
        }));
      }
      scheduleRefresh();
    } catch (error) {
      console.error('Could not book appointment', error.message);
    }
  },

  requestRefill({ patientId, prescriptionId }) {
    patch((s) => ({
      ...s,
      prescriptions: s.prescriptions.map((rx) =>
        rx.id === prescriptionId ? { ...rx, refillStatus: 'pending' } : rx
      ),
    }));
  },

  async markThreadRead({ threadId }) {
    try {
      await call(`/api/messages/${threadId}/read`, { method: 'PUT' });
      patch((s) => ({
        ...s,
        threads: s.threads.map((t) =>
          t.id === threadId
            ? { ...t, messages: t.messages.map((m) => ({ ...m, read: true })), unreadCount: 0 }
            : t
        ),
      }));
    } catch (error) {
      console.error('Could not mark thread read', error.message);
    }
  },

  async sendMessage({ userId, threadId, body }) {
    try {
      const msg = await call(`/api/messages/${threadId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      patch((s) => ({
        ...s,
        threads: s.threads.map((t) =>
          t.id === threadId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: msg?.id || uid('msg'),
                    from: userId,
                    body,
                    at: msg?.createdAt || new Date().toISOString(),
                    read: true,
                  },
                ],
              }
            : t
        ),
      }));
      scheduleRefresh(400);
    } catch (error) {
      console.error('Could not send message', error.message);
    }
  },

  async newThread({ fromUserId, toUserId, subject, body }) {
    try {
      const thread = await call('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ participantIds: [toUserId], subject, initialMessage: body }),
      });
      if (thread?.id) {
        patch((s) => ({
          ...s,
          threads: [
            {
              id: thread.id,
              subject,
              createdBy: fromUserId,
              participants: (thread.participants || []).map((p) => p.id),
              participantDetails: thread.participants || [],
              messages: (thread.messages || []).map((m) => ({
                id: m.id,
                from: m.senderId,
                body: m.body,
                at: m.createdAt,
                read: true,
              })),
              lastMessageAt: thread.lastMessageAt || null,
              unreadCount: 0,
            },
            ...s.threads,
          ],
        }));
      }
      scheduleRefresh();
    } catch (error) {
      console.error('Could not start conversation', error.message);
    }
  },

  async markAllNotificationsRead() {
    try {
      await call('/api/notifications/read-all', { method: 'PUT' });
      patch((s) => ({
        ...s,
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (error) {
      console.error('Could not mark notifications read', error.message);
    }
  },

  async markNotificationRead({ id }) {
    try {
      await call(`/api/notifications/${id}/read`, { method: 'PUT' });
      patch((s) => ({
        ...s,
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    } catch (error) {
      console.error('Could not mark notification read', error.message);
    }
  },

  async payInvoice({ invoiceId, amount }) {
    try {
      const bill = await call(`/api/billing/${invoiceId}/payments`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      patch((s) => ({
        ...s,
        invoices: s.invoices.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                status: (bill?.status === 'cancelled' ? 'cancelled' : 'paid'),
                amountPaid: num(bill?.amountPaid, inv.amount),
                patientResponsibility: num(bill?.balance, 0),
                paidAt: new Date().toISOString(),
              }
            : inv
        ),
      }));
      scheduleRefresh();
    } catch (error) {
      console.error('Could not record payment', error.message);
    }
  },

  savePaymentMethod({ userId, method }) {
    patch((s) => {
      const patient = s.patients[userId];
      if (!patient) return s;
      return {
        ...s,
        patients: {
          ...s.patients,
          [userId]: { ...patient, paymentMethods: [method, ...(patient.paymentMethods || [])] },
        },
      };
    });
  },

  async updateProfile({ userId, firstName, lastName, phone, email, language, address, allergies, emergencyContact, insurance, bloodGroup }) {
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    const userBody = {};
    if (name) userBody.name = name;
    if (phone) userBody.phone = phone;
    if (email) userBody.email = email;
    try {
      await call(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userBody),
      });
      patch((s) => {
        const u = s.users[userId];
        return {
          ...s,
          users: {
            ...s.users,
            [userId]: u
              ? {
                  ...u,
                  ...(name ? { name, firstName, lastName, initials: initialsOf(name) } : {}),
                  ...(phone ? { phone } : {}),
                  ...(email ? { email } : {}),
                }
              : u,
          },
        };
      });
    } catch (error) {
      console.error('Could not update profile', error.message);
    }
  },

  async checkIn({ id, status, vitals, room }) {
    const body = {};
    if (status) body.status = status;
    if (vitals) body.vitals = vitals;
    if (room) body.room = room;
    try {
      const updated = await call(`/api/checkins/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      patch((s) => ({
        ...s,
        checkins: s.checkins.map((c) =>
          c.id === id
            ? {
                ...c,
                status: status ?? c.status,
                vitals: vitals ?? c.vitals,
                room: room ?? c.room,
              }
            : c
        ),
      }));
      scheduleRefresh();
    } catch (error) {
      console.error('Could not update check-in', error.message);
    }
  },

  async saveEncounter({ providerId, patientId, type, note, plan, vitals, diagnosis }) {
    const body = {
      patientId: patientRecordId(patientId),
      ...(providerId ? { doctorId: providerId } : {}),
      diagnosis: diagnosis || (plan && plan.length ? plan.join(', ') : '') || 'Consultation',
      treatment: Array.isArray(plan) ? plan.join('\n') : plan || '',
      notes: note || '',
    };
    try {
      const rec = await call('/api/medical-records', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (rec?.id) {
        patch((s) => ({
          ...s,
          encounters: [
            {
              id: rec.id,
              providerId: providerId || state.sessionUserId,
              patientId,
              date: rec.createdAt || new Date().toISOString(),
              type: type || 'in-person',
              status: 'completed',
              vitals: vitals || { bp: '', hr: 0, temp: 0, weight: 0, height: 0 },
              reason: body.diagnosis,
              note: note || '',
              plan: Array.isArray(plan) ? plan : [body.treatment].filter(Boolean),
            },
            ...s.encounters,
          ],
        }));
      }
      scheduleRefresh();
    } catch (error) {
      console.error('Could not save encounter', error.message);
    }
  },

  async placeOrder({ providerId, patientId, type, name }) {
    if (type === 'lab') {
      const body = {
        patientId: patientRecordId(patientId),
        ...(providerId ? { doctorId: providerId } : {}),
        testName: name,
        testType: name,
        status: 'requested',
      };
      try {
        const test = await call('/api/laboratory', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        if (test?.id) {
          patch((s) => ({
            ...s,
            labOrders: [
              {
                id: test.id,
                providerId: providerId || state.sessionUserId,
                patientId,
                name,
                testName: name,
                orderedAt: new Date().toISOString(),
                status: 'pending_collection',
              },
              ...s.labOrders,
            ],
          }));
        }
        scheduleRefresh();
      } catch (error) {
        console.error('Could not place order', error.message);
      }
    } else if (type === 'rx') {
      try {
        await call('/api/prescriptions', {
          method: 'POST',
          body: JSON.stringify({
            patientId: patientRecordId(patientId),
            ...(providerId ? { doctorId: providerId } : {}),
            medicineId: name && state.drugCatalog.find((d) => d.name === name)?.id,
            status: 'pending',
          }),
        });
        scheduleRefresh();
      } catch (error) {
        console.error('Could not place prescription', error.message);
      }
    }
  },

  async signResult({ labResultId }) {
    try {
      await call(`/api/laboratory/${labResultId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' }),
      });
      patch((s) => ({
        ...s,
        labResults: s.labResults.map((r) =>
          r.id === labResultId ? { ...r, signedOff: true, signedOffBy: state.sessionUserId } : r
        ),
      }));
      scheduleRefresh();
    } catch (error) {
      console.error('Could not sign result', error.message);
    }
  },

  async advanceLabOrder({ labOrderId, status }) {
    const backend = status === 'resulted' ? 'completed' : status === 'in_progress' ? 'processing' : 'sample-collected';
    try {
      await call(`/api/laboratory/${labOrderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: backend }),
      });
      patch((s) => ({
        ...s,
        labOrders: s.labOrders.map((o) =>
          o.id === labOrderId ? { ...o, status: status || (o.status === 'pending_collection' ? 'in_progress' : 'resulted') } : o
        ),
      }));
      scheduleRefresh();
    } catch (error) {
      console.error('Could not advance lab order', error.message);
    }
  },

  async fulfillPharmacyOrder({ orderId, status }) {
    const backend = status === 'fulfilled' ? 'dispensed' : status === 'awaiting_verification' ? 'approved' : status;
    try {
      await call(`/api/prescriptions/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: backend }),
      });
      patch((s) => ({
        ...s,
        pharmacyQueue: s.pharmacyQueue.map((o) =>
          o.id === orderId
            ? { ...o, status: status || 'fulfilled', fulfilledAt: status === 'fulfilled' ? new Date().toISOString() : o.fulfilledAt }
            : o
        ),
      }));
      scheduleRefresh();
    } catch (error) {
      console.error('Could not update pharmacy order', error.message);
    }
  },

  async progressPharmacyOrder({ orderId, status }) {
    const backend =
      status === 'fulfilled' ? 'delivered' : status === 'ready' ? 'shipped' : status === 'processing' ? 'confirmed' : status;
    try {
      await call(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: backend }),
      });
      patch((s) => ({
        ...s,
        pharmacyOrders: s.pharmacyOrders.map((o) =>
          o.id === orderId
            ? { ...o, status, fulfilledAt: status === 'fulfilled' ? new Date().toISOString() : o.fulfilledAt }
            : o
        ),
      }));
      scheduleRefresh();
    } catch (error) {
      console.error('Could not update order', error.message);
    }
  },

  /* ---------------- Local-only actions ---------------- */

  subscribeNewsletter(email) {
    patch((s) => ({
      ...s,
      newsletterSubscribers: [{ email, at: new Date().toISOString() }, ...s.newsletterSubscribers],
    }));
    call('/api/public/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }).catch(() => undefined);
  },

  async writeAudit({ action, target, detail }) {
    try {
      await call('/api/audit-logs', {
        method: 'POST',
        body: JSON.stringify({ action, target, detail }),
      });
    } catch (error) {
      console.error('Could not write audit log', error.message);
    }
  },

  acceptConsent({ actor, patientId, consentType }) {
    patch((s) => ({
      ...s,
      consents: [
        ...(s.consents || []),
        { id: uid('cs'), patientId, consentType, at: new Date().toISOString(), recordingUserId: actor },
      ],
    }));
  },

  addToCart({ actor, drugId, qty = 1 }) {
    patch((s) => {
      const carts = s.pharmacyCarts ?? {};
      const mine = carts[actor] ?? [];
      const existing = mine.find((i) => i.drugId === drugId);
      const nextItems = existing
        ? mine.map((i) => (i.drugId === drugId ? { ...i, qty: Math.min(i.qty + qty, 9) } : i))
        : [...mine, { drugId, qty }];
      return { ...s, pharmacyCarts: { ...carts, [actor]: nextItems } };
    });
  },

  setCartItemQty({ actor, drugId, qty }) {
    patch((s) => {
      const carts = s.pharmacyCarts ?? {};
      const mine = (carts[actor] ?? [])
        .map((i) => (i.drugId === drugId ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0);
      return { ...s, pharmacyCarts: { ...carts, [actor]: mine } };
    });
  },

  removeFromCart({ actor, drugId }) {
    patch((s) => {
      const carts = s.pharmacyCarts ?? {};
      const mine = (carts[actor] ?? []).filter((i) => i.drugId !== drugId);
      return { ...s, pharmacyCarts: { ...carts, [actor]: mine } };
    });
  },

  clearCart({ actor }) {
    patch((s) => ({ ...s, pharmacyCarts: { ...(s.pharmacyCarts ?? {}), [actor]: [] } }));
  },

  async placePharmacyOrder({ actor, delivery, note }) {
    const carts = state.pharmacyCarts?.[actor] ?? [];
    if (!carts.length) return;
    const items = carts.map((i) => ({ productId: i.drugId, quantity: i.qty }));
    try {
      const order = await call('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items,
          deliveryAddress: delivery?.method === 'delivery' && delivery?.address ? delivery.address : "",
        }),
      });
      patch((s) => {
        const catalog = Object.fromEntries((s.drugCatalog || []).map((d) => [d.id, d]));
        const lines = carts
          .map((i) => {
            const d = catalog[i.drugId];
            if (!d) return null;
            return {
              drugId: d.id,
              drug: d.name,
              strength: `${d.form} · ${d.strength}`,
              pack: d.pack,
              qty: i.qty,
              price: d.price,
              lineTotal: d.price * i.qty,
            };
          })
          .filter(Boolean);
        const subtotal = lines.reduce((n, i) => n + i.lineTotal, 0);
        const fee = delivery?.method === 'delivery' ? 0 : 0;
        return {
          ...s,
          pharmacyOrders: [
            {
              id: order?.id || uid('pho'),
              patientId: actor,
              patientName: `${s.users[actor]?.firstName ?? ''} ${s.users[actor]?.lastName ?? ''}`.trim() || actor,
              items: lines,
              subtotal,
              deliveryFee: fee,
              total: subtotal + fee,
              delivery: {
                method: delivery?.method ?? 'pickup',
                address:
                  delivery?.method === 'delivery'
                    ? delivery?.address || ''
                    : 'Carebridge Pharmacy, Ikeja',
                phone: delivery?.phone || '',
                fee,
              },
              status: 'placed',
              backendStatus: order?.status || 'pending',
              placedAt: order?.createdAt || new Date().toISOString(),
              note: note ?? '',
            },
            ...(s.pharmacyOrders || []),
          ],
          pharmacyCarts: { ...(s.pharmacyCarts ?? {}), [actor]: [] },
        };
      });
      scheduleRefresh();
    } catch (error) {
      console.error('Could not place pharmacy order', error.message);
    }
  },
};

export default { getState, useDB, resetDB, actions, hydrateFromBootstrap, refreshStore, hydratePublic };