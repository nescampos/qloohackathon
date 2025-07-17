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
     * Inicializa la estructura de la base de datos para usuarios globales y múltiples proveedores.
     */
    async initialize() {
        await this.run('BEGIN TRANSACTION');
        try {
            // Tabla de usuario global
            await this.run(`
                CREATE TABLE IF NOT EXISTS global_user (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT
                )
            `);

            // Identidad de usuario por proveedor
            await this.run(`
                CREATE TABLE IF NOT EXISTS user_provider_identity (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    global_user_id INTEGER NOT NULL,
                    provider TEXT NOT NULL,
                    external_id TEXT NOT NULL,
                    UNIQUE(provider, external_id),
                    FOREIGN KEY (global_user_id) REFERENCES global_user(id)
                )
            `);

            // Historial de mensajes
            await this.run(`
                CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_provider_identity_id INTEGER NOT NULL,
                    message TEXT,
                    role TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_provider_identity_id) REFERENCES user_provider_identity(id)
                )
            `);

            // Índices para optimizar las consultas frecuentes
            await this.run('CREATE INDEX IF NOT EXISTS idx_chat_history_user_provider_identity_id ON chat_history(user_provider_identity_id)');
            await this.run('CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp)');
            await this.run('COMMIT');
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
     * Busca o crea una identidad de usuario por proveedor.
     * Si no existe, crea un global_user y la identidad.
     */
    async getOrCreateUserProviderIdentity(provider: string, externalId: string, name?: string): Promise<{ identityId: number, globalUserId: number }> {
        // Buscar identidad existente
        let row = await this.get(
            'SELECT id, global_user_id FROM user_provider_identity WHERE provider = ? AND external_id = ?',
            [provider, externalId]
        );
        if (row) {
            return { identityId: row.id, globalUserId: row.global_user_id };
        }
        // Crear global_user
        const result = await this.run(
            'INSERT INTO global_user (name) VALUES (?)',
            [name || externalId]
        );
        // SQLite: lastID está en result.lastID, pero con promisify puede no estar, así que obtener el último id insertado
        const globalUserIdRow = await this.get('SELECT last_insert_rowid() as id');
        const globalUserId = globalUserIdRow.id;
        // Crear identidad
        const identityResult = await this.run(
            'INSERT INTO user_provider_identity (global_user_id, provider, external_id) VALUES (?, ?, ?)',
            [globalUserId, provider, externalId]
        );
        const identityIdRow = await this.get('SELECT last_insert_rowid() as id');
        return { identityId: identityIdRow.id, globalUserId };
    }

    /**
     * Guarda un mensaje en el historial de chat usando la identidad de usuario por proveedor.
     */
    async saveMessageByProvider(provider: string, externalId: string, message: string, role: 'user' | 'assistant', name?: string): Promise<void> {
        const { identityId } = await this.getOrCreateUserProviderIdentity(provider, externalId, name);
        await this.run(
            'INSERT INTO chat_history (user_provider_identity_id, message, role) VALUES (?, ?, ?)',
            [identityId, message, role]
        );
    }

    /**
     * Obtiene los mensajes más recientes para una identidad de usuario por proveedor.
     */
    async getRecentMessagesByProvider(provider: string, externalId: string, limit: number = 10): Promise<Array<{message: string, role: string, timestamp: string}>> {
        const row = await this.get(
            'SELECT id FROM user_provider_identity WHERE provider = ? AND external_id = ?',
            [provider, externalId]
        );
        if (!row) return [];
        return await this.all(
            `SELECT message, role, timestamp 
             FROM chat_history 
             WHERE user_provider_identity_id = ? 
             ORDER BY timestamp DESC 
             LIMIT ?`,
            [row.id, limit]
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