import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { IClientDb } from './IClientDb';

export class SQLiteClientDb implements IClientDb {
  private db: sqlite3.Database;
  private run: (sql: string, params?: any[]) => Promise<any>;
  private get: (sql: string, params?: any[]) => Promise<any>;

  constructor() {
    this.db = new sqlite3.Database('client.db');
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA synchronous = NORMAL');
    this.db.run('PRAGMA temp_store = MEMORY');
    this.db.run('PRAGMA cache_size = -2000');
    this.run = promisify(this.db.run.bind(this.db));
    this.get = promisify(this.db.get.bind(this.db));
  }

  async initialize(): Promise<void> {
    await this.run(`
      CREATE TABLE IF NOT EXISTS user_debts (
        user_id TEXT PRIMARY KEY,
        amount REAL
      )
    `);
  }

  async getUserDebt(userId: string): Promise<number | null> {
    const result = await this.get('SELECT amount FROM user_debts WHERE user_id = ?', [userId]);
    return result ? result.amount : null;
  }

  async setUserDebt(userId: string, amount: number): Promise<void> {
    await this.run(
      'INSERT INTO user_debts (user_id, amount) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET amount = excluded.amount',
      [userId, amount]
    );
  }

  /**
     * Cierra la conexión con la base de datos y libera los recursos.
     */
  async close(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        this.db.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
  }
} 