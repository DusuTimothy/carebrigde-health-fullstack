const now = new Date();

export const CATEGORY_IDS = {
  prescriptionMedicines: '90000000-0000-4000-8000-000000000001',
  otc: '90000000-0000-4000-8000-000000000002',
  vitamins: '90000000-0000-4000-8000-000000000003',
  devices: '90000000-0000-4000-8000-000000000004',
  firstAid: '90000000-0000-4000-8000-000000000005',
  personalCare: '90000000-0000-4000-8000-000000000006',
  babyCare: '90000000-0000-4000-8000-000000000007',
  dental: '90000000-0000-4000-8000-000000000008',
  wellness: '90000000-0000-4000-8000-000000000009',
};

const categories = [
  { id: CATEGORY_IDS.prescriptionMedicines, name: 'Prescription Medicines', description: 'Medicines that require a valid prescription.' },
  { id: CATEGORY_IDS.otc, name: 'Over-the-Counter Medicines', description: 'Accessible medicines for common ailments.' },
  { id: CATEGORY_IDS.vitamins, name: 'Vitamins & Supplements', description: 'Daily supplements and micronutrients.' },
  { id: CATEGORY_IDS.devices, name: 'Medical Devices', description: 'Home monitoring and diagnostic devices.' },
  { id: CATEGORY_IDS.firstAid, name: 'First Aid', description: 'Essential first aid supplies and kits.' },
  { id: CATEGORY_IDS.personalCare, name: 'Personal Care', description: 'Hygiene and personal care products.' },
  { id: CATEGORY_IDS.babyCare, name: 'Baby Care', description: 'Products for infants and new parents.' },
  { id: CATEGORY_IDS.dental, name: 'Dental Care', description: 'Oral hygiene products.' },
  { id: CATEGORY_IDS.wellness, name: 'Wellness', description: 'General wellbeing and lifestyle products.' },
];

export const PRODUCT_IDS = {
  amoxicillin: 'a0000000-0000-4000-8000-000000000001',
  metformin: 'a0000000-0000-4000-8000-000000000002',
  lisinopril: 'a0000000-0000-4000-8000-000000000003',
  salbutamol: 'a0000000-0000-4000-8000-000000000004',
  omeprazole: 'a0000000-0000-4000-8000-000000000005',
  paracetamol: 'a0000000-0000-4000-8000-000000000006',
  ibuprofen: 'a0000000-0000-4000-8000-000000000007',
  ors: 'a0000000-0000-4000-8000-000000000008',
  cetirizine: 'a0000000-0000-4000-8000-000000000009',
  vitaminC: 'a0000000-0000-4000-8000-000000000010',
  vitaminD: 'a0000000-0000-4000-8000-000000000011',
  multivitamin: 'a0000000-0000-4000-8000-000000000012',
  bpMonitor: 'a0000000-0000-4000-8000-000000000013',
  glucometer: 'a0000000-0000-4000-8000-000000000014',
  thermometer: 'a0000000-0000-4000-8000-000000000015',
  pulseOximeter: 'a0000000-0000-4000-8000-000000000016',
  plasters: 'a0000000-0000-4000-8000-000000000017',
  firstAidKit: 'a0000000-0000-4000-8000-000000000018',
  handSanitizer: 'a0000000-0000-4000-8000-000000000019',
  faceMask: 'a0000000-0000-4000-8000-000000000020',
  babyDiapers: 'a0000000-0000-4000-8000-000000000021',
  babyLotion: 'a0000000-0000-4000-8000-000000000022',
  toothpaste: 'a0000000-0000-4000-8000-000000000023',
  mouthwash: 'a0000000-0000-4000-8000-000000000024',
  handSoap: 'a0000000-0000-4000-8000-000000000025',
  thermometerStrip: 'a0000000-0000-4000-8000-000000000026',
};

const product = (id, categoryId, name, price, stockQuantity, extra = {}) => ({
  id,
  categoryId,
  name,
  description: extra.description || `${name} supplied by the hospital pharmacy.`,
  price,
  discountPrice: extra.discountPrice ?? null,
  stockQuantity,
  minimumStock: extra.minimumStock ?? 10,
  image: null,
  brand: extra.brand || null,
  requiresPrescription: extra.requiresPrescription || false,
  status: extra.status || 'active',
});

