import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ClinicalTrial = sequelize.define(
    'ClinicalTrial',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('recruiting', 'not_recruiting'),
        allowNull: false,
        defaultValue: 'not_recruiting',
      },
      phase: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      locations: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      eligibility: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ClinicalTrial',
      tableName: 'clinical_trials',
      timestamps: true,
    }
  );

  return ClinicalTrial;
};