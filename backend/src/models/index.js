import User from './User.js';
import Department from './Department.js';
import Doctor from './Doctor.js';
import Patient from './Patient.js';
import Ward from './Ward.js';
import Bed from './Bed.js';
import Admission from './Admission.js';
import PatientTransfer from './PatientTransfer.js';
import Appointment from './Appointment.js';
import MedicalRecord from './MedicalRecord.js';
import Prescription from './Prescription.js';
import LaboratoryTest from './LaboratoryTest.js';
import ProductCategory from './ProductCategory.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Bill from './Bill.js';
import Image from './Image.js';
import Thread from './Thread.js';
import Message from './Message.js';
import ThreadParticipant from './ThreadParticipant.js';
import Notification from './Notification.js';
import Checkin from './Checkin.js';
import AuditLog from './AuditLog.js';
import Article from './Article.js';
import Location from './Location.js';
import ClinicalTrial from './ClinicalTrial.js';
import Story from './Story.js';
import SiteContent from './SiteContent.js';
import CaCertificate from './CaCertificate.js';
import PasswordResetToken from './PasswordResetToken.js';
import OtpToken from './OtpToken.js';

const models = {};

const initializeModels = (sequelize) => {
  if (sequelize.models.User) {
    return sequelize.models;
  }

  models.User = User(sequelize);
  models.Department = Department(sequelize);
  models.Doctor = Doctor(sequelize);
  models.Patient = Patient(sequelize);
  models.Ward = Ward(sequelize);
  models.Bed = Bed(sequelize);
  models.Admission = Admission(sequelize);
  models.PatientTransfer = PatientTransfer(sequelize);
  models.Appointment = Appointment(sequelize);
  models.MedicalRecord = MedicalRecord(sequelize);
  models.Prescription = Prescription(sequelize);
  models.LaboratoryTest = LaboratoryTest(sequelize);
  models.ProductCategory = ProductCategory(sequelize);
  models.Product = Product(sequelize);
  models.Order = Order(sequelize);
  models.OrderItem = OrderItem(sequelize);
  models.Bill = Bill(sequelize);
  models.Image = Image(sequelize);
  models.Thread = Thread(sequelize);
  models.Message = Message(sequelize);
  models.ThreadParticipant = ThreadParticipant(sequelize);
  models.Notification = Notification(sequelize);
  models.Checkin = Checkin(sequelize);
  models.AuditLog = AuditLog(sequelize);
  models.Article = Article(sequelize);
  models.Location = Location(sequelize);
  models.ClinicalTrial = ClinicalTrial(sequelize);
  models.Story = Story(sequelize);
  models.SiteContent = SiteContent(sequelize);
  models.CaCertificate = CaCertificate(sequelize);
  models.PasswordResetToken = PasswordResetToken(sequelize);
  models.OtpToken = OtpToken(sequelize);

  // User
  models.User.hasOne(models.Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
  models.User.hasOne(models.Patient, { foreignKey: 'userId', as: 'patientProfile' });
  models.User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
  models.User.hasMany(models.PatientTransfer, { foreignKey: 'transferredBy', as: 'transfersPerformed' });
  models.User.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' });
  models.User.hasMany(models.AuditLog, { foreignKey: 'actorId', as: 'auditLogs' });
  models.User.belongsToMany(models.Thread, { through: models.ThreadParticipant, foreignKey: 'userId', otherKey: 'threadId', as: 'threads' });
  models.User.hasMany(models.Message, { foreignKey: 'senderId', as: 'sentMessages' });
  models.User.hasMany(models.PasswordResetToken, { foreignKey: 'userId', as: 'passwordResetTokens' });
  models.User.hasMany(models.OtpToken, { foreignKey: 'userId', as: 'otpTokens' });

  // Department
  models.Department.hasMany(models.User, { foreignKey: 'departmentId', as: 'users' });
  models.Department.hasMany(models.Doctor, { foreignKey: 'departmentId', as: 'doctors' });
  models.Department.hasMany(models.Ward, { foreignKey: 'departmentId', as: 'wards' });
  models.Department.hasMany(models.Appointment, { foreignKey: 'departmentId', as: 'appointments' });

  // User
  models.User.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });

  // Doctor
  models.Doctor.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  models.Doctor.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
  models.Doctor.hasMany(models.Appointment, { foreignKey: 'doctorId', as: 'appointments' });
  models.Doctor.hasMany(models.MedicalRecord, { foreignKey: 'doctorId', as: 'medicalRecords' });
  models.Doctor.hasMany(models.Prescription, { foreignKey: 'doctorId', as: 'prescriptions' });
  models.Doctor.hasMany(models.Admission, { foreignKey: 'doctorId', as: 'admissions' });
  models.Doctor.hasMany(models.LaboratoryTest, { foreignKey: 'doctorId', as: 'laboratoryTests' });
  models.Doctor.hasMany(models.Checkin, { foreignKey: 'doctorId', as: 'checkins' });

  // Patient
  models.Patient.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  models.Patient.hasMany(models.Appointment, { foreignKey: 'patientId', as: 'appointments' });
  models.Patient.hasMany(models.Admission, { foreignKey: 'patientId', as: 'admissions' });
  models.Patient.hasMany(models.MedicalRecord, { foreignKey: 'patientId', as: 'medicalRecords' });
  models.Patient.hasMany(models.Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
  models.Patient.hasMany(models.LaboratoryTest, { foreignKey: 'patientId', as: 'laboratoryTests' });
  models.Patient.hasMany(models.Bill, { foreignKey: 'patientId', as: 'bills' });
  models.Patient.hasMany(models.Order, { foreignKey: 'patientId', as: 'orders' });
  models.Patient.hasMany(models.PatientTransfer, { foreignKey: 'patientId', as: 'transfers' });
  models.Patient.hasMany(models.Checkin, { foreignKey: 'patientId', as: 'checkins' });

  // Ward
  models.Ward.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
  models.Ward.hasMany(models.Bed, { foreignKey: 'wardId', as: 'beds' });
  models.Ward.hasMany(models.Admission, { foreignKey: 'wardId', as: 'admissions' });
  models.Ward.hasMany(models.PatientTransfer, { foreignKey: 'fromWardId', as: 'outgoingTransfers' });
  models.Ward.hasMany(models.PatientTransfer, { foreignKey: 'toWardId', as: 'incomingTransfers' });

  // Bed
  models.Bed.belongsTo(models.Ward, { foreignKey: 'wardId', as: 'ward' });
  models.Bed.hasMany(models.Admission, { foreignKey: 'bedId', as: 'admissions' });
  models.Bed.hasMany(models.PatientTransfer, { foreignKey: 'fromBedId', as: 'outgoingTransfers' });
  models.Bed.hasMany(models.PatientTransfer, { foreignKey: 'toBedId', as: 'incomingTransfers' });

  // Admission
  models.Admission.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  models.Admission.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
  models.Admission.belongsTo(models.Ward, { foreignKey: 'wardId', as: 'ward' });
  models.Admission.belongsTo(models.Bed, { foreignKey: 'bedId', as: 'bed' });
  models.Admission.hasMany(models.PatientTransfer, { foreignKey: 'admissionId', as: 'transfers' });
  models.Admission.hasMany(models.Bill, { foreignKey: 'admissionId', as: 'bills' });

  // PatientTransfer (audit trail of patient movements)
  models.PatientTransfer.belongsTo(models.Admission, { foreignKey: 'admissionId', as: 'admission' });
  models.PatientTransfer.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  models.PatientTransfer.belongsTo(models.Ward, { foreignKey: 'fromWardId', as: 'fromWard' });
  models.PatientTransfer.belongsTo(models.Ward, { foreignKey: 'toWardId', as: 'toWard' });
  models.PatientTransfer.belongsTo(models.Bed, { foreignKey: 'fromBedId', as: 'fromBed' });
  models.PatientTransfer.belongsTo(models.Bed, { foreignKey: 'toBedId', as: 'toBed' });
  models.PatientTransfer.belongsTo(models.User, { foreignKey: 'transferredBy', as: 'transferredByUser' });

  // Appointment
  models.Appointment.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  models.Appointment.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
  models.Appointment.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });

  // MedicalRecord
  models.MedicalRecord.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  models.MedicalRecord.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });

  // Prescription
  models.Prescription.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  models.Prescription.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
  models.Prescription.belongsTo(models.Product, { foreignKey: 'medicineId', as: 'medicine' });

  // LaboratoryTest
  models.LaboratoryTest.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  models.LaboratoryTest.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });

  // Checkin
  models.Checkin.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  models.Checkin.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });

  // Messaging
  models.Thread.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  models.Thread.hasMany(models.Message, { foreignKey: 'threadId', as: 'messages' });
  models.Thread.belongsToMany(models.User, { through: models.ThreadParticipant, foreignKey: 'threadId', otherKey: 'userId', as: 'participants' });
  models.Thread.hasMany(models.ThreadParticipant, { foreignKey: 'threadId', as: 'participantLinks' });
  models.Message.belongsTo(models.Thread, { foreignKey: 'threadId', as: 'thread' });
  models.Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });

  // Marketplace
  models.ProductCategory.hasMany(models.Product, { foreignKey: 'categoryId', as: 'products' });
  models.Product.belongsTo(models.ProductCategory, { foreignKey: 'categoryId', as: 'category' });
  models.Product.hasMany(models.Prescription, { foreignKey: 'medicineId', as: 'prescriptions' });

  models.Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  models.Order.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  models.Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });

  models.OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  models.OrderItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });

  // Billing
  models.Bill.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  models.Bill.belongsTo(models.Admission, { foreignKey: 'admissionId', as: 'admission' });

  return models;
};

export default initializeModels;
export { models };