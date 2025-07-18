import * as sql from 'mssql';
import { IClientDb } from './IClientDb';

export class SQLServerClientDb implements IClientDb {
  private pool: sql.ConnectionPool;

  constructor() {
    this.pool = new sql.ConnectionPool({
      user: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || '',
      server: process.env.DB_SERVER || '',
      database: process.env.DB_NAME || '',
    });
  }

  async initialize(): Promise<void> {
    await this.pool.connect();
    await this.pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_debts')
      CREATE TABLE user_debts (
        user_id NVARCHAR(250) PRIMARY KEY,
        amount FLOAT
      )
    `);
  }

  async getUserDebt(userId: string): Promise<number | null> {
    await this.pool.connect();
    const result = await this.pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('SELECT amount FROM user_debts WHERE user_id = @userId');
    return result.recordset.length > 0 ? result.recordset[0].amount : null;
  }

  async setUserDebt(userId: string, amount: number): Promise<void> {
    await this.pool.connect();
    await this.pool.request()
      .input('userId', sql.NVarChar, userId)
      .input('amount', sql.Float, amount)
      .query(`
        MERGE user_debts AS target
        USING (SELECT @userId AS user_id, @amount AS amount) AS source
        ON (target.user_id = source.user_id)
        WHEN MATCHED THEN UPDATE SET amount = source.amount
        WHEN NOT MATCHED THEN INSERT (user_id, amount) VALUES (source.user_id, source.amount);
      `);
  }

  /**
     * @inheritdoc
     * Cierra el pool de conexiones de SQL Server de manera segura.
     */
  async close(): Promise<void> {
        await this.pool.close();
    }
} 