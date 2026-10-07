/* ==========================================================================
   Seed data for the mock platform. All dates are generated relative to
   "today" so the demo always feels current. Deterministic seeded PRNG keeps
   generated schedules stable across reloads.
   ========================================================================== */

import { addDays, toISO, startOfDay, formatTimeHM, seeded, uid } from './format.js';

const rnd = seeded(42);

function dayAt(dayOffset, hour, minute = 0) {
  const d = startOfDay(addDays(dayOffset));
  d.setHours(hour, minute, 0, 0);
  return d;
}

function iso(offsetDays, hour, minute = 0) {
  return toISO(dayAt(offsetDays, hour, minute));
}

/* --------------------------------------------------------------------------
   Service lines (public specialty grid) + booking specialties
   -------------------------------------------------------------------------- */
export const serviceLines = [
  { id: 'sl-cancer', icon: 'Ribbon', name: 'Cancer Care', desc: 'A full spectrum of prevention, diagnosis and treatment from our oncologic specialists.', link: '/services/cancer-care' },
  { id: 'sl-heart', icon: 'HeartPulse', name: 'Heart & Vascular', desc: 'Leading-edge cardiology and vascular surgery from prevention to transplant.', link: '/services/heart-vascular' },
  { id: 'sl-neuro', icon: 'Brain', name: 'Neuroscience', desc: 'Care for the brain and nervous system — from headache clinics to complex surgery.', link: '/services/neuroscience' },
  { id: 'sl-women', icon: 'Baby', name: "Women's Health", desc: 'Obstetrics, gynecology, breast care and pelvic health for every stage of life.', link: '/services/womens-health' },
  { id: 'sl-ortho', icon: 'Activity', name: 'Orthopedics & Sports Medicine', desc: 'Bone, joint and spine care that gets people — including pro athletes — back in motion.', link: '/services/orthopedics' },
  { id: 'sl-children', icon: 'Stethoscope', name: "Children's Care", desc: 'Pediatric specialists caring for kids from the NICU through young adulthood.', link: '/services/pediatric-care' },
  { id: 'sl-behavioral', icon: 'Scale', name: 'Behavioral Health', desc: 'Psychiatry and therapy for everything from everyday stress to complex conditions.', link: '/services/behavioral-health' },
  { id: 'sl-transplant', icon: 'HeartHandshake', name: 'Transplant', desc: 'One of the country\'s most experienced transplant programs across 15 organ types.', link: '/services/transplant' },
  { id: 'sl-headneck', icon: 'Scan', name: 'Head & Neck Surgery', desc: 'Consultative and surgical care for conditions of the head, neck, ear, nose and throat across all ages.', link: '/services/head-neck-surgery' },
  { id: 'sl-psychiatry', icon: 'BrainCircuit', name: 'Psychiatry', desc: 'Specialized outpatient programs ranked among the best in the nation, for every age and condition.', link: '/services/psychiatry' },
];

export const bookingSpecialties = [
  { id: 'spec-primary', name: 'Primary Care / General Practice', short: 'Primary care', feeMin: 15000, feeMax: 25000 },
  { id: 'spec-cardio', name: 'Cardiology', short: 'Cardiology', feeMin: 30000, feeMax: 50000 },
  { id: 'spec-derma', name: 'Dermatology', short: 'Dermatology', feeMin: 20000, feeMax: 35000 },
  { id: 'spec-pedia', name: 'Pediatrics', short: 'Pediatrics', feeMin: 15000, feeMax: 25000 },
  { id: 'spec-ortho', name: 'Orthopedics', short: 'Orthopedics', feeMin: 30000, feeMax: 60000 },
  { id: 'spec-neuro', name: 'Neurology', short: 'Neurology', feeMin: 35000, feeMax: 60000 },
  { id: 'spec-obgyn', name: "OB/GYN & Women's Health", short: 'OB/GYN', feeMin: 25000, feeMax: 45000 },
  { id: 'spec-behavioral', name: 'Behavioral Health', short: 'Behavioral health', feeMin: 20000, feeMax: 35000 },
  { id: 'spec-endocr', name: 'Endocrinology', short: 'Endocrinology', feeMin: 25000, feeMax: 40000 },
  { id: 'spec-urgent', name: 'Immediate Care', short: 'Urgent care', feeMin: 20000, feeMax: 30000 },
];

/* --------------------------------------------------------------------------
   People (users)
   -------------------------------------------------------------------------- */
const makeUser = (id, firstName, lastName, role, email) => ({ id, firstName, lastName, role, email });

export const users = [
  makeUser('u-patient', 'Ngozi', 'Obi', 'patient', 'ngozi.obi@example.com'),
  makeUser('u-patient2', 'Ifeanyi', 'Okafor', 'patient', 'ifeanyi.okafor@example.com'),
  makeUser('u-dr-carter', 'Ifeoma', 'Carter', 'provider', 'dr.carter@carebridge.ng'),
  makeUser('u-dr-whitfield', 'Samuel', 'Yakubu', 'provider', 'dr.whitfield@carebridge.ng'),
  makeUser('u-dr-alvarez', 'Amaka', 'Eze', 'provider', 'dr.alvarez@carebridge.ng'),
  makeUser('u-dr-haddad', 'Omar', 'Haddad', 'provider', 'dr.haddad@carebridge.ng'),
  makeUser('u-dr-okafor', 'Kehinde', 'Okafor', 'provider', 'dr.okafor@carebridge.ng'),
  makeUser('u-dr-romero', 'Adaeze', 'Okonkwo', 'provider', 'dr.romero@carebridge.ng'),
  makeUser('u-dr-fontaine', 'Musa', 'Ibrahim', 'provider', 'dr.fontaine@carebridge.ng'),
  makeUser('u-nurse-kim', 'Fatima', 'Bello', 'nurse', 'r.kim@carebridge.ng'),
  makeUser('u-nurse-bell', 'Grace', 'Adebayo', 'nurse', 't.bell@carebridge.ng'),
  makeUser('u-pharm-patel', 'Kunle', 'Salami', 'pharmacist', 'd.patel@carebridge.ng'),
  makeUser('u-lab-singh', 'Chidinma', 'Nwosu', 'lab_tech', 'p.singh@carebridge.ng'),
  makeUser('u-admin-zhang', 'Tunde', 'Adebayo', 'admin', 'a.zhang@carebridge.ng'),
  makeUser('u-fd-lopez', 'Bisi', 'Ogunleye', 'front_desk', 'd.lopez@carebridge.ng'),
];

/* --------------------------------------------------------------------------
   Providers
   -------------------------------------------------------------------------- */
export const providers = [
  {
    userId: 'u-dr-carter', id: 'prv-carter', specialty: 'spec-cardio', specialtyName: 'Cardiology',
    rating: 4.8, reviews: 134, languages: ['English', 'Igbo'], acceptsNewPatients: true, bookOnline: true,
    location: 'Carebridge Medical Centre, Ikeja', image: null, bio: 'Interventional cardiologist focused on preventive heart health and minimally invasive procedures.',
    title: 'MBBS, FWACP',
  },
  {
    userId: 'u-dr-whitfield', id: 'prv-whitfield', specialty: 'spec-primary', specialtyName: 'Primary Care / General Practice',
    rating: 4.9, reviews: 218, languages: ['English'], acceptsNewPatients: true, bookOnline: true,
    location: 'Carebridge Yaba Clinic', image: null, bio: 'Board-certified family medicine physician with a special interest in longitudinal preventive care.',
    title: 'MBBS',
  },
  {
    userId: 'u-dr-alvarez', id: 'prv-alvarez', specialty: 'spec-pedia', specialtyName: 'Pediatrics',
    rating: 4.9, reviews: 176, languages: ['English', 'Yoruba'], acceptsNewPatients: true, bookOnline: true,
    location: 'Carebridge Medical Centre, Ikeja', image: null, bio: 'Pediatrician focused on childhood development, asthma and adolescent medicine.',
    title: 'MBBS, FWACP',
  },
  {
    userId: 'u-dr-haddad', id: 'prv-haddad', specialty: 'spec-derma', specialtyName: 'Dermatology',
    rating: 4.7, reviews: 98, languages: ['English', 'Hausa'], acceptsNewPatients: true, bookOnline: true,
    location: 'Carebridge Wuse Clinic', image: null, bio: 'Dermatologist specializing in medical and surgical dermatology including skin cancer screening.',
    title: 'MBBS, FMCDS',
  },
  {
    userId: 'u-dr-okafor', id: 'prv-okafor', specialty: 'spec-ortho', specialtyName: 'Orthopedics',
    rating: 4.8, reviews: 152, languages: ['English'], acceptsNewPatients: true, bookOnline: false,
    location: 'Carebridge GRA Clinic, Port Harcourt', image: null, bio: 'Orthopedic surgeon focused on sports injuries, arthroscopic surgery and joint preservation.',
    title: 'MBBS',
  },
  {
    userId: 'u-dr-romero', id: 'prv-romero', specialty: 'spec-obgyn', specialtyName: "OB/GYN & Women's Health",
    rating: 4.9, reviews: 191, languages: ['English', 'Yoruba'], acceptsNewPatients: true, bookOnline: true,
    location: 'Carebridge Medical Centre, Ikeja', image: null, bio: 'Obstetrician-gynecologist with a focus on minimally invasive gynecologic surgery and prenatal care.',
    title: 'MBBS, FWACS',
  },
  {
    userId: 'u-dr-fontaine', id: 'prv-fontaine', specialty: 'spec-neuro', specialtyName: 'Neurology',
    rating: 4.8, reviews: 87, languages: ['English', 'Hausa'], acceptsNewPatients: true, bookOnline: false,
    location: 'Carebridge Medical Centre, Ikeja', image: null, bio: 'Neurologist specializing in headache medicine and neurovascular disorders.',
    title: 'MBBS',
  },
];

