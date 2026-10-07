import { DataTypes } from 'sequelize';
import { generatePatientNumber } from '../utils/generatePatientNumber.js';

export default (sequelize) => {
  const Patient = sequelize.define(
    'Patient',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      patientNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'not_specified'),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bloodGroup: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'not_specified'),
        allowNull: true,
      },
      allergies: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      emergencyContactName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      emergencyContactPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      insuranceProvider: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      insuranceNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Patient',
      tableName: 'patients',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['patientNumber'],
        },
        {
          fields: ['email'],
        },
      ],
    }
  );

  Patient.beforeValidate(async (patient) => {
    if (patient.isNewRecord && !patient.patientNumber) {
      patient.patientNumber = await generatePatientNumber(Patient);
    }
  });

  return Patient;
};
