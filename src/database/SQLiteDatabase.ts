import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { IDatabase } from './IDatabase';

export class SQLiteDatabase implements IDatabase {
    private db: sqlite3.Database;
    private run: (sql: string, params?: any[]) => Promise<any>;
    private get: (sql: string, params?: any[]) => Promise<any>;
    private all: (sql: string, params?: any[]) => Promise<any[]>;
    private preparedStatements: { [key: string]: sqlite3.Statement } = {};

    constructor() {
        this.db = new sqlite3.Database('chat.db');
        // Enable WAL mode for better write concurrency
        this.db.run('PRAGMA journal_mode = WAL');
        // Optimize performance
        this.db.run('PRAGMA synchronous = NORMAL');
        this.db.run('PRAGMA temp_store = MEMORY');
        this.db.run('PRAGMA cache_size = -2000'); // Use 2MB of cache

        // Promisify database operations
        this.run = promisify(this.db.run.bind(this.db));
        this.get = promisify(this.db.get.bind(this.db));
        this.all = promisify(this.db.all.bind(this.db));
    }

    async initialize() {
        // Create tables in a single transaction
        await this.run('BEGIN TRANSACTION');
        try {
            await this.run(`
                CREATE TABLE IF NOT EXISTS user_threads (
                    phone_number TEXT PRIMARY KEY,
                    thread_id TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await this.run(`
                CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    phone_number TEXT,
                    thread_id TEXT,
                    message TEXT,
                    role TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create indexes for faster queries
            await this.run('CREATE INDEX IF NOT EXISTS idx_chat_history_phone_number ON chat_history(phone_number)');
            await this.run('CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp)');
            
            await this.run('COMMIT');

            // Prepare frequently used statements
            this.prepareStatements();
        } catch (error) {
            await this.run('ROLLBACK');
            throw error;
        }
    }

    private prepareStatements() {
        this.preparedStatements.getThreadId = this.db.prepare(
            'SELECT thread_id FROM user_threads WHERE phone_number = ?'
        );
        this.preparedStatements.saveThreadId = this.db.prepare(
            'INSERT OR REPLACE INTO user_threads (phone_number, thread_id, last_interaction) VALUES (?, ?, CURRENT_TIMESTAMP)'
        );
        this.preparedStatements.saveMessage = this.db.prepare(
            'INSERT INTO chat_history (phone_number, thread_id, message, role) VALUES (?, ?, ?, ?)'
        );
        this.preparedStatements.updateLastInteraction = this.db.prepare(
            'UPDATE user_threads SET last_interaction = CURRENT_TIMESTAMP WHERE phone_number = ?'
        );
    }

    async getThreadId(phoneNumber: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            this.preparedStatements.getThreadId.get([phoneNumber], (err: Error | null, row: any) => {
                if (err) reject(err);
                resolve(row ? row.thread_id : null);
            });
        });
    }

    async saveThreadId(phoneNumber: string, threadId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.preparedStatements.saveThreadId.run([phoneNumber, threadId], (err: Error | null) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    async saveMessage(phoneNumber: string, threadId: string, message: string, role: 'user' | 'assistant'): Promise<void> {
        return new Promise((resolve, reject) => {
            this.preparedStatements.saveMessage.run([phoneNumber, threadId, message, role], (err: Error | null) => {
                if (err) reject(err);
                this.preparedStatements.updateLastInteraction.run([phoneNumber], (updateErr: Error | null) => {
                    if (updateErr) reject(updateErr);
                    resolve();
                });
            });
        });
    }

    async getRecentMessages(phoneNumber: string, limit: number = 10): Promise<Array<{message: string, role: string, timestamp: string}>> {
        // Use a covering index for better performance
        return await this.all(
            `SELECT message, role, timestamp 
             FROM chat_history 
             WHERE phone_number = ? 
             ORDER BY timestamp DESC 
             LIMIT ?`,
            [phoneNumber, limit]
        );
    }

    async close(): Promise<void> {
        await Promise.all(Object.values(this.preparedStatements).map(stmt => 
            new Promise(resolve => stmt.finalize(resolve))
        ));
        await new Promise<void>((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
} 