const SLOT_TIMES = [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 13, 13.5, 14, 14.5, 15, 15.5, 16];

function bookedSlotsFor(providerIndex, dayOffset) {
  const rand = seeded(1000 + providerIndex * 31 + dayOffset);
  const count = 3 + Math.floor(rand() * 4);
  const taken = [];
  const pool = [...SLOT_TIMES];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(rand() * pool.length);
    taken.push(pool.splice(idx, 1)[0]);
  }
  return taken;
}

/* Generate appointments across the next 5 days for every provider */
export const appointments = [];
providers.forEach((pv, pIdx) => {
  [3, 2, 1].forEach((pastOffset, dayIdx) => {
    const t = [9, 10.5, 14][dayIdx];
    const hour = Math.floor(t);
    const minute = Math.round((t - hour) * 60);
    appointments.push({
      id: uid('appt'),
      providerId: pv.id,
      patientId: 'u-patient',
      type: dayIdx === 2 || dayIdx === 1 ? 'in-person' : 'video',
      date: iso(-pastOffset, hour, minute),
      durationMin: 30,
      status: 'completed',
      reason: dayIdx === 0 ? 'Routine cardiac follow-up' : dayIdx === 1 ? 'Annual physical' : 'Lab review',
      room: 'Exam 4',
      checkinAt: dayIdx === 0 ? iso(-pastOffset, hour - 1, 5) : null,
    });
  });

  for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
    const booked = bookedSlotsFor(pIdx, dayOffset);
    booked.forEach((t, i) => {
      const hour = Math.floor(t);
      const minute = Math.round((t - hour) * 60);
      const hasPatient = i % 3 === 0;
      appointments.push({
        id: uid('appt'),
        providerId: pv.id,
        patientId: hasPatient ? (i % 2 === 0 ? 'u-patient' : 'u-patient2') : null,
        type: i % 4 === 0 ? 'video' : 'in-person',
        date: iso(dayOffset, hour, minute),
        durationMin: 30,
        status: hasPatient ? 'scheduled' : 'open',
        reason: hasPatient ? (i % 2 === 0 ? 'Follow-up visit' : 'New patient consult') : null,
        room: 'Exam ' + ((i % 6) + 1),
        checkinAt: null,
      });
    });
  }
});

/* --------------------------------------------------------------------------
   Patients
   -------------------------------------------------------------------------- */
export const patients = [
  {
    userId: 'u-patient',
    dob: '1987-04-12',
    gender: 'Female',
    phone: '+234 803 555 0148',
    address: { street: '14 Admiralty Way', city: 'Lekki', state: 'Lagos', zip: '106104' },
    emergencyContact: { name: 'Emeka Obi', relation: 'Spouse', phone: '+234 802 555 0192' },
    insurance: {
      provider: 'Hygeia HMO', memberId: 'HMO-8842-1190', group: 'GRP-3344',
      plan: 'Premium Plus', copay: 5000, deductibleMet: 50000, outOfPocketMax: 300000,
      verified: true, effectiveDate: '2026-01-01',
    },
    allergies: ['Penicillin', 'Latex'],
    medications: ['Atorvastatin 20 mg', 'Lisinopril 10 mg', 'Multivitamin'],
    conditions: ['Hyperlipidemia', 'Stage 1 Hypertension', 'Mild seasonal allergies'],
    reason: 'Established patient since 2019',
  },
  {
    userId: 'u-patient2',
    dob: '1992-09-30',
    gender: 'Male',
    phone: '+234 805 555 0171',
    address: { street: '12 Aminu Kano Crescent', city: 'Wuse II', state: 'FCT', zip: '900001' },
    emergencyContact: { name: 'Nkechi Okafor', relation: 'Sister', phone: '+234 806 555 0140' },
    insurance: {
      provider: 'AXA Mansard Health', memberId: 'AXM-5510-2284', group: 'GRP-8891',
      plan: 'Family Care Plan', copay: 6000, deductibleMet: 60000, outOfPocketMax: 350000,
      verified: true, effectiveDate: '2026-03-01',
    },
    allergies: ['Sulfa drugs', 'Peanuts'],
    medications: ['Levothyroxine 50 mcg'],
    conditions: ['Hypothyroidism', 'Asthma'],
    reason: 'Established patient since 2021',
  },
];

/* --------------------------------------------------------------------------
   Encounters / visit notes (for the provider chart)
   -------------------------------------------------------------------------- */
export const encounters = [
  {
    id: 'enc-1', patientId: 'u-patient', providerId: 'prv-carter', date: iso(-21, 10, 0), type: 'in-person',
    reason: 'Routine cardiac follow-up', status: 'completed',
    vitals: { bp: '124/82', hr: 74, temp: '98.2°F', weight: '168 lbs', height: "5' 6\"" },
    note: 'Patient reports good energy levels and no chest discomfort. Lipid panel reviewed; LDL trending down with atorvastatin adherence. Continue current plan, recheck labs in 3 months.',
    plan: ['Continue atorvastatin 20 mg nightly', 'Recheck lipid panel in 12 weeks', 'Aerobic exercise 150 min/week'],
  },
  {
    id: 'enc-2', patientId: 'u-patient', providerId: 'prv-whitfield', date: iso(-60, 9, 30), type: 'in-person',
    reason: 'Annual physical', status: 'completed',
    vitals: { bp: '130/84', hr: 78, temp: '98.4°F', weight: '170 lbs', height: "5' 6\"" },
    note: 'Annual physical. BP mildly elevated, discussed DASH diet and sodium reduction. Labs drawn today. Seasonal allergies well controlled.',
    plan: ['Begin stage-1 hypertension monitoring', 'Dietary sodium reduction', 'Follow-up labs in 6 months'],
  },
  {
    id: 'enc-3', patientId: 'u-patient2', providerId: 'prv-whitfield', date: iso(-34, 14, 0), type: 'video',
    reason: 'Asthma management check', status: 'completed',
    vitals: { bp: '118/76', hr: 70, temp: '—', weight: '—', height: '—' },
    note: 'Video follow-up. Using albuterol rescue inhaler ~2x/week, well controlled. Refilled maintenance inhaler.',
    plan: ['Continue maintenance inhaler daily', 'Rinse inhaler daily', 'Return in 6 months'],
  },
];

/* --------------------------------------------------------------------------
   Prescriptions
   -------------------------------------------------------------------------- */
