import app from './src/app.js';
import dotenv from 'dotenv';
import pool from './src/database/database.js';
import { createTables } from './src/database/migrations.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

// Inicializar banco de dados ao subir o servidor
async function startServer() {
	try {
		// Somente criar tabelas se MySQL estiver configurado
		if (pool) {
			await createTables();
			console.log('✅ Banco de dados MySQL inicializado');
		} else {
			console.log('ℹ️  Modo desenvolvimento: usando dados em memória');
		}
		
		app.listen(PORT, () => {
			console.log(`Servidor rodando na porta ${PORT}`);
		});
	} catch (error) {
		console.error('⚠️  Erro ao conectar MySQL, usando modo desenvolvimento');
		app.listen(PORT, () => {
			console.log(`Servidor rodando na porta ${PORT} (modo desenvolvimento)`);
		});
	}
}

startServer();
