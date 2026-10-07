import { USER_IDS } from './20261006010001-seed-users.js';

const now = new Date();

export const PATIENT_IDS = {
  amy: '40000000-0000-4000-8000-000000000001',
  ben: '40000000-0000-4000-8000-000000000002',
  clara: '40000000-0000-4000-8000-000000000003',
  david: '40000000-0000-4000-8000-000000000004',
  eve: '40000000-0000-4000-8000-000000000005',
  fred: '40000000-0000-4000-8000-000000000006',
};

const iso = (date) => date.toISOString().slice(0, 10);
const yearsAgo = (years) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return iso(date);
};

const patients = [
  {
    id: PATIENT_IDS.amy,
    userId: USER_IDS.patientAmy,
    patientNumber: 'PT-0001',
    firstName: 'Amy',
    lastName: 'Williams',
    dateOfBirth: yearsAgo(34),
    gender: 'female',
    phone: '+233200000013',
    email: 'patient.amy@hospital.com',
    address: '12 Independence Avenue, Accra',
    bloodGroup: 'O+',
    allergies: 'Penicillin',
    emergencyContactName: 'Peter Williams',
    emergencyContactPhone: '+233200000113',
    insuranceProvider: 'AXA Health',
    insuranceNumber: 'AXA-998211',
  },
  {
    id: PATIENT_IDS.ben,
    userId: USER_IDS.patientBen,
    patientNumber: 'PT-0002',
    firstName: 'Ben',
    lastName: 'Carter',
    dateOfBirth: yearsAgo(47),
    gender: 'male',
    phone: '+233200000014',
    email: 'patient.ben@hospital.com',
    address: '5 Ring Road East, Accra',
    bloodGroup: 'A+',
    allergies: null,
    emergencyContactName: 'Rita Carter',
    emergencyContactPhone: '+233200000114',
    insuranceProvider: 'NHIA',
    insuranceNumber: 'NHIA-441209',
  },
  {
    id: PATIENT_IDS.clara,
    userId: USER_IDS.patientClara,
    patientNumber: 'PT-0003',
    firstName: 'Clara',
    lastName: 'Adams',
    dateOfBirth: yearsAgo(29),
    gender: 'female',
    phone: '+233200000015',
    email: 'patient.clara@hospital.com',
    address: '88 Spintex Road, Accra',
    bloodGroup: 'B+',
    allergies: 'Aspirin',
    emergencyContactName: 'Jane Adams',
    emergencyContactPhone: '+233200000115',
    insuranceProvider: 'Metropolitan',
    insuranceNumber: 'MET-220184',
  },
  {
    id: PATIENT_IDS.david,
    userId: USER_IDS.patientDavid,
    patientNumber: 'PT-0004',
    firstName: 'David',
    lastName: 'Kim',
    dateOfBirth: yearsAgo(61),
    gender: 'male',
    phone: '+233200000016',
    email: 'patient.david@hospital.com',
    address: '3 Airport Residential, Accra',
    bloodGroup: 'O-',
    allergies: 'Sulfa drugs',
    emergencyContactName: 'Anna Kim',
    emergencyContactPhone: '+233200000116',
    insuranceProvider: 'NHIA',
    insuranceNumber: 'NHIA-771930',
  },
  {
    id: PATIENT_IDS.eve,
    userId: USER_IDS.patientEve,
    patientNumber: 'PT-0005',
    firstName: 'Eve',
    lastName: 'Johnson',
    dateOfBirth: yearsAgo(38),
    gender: 'female',
    phone: '+233200000017',
    email: 'patient.eve@hospital.com',
    address: '19 Labone Crescent, Accra',
    bloodGroup: 'AB+',
    allergies: null,
    emergencyContactName: 'Mark Johnson',
    emergencyContactPhone: '+233200000117',
    insuranceProvider: 'SIC Life',
    insuranceNumber: 'SIC-558120',
  },
  {
    id: PATIENT_IDS.fred,
    userId: USER_IDS.patientFred,
    patientNumber: 'PT-0006',
    firstName: 'Fred',
    lastName: 'Mensah',
    dateOfBirth: yearsAgo(52),
    gender: 'male',
    phone: '+233200000018',
    email: 'patient.fred@hospital.com',
    address: '41 Kaneshie Lane, Accra',
    bloodGroup: 'A-',
    allergies: 'Latex',
    emergencyContactName: 'Akosua Mensah',
    emergencyContactPhone: '+233200000118',
    insuranceProvider: 'AXA Health',
    insuranceNumber: 'AXA-112093',
  },
];

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'patients',
      patients.map((patient) => ({
        ...patient,
        createdAt: now,
        updatedAt: now,
      }))
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('patients', { id: patients.map((p) => p.id) });
  },
};
