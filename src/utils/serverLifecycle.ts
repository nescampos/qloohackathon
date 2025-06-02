import { FastifyInstance } from 'fastify';
import { db } from '../database/db';

export class ServerLifecycle {
    static async gracefulShutdown(server: FastifyInstance, signal: string): Promise<void> {
        console.log(`\n${signal} received. Closing HTTP server and database...`);
        try {
            await server.close();
            await db.close();
            console.log('Cleanup completed');
            process.exit(0);
        } catch (err) {
            console.error('Error during cleanup:', err);
            process.exit(1);
        }
    }

    static registerShutdownHandlers(server: FastifyInstance): void {
        process.on('SIGTERM', () => this.gracefulShutdown(server, 'SIGTERM'));
        process.on('SIGINT', () => this.gracefulShutdown(server, 'SIGINT'));
    }

    static async initializeDatabase(): Promise<void> {
        try {
            await db.initialize();
        } catch (err) {
            console.error('Failed to initialize database:', err);
            process.exit(1);
        }
    }
} 