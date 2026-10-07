import { USER_IDS } from './20261006010001-seed-users.js';
import { DEPARTMENT_IDS } from './20261006010002-seed-departments.js';

const now = new Date();

export const DOCTOR_IDS = {
  amelia: '30000000-0000-4000-8000-000000000001',
  james: '30000000-0000-4000-8000-000000000002',
  sophia: '30000000-0000-4000-8000-000000000003',
  daniel: '30000000-0000-4000-8000-000000000004',
  priya: '30000000-0000-4000-8000-000000000005',
  lucas: '30000000-0000-4000-8000-000000000006',
};

const doctors = [
  {
    id: DOCTOR_IDS.amelia,
    userId: USER_IDS.amelia,
    departmentId: DEPARTMENT_IDS.cardiology,
    firstName: 'Amelia',
    lastName: 'Hart',
    specialization: 'Cardiology',
    licenseNumber: 'GMC-100201',
    phone: '+233200000002',
    email: 'dr.amelia@hospital.com',
    bio: 'Consultant cardiologist with 14 years of experience in interventional cardiology.',
    availability: 'available',
  },
  {
    id: DOCTOR_IDS.james,
    userId: USER_IDS.james,
    departmentId: DEPARTMENT_IDS.surgery,
    firstName: 'James',
    lastName: 'Okoro',
    specialization: 'General Surgery',
    licenseNumber: 'GMC-100202',
    phone: '+233200000003',
    email: 'dr.james@hospital.com',
    bio: 'General surgeon focused on abdominal and minimally invasive procedures.',
    availability: 'limited',
  },
  {
    id: DOCTOR_IDS.sophia,
    userId: USER_IDS.sophia,
    departmentId: DEPARTMENT_IDS.pediatrics,
    firstName: 'Sophia',
    lastName: 'Nguyen',
    specialization: 'Pediatrics',
    licenseNumber: 'GMC-100203',
    phone: '+233200000004',
    email: 'dr.sophia@hospital.com',
    bio: 'Paediatrician passionate about child wellness and immunisation programmes.',
    availability: 'available',
  },
  {
    id: DOCTOR_IDS.daniel,
    userId: USER_IDS.daniel,
    departmentId: DEPARTMENT_IDS.internalMedicine,
    firstName: 'Daniel',
    lastName: 'Mensah',
    specialization: 'Internal Medicine',
    licenseNumber: 'GMC-100204',
    phone: '+233200000005',
    email: 'dr.daniel@hospital.com',
    bio: 'Internist managing chronic diseases such as diabetes and hypertension.',
    availability: 'available',
  },
  {
    id: DOCTOR_IDS.priya,
    userId: USER_IDS.priya,
    departmentId: DEPARTMENT_IDS.emergency,
    firstName: 'Priya',
    lastName: 'Sharma',
    specialization: 'Emergency Medicine',
    licenseNumber: 'GMC-100205',
    phone: '+233200000006',
    email: 'dr.priya@hospital.com',
    bio: 'Emergency physician experienced in trauma and acute care.',
    availability: 'available',
  },
  {
    id: DOCTOR_IDS.lucas,
    userId: USER_IDS.lucas,
    departmentId: DEPARTMENT_IDS.neurology,
    firstName: 'Lucas',
    lastName: 'Meyer',
    specialization: 'Neurology',
    licenseNumber: 'GMC-100206',
    phone: '+233200000007',
    email: 'dr.lucas@hospital.com',
    bio: 'Neurologist specialising in stroke and epilepsy care.',
    availability: 'unavailable',
  },
];

const MARKETING = {
  [DOCTOR_IDS.amelia]: {
    title: 'Consultant Cardiologist',
    rating: 4.9,
    reviews: 214,
    languages: ['English', 'French'],
    acceptsNewPatients: true,
    bookOnline: true,
    location: 'Carebridge Medical Centre, Ikeja, Lagos',
  },
  [DOCTOR_IDS.james]: {
    title: 'General Surgeon',
    rating: 4.8,
    reviews: 176,
    languages: ['English', 'Yoruba'],
    acceptsNewPatients: true,
    bookOnline: true,
    location: 'Carebridge Medical Centre, Ikeja, Lagos',
  },
  [DOCTOR_IDS.sophia]: {
    title: 'Consultant Paediatrician',
    rating: 5.0,
    reviews: 305,
    languages: ['English', 'Vietnamese'],
    acceptsNewPatients: true,
    bookOnline: true,
    location: 'Carebridge Children’s Wing, Ikeja, Lagos',
  },
  [DOCTOR_IDS.daniel]: {
    title: 'Physician, Internal Medicine',
    rating: 4.7,
    reviews: 128,
    languages: ['English', 'Twi'],
    acceptsNewPatients: true,
    bookOnline: true,
    location: 'Carebridge Medical Centre, Ikeja, Lagos',
  },
  [DOCTOR_IDS.priya]: {
    title: 'Emergency Medicine Physician',
    rating: 4.6,
    reviews: 94,
    languages: ['English', 'Hindi'],
    acceptsNewPatients: false,
    bookOnline: false,
    location: 'Carebridge Accident & Emergency, Ikeja, Lagos',
  },
  [DOCTOR_IDS.lucas]: {
    title: 'Consultant Neurologist',
    rating: 4.9,
    reviews: 87,
    languages: ['English', 'German'],
    acceptsNewPatients: false,
    bookOnline: false,
    location: 'Carebridge Neurology Centre, Ikeja, Lagos',
  },
};

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'doctors',
      doctors.map((doctor) => {
        const marketing = MARKETING[doctor.id] || {};
        return {
          image: null,
          ...doctor,
          ...marketing,
          languages: marketing.languages
            ? queryInterface.sequelize.literal(`'${JSON.stringify(marketing.languages).replace(/'/g, "''")}'::jsonb`)
            : null,
          createdAt: now,
          updatedAt: now,
        };
      })
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('doctors', { id: doctors.map((d) => d.id) });
  },
};
