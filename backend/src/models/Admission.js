import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Admission = sequelize.define(
    'Admission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id',
        },
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id',
        },
      },
      wardId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'wards',
          key: 'id',
        },
      },
      bedId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'beds',
          key: 'id',
        },
      },
      admissionDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expectedDischargeDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      dischargeDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      diagnosis: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('admitted', 'transferred', 'discharged', 'cancelled'),
        allowNull: false,
        defaultValue: 'admitted',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dischargeNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      finalDiagnosis: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Admission',
      tableName: 'admissions',
      timestamps: true,
    }
  );

  return Admission;
};
