import * as sql from 'mssql';
import { IDatabase } from './IDatabase';

export class SQLServerDatabase implements IDatabase {
    private pool: sql.ConnectionPool;

    constructor(config: sql.config) {
        this.pool = new sql.ConnectionPool(config);
    }

    async initialize(): Promise<void> {
        await this.pool.connect();
        
        // Create tables in a single transaction
        const transaction = new sql.Transaction(this.pool);
        try {
            await transaction.begin();

            await transaction.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_threads')
                CREATE TABLE user_threads (
                    phone_number NVARCHAR(50) PRIMARY KEY,
                    thread_id NVARCHAR(100) NOT NULL,
                    created_at DATETIME2 DEFAULT GETDATE(),
                    last_interaction DATETIME2 DEFAULT GETDATE()
                )
            `);

            await transaction.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_history')
                CREATE TABLE chat_history (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    phone_number NVARCHAR(50),
                    thread_id NVARCHAR(100),
                    message NVARCHAR(MAX),
                    role NVARCHAR(50),
                    timestamp DATETIME2 DEFAULT GETDATE()
                )
            `);

            // Create indexes for faster queries
            await transaction.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_chat_history_phone_number')
                CREATE INDEX idx_chat_history_phone_number ON chat_history(phone_number)
            `);

            await transaction.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_chat_history_timestamp')
                CREATE INDEX idx_chat_history_timestamp ON chat_history(timestamp)
            `);

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getThreadId(phoneNumber: string): Promise<string | null> {
        const result = await this.pool.request()
            .input('phoneNumber', sql.NVarChar, phoneNumber)
            .query('SELECT thread_id FROM user_threads WHERE phone_number = @phoneNumber');
        
        return result.recordset[0]?.thread_id || null;
    }

    async saveThreadId(phoneNumber: string, threadId: string): Promise<void> {
        await this.pool.request()
            .input('phoneNumber', sql.NVarChar, phoneNumber)
            .input('threadId', sql.NVarChar, threadId)
            .query(`
                MERGE user_threads AS target
                USING (SELECT @phoneNumber as phone_number, @threadId as thread_id) AS source
                ON target.phone_number = source.phone_number
                WHEN MATCHED THEN
                    UPDATE SET thread_id = source.thread_id, last_interaction = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (phone_number, thread_id)
                    VALUES (source.phone_number, source.thread_id);
            `);
    }

    async saveMessage(phoneNumber: string, threadId: string, message: string, role: 'user' | 'assistant'): Promise<void> {
        const transaction = new sql.Transaction(this.pool);
        try {
            await transaction.begin();

            await transaction.request()
                .input('phoneNumber', sql.NVarChar, phoneNumber)
                .input('threadId', sql.NVarChar, threadId)
                .input('message', sql.NVarChar, message)
                .input('role', sql.NVarChar, role)
                .query(`
                    INSERT INTO chat_history (phone_number, thread_id, message, role)
                    VALUES (@phoneNumber, @threadId, @message, @role)
                `);

            await transaction.request()
                .input('phoneNumber', sql.NVarChar, phoneNumber)
                .query(`
                    UPDATE user_threads
                    SET last_interaction = GETDATE()
                    WHERE phone_number = @phoneNumber
                `);

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getRecentMessages(phoneNumber: string, limit: number = 10): Promise<Array<{message: string, role: string, timestamp: string}>> {
        const result = await this.pool.request()
            .input('phoneNumber', sql.NVarChar, phoneNumber)
            .input('limit', sql.Int, limit)
            .query(`
                SELECT message, role, timestamp
                FROM chat_history
                WHERE phone_number = @phoneNumber
                ORDER BY timestamp DESC
                OFFSET 0 ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        return result.recordset;
    }

    async close(): Promise<void> {
        await this.pool.close();
    }
} 