import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Story = sequelize.define(
    'Story',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      tag: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      quote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Story',
      tableName: 'stories',
      timestamps: true,
    }
  );

  return Story;
};