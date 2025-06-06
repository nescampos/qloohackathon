import { IDatabase } from './IDatabase';
import { SQLiteDatabase } from './SQLiteDatabase';
import { SQLServerDatabase } from './SQLServerDatabase';
import * as sql from 'mssql';

/**
 * Factory para crear instancias de base de datos.
 * Esta clase implementa el patrón Factory Method para proporcionar
 * la implementación correcta de base de datos según el entorno.
 */
export class DatabaseFactory {
    /**
     * Crea y retorna una instancia de base de datos apropiada según el entorno.
     * 
     * En desarrollo (NODE_ENV !== 'production'):
     * - Retorna una instancia de SQLiteDatabase
     * - No requiere configuración adicional
     * - Los datos se almacenan en un archivo local 'chat.db'
     * 
     * En producción (NODE_ENV === 'production'):
     * - Retorna una instancia de SQLServerDatabase
     * - Requiere las siguientes variables de entorno:
     *   * DB_USER: Usuario de SQL Server
     *   * DB_PASSWORD: Contraseña de SQL Server
     *   * DB_SERVER: Host del servidor SQL Server
     *   * DB_NAME: Nombre de la base de datos
     * 
     * @returns Una instancia que implementa la interfaz IDatabase
     */
    static createDatabase(): IDatabase {
        const environment = process.env.NODE_ENV || 'development';

        if (environment === 'production') {
            // SQL Server configuration for production
            const config: sql.config = {
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                server: process.env.DB_SERVER || '',
                database: process.env.DB_NAME,
                options: {
                    encrypt: true, // Para conexiones seguras
                    trustServerCertificate: true, // Necesario en algunos entornos
                },
                pool: {
                    max: 10, // Máximo de conexiones simultáneas
                    min: 0,  // Mínimo de conexiones mantenidas
                    idleTimeoutMillis: 30000 // Tiempo máximo de inactividad
                }
            };

            return new SQLServerDatabase(config);
        } else {
            // SQLite for development
            return new SQLiteDatabase();
        }
    }
} 