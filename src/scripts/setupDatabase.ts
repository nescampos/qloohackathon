import { db } from '../database/db';

async function setupDatabase() {
    try {
        console.log('🗄️ Initializing database...');
        await db.initialize();
        console.log('✅ Database initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

setupDatabase(); 