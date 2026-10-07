import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Order = sequelize.define(
    'Order',
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
      patientId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'patients',
          key: 'id',
        },
      },
      orderNumber: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
      },
      prescriptionStatus: {
        type: DataTypes.ENUM('not_required', 'pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'not_required',
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
    }
  );

  return Order;
};
