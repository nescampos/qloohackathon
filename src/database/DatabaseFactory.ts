import { SQLiteDatabase } from './SQLiteDatabase';
import { SQLServerDatabase } from './SQLServerDatabase';
import { SupabaseDatabase } from './SupabaseDatabase';
import * as sql from 'mssql';
import { IDatabase } from './IDatabase';

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
    static createDatabase(type: string, config: any): IDatabase {
        switch (type) {
            case 'sqlite':
                return new SQLiteDatabase();
            case 'sqlserver':
                const sqlConfig: sql.config = {
                    user: config.user,
                    password: config.password,
                    server: config.server,
                    database: config.database,
                };
                return new SQLServerDatabase(sqlConfig);
            case 'supabase':
                return new SupabaseDatabase(config.url, config.key);
            default:
                throw new Error(`Unsupported database type: ${type}`);
        }
    }
} 