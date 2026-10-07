import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Ward = sequelize.define(
    'Ward',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      departmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id',
        },
      },
      wardType: {
        type: DataTypes.ENUM(
          'emergency',
          'medical',
          'surgical',
          'pediatric',
          'maternity',
          'private',
          'icu',
          'general'
        ),
        allowNull: false,
        defaultValue: 'general',
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
          min: 1,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: 'Ward',
      tableName: 'wards',
      timestamps: true,
    }
  );

  return Ward;
};
