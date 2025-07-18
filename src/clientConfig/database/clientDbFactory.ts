import { IClientDb } from './IClientDb';
import { SQLiteClientDb } from './SQLiteClientDb';
import { SQLServerClientDb } from './SQLServerClientDb';
import { SupabaseClientDb } from './SupabaseClientDb';
import 'dotenv/config';

export function createClientDb(): IClientDb {
  const type = process.env.DB_TYPE || 'sqlite';
  if (type === 'sqlite') return new SQLiteClientDb();
  if (type === 'sqlserver') return new SQLServerClientDb();
  if (type === 'supabase') return new SupabaseClientDb();
  throw new Error(`Tipo de base de datos no soportado: ${type}`);
} 