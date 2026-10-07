import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';

class User extends Model {
  validatePassword(password) {
    if (!this.password) return Promise.resolve(false);
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

export default (sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 120],
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [6, 128],
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      departmentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id',
        },
      },
      role: {
        type: DataTypes.ENUM(
          'admin',
          'doctor',
          'nurse',
          'receptionist',
          'pharmacist',
          'laboratory_staff',
          'accountant',
          'patient'
        ),
        allowNull: false,
        defaultValue: 'patient',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
    }
  );

  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 12);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password') && user.password) {
      user.password = await bcrypt.hash(user.password, 12);
    }
  });

  return User;
};
