import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ThreadParticipant = sequelize.define(
    'ThreadParticipant',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      threadId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'threads',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'ThreadParticipant',
      tableName: 'thread_participants',
      timestamps: true,
    }
  );

  return ThreadParticipant;
};