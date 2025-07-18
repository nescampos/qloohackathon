import { initializeClientDb } from '../database/userDebt';

async function setupClientDatabase() {
  try {
    console.log('🗄️ Inicializando base de datos del cliente...');
    await initializeClientDb();
    console.log('✅ Base de datos del cliente inicializada correctamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos del cliente:', error);
    process.exit(1);
  }
}

setupClientDatabase(); 