export const prescriptions = [
  {
    id: 'rx-1', patientId: 'u-patient', providerId: 'prv-carter', drug: 'Atorvastatin', strength: '20 mg',
    directions: 'Take 1 tablet by mouth every evening', refillsRemaining: 3, quantity: 30,
    prescribedAt: iso(-45, 11, 0), expiresAt: iso(320, 0, 0), status: 'active', lastRefill: iso(-9, 9, 0),
  },
  {
    id: 'rx-2', patientId: 'u-patient', providerId: 'prv-whitfield', drug: 'Lisinopril', strength: '10 mg',
    directions: 'Take 1 tablet by mouth every morning', refillsRemaining: 1, quantity: 30,
    prescribedAt: iso(-55, 10, 0), expiresAt: iso(5, 0, 0), status: 'active', lastRefill: iso(-12, 9, 0),
  },
  {
    id: 'rx-3', patientId: 'u-patient', providerId: 'prv-whitfield', drug: 'Cetirizine', strength: '10 mg',
    directions: 'Take 1 tablet by mouth daily as needed for allergy symptoms', refillsRemaining: 4, quantity: 90,
    prescribedAt: iso(-120, 11, 0), expiresAt: iso(245, 0, 0), status: 'active', lastRefill: iso(-40, 14, 0),
  },
  {
    id: 'rx-4', patientId: 'u-patient', providerId: 'prv-carter', drug: 'Aspirin', strength: '81 mg',
    directions: 'Take 1 tablet by mouth daily', refillsRemaining: 0, quantity: 90,
    prescribedAt: iso(-200, 9, 0), expiresAt: iso(-10, 0, 0), status: 'expired', lastRefill: iso(-110, 9, 0),
  },
];

/* --------------------------------------------------------------------------
   Lab orders + results
   -------------------------------------------------------------------------- */
export const labResults = [
  {
    id: 'lab-1', patientId: 'u-patient', providerId: 'prv-carter', name: 'Lipid Panel', orderedAt: iso(-21, 10, 0),
    resultedAt: iso(-19, 15, 30), status: 'final', summary: 'Your cholesterol is improving — total cholesterol is now in the normal range and your LDL continues to trend down.',
    components: [
      { name: 'Total Cholesterol', value: '178', unit: 'mg/dL', range: '<200', status: 'normal' },
      { name: 'LDL Cholesterol', value: '101', unit: 'mg/dL', range: '<130', status: 'normal' },
      { name: 'HDL Cholesterol', value: '52', unit: 'mg/dL', range: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '142', unit: 'mg/dL', range: '<150', status: 'normal' },
    ],
    flagged: false,
  },
  {
    id: 'lab-2', patientId: 'u-patient', providerId: 'prv-carter', name: 'Hemoglobin A1c', orderedAt: iso(-21, 10, 0),
    resultedAt: iso(-19, 15, 30), status: 'final', summary: 'Your average blood sugar over the last 3 months is in the normal range.',
    components: [{ name: 'HbA1c', value: '5.4', unit: '%', range: '4.0 - 5.6', status: 'normal' }],
    flagged: false,
  },
  {
    id: 'lab-3', patientId: 'u-patient', providerId: 'prv-whitfield', name: 'Comprehensive Metabolic Panel', orderedAt: iso(-58, 9, 30),
    resultedAt: iso(-57, 12, 0), status: 'final', summary: 'Most values are within normal limits. Your fasting glucose is slightly above range — this often relates to what you ate the night before.',
    components: [
      { name: 'Fasting Glucose', value: '102', unit: 'mg/dL', range: '70 - 99', status: 'above' },
      { name: 'Creatinine', value: '0.9', unit: 'mg/dL', range: '0.6 - 1.1', status: 'normal' },
      { name: 'Potassium', value: '4.1', unit: 'mmol/L', range: '3.5 - 5.0', status: 'normal' },
      { name: 'Sodium', value: '139', unit: 'mmol/L', range: '136 - 145', status: 'normal' },
      { name: 'ALT', value: '22', unit: 'U/L', range: '7 - 56', status: 'normal' },
    ],
    flagged: true,
  },
  {
    id: 'lab-4', patientId: 'u-patient2', providerId: 'prv-whitfield', name: 'CBC with Differential', orderedAt: iso(-6, 9, 0),
    resultedAt: iso(-5, 11, 15), status: 'final', summary: 'All blood cell counts are within normal limits.',
    components: [
      { name: 'Hemoglobin', value: '14.8', unit: 'g/dL', range: '12.0 - 15.5', status: 'normal' },
      { name: 'WBC', value: '6.1', unit: 'K/uL', range: '4.0 - 11.0', status: 'normal' },
      { name: 'Platelets', value: '245', unit: 'K/uL', range: '150 - 400', status: 'normal' },
    ],
    flagged: false,
  },
];

export const labOrders = [
  { id: 'lbo-1', providerId: 'prv-carter', patientId: 'u-patient', name: 'Lipid Panel', orderedAt: iso(-2, 10, 0), status: 'pending_collection' },
  { id: 'lbo-2', providerId: 'prv-carter', patientId: 'u-patient', name: 'TSH', orderedAt: iso(-2, 10, 0), status: 'pending_collection' },
  { id: 'lbo-3', providerId: 'prv-whitfield', patientId: 'u-patient2', name: 'CMP', orderedAt: iso(-1, 9, 0), status: 'in_progress' },
  { id: 'lbo-4', providerId: 'prv-alvarez', patientId: 'u-patient2', name: 'CBC with Differential', orderedAt: iso(-1, 14, 0), status: 'resulted' },
];

/* --------------------------------------------------------------------------
   Messaging
   -------------------------------------------------------------------------- */
const mkThread = (id, participants, subject, messages) => ({ id, participants, subject, messages });

export const threads = [
  mkThread('th-1', ['u-patient', 'u-dr-carter'], 'Question about my latest lipid panel', [
    { id: uid('msg'), from: 'u-patient', body: 'Hi Dr. Carter — I got a notification that my lipid panel results are ready. Could you review them and let me know if my LDL is where we want it?', at: iso(-1, 18, 24), read: true },
    { id: uid('msg'), from: 'u-dr-carter', body: 'Hi Ngozi, yes — I reviewed it. Your LDL came in at 101, down from 128 last year. That\'s right in our target range. Keep up the consistent exercise and we\'ll recheck in 3 months.', at: iso(-1, 19, 2), read: true },
    { id: uid('msg'), from: 'u-patient', body: 'That\u2019s great news, thank you! Should I keep the atorvastatin at 20 mg?', at: iso(0, 7, 41), read: false },
  ]),
  mkThread('th-2', ['u-patient', 'u-dr-whitfield'], 'Lab result question — fasting glucose', [
    { id: uid('msg'), from: 'u-dr-whitfield', body: 'Hi Ngozi — I wanted to touch base on your fasting glucose result of 102. It\'s just slightly above range and not concerning on its own, but I\'d like to check it again in a few weeks.', at: iso(-3, 12, 15), read: true },
    { id: uid('msg'), from: 'u-patient', body: 'Thanks doctor. Any changes I should make before then?', at: iso(-3, 13, 20), read: true },
    { id: uid('msg'), from: 'u-dr-whitfield', body: 'Nothing drastic — focus on minimizing late-night snacks and keep your usual activity. I sent you an order for a fasting glucose recheck.', at: iso(-3, 14, 5), read: true },
    { id: uid('msg'), from: 'u-patient', body: 'Got it. I\'ll schedule the lab draw this week.', at: iso(-2, 9, 55), read: true },
  ]),
  mkThread('th-3', ['u-patient2', 'u-dr-whitfield'], 'Prescription refill — maintenance inhaler', [
    { id: uid('msg'), from: 'u-patient2', body: 'Hello — I\'m running low on my maintenance inhaler and would like a refill.', at: iso(-1, 9, 10), read: true },
    { id: uid('msg'), from: 'u-dr-whitfield', body: 'Hi Ifeanyi — approved. I\'ve sent the refill to the pharmacy you have on file; it should be ready within a few hours.', at: iso(-1, 11, 47), read: true },
  ]),
  mkThread('th-4', ['u-dr-carter', 'u-patient'], 'Follow-up available Thursday', [
    { id: uid('msg'), from: 'u-dr-whitfield', body: 'FYI: I have an opening Thursday at 2:00 pm if you\'d like to review the glucose recheck in person.', at: iso(0, 8, 12), read: false },
  ]),
];

/* --------------------------------------------------------------------------
   Billing
   -------------------------------------------------------------------------- */
