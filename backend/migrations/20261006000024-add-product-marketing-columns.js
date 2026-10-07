import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface) => {
    const columns = [
      { name: 'generic', type: DataTypes.STRING(255), allowNull: true },
      { name: 'form', type: DataTypes.STRING(100), allowNull: true },
      { name: 'strength', type: DataTypes.STRING(100), allowNull: true },
      { name: 'pack', type: DataTypes.STRING(100), allowNull: true },
      { name: 'manufacturer', type: DataTypes.STRING(255), allowNull: true },
    ];
    for (const column of columns) {
      await queryInterface.addColumn('products', column.name, column);
    }
  },

  down: async (queryInterface) => {
    for (const name of ['generic', 'form', 'strength', 'pack', 'manufacturer']) {
      await queryInterface.removeColumn('products', name);
    }
  },
};