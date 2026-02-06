import express from 'express';
const router = express.Router();

// Mock temporário
let clientes = [];

// GET /clientes
router.get('/', (req, res) => {
	res.json(clientes);
});

// POST /clientes
router.post('/', (req, res) => {
	const { nome, cpf_cnpj, endereco } = req.body;
	const novoCliente = {
		id: clientes.length + 1,
		nome,
		cpf_cnpj,
		endereco
	};
	clientes.push(novoCliente);
	res.status(201).json(novoCliente);
});

export default router;
