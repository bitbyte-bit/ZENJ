import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to SQLite database');
    await sequelize.sync(); // Sync models
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
};

export default sequelize;