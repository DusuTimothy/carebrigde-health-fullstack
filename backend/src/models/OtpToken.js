import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const OtpToken = sequelize.define(
    'OtpToken',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      purpose: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'step_up',
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      consumedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'OtpToken',
      tableName: 'otp_tokens',
      timestamps: true,
    }
  );

  return OtpToken;
};