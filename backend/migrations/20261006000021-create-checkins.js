import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('checkins', {
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
        allowNull: true,
        references: {
          model: 'doctors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('waiting', 'in_room', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'waiting',
      },
      room: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      vitals: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      arrivedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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

    await queryInterface.addIndex('checkins', ['status']);
    await queryInterface.addIndex('checkins', ['patientId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('checkins');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_checkins_status";');
  },
};