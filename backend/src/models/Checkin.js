import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Checkin = sequelize.define(
    'Checkin',
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
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('waiting', 'in_room', 'completed', 'cancelled'),
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
    },
    {
      sequelize,
      modelName: 'Checkin',
      tableName: 'checkins',
      timestamps: true,
    }
  );

  return Checkin;
};