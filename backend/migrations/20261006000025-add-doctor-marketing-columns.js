import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface) => {
    const columns = [
      { name: 'title', type: DataTypes.STRING(120), allowNull: true },
      { name: 'rating', type: DataTypes.DECIMAL(2, 1), allowNull: true },
      { name: 'reviews', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      { name: 'languages', type: DataTypes.JSONB, allowNull: true },
      { name: 'acceptsNewPatients', type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      { name: 'bookOnline', type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      { name: 'location', type: DataTypes.STRING(255), allowNull: true },
    ];
    for (const column of columns) {
      await queryInterface.addColumn('doctors', column.name, column);
    }
  },

  down: async (queryInterface) => {
    for (const name of ['title', 'rating', 'reviews', 'languages', 'acceptsNewPatients', 'bookOnline', 'location']) {
      await queryInterface.removeColumn('doctors', name);
    }
  },
};