const BASE = '{{baseUrl}}';

const build = (method, url, name, { auth = true, body = null } = {}) => {
  const item = {
    name,
    request: {
      method,
      header: [{ key: 'Content-Type', value: 'application/json' }],
      url: { raw: `${BASE}${url}`, host: ['{{baseUrl}}'], path: url.split(/[?/]/).filter(Boolean) },
      description: name,
    },
  };
  if (auth) {
    item.request.auth = {
      type: 'bearer',
      bearer: [{ key: 'token', value: '{{token}}', type: 'string' }],
    };
  }
  if (body) {
    item.request.body = { mode: 'raw', raw: JSON.stringify(body, null, 2) };
  }
  return item;
};

const folder = (name, items, description) => ({ name, description, item: items });

const collection = {
  info: {
    name: 'Hospital Management API',
    description:
      'Collection covering the Hospital Management System backend. Login first; the response token is persisted into the {{token}} variable automatically.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: [
    folder('Auth', [
      {
        name: 'Register (public)',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          url: { raw: `${BASE}/api/auth/register`, host: ['{{baseUrl}}'], path: ['api', 'auth', 'register'] },
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              { name: 'New Patient', email: 'patient.new@hospital.com', password: 'Password123!', phone: '+233200001234' },
              null,
              2
            ),
          },
        },
      },
      {
        name: 'Login',
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                'const json = pm.response.json();',
                "if (json.success && json.data && json.data.token) { pm.collectionVariables.set('token', json.data.token); }",
                "pm.collectionVariables.set('currentUserId', json.data?.user?.id || '');",
              ],
              type: 'text/javascript',
            },
          },
        ],
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          url: { raw: `${BASE}/api/auth/login`, host: ['{{baseUrl}}'], path: ['api', 'auth', 'login'] },
          body: {
            mode: 'raw',
            raw: JSON.stringify({ email: 'admin@hospital.com', password: 'Password123!' }, null, 2),
          },
        },
      },
      build('GET', '/api/auth/me', 'Get current user (me)'),
      build('PUT', '/api/auth/update-profile', 'Update own profile', { body: { name: 'Updated Name' } }),
      build('PUT', '/api/auth/change-password', 'Change password', {
        body: { currentPassword: 'Password123!', newPassword: 'NewPassword123!' },
      }),
    ]),
    folder('Users (admin)', [
      build('GET', '/api/users', 'List users'),
      build('GET', '/api/users/{{userId}}', 'Get user'),
      build('POST', '/api/users', 'Create user', {
        body: { name: 'Nurse Nina', email: 'nurse.nina@hospital.com', password: 'Password123!', phone: '+233200004321', role: 'nurse' },
      }),
      build('PUT', '/api/users/{{userId}}', 'Update user', { body: { role: 'nurse' } }),
      build('DELETE', '/api/users/{{userId}}', 'Delete user'),
    ]),
    folder('Departments', [
      build('GET', '/api/departments', 'List departments'),
      build('GET', '/api/departments/{{departmentId}}', 'Get department'),
      build('POST', '/api/departments', 'Create department', {
        body: { name: 'Oncology', description: 'Cancer care unit' },
      }),
      build('PUT', '/api/departments/{{departmentId}}', 'Update department', { body: { status: 'active' } }),
      build('DELETE', '/api/departments/{{departmentId}}', 'Delete department'),
    ]),
    folder('Doctors', [
      build('GET', '/api/doctors', 'List doctors'),
      build('GET', '/api/doctors/{{doctorId}}', 'Get doctor'),
      build('POST', '/api/doctors', 'Create doctor', {
        body: {
          userId: '{{userId}}',
          departmentId: '20000000-0000-4000-8000-000000000001',
          firstName: 'Nana',
          lastName: 'Ama',
          specialization: 'Cardiology',
          licenseNumber: 'GMC-XXXXX',
          email: 'dr.nana@hospital.com',
          phone: '+233200005555',
        },
      }),
      build('PUT', '/api/doctors/{{doctorId}}', 'Update doctor', { body: { availability: 'available' } }),
      build('DELETE', '/api/doctors/{{doctorId}}', 'Delete doctor'),
    ]),
    folder('Patients', [
      build('GET', '/api/patients', 'List patients'),
      build('GET', '/api/patients/me/profile', 'My patient profile'),
      build('GET', '/api/patients/{{patientId}}', 'Get patient'),
      build('POST', '/api/patients', 'Create patient', {
        body: {
          userId: '{{userId}}',
          firstName: 'Kofi',
          lastName: 'Asante',
          dateOfBirth: '1990-05-14',
          gender: 'male',
          phone: '+233200006666',
          email: 'kofi.asante@hospital.com',
          bloodGroup: 'O+',
        },
      }),
      build('PUT', '/api/patients/{{patientId}}', 'Update patient', { body: { allergies: 'None' } }),
      build('DELETE', '/api/patients/{{patientId}}', 'Delete patient'),
    ]),
    folder('Wards & Beds', [
      build('GET', '/api/wards?withBeds=true', 'List wards with beds'),
      build('GET', '/api/wards/{{wardId}}', 'Get ward'),
      build('POST', '/api/wards', 'Create ward', {
        body: {
          name: 'Cardiology Ward',
          departmentId: '20000000-0000-4000-8000-000000000001',
          wardType: 'medical',
          capacity: 10,
          description: 'Cardiac monitoring beds',
        },
      }),
      build('PUT', '/api/wards/{{wardId}}', 'Update ward', { body: { status: 'active' } }),
      build('DELETE', '/api/wards/{{wardId}}', 'Delete ward'),
      build('GET', '/api/beds?status=available', 'List available beds'),
      build('GET', '/api/beds/{{bedId}}', 'Get bed'),
      build('POST', '/api/beds', 'Create bed', { body: { wardId: '{{wardId}}', bedNumber: 'B-101' } }),
      build('PUT', '/api/beds/{{bedId}}', 'Update bed (status)', { body: { status: 'reserved' } }),
      build('DELETE', '/api/beds/{{bedId}}', 'Delete bed'),
    ]),
    folder('Admissions', [
      build('GET', '/api/admissions', 'List admissions'),
      build('GET', '/api/admissions/{{admissionId}}', 'Get admission'),
      build('POST', '/api/admissions', 'Admit patient', {
        body: {
          patientId: '40000000-0000-4000-8000-000000000001',
          doctorId: '30000000-0000-4000-8000-000000000001',
          wardId: '50000000-0000-4000-8000-000000000002',
          bedId: '60000000-0000-4000-8000-000000000206',
          expectedDischargeDate: '2026-10-20',
          reason: 'Chest pain observation',
        },
      }),
      build('PUT', '/api/admissions/{{admissionId}}/transfer', 'Transfer patient', {
        body: {
          wardId: '50000000-0000-4000-8000-000000000003',
          bedId: '60000000-0000-4000-8000-000000000301',
          reason: 'Surgical consult',
        },
      }),
      build('PUT', '/api/admissions/{{admissionId}}/discharge', 'Discharge patient', {
        body: { dischargeNotes: 'Stable', finalDiagnosis: 'Recovered' },
      }),
      build('PUT', '/api/admissions/{{admissionId}}/cancel', 'Cancel admission'),
      build('PUT', '/api/admissions/{{admissionId}}', 'Update admission', { body: { diagnosis: 'Updated diagnosis' } }),
      build('DELETE', '/api/admissions/{{admissionId}}', 'Delete admission'),
    ]),
    folder('Appointments', [
      build('GET', '/api/appointments', 'List appointments'),
      build('GET', '/api/appointments/{{appointmentId}}', 'Get appointment'),
      build('POST', '/api/appointments', 'Book appointment', {
        body: {
          doctorId: '30000000-0000-4000-8000-000000000002',
          appointmentDate: '2026-10-20',
          appointmentTime: '09:30',
          reason: 'Follow-up check',
        },
      }),
      build('PUT', '/api/appointments/{{appointmentId}}', 'Update appointment', {
        body: { status: 'confirmed' },
      }),
      build('DELETE', '/api/appointments/{{appointmentId}}', 'Cancel/delete appointment'),
    ]),
    folder('Medical Records', [
      build('GET', '/api/medical-records', 'List medical records'),
      build('GET', '/api/medical-records/{{recordId}}', 'Get medical record'),
      build('POST', '/api/medical-records', 'Create medical record', {
        body: {
          patientId: '40000000-0000-4000-8000-000000000001',
          doctorId: '30000000-0000-4000-8000-000000000004',
          diagnosis: 'Acute bronchitis',
          symptoms: 'Cough, mild fever',
          treatment: 'Cough syrup, rest',
        },
      }),
      build('PUT', '/api/medical-records/{{recordId}}', 'Update medical record', {
        body: { treatment: 'Antibiotics' },
      }),
      build('DELETE', '/api/medical-records/{{recordId}}', 'Delete medical record'),
    ]),
    folder('Prescriptions', [
      build('GET', '/api/prescriptions', 'List prescriptions'),
      build('GET', '/api/prescriptions/{{prescriptionId}}', 'Get prescription'),
      build('POST', '/api/prescriptions', 'Create prescription', {
        body: {
          patientId: '40000000-0000-4000-8000-000000000001',
          doctorId: '30000000-0000-4000-8000-000000000004',
          medicineId: 'a0000000-0000-4000-8000-000000000002',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '7 days',
          instructions: 'Take after meals.',
        },
      }),
      build('PUT', '/api/prescriptions/{{prescriptionId}}', 'Update prescription (status)', {
        body: { status: 'dispensed' },
      }),
      build('DELETE', '/api/prescriptions/{{prescriptionId}}', 'Delete prescription'),
    ]),
    folder('Laboratory', [
      build('GET', '/api/laboratory', 'List laboratory tests'),
      build('GET', '/api/laboratory/{{testId}}', 'Get laboratory test'),
      build('POST', '/api/laboratory', 'Request laboratory test', {
        body: {
          patientId: '40000000-0000-4000-8000-000000000001',
          doctorId: '30000000-0000-4000-8000-000000000004',
          testName: 'Full Blood Count',
          testType: 'haematology',
        },
      }),
      build('PUT', '/api/laboratory/{{testId}}', 'Update test (status/result)', {
        body: { status: 'completed', result: 'WBC 7.2, Hb 13.1 g/dL' },
      }),
      build('DELETE', '/api/laboratory/{{testId}}', 'Delete laboratory test'),
    ]),
    folder('Pharmacy Catalog', [
      build('GET', '/api/product-categories', 'List categories'),
      build('POST', '/api/product-categories', 'Create category', { body: { name: 'New Category' } }),
      build('PUT', '/api/product-categories/{{categoryId}}', 'Update category', { body: { status: 'active' } }),
      build('DELETE', '/api/product-categories/{{categoryId}}', 'Delete category'),
      build('GET', '/api/products', 'List products'),
      build('GET', '/api/products/{{productId}}', 'Get product'),
      build('POST', '/api/products', 'Create product', {
        body: {
          name: 'Ibuprofen 400mg',
          categoryId: '90000000-0000-4000-8000-000000000002',
          price: 4.5,
          stockQuantity: 200,
          requiresPrescription: false,
          brand: 'Advil',
        },
      }),
      build('PUT', '/api/products/{{productId}}', 'Update product', { body: { stockQuantity: 150 } }),
      build('DELETE', '/api/products/{{productId}}', 'Delete product'),
    ]),
    folder('Orders', [
      build('GET', '/api/orders', 'List my/all orders'),
      build('GET', '/api/orders/{{orderId}}', 'Get order'),
      build('POST', '/api/orders', 'Create order', {
        body: {
          deliveryAddress: '12 Independence Avenue, Accra',
          items: [{ productId: 'a0000000-0000-4000-8000-000000000006', quantity: 3 }],
        },
      }),
      build('PUT', '/api/orders/{{orderId}}/verify-prescription', 'Verify prescription', {
        body: { decision: 'approved' },
      }),
      build('PUT', '/api/orders/{{orderId}}/status', 'Update order status', { body: { status: 'shipped' } }),
    ]),
    folder('Billing', [
      build('GET', '/api/billing', 'List bills'),
      build('GET', '/api/billing/{{billId}}', 'Get bill'),
      build('POST', '/api/billing', 'Create bill', {
        body: {
          patientId: '40000000-0000-4000-8000-000000000001',
          consultationFee: 150,
          bedFee: 0,
          laboratoryFee: 0,
          pharmacyFee: 40,
          otherCharges: 0,
          totalAmount: 190,
          amountPaid: 0,
          balance: 190,
        },
      }),
      build('PUT', '/api/billing/{{billId}}', 'Update bill', { body: { amountPaid: 100, balance: 90 } }),
      build('POST', '/api/billing/{{billId}}/payments', 'Record payment', { body: { amount: 100 } }),
      build('DELETE', '/api/billing/{{billId}}', 'Delete bill'),
    ]),
    folder('Dashboards', [
      build('GET', '/api/dashboard/admin', 'Admin dashboard'),
      build('GET', '/api/dashboard/doctor', 'Doctor dashboard'),
      build('GET', '/api/dashboard/nurse', 'Nurse dashboard'),
      build('GET', '/api/dashboard/pharmacy', 'Pharmacy dashboard'),
      build('GET', '/api/dashboard/patient', 'Patient dashboard'),
    ]),
    folder('Health', [build('GET', '/health', 'Health check', { auth: false })]),
  ],
  variable: [
    { key: 'baseUrl', value: 'http://localhost:5000' },
    { key: 'token', value: '' },
    { key: 'userId', value: '' },
    { key: 'patientId', value: '' },
    { key: 'doctorId', value: '' },
    { key: 'departmentId', value: '' },
    { key: 'wardId', value: '' },
    { key: 'bedId', value: '' },
    { key: 'admissionId', value: '' },
    { key: 'appointmentId', value: '' },
    { key: 'recordId', value: '' },
    { key: 'prescriptionId', value: '' },
    { key: 'testId', value: '' },
    { key: 'categoryId', value: '' },
    { key: 'productId', value: '' },
    { key: 'orderId', value: '' },
    { key: 'billId', value: '' },
  ],
};

const fs = await import('node:fs');
const root = '/home/timothy-dusu/Health-platform/backend/postman';
fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(`${root}/hospital-api.postman_collection.json`, JSON.stringify(collection, null, 2));
fs.writeFileSync(
  `${root}/hospital-api.environment.json`,
  JSON.stringify({
    name: 'Hospital API Local',
    values: [
      { key: 'baseUrl', value: 'http://localhost:5000', enabled: true },
      { key: 'token', value: '', enabled: true },
    ],
    _postman_variable_scope: 'environment',
  }, null, 2)
);
console.log('Postman collection written.');