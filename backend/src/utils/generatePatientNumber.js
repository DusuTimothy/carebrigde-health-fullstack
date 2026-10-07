import { Op } from 'sequelize';

const toNumber = (value) => {
  const match = /^PT-(\d+)$/.exec(value || '');
  return match ? parseInt(match[1], 10) : 0;
};

export const generatePatientNumber = async (PatientModel) => {
  const last = await PatientModel.findOne({
    where: { patientNumber: { [Op.like]: 'PT-%' } },
    order: [['patientNumber', 'DESC']],
    attributes: ['patientNumber'],
  });

  const next = last ? toNumber(last.patientNumber) + 1 : 1;
  return `PT-${String(next).padStart(4, '0')}`;
};

export default generatePatientNumber;
