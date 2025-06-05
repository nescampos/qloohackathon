import { DatabaseFactory } from './DatabaseFactory';

// Export a singleton instance using the factory
export const db = DatabaseFactory.createDatabase(); 