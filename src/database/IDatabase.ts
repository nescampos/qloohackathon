/**
 * Interfaz que define el contrato para todas las implementaciones de base de datos.
 * Esta interfaz asegura que todas las implementaciones (SQLite, SQL Server, etc.)
 * proporcionen la misma funcionalidad básica necesaria para la aplicación.
 */
export interface IDatabase {
    /**
     * Inicializa la base de datos creando las tablas necesarias si no existen.
     * Este método debe ser llamado al inicio de la aplicación.
     */
    initialize(): Promise<void>;

    /**
     * Obtiene el ID del hilo de conversación asociado a un número de teléfono.
     * @param phoneNumber - Número de teléfono del usuario
     * @returns El ID del hilo si existe, null si no existe
     */
    getThreadId(phoneNumber: string): Promise<string | null>;

    /**
     * Guarda o actualiza el ID del hilo de conversación para un número de teléfono.
     * @param phoneNumber - Número de teléfono del usuario
     * @param threadId - ID del hilo de conversación de OpenAI
     */
    saveThreadId(phoneNumber: string, threadId: string): Promise<void>;

    /**
     * Guarda un mensaje en el historial de chat.
     * @param phoneNumber - Número de teléfono del usuario
     * @param threadId - ID del hilo de conversación
     * @param message - Contenido del mensaje
     * @param role - Rol del mensaje ('user' o 'assistant')
     */
    saveMessage(phoneNumber: string, threadId: string, message: string, role: 'user' | 'assistant'): Promise<void>;

    /**
     * Obtiene los mensajes más recientes para un usuario específico.
     * @param phoneNumber - Número de teléfono del usuario
     * @param limit - Número máximo de mensajes a retornar
     * @returns Array de mensajes ordenados por fecha descendente
     */
    getRecentMessages(phoneNumber: string, limit?: number): Promise<Array<{message: string, role: string, timestamp: string}>>;

    /**
     * Cierra la conexión con la base de datos y libera los recursos.
     * Este método debe ser llamado al cerrar la aplicación.
     */
    close(): Promise<void>;
} 