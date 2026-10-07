import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const SiteContent = sequelize.define(
    'SiteContent',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true,
      },
      value: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'SiteContent',
      tableName: 'site_contents',
      timestamps: true,
    }
  );

  return SiteContent;
};