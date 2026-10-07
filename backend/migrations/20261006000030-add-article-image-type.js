export default {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_images_entityType" ADD VALUE IF NOT EXISTS 'article'`
    );
  },
  // Postgres does not support removing an enum value; keep the type additive.
  down: async () => {},
};