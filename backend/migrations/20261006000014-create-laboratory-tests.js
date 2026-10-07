import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('laboratory_tests', {
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
        onDelete: 'CASCADE',
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'doctors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      testName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      testType: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      result: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('requested', 'sample-collected', 'processing', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'requested',
      },
      requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      completedAt: {
        type: DataTypes.DATE,
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('laboratory_tests');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_laboratory_tests_status";');
  },
};
