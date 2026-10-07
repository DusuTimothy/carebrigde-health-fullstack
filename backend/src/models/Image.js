import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Image = sequelize.define(
    'Image',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      entityType: {
        type: DataTypes.ENUM('product', 'doctor', 'user', 'department', 'ward', 'article'),
        allowNull: false,
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      dataUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Image',
      tableName: 'images',
      timestamps: true,
      indexes: [
        {
          fields: ['entityType', 'entityId'],
        },
      ],
    }
  );

  return Image;
};