import { DatabaseFactory } from './DatabaseFactory';
import 'dotenv/config';

const dbType = process.env.DB_TYPE || (process.env.NODE_ENV === 'production' ? 'sqlserver' : 'sqlite');
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_KEY,
};

export const db = DatabaseFactory.createDatabase(dbType, dbConfig); 