export const invoices = [
  {
    id: 'inv-1', patientId: 'u-patient', date: iso(-58, 12, 0), dueDate: iso(-28, 0, 0),
    description: 'Annual physical — Dr. Yakubu', provider: 'Dr. Samuel Yakubu',
    amount: 245000, insuranceCovered: 160000, patientResponsibility: 85000, status: 'paid', paidAt: iso(-30, 9, 0),
  },
  {
    id: 'inv-2', patientId: 'u-patient', date: iso(-24, 12, 0), dueDate: iso(6, 0, 0),
    description: 'Cardiology follow-up + lipid panel', provider: 'Dr. Ifeoma Carter',
    amount: 340000, insuranceCovered: 197500, patientResponsibility: 142500, status: 'open', paidAt: null,
  },
  {
    id: 'inv-3', patientId: 'u-patient', date: iso(-60, 12, 0), dueDate: iso(-30, 0, 0),
    description: 'Lab — Comprehensive Metabolic Panel', provider: 'Carebridge Clinical Labs',
    amount: 120000, insuranceCovered: 120000, patientResponsibility: 0, status: 'paid', paidAt: iso(-40, 8, 0),
  },
];

/* --------------------------------------------------------------------------
   Notifications
   -------------------------------------------------------------------------- */
export const notifications = [
  { id: uid('n'), userId: 'u-patient', type: 'lab', title: 'Lab results available', body: 'Your Lipid Panel results are ready to review.', at: iso(-1, 15, 30), read: true, link: '/portal/patient/labs' },
  { id: uid('n'), userId: 'u-patient', type: 'message', title: 'New message from Dr. Carter', body: 'Re: Question about my latest lipid panel', at: iso(0, 7, 42), read: false, link: '/portal/patient/messages' },
  { id: uid('n'), userId: 'u-patient', type: 'appointment', title: 'Upcoming follow-up', body: 'Cardiology follow-up with Dr. Carter in 3 days.', at: iso(-1, 8, 0), read: false, link: '/portal/patient/appointments' },
  { id: uid('n'), userId: 'u-patient', type: 'billing', title: 'New statement available', body: 'Invoice #INV-2 is now due in 6 days.', at: iso(-2, 9, 0), read: true, link: '/portal/patient/billing' },
  { id: uid('n'), userId: 'u-dr-carter', type: 'results', title: 'Lab results ready for review', body: '2 orders have resulted and are waiting for sign-off.', at: iso(-1, 15, 34), read: false, link: '/portal/provider/results' },
  { id: uid('n'), userId: 'u-dr-carter', type: 'schedule', title: 'New appointment booked', body: 'Ifeanyi Okafor booked a video visit for tomorrow at 1:00 pm.', at: iso(0, 6, 12), read: false, link: '/portal/provider/schedule' },
  { id: uid('n'), userId: 'u-admin-zhang', type: 'report', title: 'Weekly occupancy report ready', body: 'Friday morning occupancy was at 84% across three sites.', at: iso(-1, 17, 0), read: false, link: '/portal/admin/reports' },
  { id: uid('n'), userId: 'u-nurse-kim', type: 'queue', title: 'Patients waiting', body: '2 patients are checked in and waiting for their rooms.', at: iso(0, 9, 22), read: false, link: '/portal/nurse/queue' },
  { id: uid('n'), userId: 'u-pharm-patel', type: 'prescription', title: 'Refill requests waiting', body: '3 prescriptions are ready to fill in the fulfillment queue.', at: iso(0, 8, 40), read: true, link: '/portal/pharmacist/orders' },
  { id: uid('n'), userId: 'u-lab-singh', type: 'results', title: 'Specimen collected', body: 'Lipid Panel for Ngozi Obi is ready to process.', at: iso(0, 9, 5), read: false, link: '/portal/lab/orders' },
  { id: uid('n'), userId: 'u-fd-lopez', type: 'appointment', title: 'Walk-in scheduled', body: 'Amos Edeh checked in for a BP check with Dr. Carter.', at: iso(0, 8, 56), read: false, link: '/portal/front-desk/checkins' },
];

/* --------------------------------------------------------------------------
   Facilities / rooms + staff for admin
   -------------------------------------------------------------------------- */
export const facilities = [
  { id: 'fac-1', name: 'Carebridge Medical Centre, Ikeja', rooms: ['ER-1', 'ER-2', 'ER-3', 'ER-4', 'ICU-1', 'ICU-2'], bedsTotal: 120, bedsOccupied: 98 },
  { id: 'fac-2', name: 'Carebridge Wuse Clinic', rooms: ['Exam 1', 'Exam 2', 'Exam 3', 'Exam 4'], bedsTotal: 0, bedsOccupied: 0 },
  { id: 'fac-3', name: 'Carebridge Yaba Clinic', rooms: ['Exam 1', 'Exam 2', 'Exam 3'], bedsTotal: 0, bedsOccupied: 0 },
];

export const staffRoster = [
  { id: uid('st'), name: 'Dr. Ifeoma Carter', role: 'Provider', dept: 'Cardiology', shift: 'Day', onDuty: true, userId: 'u-dr-carter' },
  { id: uid('st'), name: 'Dr. Samuel Yakubu', role: 'Provider', dept: 'Primary Care', shift: 'Day', onDuty: true, userId: 'u-dr-whitfield' },
  { id: uid('st'), name: 'Dr. Amaka Eze', role: 'Provider', dept: 'Pediatrics', shift: 'Day', onDuty: false, userId: 'u-dr-alvarez' },
  { id: uid('st'), name: 'Dr. Omar Haddad', role: 'Provider', dept: 'Dermatology', shift: 'Day', onDuty: true, userId: 'u-dr-haddad' },
  { id: uid('st'), name: 'Fatima Bello', role: 'Nurse', dept: 'Cardiology', shift: 'Day', onDuty: true, userId: 'u-nurse-kim' },
  { id: uid('st'), name: 'Grace Adebayo', role: 'Nurse', dept: 'Primary Care', shift: 'Evening', onDuty: true, userId: 'u-nurse-bell' },
  { id: uid('st'), name: 'Kunle Salami', role: 'Pharmacist', dept: 'Pharmacy', shift: 'Day', onDuty: true, userId: 'u-pharm-patel' },
  { id: uid('st'), name: 'Chidinma Nwosu', role: 'Lab Technician', dept: 'Laboratory', shift: 'Day', onDuty: true, userId: 'u-lab-singh' },
  { id: uid('st'), name: 'Tunde Adebayo', role: 'Administrator', dept: 'Operations', shift: 'Day', onDuty: true, userId: 'u-admin-zhang' },
  { id: uid('st'), name: 'Bisi Ogunleye', role: 'Front Desk', dept: 'Operations', shift: 'Day', onDuty: true, userId: 'u-fd-lopez' },
];

/* Check-in queue (admin / nurse view) */
export const checkins = [
  { id: uid('ci'), name: 'Amos Edeh', dob: '1955-01-09', providerId: 'prv-carter', room: 'Exam 2', status: 'waiting', arrivedAt: iso(0, 8, 55), vitals: null, reason: 'BP check' },
  { id: uid('ci'), name: 'Yetunde Bakare', dob: '1989-06-22', providerId: 'prv-carter', room: 'Exam 4', status: 'in_room', arrivedAt: iso(0, 9, 10), vitals: { bp: '128/80', hr: 72, temp: '98.0°F' }, reason: 'Chest pressure follow-up' },
  { id: uid('ci'), name: 'Emeka Nwankwo', dob: '1977-11-03', providerId: 'prv-whitfield', room: 'Exam 1', status: 'waiting', arrivedAt: iso(0, 9, 20), vitals: null, reason: 'Annual physical' },
  { id: uid('ci'), name: 'Aisha Mohammed', dob: '1995-03-17', providerId: 'prv-whitfield', room: 'Exam 3', status: 'completed', arrivedAt: iso(0, 8, 40), vitals: { bp: '118/76', hr: 68, temp: '97.8°F' }, reason: 'Allergies follow-up' },
];

