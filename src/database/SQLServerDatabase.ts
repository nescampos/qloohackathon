import * as sql from 'mssql';
import { IDatabase } from './IDatabase';

/**
 * Implementación de la base de datos usando SQL Server.
 * Esta implementación está diseñada para entornos de producción,
 * proporcionando todas las características empresariales de SQL Server
 * como alta disponibilidad, backups automáticos y mejor escalabilidad.
 */
export class SQLServerDatabase implements IDatabase {
    private pool: sql.ConnectionPool;

    /**
     * Constructor que inicializa el pool de conexiones de SQL Server.
     * @param config - Configuración de conexión a SQL Server incluyendo credenciales y opciones
     */
    constructor(config: sql.config) {
        this.pool = new sql.ConnectionPool(config);
    }

    /**
     * Inicializa la estructura de la base de datos.
     * Crea las tablas e índices necesarios si no existen, utilizando características
     * específicas de SQL Server como NVARCHAR para soporte Unicode y DATETIME2 para
     * precisión temporal.
     */
    async initialize(): Promise<void> {
        await this.pool.connect();
        
        // Create tables in a single transaction
        const transaction = new sql.Transaction(this.pool);
        try {
            await transaction.begin();

            // Tabla para almacenar la relación entre usuarios y sus hilos de conversación
            await transaction.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_threads')
                CREATE TABLE user_threads (
                    phone_number NVARCHAR(50) PRIMARY KEY,
                    thread_id NVARCHAR(100) NOT NULL,
                    created_at DATETIME2 DEFAULT GETDATE(),
                    last_interaction DATETIME2 DEFAULT GETDATE()
                )
            `);

            // Tabla para almacenar el historial de mensajes
            await transaction.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_history')
                CREATE TABLE chat_history (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    phone_number NVARCHAR(50),
                    thread_id NVARCHAR(100),
                    message NVARCHAR(MAX),
                    role NVARCHAR(50),
                    timestamp DATETIME2 DEFAULT GETDATE(),
                    FOREIGN KEY (phone_number) REFERENCES user_threads(phone_number)
                )
            `);

            // Índices para optimizar las consultas frecuentes
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

    /**
     * @inheritdoc
     * Utiliza parámetros SQL para prevenir inyección SQL.
     */
    async getThreadId(phoneNumber: string): Promise<string | null> {
        const result = await this.pool.request()
            .input('phoneNumber', sql.NVarChar, phoneNumber)
            .query('SELECT thread_id FROM user_threads WHERE phone_number = @phoneNumber');
        
        return result.recordset[0]?.thread_id || null;
    }

    /**
     * @inheritdoc
     * Utiliza la sentencia MERGE de SQL Server para manejar la inserción/actualización
     * en una única operación atómica.
     */
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

    /**
     * @inheritdoc
     * Implementa una transacción explícita para garantizar la consistencia
     * al guardar el mensaje y actualizar la última interacción.
     */
    async saveMessage(phoneNumber: string, threadId: string, message: string, role: 'user' | 'assistant'): Promise<void> {
        const transaction = new sql.Transaction(this.pool);
        try {
            await transaction.begin();

            // Inserta el nuevo mensaje
            await transaction.request()
                .input('phoneNumber', sql.NVarChar, phoneNumber)
                .input('threadId', sql.NVarChar, threadId)
                .input('message', sql.NVarChar, message)
                .input('role', sql.NVarChar, role)
                .query(`
                    INSERT INTO chat_history (phone_number, thread_id, message, role)
                    VALUES (@phoneNumber, @threadId, @message, @role)
                `);

            // Actualiza la marca de tiempo de última interacción
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

    /**
     * @inheritdoc
     * Utiliza la sintaxis moderna de SQL Server para paginación (OFFSET-FETCH)
     * que es más eficiente que TOP o ROW_NUMBER().
     */
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

    /**
     * @inheritdoc
     * Cierra el pool de conexiones de SQL Server de manera segura.
     */
    async close(): Promise<void> {
        await this.pool.close();
    }
} 