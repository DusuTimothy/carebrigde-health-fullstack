import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MedicalRecord = sequelize.define(
    'MedicalRecord',
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
      diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      symptoms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      treatment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'MedicalRecord',
      tableName: 'medical_records',
      timestamps: true,
    }
  );

  return MedicalRecord;
};