/* Pharmacy fulfillment queue (pharmacist view) */
export const pharmacyQueue = [
  { id: uid('phq'), patientName: 'Ifeanyi Okafor', drug: 'Fluticasone inhaler', strength: '220 mcg', directions: '2 puffs by mouth daily', status: 'ready_to_fill', requestedAt: iso(-1, 11, 48), rxId: 'rx-m1', assurance: 'High-alert check passed' },
  { id: uid('phq'), patientName: 'Ngozi Obi', drug: 'Lisinopril', strength: '10 mg', directions: '1 tablet by mouth every morning', status: 'ready_to_fill', requestedAt: iso(-1, 14, 2), rxId: 'rx-2', assurance: 'High-alert check passed' },
  { id: uid('phq'), patientName: 'Amos Edeh', drug: 'Amlodipine', strength: '5 mg', directions: '1 tablet by mouth daily', status: 'awaiting_verification', requestedAt: iso(0, 8, 30), rxId: 'rx-m2', assurance: 'Duplicate therapy — resolved' },
  { id: uid('phq'), patientName: 'Yetunde Bakare', drug: 'Metoprolol tartrate', strength: '25 mg', directions: '1/2 tablet by mouth twice daily', status: 'fulfilled', requestedAt: iso(0, 7, 45), rxId: 'rx-m3', assurance: 'Allergies reviewed' },
];

/* Online drug catalog (patient buys directly from Carebridge Pharmacy) */
export const drugCatalog = [
  {
    id: 'dr-1', name: 'Paracetamol', generic: 'Acetaminophen', form: 'Tablet', strength: '500 mg', pack: 'Pack of 20',
    price: 450, category: 'Pain & fever', requiresPrescription: false, inStock: true, manufacturer: 'Emzor',
    desc: 'For mild to moderate pain and fever — safe for adults and children over 12.',
  },
  {
    id: 'dr-2', name: 'Ibuprofen', generic: 'Nurofen', form: 'Tablet', strength: '200 mg', pack: 'Pack of 12',
    price: 320, category: 'Pain & fever', requiresPrescription: false, inStock: true, manufacturer: 'Pfizer',
    desc: 'Anti-inflammatory pain relief for headaches, muscle aches and period pain.',
  },
  {
    id: 'dr-3', name: 'Aspirin', generic: 'Acetylsalicylic acid', form: 'Tablet', strength: '81 mg', pack: 'Pack of 30',
    price: 280, category: 'Pain & fever', requiresPrescription: false, inStock: true, manufacturer: 'Bayer',
    desc: 'Low-dose daily aspirin tablet for heart-protective therapy as advised by your doctor.',
  },
  {
    id: 'dr-4', name: 'Cetirizine', generic: 'Zyrtec', form: 'Tablet', strength: '10 mg', pack: 'Pack of 30',
    price: 900, category: 'Allergy & cold', requiresPrescription: true, inStock: true, manufacturer: 'Emzor',
    desc: 'Once-daily allergy relief for hay fever, hives and itchy eyes.',
  },
  {
    id: 'dr-5', name: 'Loratadine', generic: 'Claritin', form: 'Tablet', strength: '10 mg', pack: 'Pack of 30',
    price: 1100, category: 'Allergy & cold', requiresPrescription: false, inStock: true, manufacturer: 'Bayer',
    desc: 'Non-drowsy antihistamine for seasonal allergies and pet allergies.',
  },
  {
    id: 'dr-6', name: 'Chlorpheniramine syrup', generic: 'Piriton', form: 'Syrup', strength: '4 mg / 5 ml', pack: '100 ml bottle',
    price: 700, category: 'Allergy & cold', requiresPrescription: false, inStock: true, manufacturer: 'Fidson',
    desc: 'Syrup for allergy, cold and seasonal sniffles — suitable for children.',
  },
  {
    id: 'dr-7', name: 'Omeprazole', generic: 'OTC acid reducer', form: 'Capsule', strength: '20 mg', pack: 'Pack of 7',
    price: 850, category: 'Digestion', requiresPrescription: false, inStock: true, manufacturer: 'May & Baker',
    desc: 'Reduces stomach acid to treat heartburn, acid reflux and ulcers.',
  },
  {
    id: 'dr-8', name: 'Oral Rehydration Salts', generic: 'ORS', form: 'Sachet', strength: '20.5 g', pack: 'Pack of 10',
    price: 400, category: 'Digestion', requiresPrescription: false, inStock: true, manufacturer: 'Evans',
    desc: 'Replenishes fluids and electrolytes lost through diarrhoea or vomiting.',
  },
  {
    id: 'dr-9', name: 'Antacid suspension', generic: 'Milk of magnesia blend', form: 'Suspension', strength: '200 ml', pack: '200 ml bottle',
    price: 600, category: 'Digestion', requiresPrescription: false, inStock: true, manufacturer: 'Fidson',
    desc: 'Fast relief from heartburn and indigestion after heavy meals.',
  },
  {
    id: 'dr-10', name: 'Multivitamin', generic: 'Daily essentials', form: 'Tablet', strength: 'A–Z', pack: 'Pack of 60',
    price: 3200, category: 'Vitamins & supplements', requiresPrescription: false, inStock: true, manufacturer: 'Seven Seas',
    desc: 'Broad daily multivitamin covering 23 essential vitamins and minerals.',
  },
  {
    id: 'dr-11', name: 'Vitamin C', generic: 'Ascorbic acid', form: 'Tablet', strength: '1000 mg', pack: 'Pack of 60',
    price: 2100, category: 'Vitamins & supplements', requiresPrescription: false, inStock: true, manufacturer: 'Emzor',
    desc: 'High-dose vitamin C to support immune function through the season.',
  },
  {
    id: 'dr-12', name: 'Prenatal vitamins', generic: 'Folic acid + iron', form: 'Tablet', strength: 'Daily', pack: 'Pack of 30',
    price: 4500, category: 'Vitamins & supplements', requiresPrescription: false, inStock: true, manufacturer: 'Seven Seas',
    desc: 'Folate, iron and DHA tailored for pregnancy and breastfeeding.',
  },
  {
    id: 'dr-13', name: 'Salbutamol inhaler', generic: 'Albuterol', form: 'Inhaler', strength: '100 mcg', pack: 'Single inhaler',
    price: 3500, category: 'Asthma & respiratory', requiresPrescription: true, inStock: true, manufacturer: 'GSK',
    desc: 'Reliever inhaler that opens the airways quickly during an asthma attack.',
  },
  {
    id: 'dr-14', name: 'Fluticasone inhaler', generic: 'Advair-style controller', form: 'Inhaler', strength: '220 mcg', pack: 'Single inhaler',
    price: 12000, category: 'Asthma & respiratory', requiresPrescription: true, inStock: true, manufacturer: 'GSK',
    desc: 'Daily maintenance inhaler to prevent asthma symptoms and flare-ups.',
  },
  {
    id: 'dr-15', name: 'Atorvastatin', generic: 'Lipitor', form: 'Tablet', strength: '20 mg', pack: 'Pack of 30',
    price: 4500, category: 'Heart & blood pressure', requiresPrescription: true, inStock: true, manufacturer: 'Emzor',
    desc: 'Statin that lowers LDL cholesterol and reduces cardiovascular risk.',
  },
  {
    id: 'dr-16', name: 'Lisinopril', generic: 'Prinivil', form: 'Tablet', strength: '10 mg', pack: 'Pack of 30',
    price: 3900, category: 'Heart & blood pressure', requiresPrescription: true, inStock: true, manufacturer: 'May & Baker',
    desc: 'ACE inhibitor used to treat high blood pressure and heart failure.',
  },
  {
    id: 'dr-17', name: 'Amlodipine', generic: 'Norvasc', form: 'Tablet', strength: '5 mg', pack: 'Pack of 30',
    price: 2800, category: 'Heart & blood pressure', requiresPrescription: true, inStock: true, manufacturer: 'Pfizer',
    desc: 'Calcium-channel blocker for high blood pressure and angina.',
  },
  {
    id: 'dr-18', name: 'Metformin', generic: 'Glucophage', form: 'Tablet', strength: '500 mg', pack: 'Pack of 60',
    price: 3500, category: 'Diabetes', requiresPrescription: true, inStock: true, manufacturer: 'Merck',
    desc: 'First-line tablets for type 2 diabetes to control blood sugar.',
  },
  {
    id: 'dr-19', name: 'Blood glucose meter kit', generic: 'Glucometer', form: 'Kit', strength: 'Meter + strips', pack: '50 strips',
    price: 8500, category: 'Diabetes', requiresPrescription: false, inStock: true, manufacturer: 'Roche',
    desc: 'Everything needed to monitor blood sugar at home.',
  },
  {
    id: 'dr-20', name: 'Zinc oxide ointment', generic: 'Healing cream', form: 'Ointment', strength: '10 %', pack: '50 g tube',
    price: 1200, category: 'First aid & skin', requiresPrescription: false, inStock: true, manufacturer: 'Fidson',
    desc: 'Soothes rashes, nappy rash, burns and minor wounds.',
  },
  {
    id: 'dr-21', name: 'Chlorhexidine solution', generic: 'Antiseptic', form: 'Solution', strength: '4 %', pack: '200 ml bottle',
    price: 1500, category: 'First aid & skin', requiresPrescription: false, inStock: true, manufacturer: 'Evans',
    desc: 'Skin antiseptic for cleaning cuts, scrapes and surgical sites.',
  },
  {
    id: 'dr-22', name: 'Cough syrup', generic: 'Dextromethorphan', form: 'Syrup', strength: '15 mg/5 ml', pack: '100 ml bottle',
    price: 950, category: 'Allergy & cold', requiresPrescription: false, inStock: true, manufacturer: 'May & Baker',
    desc: 'Relieves dry coughs and soothes a scratchy throat.',
  },
  {
    id: 'dr-23', name: 'Vitamin D3', generic: 'Cholecalciferol', form: 'Softgel', strength: '1000 IU', pack: 'Pack of 60',
    price: 2400, category: 'Vitamins & supplements', requiresPrescription: false, inStock: true, manufacturer: 'Vitabiotics',
    desc: 'Supports bone health, immunity and mood.',
  },
  {
    id: 'dr-24', name: 'Iron + Folic Acid', generic: 'Haematologic tablets', form: 'Tablet', strength: '65 mg / 0.4 mg', pack: 'Pack of 30',
    price: 1500, category: 'Vitamins & supplements', requiresPrescription: false, inStock: true, manufacturer: 'Emzor',
    desc: 'Helps prevent iron-deficiency anaemia, especially in pregnancy.',
  },
  {
    id: 'dr-25', name: 'Mebendazole', generic: 'Vermox', form: 'Chewable tablet', strength: '500 mg', pack: 'Pack of 6',
    price: 550, category: 'Digestion', requiresPrescription: false, inStock: true, manufacturer: 'Janssen',
    desc: 'Single-dose treatment for worm infections.',
  },
  {
    id: 'dr-26', name: 'Povidone-iodine solution', generic: 'Disinfectant', form: 'Solution', strength: '10 %', pack: '100 ml bottle',
    price: 850, category: 'First aid & skin', requiresPrescription: false, inStock: true, manufacturer: 'Evans',
    desc: 'Antiseptic for disinfecting wounds and before minor procedures.',
  },
  {
    id: 'dr-27', name: 'Diclofenac gel', generic: 'Voltaren', form: 'Gel', strength: '1 %', pack: '30 g tube',
    price: 1400, category: 'First aid & skin', requiresPrescription: false, inStock: true, manufacturer: 'Novartis',
    desc: 'Topical pain relief for joint and muscle aches.',
  },
];

