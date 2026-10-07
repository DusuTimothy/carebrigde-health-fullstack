import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('beds', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      wardId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'wards',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bedNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('available', 'occupied', 'reserved', 'maintenance'),
        allowNull: false,
        defaultValue: 'available',
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

    await queryInterface.addConstraint('beds', {
      fields: ['wardId', 'bedNumber'],
      type: 'unique',
      name: 'beds_wardId_bedNumber_unique',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('beds');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_beds_status";');
  },
};
