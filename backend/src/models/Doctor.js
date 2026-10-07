import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Doctor = sequelize.define(
    'Doctor',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
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
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      specialization: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      licenseNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      availability: {
        type: DataTypes.ENUM('available', 'limited', 'unavailable'),
        allowNull: false,
        defaultValue: 'available',
      },
      title: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
      },
      reviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      languages: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      acceptsNewPatients: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      bookOnline: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Doctor',
      tableName: 'doctors',
      timestamps: true,
    }
  );

  return Doctor;
};
