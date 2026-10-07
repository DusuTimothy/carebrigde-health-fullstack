import { PATIENT_IDS } from './20261006010004-seed-patients.js';
import { DOCTOR_IDS } from './20261006010003-seed-doctors.js';
import { DEPARTMENT_IDS } from './20261006010002-seed-departments.js';

const now = new Date();
const dayISO = (offset) => {
  const date = new Date(now);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const appointments = [
  { patient: PATIENT_IDS.amy, doctor: DOCTOR_IDS.james, department: DEPARTMENT_IDS.surgery, date: 0, time: '09:00:00', status: 'completed', reason: 'Post-operative review' },
  { patient: PATIENT_IDS.ben, doctor: DOCTOR_IDS.daniel, department: DEPARTMENT_IDS.internalMedicine, date: 0, time: '10:30:00', status: 'in-consultation', reason: 'Blood pressure check' },
  { patient: PATIENT_IDS.clara, doctor: DOCTOR_IDS.daniel, department: DEPARTMENT_IDS.internalMedicine, date: 0, time: '11:15:00', status: 'checked-in', reason: 'Diabetes management' },
  { patient: PATIENT_IDS.eve, doctor: DOCTOR_IDS.amelia, department: DEPARTMENT_IDS.cardiology, date: 0, time: '14:00:00', status: 'scheduled', reason: 'Annual heart screening' },
  { patient: PATIENT_IDS.fred, doctor: DOCTOR_IDS.lucas, department: DEPARTMENT_IDS.neurology, date: 1, time: '09:30:00', status: 'confirmed', reason: 'Recurrent migraines' },
  { patient: PATIENT_IDS.amy, doctor: DOCTOR_IDS.sophia, department: DEPARTMENT_IDS.pediatrics, date: 2, time: '10:00:00', status: 'scheduled', reason: 'Child immunisation' },
  { patient: PATIENT_IDS.david, doctor: DOCTOR_IDS.amelia, department: DEPARTMENT_IDS.cardiology, date: -2, time: '08:45:00', status: 'completed', reason: 'Hypertension follow-up' },
  { patient: PATIENT_IDS.eve, doctor: DOCTOR_IDS.priya, department: DEPARTMENT_IDS.emergency, date: 1, time: '16:00:00', status: 'scheduled', reason: 'Allergy testing' },
  { patient: PATIENT_IDS.ben, doctor: DOCTOR_IDS.lucas, department: DEPARTMENT_IDS.neurology, date: -1, time: '15:00:00', status: 'no-show', reason: 'Numbness in left arm' },
  { patient: PATIENT_IDS.clara, doctor: DOCTOR_IDS.sophia, department: DEPARTMENT_IDS.pediatrics, date: 3, time: '12:00:00', status: 'scheduled', reason: 'Paediatric consultation for nephew' },
  { patient: PATIENT_IDS.fred, doctor: DOCTOR_IDS.daniel, department: DEPARTMENT_IDS.internalMedicine, date: 2, time: '13:00:00', status: 'cancelled', reason: 'Routine check-up' },
];

const rows = appointments.map((appointment, index) => ({
  id: `e0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  patientId: appointment.patient,
  doctorId: appointment.doctor,
  departmentId: appointment.department,
  appointmentDate: dayISO(appointment.date),
  appointmentTime: appointment.time,
  reason: appointment.reason,
  status: appointment.status,
  notes: null,
  createdAt: now,
  updatedAt: now,
}));

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('appointments', rows);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('appointments', { id: rows.map((r) => r.id) });
  },
};
