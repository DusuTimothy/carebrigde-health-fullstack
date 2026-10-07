import { USER_IDS } from './20261006010001-seed-users.js';
import { PATIENT_IDS } from './20261006010004-seed-patients.js';
import { DOCTOR_IDS } from './20261006010003-seed-doctors.js';

const now = new Date();

const hourAgo = (hours) => new Date(now.getTime() - hours * 3600 * 1000);

const THREAD = (n) => `f4000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const MESSAGE = (n) => `f5000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const NOTIFICATION = (n) => `f6000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const CHECKIN = (n) => `f7000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const AUDIT = (n) => `f8000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const threads = [
  {
    id: THREAD(1),
    subject: 'Question about my latest lipid panel',
    createdBy: USER_IDS.patientAmy,
    lastMessageAt: hourAgo(2),
    participantIds: [USER_IDS.patientAmy, USER_IDS.amelia],
    messages: [
      { senderId: USER_IDS.patientAmy, body: 'Hi Dr. Hart — I got a notification that my lipid panel results are ready. Could you review them and let me know if my LDL is where we want it?', at: hourAgo(30), read: true },
      { senderId: USER_IDS.amelia, body: 'Hi Amy, yes — I reviewed it. Your LDL came in well below target. Keep up the consistent exercise and we will recheck in 3 months.', at: hourAgo(28), read: true },
      { senderId: USER_IDS.patientAmy, body: 'That\u2019s great news, thank you! Should I keep the lisinopril at the same dose?', at: hourAgo(2), read: false },
    ],
  },
  {
    id: THREAD(2),
    subject: 'Prescription refill — maintenance inhaler',
    createdBy: USER_IDS.patientBen,
    lastMessageAt: hourAgo(5),
    participantIds: [USER_IDS.patientBen, USER_IDS.priya],
    messages: [
      { senderId: USER_IDS.patientBen, body: 'Hello — I\u2019m running low on my medication and would like a refill.', at: hourAgo(20), read: true },
      { senderId: USER_IDS.priya, body: 'Hi Ben — approved. I\u2019ve sent the refill to the pharmacy on file; it should be ready within a few hours.', at: hourAgo(18), read: true },
      { senderId: USER_IDS.priya, body: 'If you\u2019d like to review the glucose recheck, I have an opening Thursday at 2:00 pm.', at: hourAgo(5), read: false },
    ],
  },
  {
    id: THREAD(3),
    subject: 'Ward handover — Paediatric admissions',
    createdBy: USER_IDS.nurse,
    lastMessageAt: hourAgo(2),
    participantIds: [USER_IDS.nurse, USER_IDS.sophia, USER_IDS.reception],
    messages: [
      { senderId: USER_IDS.nurse, body: 'Good morning — two paediatric admissions came in overnight. Sophia, can you review the notes before rounds?', at: hourAgo(4), read: true },
      { senderId: USER_IDS.sophia, body: 'Got them, reviewing now. Front desk, please mark both as in-room.', at: hourAgo(3), read: true },
      { senderId: USER_IDS.reception, body: 'Done. Both rooms updated.', at: hourAgo(2), read: false },
    ],
  },
  {
    id: THREAD(4),
    subject: 'Clarification on Amoxicillin prescription',
    createdBy: USER_IDS.pharmacist,
    lastMessageAt: hourAgo(6),
    participantIds: [USER_IDS.pharmacist, USER_IDS.james],
    messages: [
      { senderId: USER_IDS.pharmacist, body: 'Hi Dr. Okoro — quick question on the amoxicillin course for Ms. Williams. Is 7 days as prescribed?', at: hourAgo(7), read: true },
      { senderId: USER_IDS.james, body: 'Yes, 7 days is correct. Please dispense as written.', at: hourAgo(6), read: true },
    ],
  },
  {
    id: THREAD(5),
    subject: 'End of shift summary — Front desk',
    createdBy: USER_IDS.reception,
    lastMessageAt: hourAgo(1),
    participantIds: [USER_IDS.reception, USER_IDS.admin],
    messages: [
      { senderId: USER_IDS.reception, body: 'End of shift: 12 walk-ins, 3 admissions, 2 pending insurance verifications for tomorrow.', at: hourAgo(1), read: true },
    ],
  },
];

const threadRows = threads.map((t) => ({ id: t.id, subject: t.subject, createdBy: t.createdBy, lastMessageAt: t.lastMessageAt, createdAt: hourAgo(48), updatedAt: t.lastMessageAt }));
const participantRows = threads.flatMap((t) =>
  t.participantIds.map((userId) => ({ id: MESSAGE(999 + t.participantIds.indexOf(userId) + threads.indexOf(t) * 10), threadId: t.id, userId, createdAt: t.createdAt || hourAgo(48), updatedAt: hourAgo(48) }))
);
let msgSeq = 1;
const messageRows = threads.flatMap((t) =>
  t.messages.map((m) => ({ id: MESSAGE(msgSeq++), threadId: t.id, senderId: m.senderId, body: m.body, read: m.read, createdAt: m.at, updatedAt: m.at }))
);

const notifications = [
  { userId: USER_IDS.admin, type: 'results', title: 'New admissions flagged', body: '2 admissions are awaiting bed assignment today.', read: false, at: hourAgo(2), link: '/portal/admin/patients' },
  { userId: USER_IDS.patientAmy, type: 'lab', title: 'Lab results available', body: 'Your labs are ready to review.', read: false, at: hourAgo(3), link: '/portal/patient/labs' },
  { userId: USER_IDS.patientAmy, type: 'message', title: 'New message from Dr. Hart', body: 'Re: Question about my latest lipid panel', read: false, at: hourAgo(2), link: '/portal/patient/messages' },
  { userId: USER_IDS.patientAmy, type: 'appointment', title: 'Upcoming follow-up', body: 'Cardiology follow-up with Dr. Hart in 3 days.', read: false, at: hourAgo(26), link: '/portal/patient/appointments' },
  { userId: USER_IDS.patientAmy, type: 'billing', title: 'New statement available', body: 'Your latest statement is now available to review.', read: true, at: hourAgo(50), link: '/portal/patient/billing' },
  { userId: USER_IDS.amelia, type: 'results', title: 'Lab results ready for review', body: '2 orders have resulted and are waiting for sign-off.', read: false, at: hourAgo(3), link: '/portal/provider/results' },
  { userId: USER_IDS.amelia, type: 'schedule', title: 'New appointment booked', body: 'Ben Carter booked a video visit for tomorrow.', read: false, at: hourAgo(8), link: '/portal/provider/schedule' },
  { userId: USER_IDS.accountant, type: 'report', title: 'Weekly occupancy report ready', body: 'Friday morning occupancy was at 84% across three sites.', read: false, at: hourAgo(5), link: '/portal/admin/reports' },
  { userId: USER_IDS.nurse, type: 'queue', title: 'Patients waiting', body: '2 patients are checked in and waiting for their rooms.', read: false, at: hourAgo(3), link: '/portal/nurse/queue' },
  { userId: USER_IDS.pharmacist, type: 'prescription', title: 'Refill requests waiting', body: '3 prescriptions are ready to fill in the fulfillment queue.', read: true, at: hourAgo(4), link: '/portal/pharmacist/orders' },
  { userId: USER_IDS.lab, type: 'results', title: 'Specimen collected', body: 'A sample for Ms. Williams is ready to process.', read: false, at: hourAgo(3), link: '/portal/lab/orders' },
  { userId: USER_IDS.reception, type: 'appointment', title: 'Walk-in scheduled', body: 'A walk-in patient checked in for a BP check.', read: false, at: hourAgo(2), link: '/portal/front-desk/checkins' },
];

const checkins = [
  { patientId: PATIENT_IDS.amy, doctorId: DOCTOR_IDS.amelia, reason: 'BP check', status: 'in_room', room: 'Exam 4', vitals: { bp: '128/80', hr: 72, temp: '36.7C' }, at: hourAgo(2), completedAt: null },
  { patientId: PATIENT_IDS.ben, doctorId: DOCTOR_IDS.priya, reason: 'Annual physical', status: 'waiting', room: 'Exam 1', vitals: null, at: hourAgo(1.2), completedAt: null },
  { patientId: PATIENT_IDS.clara, doctorId: DOCTOR_IDS.daniel, reason: 'Allergies follow-up', status: 'completed', room: 'Exam 3', vitals: { bp: '118/76', hr: 68, temp: '36.5C' }, at: hourAgo(6), completedAt: hourAgo(4) },
];

const auditLogs = [
  { actorId: USER_IDS.admin, actorName: 'System Administrator', action: 'LOGIN', target: 'Admin console', detail: 'Session started via email + password', at: hourAgo(5) },
  { actorId: USER_IDS.patientAmy, actorName: 'Amy Williams', action: 'VIEW', target: 'Lab result', detail: 'Viewed lab result from results inbox', at: hourAgo(3) },
  { actorId: USER_IDS.amelia, actorName: 'Dr. Amelia Hart', action: 'VIEW', target: 'Patient chart', detail: 'Opened chart from results inbox', at: hourAgo(3) },
  { actorId: USER_IDS.james, actorName: 'Dr. James Okoro', action: 'UPDATE', target: 'Prescription', detail: 'Approved refill request', at: hourAgo(6) },
  { actorId: USER_IDS.reception, actorName: 'Front Desk Officer', action: 'CREATE', target: 'Check-in', detail: 'Checked in walk-in patient', at: hourAgo(2) },
];

const rows = {
  threads: threadRows.map((r) => ({ createdAt: hourAgo(48), updatedAt: r.lastMessageAt, ...r })),
  participants: participantRows,
  messages: messageRows,
  notifications: notifications.map(({ at, ...n }, i) => ({ id: NOTIFICATION(i + 1), ...n, createdAt: at, updatedAt: at })),
  checkins: checkins.map(({ at, ...c }, i) => ({ id: CHECKIN(i + 1), ...c, arrivedAt: at, createdAt: at, updatedAt: c.completedAt || at })),
  auditLogs: auditLogs.map(({ at, ...a }, i) => ({ id: AUDIT(i + 1), ...a, createdAt: at, updatedAt: at })),
};

export default {
  up: async (queryInterface) => {
    const jsonb = (value) => queryInterface.sequelize.literal(`'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`);
    await queryInterface.bulkInsert('threads', rows.threads);
    await queryInterface.bulkInsert('thread_participants', rows.participants);
    await queryInterface.bulkInsert('messages', rows.messages);
    await queryInterface.bulkInsert('notifications', rows.notifications);
    await queryInterface.bulkInsert('checkins', rows.checkins.map((c) => ({ ...c, vitals: c.vitals ? jsonb(c.vitals) : null })));
    await queryInterface.bulkInsert('audit_logs', rows.auditLogs);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('audit_logs', { id: rows.auditLogs.map((r) => r.id) });
    await queryInterface.bulkDelete('checkins', { id: rows.checkins.map((r) => r.id) });
    await queryInterface.bulkDelete('notifications', { id: rows.notifications.map((r) => r.id) });
    await queryInterface.bulkDelete('messages', { id: rows.messages.map((r) => r.id) });
    await queryInterface.bulkDelete('thread_participants', { id: rows.participants.map((r) => r.id) });
    await queryInterface.bulkDelete('threads', { id: rows.threads.map((r) => r.id) });
  },
};