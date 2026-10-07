import bcrypt from 'bcrypt';

const now = new Date();

export const USER_IDS = {
  admin: '10000000-0000-4000-8000-000000000001',
  amelia: '10000000-0000-4000-8000-000000000002',
  james: '10000000-0000-4000-8000-000000000003',
  sophia: '10000000-0000-4000-8000-000000000004',
  daniel: '10000000-0000-4000-8000-000000000005',
  priya: '10000000-0000-4000-8000-000000000006',
  lucas: '10000000-0000-4000-8000-000000000007',
  nurse: '10000000-0000-4000-8000-000000000008',
  reception: '10000000-0000-4000-8000-000000000009',
  pharmacist: '10000000-0000-4000-8000-000000000010',
  lab: '10000000-0000-4000-8000-000000000011',
  accountant: '10000000-0000-4000-8000-000000000012',
  patientAmy: '10000000-0000-4000-8000-000000000013',
  patientBen: '10000000-0000-4000-8000-000000000014',
  patientClara: '10000000-0000-4000-8000-000000000015',
  patientDavid: '10000000-0000-4000-8000-000000000016',
  patientEve: '10000000-0000-4000-8000-000000000017',
  patientFred: '10000000-0000-4000-8000-000000000018',
};

export const SEED_PASSWORD = 'Password123!';

const users = [
  { id: USER_IDS.admin, name: 'System Administrator', email: 'admin@hospital.com', role: 'admin', phone: '+233200000001' },
  { id: USER_IDS.amelia, name: 'Dr. Amelia Hart', email: 'dr.amelia@hospital.com', role: 'doctor', phone: '+233200000002' },
  { id: USER_IDS.james, name: 'Dr. James Okoro', email: 'dr.james@hospital.com', role: 'doctor', phone: '+233200000003' },
  { id: USER_IDS.sophia, name: 'Dr. Sophia Nguyen', email: 'dr.sophia@hospital.com', role: 'doctor', phone: '+233200000004' },
  { id: USER_IDS.daniel, name: 'Dr. Daniel Mensah', email: 'dr.daniel@hospital.com', role: 'doctor', phone: '+233200000005' },
  { id: USER_IDS.priya, name: 'Dr. Priya Sharma', email: 'dr.priya@hospital.com', role: 'doctor', phone: '+233200000006' },
  { id: USER_IDS.lucas, name: 'Dr. Lucas Meyer', email: 'dr.lucas@hospital.com', role: 'doctor', phone: '+233200000007' },
  { id: USER_IDS.nurse, name: 'Grace Boateng', email: 'nurse.grace@hospital.com', role: 'nurse', phone: '+233200000008' },
  { id: USER_IDS.reception, name: 'Front Desk Officer', email: 'frontdesk@hospital.com', role: 'receptionist', phone: '+233200000009' },
  { id: USER_IDS.pharmacist, name: 'Kwame Pharmacy', email: 'pharmacy@hospital.com', role: 'pharmacist', phone: '+233200000010' },
  { id: USER_IDS.lab, name: 'Lab Technician', email: 'lab.tech@hospital.com', role: 'laboratory_staff', phone: '+233200000011' },
  { id: USER_IDS.accountant, name: 'Accounts Officer', email: 'accounts@hospital.com', role: 'accountant', phone: '+233200000012' },
  { id: USER_IDS.patientAmy, name: 'Amy Williams', email: 'patient.amy@hospital.com', role: 'patient', phone: '+233200000013' },
  { id: USER_IDS.patientBen, name: 'Ben Carter', email: 'patient.ben@hospital.com', role: 'patient', phone: '+233200000014' },
  { id: USER_IDS.patientClara, name: 'Clara Adams', email: 'patient.clara@hospital.com', role: 'patient', phone: '+233200000015' },
  { id: USER_IDS.patientDavid, name: 'David Kim', email: 'patient.david@hospital.com', role: 'patient', phone: '+233200000016' },
  { id: USER_IDS.patientEve, name: 'Eve Johnson', email: 'patient.eve@hospital.com', role: 'patient', phone: '+233200000017' },
  { id: USER_IDS.patientFred, name: 'Fred Mensah', email: 'patient.fred@hospital.com', role: 'patient', phone: '+233200000018' },
];

export default {
  up: async (queryInterface) => {
    const hashed = await bcrypt.hash(SEED_PASSWORD, 12);
    await queryInterface.bulkInsert(
      'users',
      users.map((user) => ({
        ...user,
        password: hashed,
        createdAt: now,
        updatedAt: now,
      }))
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', {
      id: users.map((user) => user.id),
    });
  },
};
