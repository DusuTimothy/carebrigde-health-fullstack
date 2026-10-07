import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Bed = sequelize.define(
    'Bed',
    {
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
      },
      bedNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.ENUM('available', 'occupied', 'reserved', 'maintenance'),
        allowNull: false,
        defaultValue: 'available',
      },
    },
    {
      sequelize,
      modelName: 'Bed',
      tableName: 'beds',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['wardId', 'bedNumber'],
        },
      ],
    }
  );

  return Bed;
};
