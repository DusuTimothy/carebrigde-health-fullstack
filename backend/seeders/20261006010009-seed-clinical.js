import { PATIENT_IDS } from './20261006010004-seed-patients.js';
import { DOCTOR_IDS } from './20261006010003-seed-doctors.js';
import { USER_IDS } from './20261006010001-seed-users.js';
import { PRODUCT_IDS } from './20261006010006-seed-product-catalog.js';

const now = new Date();

const medicalRecords = [
  {
    id: 'f1000000-0000-4000-8000-000000000001',
    patientId: PATIENT_IDS.amy,
    doctorId: DOCTOR_IDS.james,
    diagnosis: 'Acute appendicitis',
    symptoms: 'Lower right abdominal pain, fever 38.4C, nausea',
    treatment: 'Laparoscopic appendectomy performed successfully',
    notes: 'Recovering well. Pain managed with paracetamol.',
  },
  {
    id: 'f1000000-0000-4000-8000-000000000002',
    patientId: PATIENT_IDS.ben,
    doctorId: DOCTOR_IDS.priya,
    diagnosis: 'Unstable angina',
    symptoms: 'Chest pain radiating to left arm, shortness of breath, diaphoresis',
    treatment: 'Nitroglycerin sublingual, continuous cardiac monitoring, aspirin 300mg loading dose',
    notes: 'Cardiology consultation requested for possible angiography.',
  },
  {
    id: 'f1000000-0000-4000-8000-000000000003',
    patientId: PATIENT_IDS.clara,
    doctorId: DOCTOR_IDS.daniel,
    diagnosis: 'Type 2 Diabetes Mellitus, poorly controlled',
    symptoms: 'Fatigue, polyuria, polydipsia, blurred vision',
    treatment: 'Metformin 850mg BD, dietary counselling, glucometer education',
    notes: 'HbA1c 8.2%. Endocrinology review in 4 weeks.',
  },
  {
    id: 'f1000000-0000-4000-8000-000000000004',
    patientId: PATIENT_IDS.david,
    doctorId: DOCTOR_IDS.amelia,
    diagnosis: 'Stage 2 Hypertension',
    symptoms: 'Headache, visual disturbance, BP 168/102',
    treatment: 'Lisinopril 10mg OD, low sodium diet, daily BP monitoring',
    notes: 'Discharged after BP stabilised at 132/84.',
  },
  {
    id: 'f1000000-0000-4000-8000-000000000005',
    patientId: PATIENT_IDS.eve,
    doctorId: DOCTOR_IDS.lucas,
    diagnosis: 'Migraine with aura',
    symptoms: 'Unilateral throbbing headache, photophobia, visual aura',
    treatment: 'Ibuprofen 400mg, rest in dark room, trigger avoidance advice',
    notes: 'Keep headache diary. Review if frequency increases.',
  },
];

const prescriptions = [
  {
    id: 'f2000000-0000-4000-8000-000000000001',
    patientId: PATIENT_IDS.amy,
    doctorId: DOCTOR_IDS.james,
    medicineId: PRODUCT_IDS.amoxicillin,
    dosage: '500mg',
    frequency: 'Three times daily',
    duration: '7 days',
    instructions: 'Take after meals. Complete the full course.',
    status: 'approved',
  },
  {
    id: 'f2000000-0000-4000-8000-000000000002',
    patientId: PATIENT_IDS.clara,
    doctorId: DOCTOR_IDS.daniel,
    medicineId: PRODUCT_IDS.metformin,
    dosage: '850mg',
    frequency: 'Twice daily',
    duration: '30 days',
    instructions: 'Take with breakfast and dinner to reduce stomach upset.',
    status: 'pending',
  },
  {
    id: 'f2000000-0000-4000-8000-000000000003',
    patientId: PATIENT_IDS.ben,
    doctorId: DOCTOR_IDS.priya,
    medicineId: PRODUCT_IDS.omeprazole,
    dosage: '20mg',
    frequency: 'Once daily',
    duration: '14 days',
    instructions: 'Take 30 minutes before breakfast.',
    status: 'pending',
  },
  {
    id: 'f2000000-0000-4000-8000-000000000004',
    patientId: PATIENT_IDS.david,
    doctorId: DOCTOR_IDS.amelia,
    medicineId: PRODUCT_IDS.lisinopril,
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '30 days',
    instructions: 'Monitor blood pressure daily. Report dizziness immediately.',
    status: 'approved',
  },
  {
    id: 'f2000000-0000-4000-8000-000000000005',
    patientId: PATIENT_IDS.eve,
    doctorId: DOCTOR_IDS.lucas,
    medicineId: PRODUCT_IDS.ibuprofen,
    dosage: '400mg',
    frequency: 'As needed',
    duration: '5 days',
    instructions: 'Take with food if experiencing pain. Maximum 3 doses per day.',
    status: 'dispensed',
  },
  {
    id: 'f2000000-0000-4000-8000-000000000006',
    patientId: PATIENT_IDS.amy,
    doctorId: DOCTOR_IDS.james,
    medicineId: PRODUCT_IDS.omeprazole,
    dosage: '20mg',
    frequency: 'Once daily',
    duration: '14 days',
    instructions: 'Take before breakfast for gastric protection during antibiotic course.',
    status: 'dispensed',
  },
];

