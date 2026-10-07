import { getSequelize } from '../config/database.js';
import { successResponse } from '../utils/apiResponse.js';
import { attachImages } from '../utils/images.js';

const SITE_CONTENT_KEYS = [
  'serviceLines',
  'bookingSpecialties',
  'community',
  'facilities',
  'labInstruments',
  'departmentsCatalog',
  'contactChannels',
];

const toJSONs = (rows) => rows.map((row) => row.toJSON());

const userAttrs = ['id', 'name', 'email', 'role', 'phone'];
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export const bootstrap = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const role = req.user.role;
    const isPatient = role === 'patient';
    const isDoctor = role === 'doctor';
    const isStaffAdmins = ['admin', 'accountant'].includes(role);

    const me = await models.User.findByPk(req.user.id, {
      include: [
        { model: models.Patient, as: 'patientProfile' },
        { model: models.Doctor, as: 'doctorProfile' },
      ],
    });

    const patientRecord = await models.Patient.findOne({ where: { userId: req.user.id }, attributes: ['id'] });
    const doctorRecord = await models.Doctor.findOne({ where: { userId: req.user.id }, attributes: ['id'] });
    const myPatientId = patientRecord?.id || NIL_UUID;
    const myDoctorId = doctorRecord?.id || null;

    const patientWhere = isPatient ? { patientId: myPatientId } : {};
    const doctorWhere = isDoctor ? { doctorId: myDoctorId } : {};

    const [departments, productCategories, products, doctors, patients, wards, admissions, appointments, medicalRecords, prescriptions, laboratoryTests, orders, bills, checkins, users, auditLogs, contents, transfers, articles, locations, clinicalTrials, stories] =
      await Promise.all([
        models.Department.findAll({ order: [['name', 'ASC']] }),
        models.ProductCategory.findAll({ order: [['name', 'ASC']] }),
        models.Product.findAll({ where: { status: 'active' }, include: [{ model: models.ProductCategory, as: 'category' }], order: [['name', 'ASC']] }),
        models.Doctor.findAll({ include: [{ model: models.User, as: 'user', attributes: userAttrs }, { model: models.Department, as: 'department' }], order: [['lastName', 'ASC']] }),
        models.Patient.findAll({ include: [{ model: models.User, as: 'user', attributes: userAttrs }], order: [['lastName', 'ASC']] }),
        models.Ward.findAll({ include: [{ model: models.Department, as: 'department' }, { model: models.Bed, as: 'beds' }], order: [['name', 'ASC']] }),
        models.Admission.findAll({
          where: patientWhere,
          include: [
            { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Doctor, as: 'doctor', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Ward, as: 'ward' },
            { model: models.Bed, as: 'bed' },
          ],
          order: [['createdAt', 'DESC']],
        }),
        models.Appointment.findAll({
          where: { ...patientWhere, ...doctorWhere },
          include: [
            { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Doctor, as: 'doctor', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Department, as: 'department' },
          ],
          order: [['appointmentDate', 'DESC']],
        }),
        models.MedicalRecord.findAll({
          where: { ...patientWhere, ...doctorWhere },
          include: [
            { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Doctor, as: 'doctor', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
          ],
          order: [['createdAt', 'DESC']],
        }),
        models.Prescription.findAll({
          where: { ...patientWhere, ...doctorWhere },
          include: [
            { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Doctor, as: 'doctor', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Product, as: 'medicine' },
          ],
          order: [['createdAt', 'DESC']],
        }),
        models.LaboratoryTest.findAll({
          where: { ...patientWhere, ...doctorWhere },
          include: [
            { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Doctor, as: 'doctor', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
          ],
          order: [['createdAt', 'DESC']],
        }),
        models.Order.findAll({
          where: patientWhere,
          include: [
            { model: models.User, as: 'user', attributes: userAttrs },
            { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.OrderItem, as: 'items', include: [{ model: models.Product, as: 'product' }] },
          ],
          order: [['createdAt', 'DESC']],
        }),
        models.Bill.findAll({
          where: patientWhere,
          include: [
            { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Admission, as: 'admission' },
          ],
          order: [['createdAt', 'DESC']],
        }),
        models.Checkin.findAll({
          where: patientWhere,
          include: [
            { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Doctor, as: 'doctor', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
          ],
          order: [['arrivedAt', 'DESC']],
        }),
        models.User.findAll({ attributes: userAttrs, include: [{ model: models.Department, as: 'department', attributes: ['id', 'name'] }], order: [['name', 'ASC']] }),
        isStaffAdmins ? models.AuditLog.findAll({ order: [['createdAt', 'DESC']], limit: 500 }) : Promise.resolve([]),
        models.SiteContent.findAll({ where: { key: SITE_CONTENT_KEYS } }),
        models.PatientTransfer.findAll({
          where: patientWhere,
          include: [
            { model: models.Patient, as: 'patient', include: [{ model: models.User, as: 'user', attributes: userAttrs }] },
            { model: models.Ward, as: 'fromWard' },
            { model: models.Ward, as: 'toWard' },
          ],
          order: [['createdAt', 'DESC']],
        }),
        models.Article.findAll({ order: [['date', 'DESC']] }),
        models.Location.findAll({ order: [['name', 'ASC']] }),
        models.ClinicalTrial.findAll(),
        models.Story.findAll({ order: [['date', 'DESC']] }),
      ]);

    const siteContents = {};
    contents.forEach((c) => {
      siteContents[c.key] = c.value;
    });

    const participations = await models.ThreadParticipant.findAll({
      where: { userId: req.user.id },
      attributes: ['threadId'],
    });
    const myThreadIds = participations.map((p) => p.threadId);
    const allThreads = myThreadIds.length
      ? await models.Thread.findAll({
          where: { id: myThreadIds },
          include: [
            { model: models.User, as: 'participants', attributes: userAttrs },
            {
              model: models.Message,
              as: 'messages',
              include: [{ model: models.User, as: 'sender', attributes: ['id', 'name', 'role'] }],
              order: [['createdAt', 'ASC']],
            },
          ],
          order: [['lastMessageAt', 'DESC']],
        })
      : [];

    const notifications = await models.Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 200,
    });

    const [deptPlain, categoryPlain, productPlain, doctorPlain, patientPlain, wardPlain, userPlain, articlePlain] = [
      departments, productCategories, products, doctors, patients, wards, users, articles,
    ].map(toJSONs);

    await attachImages(models, 'user', userPlain);
    await attachImages(models, 'doctor', doctorPlain);
    await attachImages(models, 'product', productPlain);
    await attachImages(models, 'department', deptPlain);
    await attachImages(models, 'ward', wardPlain);
    await attachImages(models, 'article', articlePlain);

    const userById = Object.fromEntries(userPlain.map((u) => [u.id, u]));
    const doctorById = Object.fromEntries(doctorPlain.map((d) => [d.id, d]));
    const patientById = Object.fromEntries(patientPlain.map((p) => [p.id, p]));
    const patientUserIdByPatientId = Object.fromEntries(patientPlain.map((p) => [p.id, p.userId]));

    if (me.doctorProfile) {
      me.doctorProfile.imageUrl = doctorById[me.doctorProfile.id]?.imageUrl || null;
    }
    me.imageUrl = userById[me.id]?.imageUrl || null;
    if (me.patientProfile && patientById[me.patientProfile.id]) {
      me.patientProfile.imageUrl = userById[me.id]?.imageUrl || null;
    }

    const payload = {
      user: me,
      team: userPlain,
      users: userById,
      doctors: doctorById,
      patients: patientById,
      patientUserIdByPatientId,
      staffRoster: userPlain.filter((u) => u.role !== 'patient'),
      departments: deptPlain,
      productCategories: categoryPlain,
      products: productPlain,
      wards: wardPlain,
      beds: wardPlain.flatMap((ward) =>
        (ward.beds || []).map((bed) => ({ ...bed, wardId: ward.id, ward: { id: ward.id, name: ward.name } }))
      ),
      admissions,
      transfers,
      appointments,
      medicalRecords,
      prescriptions,
      laboratoryTests,
      orders,
      bills,
      checkins,
      threads: allThreads,
      notifications,
      auditLogs,
      siteContents,
articles: articlePlain,
      locations,
      clinicalTrials,
      stories,
    };

    return successResponse(res, payload);
  } catch (error) {
    return next(error);
  }
};

export default { bootstrap };