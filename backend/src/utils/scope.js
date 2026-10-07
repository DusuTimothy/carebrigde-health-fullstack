import { getSequelize } from '../config/database.js';
import { ApiError } from './errors.js';

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

/**
 * Returns the patient id a requesting user is scoped to.
 * - Staff users receive null (no restriction).
 * - Patient users receive their own patient id, or NIL_UUID when no profile exists.
 */
export const resolvePatientScope = async (req) => {
  if (req.user?.role !== 'patient') return null;
  const patient = await getSequelize().models.Patient.findOne({
    where: { userId: req.user.id },
    attributes: ['id'],
  });
  return patient ? patient.id : NIL_UUID;
};

export const assertOwnPatient = async (req, patientId) => {
  const scoped = await resolvePatientScope(req);
  if (scoped !== null && scoped !== patientId) {
    throw ApiError.forbidden('You can only perform this action for your own patient profile.');
  }
};

export default { resolvePatientScope, assertOwnPatient };