/* Online pharmacy orders (placed by patients via "Buy drugs online") */
export const pharmacyOrders = [
  {
    id: uid('pho'),
    patientId: 'u-patient2',
    patientName: 'Ifeanyi Okafor',
    items: [
      { drugId: 'dr-10', drug: 'Multivitamin', strength: 'Tablet · A–Z', pack: 'Pack of 60', qty: 1, price: 3200, lineTotal: 3200 },
      { drugId: 'dr-13', drug: 'Salbutamol inhaler', strength: 'Inhaler · 100 mcg', pack: 'Single inhaler', qty: 2, price: 3500, lineTotal: 7000 },
    ],
    subtotal: 10200,
    deliveryFee: 1500,
    total: 11700,
    delivery: { method: 'delivery', address: '12 Aminu Kano Crescent, Wuse II, Abuja', phone: '+234 805 555 0171', fee: 1500 },
    status: 'processing',
    placedAt: iso(0, 8, 10),
    note: 'Please call before delivery.',
  },
];

/* Lab instrument queues (lab tech view) */
export const labInstruments = [
  { id: 'sys-xl2', name: 'Chemistry Analyzer XL-2', utilization: 74, current: 'Lipid Panel ×3', queueCount: 6 },
  { id: 'sys-hemo', name: 'Hematology Analyzer HemoOne', utilization: 61, current: 'CBC ×2', queueCount: 4 },
  { id: 'sys-imm', name: 'Immunoassay P800', utilization: 38, current: 'TSH ×1', queueCount: 2 },
  { id: 'sys-borne', name: 'Specimen Transport Runner', utilization: 0, current: '—', queueCount: 0 },
];

/* Revenue / reports (admin) */
export const reports = {
  revenueByMonth: [
    { month: 'April 2026', revenue: 284000, visits: 3120, noShows: 96 },
    { month: 'May 2026', revenue: 296500, visits: 3270, noShows: 90 },
    { month: 'June 2026', revenue: 289400, visits: 3195, noShows: 104 },
    { month: 'July 2026', revenue: 302100, visits: 3340, noShows: 88 },
    { month: 'August 2026', revenue: 318750, visits: 3485, noShows: 82 },
    { month: 'September 2026 (MTD)', revenue: 124900, visits: 1420, noShows: 31 },
  ],
  occupancyByFacility: [
    { facility: 'Carebridge Medical Centre, Ikeja', rate: 82 },
    { facility: 'Carebridge Victoria Island Medical Centre', rate: 76 },
    { facility: 'Carebridge Yaba Clinic', rate: 64 },
  ],
  claims: [
    { id: 'CLM-90211', patient: 'Ngozi Obi', payer: 'Hygeia HMO', amount: 340000, status: 'paid' },
    { id: 'CLM-90212', patient: 'Ifeanyi Okafor', payer: 'AXA Mansard Health', amount: 410000, status: 'submitted' },
    { id: 'CLM-90213', patient: 'Amos Edeh', payer: 'NHIA', amount: 295000, status: 'pending' },
    { id: 'CLM-90214', patient: 'Yetunde Bakare', payer: 'Hygeia HMO', amount: 380000, status: 'denied' },
  ],
};

/* --------------------------------------------------------------------------
   Public-site content
   -------------------------------------------------------------------------- */
export const news = [
  { id: 'n-1', category: 'Health & Wellness', title: 'Five daily habits that keep your heart healthy', date: iso(-1, 8, 0), readTime: '4 min read', excerpt: 'Small, consistent choices — from movement snacking to sleep hygiene — add up to big cardiovascular protection.', url: '/news-and-insights' },
  { id: 'n-2', category: 'Research', title: 'New machine-learning model improves early cancer detection', date: iso(-3, 9, 0), readTime: '6 min read', excerpt: 'A Carebridge research team trained an AI model that flags subtle imaging patterns years earlier than standard review.', url: '/news-and-insights' },
  { id: 'n-3', category: 'Patient Stories', title: 'Marathon runner returns to the course after knee surgery', date: iso(-6, 10, 0), readTime: '5 min read', excerpt: 'Sports medicine and physical therapy got Amina back to racing just eight months after an ACL reconstruction.', url: '/news-and-insights' },
  { id: 'n-4', category: 'Health & Wellness', title: 'What your blood pressure numbers actually mean', date: iso(-8, 11, 0), readTime: '3 min read', excerpt: 'A plain-language guide to systolic and diastolic readings — and when to call your care team.', url: '/news-and-insights' },
  { id: 'n-5', category: 'Research', title: 'Weight-loss drug trial shows promise for fatty liver disease', date: iso(-12, 9, 0), readTime: '7 min read', excerpt: 'Interim results from an early-phase study suggest meaningful improvement in liver fat among participants.', url: '/news-and-insights' },
  { id: 'n-6', category: 'Health & Wellness', title: 'A parent\u2019s guide to back-to-school immunizations', date: iso(-15, 10, 0), readTime: '4 min read', excerpt: 'Which vaccines your child needs this year — and how to book a same-week well visit.', url: '/news-and-insights' },
  { id: 'n-7', category: 'Patient Stories', title: 'After a stroke at 42, a patient relearns to walk with our rehab team', date: iso(-18, 9, 0), readTime: '6 min read', excerpt: 'Early rehab intervention rewired a recovery that doctors predicted would take a year.', url: '/news-and-insights' },
  { id: 'n-8', category: 'Ask the Doctors', title: 'Ask the doctors: Why do I wake up with a headache every morning?', date: iso(-21, 11, 0), readTime: '3 min read', excerpt: 'Your clinicians answer a reader question about morning headaches — causes and when to worry.', url: '/news-and-insights' },
  { id: 'n-9', category: 'Health & Wellness', title: 'Sleep, stress and screen time: the new science of teen mental health', date: iso(-25, 10, 0), readTime: '5 min read', excerpt: 'A behavioral health specialist shares what parents can actually do that moves the needle.', url: '/news-and-insights' },
  { id: 'n-10', category: 'Research', title: 'Personalized breast-screening schedules outperform one-size-fits-all', date: iso(-30, 9, 0), readTime: '6 min read', excerpt: 'Risk-based intervals could catch more cancers while reducing false positives by a fifth.', url: '/news-and-insights' },
];