const products = [
  product(PRODUCT_IDS.amoxicillin, CATEGORY_IDS.prescriptionMedicines, 'Amoxicillin 500mg Capsules', 12.5, 240, { requiresPrescription: true, brand: 'Cipla' }),
  product(PRODUCT_IDS.metformin, CATEGORY_IDS.prescriptionMedicines, 'Metformin 850mg Tablets', 9.75, 180, { requiresPrescription: true, brand: 'Merck' }),
  product(PRODUCT_IDS.lisinopril, CATEGORY_IDS.prescriptionMedicines, 'Lisinopril 10mg Tablets', 11.0, 8, { requiresPrescription: true, brand: 'Zydus', minimumStock: 20 }),
  product(PRODUCT_IDS.salbutamol, CATEGORY_IDS.prescriptionMedicines, 'Salbutamol Inhaler 100mcg', 18.9, 60, { requiresPrescription: true, brand: 'GSK' }),
  product(PRODUCT_IDS.omeprazole, CATEGORY_IDS.prescriptionMedicines, 'Omeprazole 20mg Capsules', 10.25, 150, { requiresPrescription: true, brand: 'AstraZeneca' }),
  product(PRODUCT_IDS.paracetamol, CATEGORY_IDS.otc, 'Paracetamol 500mg Tablets', 3.5, 500, { brand: 'Panadol', discountPrice: 2.95 }),
  product(PRODUCT_IDS.ibuprofen, CATEGORY_IDS.otc, 'Ibuprofen 400mg Tablets', 4.2, 320, { brand: 'Advil' }),
  product(PRODUCT_IDS.ors, CATEGORY_IDS.otc, 'Oral Rehydration Salts (10 sachets)', 5.0, 0, { brand: 'ORS Plus' }),
  product(PRODUCT_IDS.cetirizine, CATEGORY_IDS.otc, 'Cetirizine 10mg Antihistamine', 4.8, 210, { brand: 'Zyrtec' }),
  product(PRODUCT_IDS.vitaminC, CATEGORY_IDS.vitamins, 'Vitamin C 1000mg Effervescent', 7.5, 140, { brand: 'Redoxon', discountPrice: 6.5 }),
  product(PRODUCT_IDS.vitaminD, CATEGORY_IDS.vitamins, 'Vitamin D3 2000 IU Softgels', 9.0, 95, { brand: 'NOW Foods' }),
  product(PRODUCT_IDS.multivitamin, CATEGORY_IDS.vitamins, 'Daily Multivitamin (60 tablets)', 14.5, 120, { brand: 'Centrum' }),
  product(PRODUCT_IDS.bpMonitor, CATEGORY_IDS.devices, 'Digital Blood Pressure Monitor', 45.0, 35, { brand: 'Omron', minimumStock: 5 }),
  product(PRODUCT_IDS.glucometer, CATEGORY_IDS.devices, 'Glucometer Kit with 25 Strips', 38.5, 42, { brand: 'Accu-Chek', minimumStock: 5 }),
  product(PRODUCT_IDS.thermometer, CATEGORY_IDS.devices, 'Digital Clinical Thermometer', 8.75, 90, { brand: 'Braun', minimumStock: 15 }),
  product(PRODUCT_IDS.pulseOximeter, CATEGORY_IDS.devices, 'Fingertip Pulse Oximeter', 22.0, 4, { brand: 'Nonin', minimumStock: 10 }),
  product(PRODUCT_IDS.plasters, CATEGORY_IDS.firstAid, 'Adhesive Plasters (60 pieces)', 3.25, 260, { brand: 'Band-Aid' }),
  product(PRODUCT_IDS.firstAidKit, CATEGORY_IDS.firstAid, 'Home First Aid Kit', 27.5, 30, { brand: 'Survivex', minimumStock: 5 }),
  product(PRODUCT_IDS.handSanitizer, CATEGORY_IDS.personalCare, 'Hand Sanitizer 500ml', 6.0, 180, { brand: 'Dettol' }),
  product(PRODUCT_IDS.faceMask, CATEGORY_IDS.personalCare, 'Disposable Face Masks (50 pcs)', 7.25, 400, { brand: '3M' }),
  product(PRODUCT_IDS.babyDiapers, CATEGORY_IDS.babyCare, 'Baby Diapers Size 3 (40 pcs)', 16.0, 75, { brand: 'Pampers' }),
  product(PRODUCT_IDS.babyLotion, CATEGORY_IDS.babyCare, 'Gentle Baby Lotion 200ml', 8.5, 60, { brand: 'Johnson’s' }),
  product(PRODUCT_IDS.toothpaste, CATEGORY_IDS.dental, 'Fluoride Toothpaste 150ml', 4.5, 300, { brand: 'Colgate' }),
  product(PRODUCT_IDS.mouthwash, CATEGORY_IDS.dental, 'Antiseptic Mouthwash 500ml', 9.25, 5, { brand: 'Listerine', minimumStock: 12 }),
  product(PRODUCT_IDS.handSoap, CATEGORY_IDS.wellness, 'Liquid Hand Soap 400ml', 5.5, 150, { brand: 'Softsoap' }),
  product(PRODUCT_IDS.thermometerStrip, CATEGORY_IDS.wellness, 'Forehead Thermometer Strip', 6.75, 0, { brand: 'Tempa', status: 'discontinued' }),
];

