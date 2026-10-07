import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const PatientTransfer = sequelize.define(
    'PatientTransfer',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      admissionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'admissions',
          key: 'id',
        },
      },
      patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id',
        },
      },
      fromWardId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'wards',
          key: 'id',
        },
      },
      fromBedId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'beds',
          key: 'id',
        },
      },
      toWardId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'wards',
          key: 'id',
        },
      },
      toBedId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'beds',
          key: 'id',
        },
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      transferDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      transferredBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'PatientTransfer',
      tableName: 'patient_transfers',
      timestamps: true,
      updatedAt: false,
    }
  );

  return PatientTransfer;
};
