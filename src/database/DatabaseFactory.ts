import { IDatabase } from './IDatabase';
import { SQLiteDatabase } from './SQLiteDatabase';
import { SQLServerDatabase } from './SQLServerDatabase';
import * as sql from 'mssql';

export class DatabaseFactory {
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
                    encrypt: true,
                    trustServerCertificate: true,
                },
                pool: {
                    max: 10,
                    min: 0,
                    idleTimeoutMillis: 30000
                }
            };

            return new SQLServerDatabase(config);
        } else {
            // SQLite for development
            return new SQLiteDatabase();
        }
    }
} 