import express from 'express';
const router = express.Router();

// Mock temporário
let rotas = [];

// GET /rotas - Listar todas
router.get('/', (req, res) => {
	res.json(rotas);
});

// POST /rotas
router.post('/', (req, res) => {
	const { nome, data, motorista, clientes } = req.body;
	const novaRota = {
		id: rotas.length + 1,
		nome,
		data,
		motorista,
		clientes: clientes || []
	};
	rotas.push(novaRota);
	res.status(201).json(novaRota);
});

// GET /rotas/:id
router.get('/:id', (req, res) => {
	const rota = rotas.find(r => r.id === parseInt(req.params.id));
	if (!rota) return res.status(404).json({ erro: 'Rota não encontrada' });
	res.json(rota);
});

export default router;