const laboratoryTests = [
  {
    id: 'f3000000-0000-4000-8000-000000000001',
    patientId: PATIENT_IDS.amy,
    doctorId: DOCTOR_IDS.james,
    testType: 'haematology',
    testName: 'Complete Blood Count (CBC)',
    result: 'WBC 14.2 x10^9/L (elevated), Hb 12.8 g/dL, Platelets 250 x10^9/L',
    status: 'completed',
    resultSummary: 'White cell count is elevated, consistent with infection; haemoglobin and platelets are within normal limits.',
    components: [
      { name: 'White Blood Cells', value: '14.2', unit: '10^9/L', range: '4.0 - 11.0', status: 'above' },
      { name: 'Haemoglobin', value: '12.8', unit: 'g/dL', range: '12.0 - 15.5', status: 'normal' },
      { name: 'Platelets', value: '250', unit: '10^9/L', range: '150 - 400', status: 'normal' },
    ],
  },
  {
    id: 'f3000000-0000-4000-8000-000000000002',
    patientId: PATIENT_IDS.ben,
    doctorId: DOCTOR_IDS.priya,
    testType: 'cardiac_markers',
    testName: 'Troponin I',
    result: null,
    status: 'processing',
  },
  {
    id: 'f3000000-0000-4000-8000-000000000003',
    patientId: PATIENT_IDS.clara,
    doctorId: DOCTOR_IDS.daniel,
    testType: 'biochemistry',
    testName: 'HbA1c',
    result: 'HbA1c 8.2% (target <7%)',
    status: 'completed',
    resultSummary: 'Your average blood sugar over the last 3 months is above target, so we will review your diabetes plan.',
    components: [{ name: 'HbA1c', value: '8.2', unit: '%', range: '4.0 - 5.6', status: 'above' }],
  },
  {
    id: 'f3000000-0000-4000-8000-000000000004',
    patientId: PATIENT_IDS.david,
    doctorId: DOCTOR_IDS.amelia,
    testType: 'biochemistry',
    testName: 'Lipid Profile',
    result: null,
    status: 'requested',
  },
  {
    id: 'f3000000-0000-4000-8000-000000000005',
    patientId: PATIENT_IDS.eve,
    doctorId: DOCTOR_IDS.lucas,
    testType: 'biochemistry',
    testName: 'Fasting Blood Glucose',
    result: null,
    status: 'sample-collected',
  },
  {
    id: 'f3000000-0000-4000-8000-000000000006',
    patientId: PATIENT_IDS.fred,
    doctorId: DOCTOR_IDS.daniel,
    testType: 'microbiology',
    testName: 'Urinalysis with Culture',
    result: 'No growth. No pus cells seen.',
    status: 'completed',
    resultSummary: 'No infection detected. The culture showed no growth.',
    components: [
      { name: 'Leucocyte Esterase', value: 'Negative', unit: '—', range: 'Negative', status: 'normal' },
      { name: 'Nitrites', value: 'Negative', unit: '—', range: 'Negative', status: 'normal' },
      { name: 'Culture', value: 'No growth', unit: '—', range: 'No growth', status: 'normal' },
    ],
  },
];

const prescriptionRows = prescriptions.map((prescription) => ({
  ...prescription,
  createdAt: now,
  updatedAt: now,
}));

const jsonb = (queryInterface, value) =>
  queryInterface.sequelize.literal(`'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`);

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'medical_records',
      medicalRecords.map((record) => ({
        ...record,
        createdAt: now,
        updatedAt: now,
      }))
    );
    await queryInterface.bulkInsert('prescriptions', prescriptionRows);
    await queryInterface.bulkInsert(
      'laboratory_tests',
      laboratoryTests.map((test) => ({
        ...test,
        components: test.components ? jsonb(queryInterface, test.components) : null,
        requestedAt: now,
        completedAt: test.status === 'completed' ? now : null,
        createdAt: now,
        updatedAt: now,
      }))
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('laboratory_tests', { id: laboratoryTests.map((t) => t.id) });
    await queryInterface.bulkDelete('prescriptions', { id: prescriptions.map((p) => p.id) });
    await queryInterface.bulkDelete('medical_records', { id: medicalRecords.map((r) => r.id) });
  },
};
