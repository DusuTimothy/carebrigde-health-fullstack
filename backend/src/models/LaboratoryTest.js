import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LaboratoryTest = sequelize.define(
    'LaboratoryTest',
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
        allowNull: true,
        references: {
          model: 'doctors',
          key: 'id',
        },
      },
      testName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      testType: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      result: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resultSummary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      components: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('requested', 'sample-collected', 'processing', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'requested',
      },
      requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'LaboratoryTest',
      tableName: 'laboratory_tests',
      timestamps: true,
    }
  );

  return LaboratoryTest;
};
