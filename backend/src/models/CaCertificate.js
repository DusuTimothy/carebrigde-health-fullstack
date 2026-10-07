import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const CaCertificate = sequelize.define(
    'CaCertificate',
    {
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
        validate: {
          isIn: [[true, false]],
        },
      },
    },
    {
      sequelize,
      modelName: 'CaCertificate',
      tableName: 'ca_certificates',
      timestamps: true,
    }
  );

  return CaCertificate;
};