export const healthLibrary = [
  { id: 'hl-1', title: 'High blood pressure (hypertension)', category: 'Heart & Vascular', readTime: '5 min', summary: 'Learn what raises blood pressure, how it is measured, and the drug-free and medication options that bring it down.' },
  { id: 'hl-2', title: 'Type 2 diabetes', category: 'Endocrinology', readTime: '7 min', summary: 'Understanding blood sugar, what HbA1c means, and how diet, activity and medication work together.' },
  { id: 'hl-3', title: 'Seasonal allergies (allergic rhinitis)', category: 'Primary Care', readTime: '4 min', summary: 'Why pollen season triggers sneezing and congestion — and which treatments help most.' },
  { id: 'hl-4', title: 'Asthma in adults', category: 'Pulmonology', readTime: '6 min', summary: 'Recognizing triggers, using inhalers correctly, and building an asthma action plan.' },
  { id: 'hl-5', title: 'Low back pain', category: 'Orthopedics', readTime: '6 min', summary: 'Most back pain improves with movement, not rest. Here is what works and when imaging is needed.' },
  { id: 'hl-6', title: 'Anxiety and stress', category: 'Behavioral Health', readTime: '5 min', summary: 'Signs that everyday stress has become anxiety — and evidence-based ways to respond.' },
  { id: 'hl-7', title: 'High cholesterol', category: 'Heart & Vascular', readTime: '5 min', summary: 'What LDL, HDL and triglycerides mean, and how food, exercise and medication lower risk.' },
  { id: 'hl-8', title: 'The flu vs. a common cold', category: 'Primary Care', readTime: '3 min', summary: 'Quick comparison of symptoms, when to stay home, and when to seek urgent care.' },
  { id: 'hl-9', title: 'Prenatal vitamins and pregnancy nutrition', category: "Women's Health", readTime: '4 min', summary: 'The nutrients that matter most before and during pregnancy and safe foods to prioritize.' },
  { id: 'hl-10', title: 'Shingles', category: 'Infectious Disease', readTime: '4 min', summary: 'What the reactivation of the chickenpox virus looks like and why vaccination is recommended.' },
  { id: 'hl-11', title: 'Migraine', category: 'Neurology', readTime: '6 min', summary: 'Beyond tension headaches: migraine triggers, warning signs, and preventive treatments.' },
  { id: 'hl-12', title: 'Skin cancer prevention', category: 'Dermatology', readTime: '5 min', summary: 'The ABCDEs of melanoma, sunscreen that actually works, and when to get a skin check.' },
];

export const clinicalTrials = [
  {
    id: 'ct-1', title: 'Early Detection of Heart Failure Using Wearable Sensors', category: 'Heart & Vascular',
    status: 'recruiting', phase: 'Phase 2', locations: ['Carebridge Medical Centre, Ikeja'],
    summary: 'Study evaluating whether smartwatch sensor data can detect early warning signs of heart failure weeks before symptoms appear.',
    eligibility: 'Adults 40+ with a history of hypertension.',
  },
  {
    id: 'ct-2', title: 'Targeted Immunotherapy for Metastatic Breast Cancer', category: 'Cancer Care',
    status: 'recruiting', phase: 'Phase 3', locations: ['Carebridge Medical Centre, Ikeja', 'Carebridge Wuse Clinic'],
    summary: 'Testing a novel combination immunotherapy against standard therapy in adults with HER2-negative metastatic breast cancer.',
    eligibility: 'Adults 18+ with confirmed metastatic breast cancer.',
  },
  {
    id: 'ct-3', title: 'AI-Assisted Retinal Screening for Diabetic Retinopathy', category: 'Ophthalmology',
    status: 'recruiting', phase: 'Phase 1', locations: ['Carebridge Yaba Clinic'],
    summary: 'Validating an AI tool that reads retinal photographs to flag signs of diabetic eye disease during routine visits.',
    eligibility: 'Adults with type 2 diabetes.',
  },
  {
    id: 'ct-4', title: 'Home-Based Strength Training for Chronic Back Pain', category: 'Orthopedics',
    status: 'recruiting', phase: 'Phase 2', locations: ['Carebridge GRA Clinic, Port Harcourt'],
    summary: 'Comparing two supervised home exercise programs for adults with chronic non-surgical low back pain.',
    eligibility: 'Adults 18-70 with back pain lasting 3+ months.',
  },
  {
    id: 'ct-5', title: 'Mindfulness App for Pediatric Anxiety', category: 'Behavioral Health',
    status: 'not_recruiting', phase: 'Phase 3', locations: ['Carebridge Medical Centre, Ikeja'],
    summary: 'Evaluating a therapist-guided mindfulness app as a first-line treatment for anxiety in adolescents.',
    eligibility: 'Youth ages 12-17 with generalized anxiety disorder.',
  },
  {
    id: 'ct-6', title: 'Personalized Dosing of Blood Pressure Medications', category: 'Heart & Vascular',
    status: 'recruiting', phase: 'Phase 4', locations: ['Carebridge Wuse Clinic', 'Carebridge Yaba Clinic'],
    summary: 'Using genetic markers to tailor antihypertensive dosing and reduce side effects.',
    eligibility: 'Adults 18+ starting therapy for hypertension.',
  },
];

export const stories = [
  {
    id: 'st-1', name: 'Amina Yusuf, 39', title: 'Back on the road after ACL reconstruction',
    date: iso(-12, 9, 0), tag: 'Orthopedics',
    quote: 'Sports medicine gave me a plan, a team, and the confidence that I would run again. Nine months later I crossed the finish line in Lagos.',
  },
  {
    id: 'st-2', name: 'Chuka Okeke, 58', title: 'A second chance after a heart transplant',
    date: iso(-30, 9, 0), tag: 'Transplant',
    quote: 'From the first consult to discharge, everyone knew my name. Six months post-transplant I walked my daughter down the aisle.',
  },
  {
    id: 'st-3', name: 'Amara Osei, 7', title: 'Beating leukemia — with her family by her side',
    date: iso(-20, 9, 0), tag: 'Cancer Care',
    quote: 'The pediatric team made the hardest year of our lives feel manageable. Amara rang the bell and she never looked back.',
  },
];

export const departments = [
  { name: 'Anesthesiology', letter: 'A' },
  { name: 'Audiology', letter: 'A' },
  { name: 'Cardiology', letter: 'C' },
  { name: 'Cardiothoracic Surgery', letter: 'C' },
  { name: 'Dermatology', letter: 'D' },
  { name: 'Emergency Medicine', letter: 'E' },
  { name: 'Endocrinology', letter: 'E' },
  { name: 'Family Medicine', letter: 'F' },
  { name: 'Gastroenterology', letter: 'G' },
  { name: 'Geriatrics', letter: 'G' },
  { name: 'Hematology & Oncology', letter: 'H' },
  { name: 'Infectious Disease', letter: 'I' },
  { name: 'Laboratory Medicine', letter: 'L' },
  { name: 'Nephrology', letter: 'N' },
  { name: 'Neurology', letter: 'N' },
  { name: 'Neurosurgery', letter: 'N' },
  { name: 'Obstetrics & Gynecology', letter: 'O' },
  { name: 'Ophthalmology', letter: 'O' },
  { name: 'Orthopedic Surgery', letter: 'O' },
  { name: 'Otolaryngology (ENT)', letter: 'O' },
  { name: 'Pain Medicine', letter: 'P' },
  { name: 'Pathology', letter: 'P' },
  { name: 'Pediatrics', letter: 'P' },
  { name: 'Physical Medicine & Rehab', letter: 'P' },
  { name: 'Psychiatry', letter: 'P' },
  { name: 'Pulmonology', letter: 'P' },
  { name: 'Radiation Oncology', letter: 'R' },
  { name: 'Radiology', letter: 'R' },
  { name: 'Rheumatology', letter: 'R' },
  { name: 'Sleep Medicine', letter: 'S' },
  { name: 'Sports Medicine', letter: 'S' },
  { name: 'Transplant Services', letter: 'T' },
  { name: 'Urology', letter: 'U' },
  { name: 'Vascular Surgery', letter: 'V' },
  { name: 'Weight Management', letter: 'W' },
];

