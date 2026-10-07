import { Sequelize } from 'sequelize';
import { config } from './environment.js';
import initializeModels from '../models/index.js';

let sequelizeInstance = null;

export const initializeDatabase = async () => {
  try {
    console.log('Connecting to PostgreSQL...');
    const envConfig = config[process.env.NODE_ENV] || config.development;
    
    sequelizeInstance = new Sequelize(envConfig.url, {
      dialect: envConfig.dialect,
      logging: envConfig.logging || false,
      dialectOptions: {
        ssl: envConfig.dialectOptions?.ssl || false,
      },
      pool: {
        max: 20,
        min: 0,
        idle: 30000,
      },
      define: {
        timestamps: true,
        underscored: false,
      },
    });
    initializeModels(sequelizeInstance);
    
    await sequelizeInstance.authenticate();
    console.log('Database connected successfully.');
    return sequelizeInstance;
  } catch (error) {
    const cause = error.parent || error.original || error.cause;
    const causeMessage = cause?.errors?.map((causeError) => causeError.message).filter(Boolean).join('; ');
    console.error(
      'Unable to connect to the database:',
      causeMessage || cause?.message || error.message || error.name,
    );
    throw error;
  }
};

export const getSequelize = () => {
  if (!sequelizeInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return sequelizeInstance;
};