import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import { initializeDatabase, getSequelize } from '../src/config/database.js';
import { getEmailOutbox } from '../src/services/emailService.js';
import { hashToken } from '../src/utils/tokens.js';

process.env.NODE_ENV = 'test';

let server;
let adminToken;
let doctorToken;
let pharmacistToken;
let patientToken;

const login = async (email, password = 'Password123!') => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  expect(res.status).toBe(200);
  return res.body.data.token;
};

const authorized = (token) => ({ Authorization: `Bearer ${token}` });

/* Verification/reset emails are captured in the development outbox because the
   test environment has no RESEND_API_KEY. Pull the raw token out of the link. */
const tokenFromOutbox = (template, to) => {
  const message = [...getEmailOutbox()]
    .reverse()
    .find((entry) => entry.template === template && entry.to === to);
  expect(message).toBeDefined();
  const match = message.text.match(/[?&]token=([A-Za-z0-9_\-]+)/);
  expect(match).toBeTruthy();
  return decodeURIComponent(match[1]);
};

const registerUser = async (overrides = {}) => {
  const email = overrides.email || `jest.user.${Date.now()}.${Math.random().toString(16).slice(2)}@hospital.com`;
  const payload = {
    name: 'Jest User',
    email,
    password: 'Password123!',
    phone: '+233200009999',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  expect(res.status).toBe(201);
  return { email, password: payload.password, res };
};

beforeAll(async () => {
  server = app;
  await initializeDatabase();
  adminToken = await login('admin@hospital.com');
  doctorToken = await login('dr.amelia@hospital.com');
  pharmacistToken = await login('pharmacy@hospital.com');
});

afterAll(async () => {
  const sequelize = await getSequelize();
  await sequelize.close();
});

describe('Auth', () => {
  test('registers a patient unverified and auto-creates a patient profile after verification', async () => {
    const { email, password } = await registerUser({ name: 'Jest Patient' });

    // Signup no longer issues a session for an unverified account.
    const unverified = await request(app).post('/api/auth/login').send({ email, password });
    expect(unverified.status).toBe(403);
    expect(unverified.body.errors?.[0]?.code).toBe('EMAIL_NOT_VERIFIED');

    const token = tokenFromOutbox('email-verification', email);
    const verified = await request(app).post('/api/auth/verify-email').send({ token });
    expect(verified.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.data.token).toBeTruthy();

    const me = await request(app)
      .get('/api/patients/me/profile')
      .set(authorized(login.body.data.token));
    expect(me.status).toBe(200);
    expect(me.body.data).toMatchObject({ email, patientNumber: expect.any(String) });
  });

  test('registration never returns a usable token', async () => {
    const { res } = await registerUser();
    expect(res.body.data.token).toBeUndefined();
    expect(res.body.data.user.emailVerified).toBe(false);
  });

  test('rejects duplicate registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup', email: 'admin@hospital.com', password: 'Password123!' });
    expect(res.status).toBe(409);
  });

  test('registers with split names and date of birth', async () => {
    const email = `jest.firstlast.${Date.now()}@hospital.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jest',
        lastName: 'Rodriguez',
        dateOfBirth: '1990-05-14',
        email,
        password: 'Password123!',
        phone: '+233200008889',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.user.name).toBe('Jest Rodriguez');

    const token = tokenFromOutbox('email-verification', email);
    await request(app).post('/api/auth/verify-email').send({ token });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123!' });
    const me = await request(app)
      .get('/api/patients/me/profile')
      .set(authorized(login.body.data.token));
    expect(me.status).toBe(200);
    expect(me.body.data).toMatchObject({ firstName: 'Jest', lastName: 'Rodriguez', dateOfBirth: '1990-05-14' });
  });

  test('rejects invalid login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@hospital.com', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  test('requires a token for protected routes', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });
});

describe('Email verification and password reset', () => {
  test('verifies an email once and rejects reuse of the same token', async () => {
    const { email } = await registerUser();
    const token = tokenFromOutbox('email-verification', email);

    const first = await request(app).post('/api/auth/verify-email').send({ token });
    expect(first.status).toBe(200);

    const reused = await request(app).post('/api/auth/verify-email').send({ token });
    expect(reused.status).toBe(400);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123!' });
    expect(login.status).toBe(200);
  });

  test('rejects an expired verification token', async () => {
    const { email } = await registerUser();
    const token = tokenFromOutbox('email-verification', email);
    const sequelize = getSequelize();
    await sequelize.models.EmailVerificationToken.update(
      { expiresAt: new Date(Date.now() - 1000) },
      { where: { tokenHash: hashToken(token) } }
    );
    const res = await request(app).post('/api/auth/verify-email').send({ token });
    expect(res.status).toBe(400);
  });

  test('resend issues a new token and keeps the response generic', async () => {
    const { email } = await registerUser();
    const firstToken = tokenFromOutbox('email-verification', email);

    const resend = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: 'nobody-' + email });
    expect(resend.status).toBe(200);
    expect(resend.body.data).toBeNull();

    const again = await request(app).post('/api/auth/resend-verification').send({ email });
    expect(again.status).toBe(200);
    expect(again.body.message).toMatch(/if an account exists/i);

    // The original token is invalidated when a replacement is issued.
    const oldToken = await request(app).post('/api/auth/verify-email').send({ token: firstToken });
    expect(oldToken.status).toBe(400);

    const newToken = tokenFromOutbox('email-verification', email);
    expect(newToken).not.toBe(firstToken);
    const verified = await request(app).post('/api/auth/verify-email').send({ token: newToken });
    expect(verified.status).toBe(200);
  });

  test('resets a password through the emailed link and invalidates the token', async () => {
    const { email } = await registerUser();
    const verification = tokenFromOutbox('email-verification', email);
    await request(app).post('/api/auth/verify-email').send({ token: verification });

    const forgot = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(forgot.status).toBe(200);
    expect(forgot.body.data).toBeNull();
    expect(JSON.stringify(forgot.body)).not.toMatch(/resetToken/i);

    const resetToken = tokenFromOutbox('password-reset', email);
    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, password: 'NewPassword456!' });
    expect(reset.status).toBe(200);

    const reused = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, password: 'AnotherPassword789!' });
    expect(reused.status).toBe(400);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123!' });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'NewPassword456!' });
    expect(newLogin.status).toBe(200);
  });

  test('rejects an expired password reset token', async () => {
    const { email } = await registerUser();
    const verification = tokenFromOutbox('email-verification', email);
    await request(app).post('/api/auth/verify-email').send({ token: verification });
    await request(app).post('/api/auth/forgot-password').send({ email });
    const resetToken = tokenFromOutbox('password-reset', email);

    const sequelize = getSequelize();
    await sequelize.models.PasswordResetToken.update(
      { expiresAt: new Date(Date.now() - 1000) },
      { where: { tokenHash: hashToken(resetToken) } }
    );

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, password: 'NewPassword456!' });
    expect(res.status).toBe(400);
  });

  test('password reset requests stay generic for unknown accounts', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'does-not-exist@hospital.com' });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
    expect(res.body.message).toMatch(/if an account exists/i);
  });

  test('rejects a confirmation field sent to the reset endpoint', async () => {
    const { email } = await registerUser();
    const verification = tokenFromOutbox('email-verification', email);
    await request(app).post('/api/auth/verify-email').send({ token: verification });
    await request(app).post('/api/auth/forgot-password').send({ email });
    const resetToken = tokenFromOutbox('password-reset', email);

    const res = await request(app).post('/api/auth/reset-password').send({
      token: resetToken,
      password: 'NewPassword456!',
      confirmPassword: 'NewPassword456!',
    });
    expect(res.status).toBe(400);
  });
});

describe('Role-based access', () => {
  test('patient cannot access admin-only users endpoint', async () => {
    patientToken = await login('patient.amy@hospital.com');
    const res = await request(app).get('/api/users').set(authorized(patientToken));
    expect(res.status).toBe(403);
  });

  test('patient is scoped to own patient record', async () => {
    const res = await request(app).get('/api/patients').set(authorized(patientToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('patient cannot open admin dashboard', async () => {
    const res = await request(app).get('/api/dashboard/admin').set(authorized(patientToken));
    expect(res.status).toBe(403);
  });
});

describe('Wards & beds', () => {
  test('lists wards and optionally their beds', async () => {
    const plain = await request(app).get('/api/wards').set(authorized(adminToken));
    expect(plain.status).toBe(200);
    expect(plain.body.data.length).toBe(7);

    const withBeds = await request(app)
      .get('/api/wards?withBeds=true')
      .set(authorized(adminToken));
    expect(withBeds.body.data.every((w) => Array.isArray(w.beds))).toBe(true);
  });

  test('nurse can update a bed status', async () => {
    const nurseToken = await login('nurse.grace@hospital.com');
    const BED = '60000000-0000-4000-8000-000000000203';
    const r1 = await request(app)
      .put(`/api/beds/${BED}`)
      .set(authorized(nurseToken))
      .send({ status: 'reserved' });
    expect(r1.status).toBe(200);
    expect(r1.body.data.status).toBe('reserved');
    await request(app).put(`/api/beds/${BED}`).set(authorized(nurseToken)).send({ status: 'available' });
  });
});

describe('Admissions lifecycle', () => {
  let admissionId;

  test('admits a patient and locks the bed', async () => {
    const res = await request(app)
      .post('/api/admissions')
      .set(authorized(adminToken))
      .send({
        patientId: '40000000-0000-4000-8000-000000000006',
        doctorId: '30000000-0000-4000-8000-000000000001',
        wardId: '50000000-0000-4000-8000-000000000002',
        bedId: '60000000-0000-4000-8000-000000000205',
        reason: 'Jest admission',
      });
    expect(res.status).toBe(201);
    admissionId = res.body.data.id;

    const bed = await request(app)
      .get('/api/beds/60000000-0000-4000-8000-000000000205')
      .set(authorized(adminToken));
    expect(bed.body.data.status).toBe('occupied');
  });

  test('rejects a second active admission for the same patient', async () => {
    const res = await request(app)
      .post('/api/admissions')
      .set(authorized(adminToken))
      .send({
        patientId: '40000000-0000-4000-8000-000000000006',
        doctorId: '30000000-0000-4000-8000-000000000001',
        wardId: '50000000-0000-4000-8000-000000000003',
        bedId: '60000000-0000-4000-8000-000000000301',
        reason: 'Duplicate jest admission',
      });
    expect(res.status).toBe(409);
  });

  test('transfers the admission and records the movement', async () => {
    const res = await request(app)
      .put(`/api/admissions/${admissionId}/transfer`)
      .set(authorized(adminToken))
      .send({
        wardId: '50000000-0000-4000-8000-000000000003',
        bedId: '60000000-0000-4000-8000-000000000301',
        reason: 'Surgical consult',
      });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('transferred');
    expect(res.body.data.ward.name).toBe('Surgical Ward');
  });

  test('discharges the admission and releases the bed', async () => {
    const res = await request(app)
      .put(`/api/admissions/${admissionId}/discharge`)
      .set(authorized(adminToken))
      .send({ dischargeNotes: 'Jest discharge', finalDiagnosis: 'Recovered' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('discharged');

    const bed = await request(app)
      .get('/api/beds/60000000-0000-4000-8000-000000000301')
      .set(authorized(adminToken));
    expect(bed.body.data.status).toBe('available');
  });
});

describe('Pharmacy orders', () => {
  test('creates an order applying discount price and computes totals', async () => {
    patientToken = await login('patient.amy@hospital.com');
    const res = await request(app)
      .post('/api/orders')
      .set(authorized(patientToken))
      .send({
        deliveryAddress: 'Jest address',
        items: [
          { productId: 'a0000000-0000-4000-8000-000000000006', quantity: 2 },
          { productId: 'a0000000-0000-4000-8000-000000000010', quantity: 1 },
        ],
      });
    expect(res.status).toBe(201);
    expect(Number(res.body.data.subtotal)).toBeCloseTo(12.4);
    expect(Number(res.body.data.deliveryFee)).toBe(5);
    expect(Number(res.body.data.total)).toBeCloseTo(17.4);
  });

  test('rejects an order when stock is insufficient', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set(authorized(patientToken))
      .send({ items: [{ productId: 'a0000000-0000-4000-8000-000000000016', quantity: 999 }] });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Insufficient stock');
  });

  test('blocks prescription-only orders until verified', async () => {
    const created = await request(app)
      .post('/api/orders')
      .set(authorized(patientToken))
      .send({ items: [{ productId: 'a0000000-0000-4000-8000-000000000001', quantity: 1 }] });
    expect(created.status).toBe(201);
    expect(created.body.data.prescriptionStatus).toBe('pending');

    const blocked = await request(app)
      .put(`/api/orders/${created.body.data.id}/status`)
      .set(authorized(pharmacistToken))
      .send({ status: 'processing' });
    expect(blocked.status).toBe(409);

    const approved = await request(app)
      .put(`/api/orders/${created.body.data.id}/verify-prescription`)
      .set(authorized(pharmacistToken))
      .send({ decision: 'approved' });
    expect(approved.status).toBe(200);
    expect(approved.body.data.prescriptionStatus).toBe('approved');

    const advanced = await request(app)
      .put(`/api/orders/${created.body.data.id}/status`)
      .set(authorized(pharmacistToken))
      .send({ status: 'processing' });
    expect(advanced.status).toBe(200);
    expect(advanced.body.data.status).toBe('processing');
  });
});

describe('Billing', () => {
  test('lists bills and records a payment updating balance', async () => {
    const list = await request(app).get('/api/billing').set(authorized(adminToken));
    expect(list.status).toBe(200);
    const bill = list.body.data.find((b) => b.status !== 'paid');
    expect(bill).toBeDefined();

    const pay = await request(app)
      .post(`/api/billing/${bill.id}/payments`)
      .set(authorized(adminToken))
      .send({ amount: 50 });
    expect(pay.status).toBe(200);
    expect(Number(pay.body.data.amountPaid)).toBe(Number(bill.amountPaid) + 50);
    expect(Number(pay.body.data.balance)).toBeGreaterThan(0);
  });
});

describe('Clinical workflows', () => {
  test('creates a lab test and completes it with a result', async () => {
    const labToken = await login('lab.tech@hospital.com');
    const nurseToken = await login('nurse.grace@hospital.com');

    const created = await request(app)
      .post('/api/laboratory')
      .set(authorized(doctorToken))
      .send({
        patientId: '40000000-0000-4000-8000-000000000001',
        testName: 'Jest CBC',
        testType: 'haematology',
      });
    expect(created.status).toBe(201);

    const sampled = await request(app)
      .put(`/api/laboratory/${created.body.data.id}`)
      .set(authorized(nurseToken))
      .send({ status: 'sample-collected' });
    expect(sampled.body.data.status).toBe('sample-collected');

    const done = await request(app)
      .put(`/api/laboratory/${created.body.data.id}`)
      .set(authorized(labToken))
      .send({ status: 'completed', result: 'Hb 13.2 g/dL' });
    expect(done.body.data.status).toBe('completed');
    expect(done.body.data.result).toBe('Hb 13.2 g/dL');
    expect(done.body.data.completedAt).toBeTruthy();
  });
});

describe('Dashboards', () => {
  test('admin dashboard aggregates totals', async () => {
    const res = await request(app).get('/api/dashboard/admin').set(authorized(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.data.totalBeds).toBe(42);
    expect(res.body.data.totalDoctors).toBe(6);
    expect(res.body.data.currentAdmissions).toBeGreaterThanOrEqual(3);
  });

  test('doctor dashboard shows appointment load', async () => {
    const res = await request(app).get('/api/dashboard/doctor').set(authorized(doctorToken));
    expect(res.status).toBe(200);
    expect(typeof res.body.data.todaysAppointments).toBe('number');
  });
});