import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('images', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      entityType: {
        type: Sequelize.ENUM('product', 'doctor', 'user', 'department', 'ward'),
        allowNull: false,
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      dataUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex('images', ['entityType', 'entityId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('images');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_images_entityType";');
  },
};