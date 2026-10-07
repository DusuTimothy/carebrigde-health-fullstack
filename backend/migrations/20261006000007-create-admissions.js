import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admissions', {
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
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      wardId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'wards',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      bedId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'beds',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      admissionDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
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
        type: Sequelize.ENUM('admitted', 'transferred', 'discharged', 'cancelled'),
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('admissions', ['status']);
    await queryInterface.addIndex('admissions', ['patientId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('admissions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_admissions_status";');
  },
};