export const locations = [
  { id: 'loc-1', name: 'Carebridge Medical Centre, Ikeja', type: 'Hospital', address: '1 Hospital Road, Ikeja GRA, Lagos', phone: '+234 1 270 0100', hours: 'Open 24 hours', services: ['Emergency', 'ICU', 'Inpatient'] },
  { id: 'loc-2', name: 'Carebridge Victoria Island Medical Centre', type: 'Hospital', address: '12 Adeola Odeku Street, Victoria Island, Lagos', phone: '+234 1 460 8200', hours: 'Open 24 hours', services: ['Emergency', 'Inpatient'] },
  { id: 'loc-3', name: 'Carebridge Yaba Clinic', type: 'Primary Care', address: '8 Herbert Macaulay Way, Yaba, Lagos', phone: '+234 1 740 5530', hours: 'Mon–Fri 8 am – 8 pm', services: ['Primary care', 'Lab draw'] },
  { id: 'loc-4', name: 'Carebridge Wuse Clinic', type: 'Primary Care', address: 'Plot 22, Aminu Kano Crescent, Wuse II, Abuja', phone: '+234 9 460 9410', hours: 'Mon–Fri 8 am – 8 pm', services: ['Primary care'] },
  { id: 'loc-5', name: 'Carebridge GRA Immediate Care', type: 'Immediate Care', address: '2 Aba Road, GRA Phase 2, Port Harcourt', phone: '+234 84 460 1200', hours: 'Mon–Fri 8 am – 8 pm · Sat–Sun 9 am – 6 pm', services: ['Urgent care', 'X-ray', 'IV hydration'] },
  { id: 'loc-6', name: 'Carebridge Lekki Immediate Care', type: 'Immediate Care', address: 'Plot 34, Admiralty Way, Lekki Phase 1, Lagos', phone: '+234 1 460 2200', hours: 'Mon–Fri 8 am – 8 pm · Sat–Sun 9 am – 6 pm', services: ['Urgent care', 'X-ray'] },
  { id: 'loc-7', name: 'Carebridge Bodija Specialty Centre', type: 'Specialty Care', address: '3 Awolowo Avenue, Bodija, Ibadan', phone: '+234 2 750 3320', hours: 'Mon–Fri 8 am – 8 pm', services: ['Orthopedics', 'Dermatology'] },
  { id: 'loc-8', name: 'Carebridge Diagnostics Centre, Victoria Island', type: 'Imaging', address: '15 Akin Adesola Street, Victoria Island, Lagos', phone: '+234 1 460 9900', hours: 'Mon–Fri 7 am – 6 pm', services: ['MRI', 'CT', 'Ultrasound', 'X-ray'] },
  { id: 'loc-9', name: 'Carebridge Pharmacy, Ikeja', type: 'Pharmacy', address: '9 Allen Avenue, Ikeja, Lagos', phone: '+234 1 270 4450', hours: 'Mon–Fri 8 am – 6 pm · Sat 9 am – 1 pm', services: ['Prescriptions', 'Counseling'] },
  { id: 'loc-10', name: 'The BirthPlace at Carebridge VI', type: 'Specialty Care', address: 'Level 3, Carebridge Victoria Island Medical Centre, Lagos', phone: '+234 1 460 8280', hours: 'Open 24 hours', services: ['Maternity', 'NICU'] },
];

/* --------------------------------------------------------------------------
   Departments events / community content (community & equity page)
   -------------------------------------------------------------------------- */
export const community = {
  mission: 'Carebridge Health believes equitable care starts with access. We run free screening clinics, mobile care units, and partnerships across neighborhoods that face the greatest barriers to care.',
  programs: [
    { id: 'cg-1', name: 'Mobile Care Unit', desc: 'Free blood pressure, glucose and cholesterol screenings around the state.', participants: 4200 },
    { id: 'cg-2', name: 'Community Health Workers', desc: 'Trained navigators who connect neighbors to insurance, food and housing support.', participants: 1180 },
    { id: 'cg-3', name: 'Homeless Healthcare Collaborative', desc: 'Street medicine teams providing primary care and behavioral health to unsheltered neighbors.', participants: 960 },
    { id: 'cg-4', name: 'Translation & Health Literacy', desc: 'In-language classes and materials across 10 languages.', participants: 2300 },
  ],
};

/* --------------------------------------------------------------------------
   Audit log (seeded)
   -------------------------------------------------------------------------- */
export const auditLog = [
  { id: uid('al'), actor: 'u-patient', action: 'LOGIN', target: 'Patient portal', at: iso(0, 7, 58), detail: 'Session started via email + password' },
  { id: uid('al'), actor: 'u-patient', action: 'VIEW', target: 'Lab result lab-2', at: iso(-1, 16, 2), detail: 'Viewed Hemoglobin A1c result' },
  { id: uid('al'), actor: 'u-dr-carter', action: 'VIEW', target: 'Patient chart (Ngozi Obi)', at: iso(-1, 15, 40), detail: 'Opened chart from results inbox' },
  { id: uid('al'), actor: 'u-dr-whitfield', action: 'UPDATE', target: 'Prescription rx-3', at: iso(-1, 11, 47), detail: 'Approved refill request' },
  { id: uid('al'), actor: 'u-admin-zhang', action: 'EXPORT', target: 'Monthly occupancy report', at: iso(-1, 17, 4), detail: 'Exported CSV' },
];

/* Aggregate maps for convenience */
export function buildInitialState(now = new Date()) {
  void now;
  return {
    version: 2,
    users: Object.fromEntries(users.map((u) => [u.id, u])),
    patients: Object.fromEntries(patients.map((p) => [p.userId, p])),
    providers: Object.fromEntries(providers.map((p) => [p.id, p])),
    serviceLines,
    bookingSpecialties,
    appointments,
    encounters,
    prescriptions,
    labResults,
    labOrders,
    threads,
    invoices,
    notifications,
    facilities,
    staffRoster,
    checkins,
    pharmacyQueue,
    drugCatalog,
    pharmacyOrders,
    pharmacyCarts: {},
    labInstruments,
    reports,
    news,
    healthLibrary,
    clinicalTrials,
    stories,
    departments,
    locations,
    community,
    auditLog,
    newsletterSubscribers: [],
  };
}

export function slotTimesFor(appts, providerId, dayOffset) {
  const dayStart = startOfDay(addDays(dayOffset));
  const booked = appts
    .filter((a) => a.providerId === providerId && !a.status.startsWith('open'))
    .map((a) => new Date(a.date).getTime())
    .filter((t) => {
      const d = new Date(t);
      return startOfDay(d).getTime() === dayStart.getTime();
    })
    .map((t) => new Date(t).getHours() + new Date(t).getMinutes() / 60);

  const times = [];
  for (const t of SLOT_TIMES) {
    if (booked.includes(t)) continue;
    const slotDate = dayAt(dayOffset, Math.floor(t), Math.round((t % 1) * 60));
    if (slotDate.getTime() <= Date.now()) continue;
    times.push(t);
  }
  return times;
}

export function slotTimeToDate(dayOffset, t) {
  return dayAt(dayOffset, Math.floor(t), Math.round((t % 1) * 60));
}

export function slotTimeToString(t) {
  return formatTimeHM(dayAt(0, Math.floor(t), Math.round((t % 1) * 60)));
}