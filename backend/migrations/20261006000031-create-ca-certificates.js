import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ca_certificates', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      commonName: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      caCert: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      serverCert: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      serverKeyEnc: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      issuedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('ca_certificates', ['active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ca_certificates');
  },
};