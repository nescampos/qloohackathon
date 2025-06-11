import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { IDatabase } from './IDatabase';

/**
 * Implementación de la base de datos usando SQLite.
 * Esta implementación está optimizada para desarrollo local y pruebas.
 * Utiliza el archivo 'chat.db' para almacenar los datos y está configurada
 * con optimizaciones de rendimiento específicas de SQLite.
 */
export class SQLiteDatabase implements IDatabase {
    private db: sqlite3.Database;
    private run: (sql: string, params?: any[]) => Promise<any>;
    private get: (sql: string, params?: any[]) => Promise<any>;
    private all: (sql: string, params?: any[]) => Promise<any[]>;
    private preparedStatements: { [key: string]: sqlite3.Statement } = {};

    /**
     * Constructor que inicializa la conexión a SQLite y configura las optimizaciones.
     * - Habilita el modo WAL para mejor concurrencia en escritura
     * - Configura el modo síncrono para equilibrar rendimiento y seguridad
     * - Optimiza el uso de memoria y caché
     */
    constructor() {
        this.db = new sqlite3.Database('chat.db');
        // Enable WAL mode for better write concurrency
        this.db.run('PRAGMA journal_mode = WAL');
        // Optimize performance
        this.db.run('PRAGMA synchronous = NORMAL');
        this.db.run('PRAGMA temp_store = MEMORY');
        this.db.run('PRAGMA cache_size = -2000'); // Use 2MB of cache

        // Promisify database operations for better async handling
        this.run = promisify(this.db.run.bind(this.db));
        this.get = promisify(this.db.get.bind(this.db));
        this.all = promisify(this.db.all.bind(this.db));
    }

    /**
     * Inicializa la estructura de la base de datos.
     * Crea las tablas necesarias y sus índices en una única transacción
     * para garantizar la consistencia de la base de datos.
     */
    async initialize() {
        await this.run('BEGIN TRANSACTION');
        try {
            // Tabla para almacenar la relación entre usuarios y sus hilos de conversación
            await this.run(`
                CREATE TABLE IF NOT EXISTS user_threads (
                    phone_number TEXT PRIMARY KEY,
                    thread_id TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Tabla para almacenar el historial de mensajes
            await this.run(`
                CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    phone_number TEXT,
                    thread_id TEXT,
                    message TEXT,
                    role TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (phone_number) REFERENCES user_threads(phone_number)
                )
            `);

            // Índices para optimizar las consultas frecuentes
            await this.run('CREATE INDEX IF NOT EXISTS idx_chat_history_phone_number ON chat_history(phone_number)');
            await this.run('CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp)');
            
            // Tabla para almacenar la deuda de los usuarios
            await this.run(`
                CREATE TABLE IF NOT EXISTS user_debt (
                    phone_number TEXT PRIMARY KEY,
                    name TEXT,
                    debt_amount DECIMAL(10,2) NOT NULL,
                    due_date DATE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Índice para optimizar búsquedas por fecha de vencimiento
            await this.run('CREATE INDEX IF NOT EXISTS idx_user_debt_due_date ON user_debt(due_date)');
            
            await this.run('COMMIT');

            // Prepara las consultas más utilizadas
            this.prepareStatements();
        } catch (error) {
            await this.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Prepara las consultas SQL más frecuentes para mejorar el rendimiento.
     * SQLite puede reutilizar el plan de ejecución de estas consultas.
     */
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

    /**
     * @inheritdoc
     */
    async getThreadId(phoneNumber: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            this.preparedStatements.getThreadId.get([phoneNumber], (err: Error | null, row: any) => {
                if (err) reject(err);
                resolve(row ? row.thread_id : null);
            });
        });
    }

    /**
     * @inheritdoc
     */
    async saveThreadId(phoneNumber: string, threadId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.preparedStatements.saveThreadId.run([phoneNumber, threadId], (err: Error | null) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    /**
     * @inheritdoc
     * Implementa una transacción atómica para guardar el mensaje y actualizar
     * la marca de tiempo de última interacción.
     */
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

    /**
     * @inheritdoc
     * Utiliza un índice covering para optimizar la consulta de mensajes recientes.
     */
    async getRecentMessages(phoneNumber: string, limit: number = 10): Promise<Array<{message: string, role: string, timestamp: string}>> {
        return await this.all(
            `SELECT message, role, timestamp 
             FROM chat_history 
             WHERE phone_number = ? 
             ORDER BY timestamp DESC 
             LIMIT ?`,
            [phoneNumber, limit]
        );
    }

    /**
     * @inheritdoc
     */
    async saveUserDebt(phoneNumber: string, name: string | null, debtAmount: number, dueDate: Date): Promise<void> {
        await this.run(
            `INSERT OR REPLACE INTO user_debt (phone_number, name, debt_amount, due_date)
             VALUES (?, ?, ?, ?)`,
            [phoneNumber, name, debtAmount, dueDate.toISOString().split('T')[0]]
        );
    }

    /**
     * @inheritdoc
     */
    async getUserDebt(phoneNumber: string): Promise<{
        phoneNumber: string;
        name: string | null;
        debtAmount: number;
        dueDate: Date;
        createdAt: Date;
    } | null> {
        const result = await this.get(
            `SELECT phone_number, name, debt_amount, due_date, created_at
             FROM user_debt
             WHERE phone_number = ?`,
            [phoneNumber]
        );

        if (!result) return null;

        return {
            phoneNumber: result.phone_number,
            name: result.name,
            debtAmount: result.debt_amount,
            dueDate: new Date(result.due_date),
            createdAt: new Date(result.created_at)
        };
    }

    /**
     * @inheritdoc
     */
    async getOverdueDebts(date: Date): Promise<Array<{
        phoneNumber: string;
        name: string | null;
        debtAmount: number;
        dueDate: Date;
        createdAt: Date;
    }>> {
        const results = await this.all(
            `SELECT phone_number, name, debt_amount, due_date, created_at
             FROM user_debt
             WHERE due_date <= ?
             ORDER BY due_date ASC`,
            [date.toISOString().split('T')[0]]
        );

        return results.map(row => ({
            phoneNumber: row.phone_number,
            name: row.name,
            debtAmount: row.debt_amount,
            dueDate: new Date(row.due_date),
            createdAt: new Date(row.created_at)
        }));
    }

    /**
     * @inheritdoc
     * Asegura una limpieza adecuada de recursos:
     * 1. Finaliza todas las consultas preparadas
     * 2. Cierra la conexión a la base de datos
     */
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