const MARKETING = {
  [PRODUCT_IDS.amoxicillin]: { generic: 'Amoxicillin Trihydrate', form: 'Capsule', strength: '500mg', pack: '20 capsules', manufacturer: 'Cipla Ltd' },
  [PRODUCT_IDS.metformin]: { generic: 'Metformin Hydrochloride', form: 'Tablet', strength: '850mg', pack: '28 tablets', manufacturer: 'Merck KGaA' },
  [PRODUCT_IDS.lisinopril]: { generic: 'Lisinopril', form: 'Tablet', strength: '10mg', pack: '28 tablets', manufacturer: 'Zydus Lifesciences' },
  [PRODUCT_IDS.salbutamol]: { generic: 'Salbutamol Sulfate', form: 'Inhaler', strength: '100mcg/dose', pack: '200 doses', manufacturer: 'GSK' },
  [PRODUCT_IDS.omeprazole]: { generic: 'Omeprazole', form: 'Capsule', strength: '20mg', pack: '14 capsules', manufacturer: 'AstraZeneca' },
  [PRODUCT_IDS.paracetamol]: { generic: 'Paracetamol', form: 'Tablet', strength: '500mg', pack: '24 tablets', manufacturer: 'Haleon' },
  [PRODUCT_IDS.ibuprofen]: { generic: 'Ibuprofen', form: 'Tablet', strength: '400mg', pack: '24 tablets', manufacturer: 'Pfizer' },
  [PRODUCT_IDS.ors]: { generic: 'Oral Rehydration Salts (WHO)', form: 'Powder', strength: '20.5g/sachet', pack: '10 sachets', manufacturer: 'UNICEF Supply' },
  [PRODUCT_IDS.cetirizine]: { generic: 'Cetirizine Hydrochloride', form: 'Tablet', strength: '10mg', pack: '7 tablets', manufacturer: 'UCB' },
  [PRODUCT_IDS.vitaminC]: { generic: 'Ascorbic Acid', form: 'Effervescent Tablet', strength: '1000mg', pack: '10 tablets', manufacturer: 'Bayer' },
  [PRODUCT_IDS.vitaminD]: { generic: 'Cholecalciferol', form: 'Softgel', strength: '2000 IU', pack: '60 softgels', manufacturer: 'NOW Foods' },
  [PRODUCT_IDS.multivitamin]: { generic: 'Daily Multivitamin', form: 'Tablet', strength: 'Multivitamin', pack: '60 tablets', manufacturer: 'Centrum' },
  [PRODUCT_IDS.bpMonitor]: { generic: 'Automatic Blood Pressure Monitor', form: 'Device', strength: '—', pack: '1 unit', manufacturer: 'Omron Healthcare' },
  [PRODUCT_IDS.glucometer]: { generic: 'Blood Glucose Monitoring System', form: 'Device', strength: '—', pack: '1 meter + 25 strips', manufacturer: 'Roche' },
  [PRODUCT_IDS.thermometer]: { generic: 'Clinical Thermometer', form: 'Device', strength: '—', pack: '1 unit', manufacturer: 'Braun' },
  [PRODUCT_IDS.pulseOximeter]: { generic: 'Fingertip Pulse Oximeter', form: 'Device', strength: '—', pack: '1 unit', manufacturer: 'Nonin' },
  [PRODUCT_IDS.plasters]: { generic: 'Adhesive Bandage', form: 'Plaster', strength: 'Various', pack: '60 pieces', manufacturer: 'Johnson & Johnson' },
  [PRODUCT_IDS.firstAidKit]: { generic: 'First Aid Kit', form: 'Kit', strength: '—', pack: '1 kit', manufacturer: 'Survivex' },
  [PRODUCT_IDS.handSanitizer]: { generic: 'Alcohol-based Hand Sanitizer', form: 'Liquid', strength: '70% IPA', pack: '500ml', manufacturer: 'Reckitt' },
  [PRODUCT_IDS.faceMask]: { generic: 'Surgical Face Mask', form: 'Mask', strength: '3-ply', pack: '50 masks', manufacturer: '3M' },
  [PRODUCT_IDS.babyDiapers]: { generic: 'Baby Diaper', form: 'Diaper', strength: 'Size 3', pack: '40 diapers', manufacturer: 'Procter & Gamble' },
  [PRODUCT_IDS.babyLotion]: { generic: 'Baby Moisturizing Lotion', form: 'Lotion', strength: '—', pack: '200ml', manufacturer: 'Johnson & Johnson' },
  [PRODUCT_IDS.toothpaste]: { generic: 'Fluoride Toothpaste', form: 'Paste', strength: '1450ppm fluoride', pack: '150ml', manufacturer: 'Colgate-Palmolive' },
  [PRODUCT_IDS.mouthwash]: { generic: 'Antiseptic Mouthwash', form: 'Liquid', strength: '0.2% CHX', pack: '500ml', manufacturer: 'Kenvue' },
  [PRODUCT_IDS.handSoap]: { generic: 'Liquid Hand Soap', form: 'Liquid', strength: '—', pack: '400ml', manufacturer: 'Colgate-Palmolive' },
  [PRODUCT_IDS.thermometerStrip]: { generic: 'Forehead Temperature Strip', form: 'Strip', strength: '—', pack: '1 strip', manufacturer: 'Tempa' },
};

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'product_categories',
      categories.map((category) => ({
        ...category,
        image: null,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      }))
    );
    await queryInterface.bulkInsert(
      'products',
      products.map((item) => ({ ...item, ...(MARKETING[item.id] || {}), createdAt: now, updatedAt: now }))
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('products', { id: products.map((p) => p.id) });
    await queryInterface.bulkDelete('product_categories', { id: categories.map((c) => c.id) });
  },
};
