import { DatabaseFactory } from './DatabaseFactory';

/**
 * Punto de entrada único para la base de datos.
 * Este archivo exporta una única instancia de la base de datos (singleton)
 * que será utilizada en toda la aplicación.
 * 
 * La implementación concreta (SQLite o SQL Server) es determinada por
 * el DatabaseFactory basándose en el entorno de ejecución (NODE_ENV).
 * 
 * Uso:
 * ```typescript
 * import { db } from './database/db';
 * 
 * // Inicializar la base de datos
 * await db.initialize();
 * 
 * // Usar los métodos de la base de datos
 * await db.saveMessage(...);
 * ```
 */
export const db = DatabaseFactory.createDatabase(); 