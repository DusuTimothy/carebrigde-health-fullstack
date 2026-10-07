const now = new Date();

export const DEPARTMENT_IDS = {
  cardiology: '20000000-0000-4000-8000-000000000001',
  neurology: '20000000-0000-4000-8000-000000000002',
  pediatrics: '20000000-0000-4000-8000-000000000003',
  surgery: '20000000-0000-4000-8000-000000000004',
  orthopedics: '20000000-0000-4000-8000-000000000005',
  obstetrics: '20000000-0000-4000-8000-000000000006',
  emergency: '20000000-0000-4000-8000-000000000007',
  internalMedicine: '20000000-0000-4000-8000-000000000008',
};

const departments = [
  {
    id: DEPARTMENT_IDS.cardiology,
    name: 'Cardiology',
    description: 'Diagnosis and treatment of heart and cardiovascular conditions.',
    status: 'active',
  },
  {
    id: DEPARTMENT_IDS.neurology,
    name: 'Neurology',
    description: 'Care for disorders of the nervous system, brain and spine.',
    status: 'active',
  },
  {
    id: DEPARTMENT_IDS.pediatrics,
    name: 'Pediatrics',
    description: 'Medical care for infants, children and adolescents.',
    status: 'active',
  },
  {
    id: DEPARTMENT_IDS.surgery,
    name: 'Surgery',
    description: 'General and specialised surgical services.',
    status: 'active',
  },
  {
    id: DEPARTMENT_IDS.orthopedics,
    name: 'Orthopedics',
    description: 'Musculoskeletal care including bones, joints and muscles.',
    status: 'active',
  },
  {
    id: DEPARTMENT_IDS.obstetrics,
    name: 'Obstetrics & Gynecology',
    description: 'Maternity, prenatal and women’s health services.',
    status: 'active',
  },
  {
    id: DEPARTMENT_IDS.emergency,
    name: 'Emergency Medicine',
    description: '24/7 acute care and trauma response.',
    status: 'active',
  },
  {
    id: DEPARTMENT_IDS.internalMedicine,
    name: 'Internal Medicine',
    description: 'Adult medicine covering chronic and acute internal conditions.',
    status: 'active',
  },
];

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'departments',
      departments.map((department) => ({
        ...department,
        image: null,
        createdAt: now,
        updatedAt: now,
      }))
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('departments', { id: departments.map((d) => d.id) });
  },
};
