import { USER_IDS } from './20261006010001-seed-users.js';
import { PATIENT_IDS } from './20261006010004-seed-patients.js';
import { ADMISSION_IDS } from './20261006010007-seed-admissions.js';
import { PRODUCT_IDS } from './20261006010006-seed-product-catalog.js';

const now = new Date();

const orders = [
  {
    id: 'b0000000-0000-4000-8000-000000000001',
    orderNumber: 'ORD-DEMO0001',
    userId: USER_IDS.patientAmy,
    patientId: PATIENT_IDS.amy,
    deliveryAddress: '12 Independence Avenue, Accra',
    status: 'delivered',
    paymentStatus: 'paid',
    prescriptionStatus: 'not_required',
    subtotal: 12.4,
    deliveryFee: 5.0,
    total: 17.4,
  },
  {
    id: 'b0000000-0000-4000-8000-000000000002',
    orderNumber: 'ORD-DEMO0002',
    userId: USER_IDS.patientBen,
    patientId: PATIENT_IDS.ben,
    deliveryAddress: '5 Ring Road East, Accra',
    status: 'pending',
    paymentStatus: 'pending',
    prescriptionStatus: 'pending',
    subtotal: 11.0,
    deliveryFee: 5.0,
    total: 16.0,
  },
  {
    id: 'b0000000-0000-4000-8000-000000000003',
    orderNumber: 'ORD-DEMO0003',
    userId: USER_IDS.patientFred,
    patientId: PATIENT_IDS.fred,
    deliveryAddress: '41 Kaneshie Lane, Accra',
    status: 'confirmed',
    paymentStatus: 'paid',
    prescriptionStatus: 'not_required',
    subtotal: 27.25,
    deliveryFee: 5.0,
    total: 32.25,
  },
];

const orderItems = [
  {
    id: 'c0000000-0000-4000-8000-000000000001',
    orderId: orders[0].id,
    productId: PRODUCT_IDS.paracetamol,
    quantity: 2,
    unitPrice: 2.95,
    subtotal: 5.9,
  },
  {
    id: 'c0000000-0000-4000-8000-000000000002',
    orderId: orders[0].id,
    productId: PRODUCT_IDS.vitaminC,
    quantity: 1,
    unitPrice: 6.5,
    subtotal: 6.5,
  },
  {
    id: 'c0000000-0000-4000-8000-000000000003',
    orderId: orders[1].id,
    productId: PRODUCT_IDS.lisinopril,
    quantity: 1,
    unitPrice: 11.0,
    subtotal: 11.0,
  },
  {
    id: 'c0000000-0000-4000-8000-000000000004',
    orderId: orders[2].id,
    productId: PRODUCT_IDS.thermometer,
    quantity: 2,
    unitPrice: 8.75,
    subtotal: 17.5,
  },
  {
    id: 'c0000000-0000-4000-8000-000000000005',
    orderId: orders[2].id,
    productId: PRODUCT_IDS.plasters,
    quantity: 3,
    unitPrice: 3.25,
    subtotal: 9.75,
  },
];

const bills = [
  {
    id: 'd0000000-0000-4000-8000-000000000001',
    patientId: PATIENT_IDS.amy,
    admissionId: ADMISSION_IDS.amy,
    consultationFee: 150.0,
    bedFee: 240.0,
    laboratoryFee: 60.0,
    pharmacyFee: 40.0,
    otherCharges: 0.0,
    totalAmount: 490.0,
    amountPaid: 150.0,
    balance: 340.0,
    status: 'partially-paid',
  },
  {
    id: 'd0000000-0000-4000-8000-000000000002',
    patientId: PATIENT_IDS.ben,
    admissionId: ADMISSION_IDS.ben,
    consultationFee: 200.0,
    bedFee: 320.0,
    laboratoryFee: 120.0,
    pharmacyFee: 60.0,
    otherCharges: 0.0,
    totalAmount: 700.0,
    amountPaid: 300.0,
    balance: 400.0,
    status: 'partially-paid',
  },
  {
    id: 'd0000000-0000-4000-8000-000000000003',
    patientId: PATIENT_IDS.clara,
    admissionId: ADMISSION_IDS.clara,
    consultationFee: 120.0,
    bedFee: 160.0,
    laboratoryFee: 45.0,
    pharmacyFee: 30.0,
    otherCharges: 0.0,
    totalAmount: 355.0,
    amountPaid: 0.0,
    balance: 355.0,
    status: 'pending',
  },
  {
    id: 'd0000000-0000-4000-8000-000000000004',
    patientId: PATIENT_IDS.eve,
    admissionId: null,
    consultationFee: 80.0,
    bedFee: 0.0,
    laboratoryFee: 0.0,
    pharmacyFee: 0.0,
    otherCharges: 20.0,
    totalAmount: 100.0,
    amountPaid: 100.0,
    balance: 0.0,
    status: 'paid',
  },
];

const orderRows = orders.map((order) => ({
  ...order,
  createdAt: now,
  updatedAt: now,
}));

const billRows = bills.map((bill) => ({
  ...bill,
  createdAt: now,
  updatedAt: now,
}));

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('orders', orderRows);
    await queryInterface.bulkInsert(
      'order_items',
      orderItems.map((item) => ({ ...item, createdAt: now, updatedAt: now }))
    );
    await queryInterface.bulkInsert('bills', billRows);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('bills', { id: bills.map((b) => b.id) });
    await queryInterface.bulkDelete('order_items', { id: orderItems.map((i) => i.id) });
    await queryInterface.bulkDelete('orders', { id: orders.map((o) => o.id) });
  },
};
