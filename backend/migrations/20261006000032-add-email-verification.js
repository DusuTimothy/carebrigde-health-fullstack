import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.addColumn('users', 'emailVerified', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.createTable('email_verification_tokens', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Only a SHA-256 hash of the emailed token is ever persisted.
      tokenHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // Existing rows store the raw token; rename for clarity so the column
    // always describes what it holds. Older raw-token links become invalid.
    await queryInterface.renameColumn('password_reset_tokens', 'token', 'tokenHash');
  },

  down: async (queryInterface) => {
    await queryInterface.renameColumn('password_reset_tokens', 'tokenHash', 'token');
    await queryInterface.dropTable('email_verification_tokens');
    await queryInterface.removeColumn('users', 'emailVerified');
  },
};
