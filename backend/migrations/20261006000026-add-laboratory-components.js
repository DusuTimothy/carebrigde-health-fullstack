import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.addColumn('laboratory_tests', 'components', {
      type: DataTypes.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('laboratory_tests', 'resultSummary', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('laboratory_tests', 'resultSummary');
    await queryInterface.removeColumn('laboratory_tests', 'components');
  },
};