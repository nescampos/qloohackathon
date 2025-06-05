export interface IDatabase {
    initialize(): Promise<void>;
    getThreadId(phoneNumber: string): Promise<string | null>;
    saveThreadId(phoneNumber: string, threadId: string): Promise<void>;
    saveMessage(phoneNumber: string, threadId: string, message: string, role: 'user' | 'assistant'): Promise<void>;
    getRecentMessages(phoneNumber: string, limit?: number): Promise<Array<{message: string, role: string, timestamp: string}>>;
    close(): Promise<void>;
} 