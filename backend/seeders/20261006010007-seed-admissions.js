import { PATIENT_IDS } from './20261006010004-seed-patients.js';
import { DOCTOR_IDS } from './20261006010003-seed-doctors.js';
import { WARD_IDS, bedId } from './20261006010005-seed-wards-beds.js';
import { USER_IDS } from './20261006010001-seed-users.js';

const now = new Date();
const dayISO = (offset) => {
  const date = new Date(now);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const ADMISSION_IDS = {
  amy: '70000000-0000-4000-8000-000000000001',
  ben: '70000000-0000-4000-8000-000000000002',
  clara: '70000000-0000-4000-8000-000000000003',
  david: '70000000-0000-4000-8000-000000000004',
};

const admissions = [
  {
    id: ADMISSION_IDS.amy,
    patientId: PATIENT_IDS.amy,
    doctorId: DOCTOR_IDS.james,
    wardId: WARD_IDS.surgical,
    bedId: bedId(3, 2),
    admissionDate: dayISO(-3),
    expectedDischargeDate: dayISO(2),
    dischargeDate: null,
    reason: 'Severe abdominal pain',
    diagnosis: 'Appendicitis',
    status: 'transferred',
    notes: 'Requires observation post transfer to surgical ward.',
    dischargeNotes: null,
    finalDiagnosis: null,
  },
  {
    id: ADMISSION_IDS.ben,
    patientId: PATIENT_IDS.ben,
    doctorId: DOCTOR_IDS.priya,
    wardId: WARD_IDS.icu,
    bedId: bedId(7, 1),
    admissionDate: dayISO(-1),
    expectedDischargeDate: dayISO(4),
    dischargeDate: null,
    reason: 'Chest pain and shortness of breath',
    diagnosis: 'Unstable angina',
    status: 'admitted',
    notes: 'Continuous cardiac monitoring required.',
    dischargeNotes: null,
    finalDiagnosis: null,
  },
  {
    id: ADMISSION_IDS.clara,
    patientId: PATIENT_IDS.clara,
    doctorId: DOCTOR_IDS.daniel,
    wardId: WARD_IDS.medical,
    bedId: bedId(2, 1),
    admissionDate: dayISO(-2),
    expectedDischargeDate: dayISO(1),
    dischargeDate: null,
    reason: 'Poor glycaemic control',
    diagnosis: 'Type 2 Diabetes Mellitus',
    status: 'admitted',
    notes: 'Endocrinology review requested.',
    dischargeNotes: null,
    finalDiagnosis: null,
  },
  {
    id: ADMISSION_IDS.david,
    patientId: PATIENT_IDS.david,
    doctorId: DOCTOR_IDS.amelia,
    wardId: WARD_IDS.medical,
    bedId: bedId(2, 2),
    admissionDate: dayISO(-10),
    expectedDischargeDate: dayISO(-7),
    dischargeDate: dayISO(-6),
    reason: 'Hypertensive crisis',
    diagnosis: 'Stage 2 Hypertension',
    status: 'discharged',
    notes: null,
    dischargeNotes: 'Patient is stable. Continue medication at home and follow up in 2 weeks.',
    finalDiagnosis: 'Hypertension, controlled',
  },
];

const transfers = [
  {
    id: '80000000-0000-4000-8000-000000000001',
    admissionId: ADMISSION_IDS.amy,
    patientId: PATIENT_IDS.amy,
    fromWardId: WARD_IDS.medical,
    fromBedId: bedId(2, 3),
    toWardId: WARD_IDS.surgical,
    toBedId: bedId(3, 2),
    reason: 'Patient requires surgical care',
    transferDate: dayISO(-1),
    transferredBy: USER_IDS.nurse,
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
  },
];

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'admissions',
      admissions.map((admission) => ({ ...admission, createdAt: now, updatedAt: now }))
    );
    await queryInterface.bulkInsert('patient_transfers', transfers);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('patient_transfers', { id: transfers.map((t) => t.id) });
    await queryInterface.bulkDelete('admissions', { id: admissions.map((a) => a.id) });
  },
};
