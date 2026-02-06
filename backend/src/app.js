import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import produtosRoutes from './routes/produtos.js';
import clientesRoutes from './routes/clientes.js';
import rotasRoutes from './routes/rotas.js';
import vendasRoutes from './routes/vendas.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rota raiz
app.get('/', (req, res) => {
    res.json({ message: 'API Leo Super Mercado rodando', version: '1.0.0' });
});

app.use('/produtos', produtosRoutes);
app.use('/clientes', clientesRoutes);
app.use('/rotas', rotasRoutes);
app.use('/vendas', vendasRoutes);

export default app;
