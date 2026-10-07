import { DEPARTMENT_IDS } from './20261006010002-seed-departments.js';

const now = new Date();

export const WARD_IDS = {
  emergency: '50000000-0000-4000-8000-000000000001',
  medical: '50000000-0000-4000-8000-000000000002',
  surgical: '50000000-0000-4000-8000-000000000003',
  pediatric: '50000000-0000-4000-8000-000000000004',
  maternity: '50000000-0000-4000-8000-000000000005',
  private: '50000000-0000-4000-8000-000000000006',
  icu: '50000000-0000-4000-8000-000000000007',
};

export const bedId = (wardNumber, bedNumber) =>
  `60000000-0000-4000-8000-00000000${String(wardNumber).padStart(2, '0')}${String(bedNumber).padStart(2, '0')}`;

const wards = [
  {
    id: WARD_IDS.emergency,
    name: 'Emergency Ward',
    departmentId: DEPARTMENT_IDS.emergency,
    wardType: 'emergency',
    capacity: 6,
    description: 'High-acuity beds for trauma and acute presentations.',
  },
  {
    id: WARD_IDS.medical,
    name: 'Medical Ward',
    departmentId: DEPARTMENT_IDS.internalMedicine,
    wardType: 'medical',
    capacity: 6,
    description: 'General medical admissions for adult patients.',
  },
  {
    id: WARD_IDS.surgical,
    name: 'Surgical Ward',
    departmentId: DEPARTMENT_IDS.surgery,
    wardType: 'surgical',
    capacity: 6,
    description: 'Post-operative and pre-surgical inpatient care.',
  },
  {
    id: WARD_IDS.pediatric,
    name: 'Pediatric Ward',
    departmentId: DEPARTMENT_IDS.pediatrics,
    wardType: 'pediatric',
    capacity: 6,
    description: 'Child-friendly inpatient unit for patients under 16.',
  },
  {
    id: WARD_IDS.maternity,
    name: 'Maternity Ward',
    departmentId: DEPARTMENT_IDS.obstetrics,
    wardType: 'maternity',
    capacity: 6,
    description: 'Labour, delivery and postnatal care.',
  },
  {
    id: WARD_IDS.private,
    name: 'Private Ward',
    departmentId: DEPARTMENT_IDS.internalMedicine,
    wardType: 'private',
    capacity: 6,
    description: 'Single-occupancy rooms with premium amenities.',
  },
  {
    id: WARD_IDS.icu,
    name: 'Intensive Care Unit',
    departmentId: DEPARTMENT_IDS.emergency,
    wardType: 'icu',
    capacity: 6,
    description: 'Critical care beds with continuous monitoring.',
  },
];

const BED_STATUSES = {
  [bedId(1, 3)]: 'reserved',
  [bedId(1, 4)]: 'maintenance',
  [bedId(2, 1)]: 'occupied',
  [bedId(3, 2)]: 'occupied',
  [bedId(4, 2)]: 'reserved',
  [bedId(6, 1)]: 'reserved',
  [bedId(7, 1)]: 'occupied',
  [bedId(7, 4)]: 'maintenance',
};

const beds = [];
wards.forEach((ward, wardIndex) => {
  for (let bedNumber = 1; bedNumber <= 6; bedNumber += 1) {
    const id = bedId(wardIndex + 1, bedNumber);
    beds.push({
      id,
      wardId: ward.id,
      bedNumber: String(bedNumber).padStart(3, '0'),
      status: BED_STATUSES[id] || 'available',
      createdAt: now,
      updatedAt: now,
    });
  }
});

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'wards',
      wards.map((ward) => ({ ...ward, status: 'active', createdAt: now, updatedAt: now }))
    );
    await queryInterface.bulkInsert('beds', beds);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('beds', { id: beds.map((b) => b.id) });
    await queryInterface.bulkDelete('wards', { id: wards.map((w) => w.id) });
  },
};
