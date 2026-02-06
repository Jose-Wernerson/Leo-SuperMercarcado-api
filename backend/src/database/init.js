import { createTables, seedDatabase } from './migrations.js';

async function initDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados...');
    await createTables();
    await seedDatabase();
    console.log('✅ Banco de dados pronto!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initDatabase();
