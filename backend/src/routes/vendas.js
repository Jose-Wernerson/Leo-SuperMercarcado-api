import express from 'express';
const router = express.Router();

// Mock temporário - armazenamento em memória
let vendas = [];

// POST /vendas
router.post('/', (req, res) => {
	try {
		const vendaData = req.body;
		const novaVenda = {
			id: vendas.length + 1,
			...vendaData,
			status: 'Concluído'
		};
		vendas.push(novaVenda);
		res.status(201).json(novaVenda);
	} catch (error) {
		console.error('Erro ao criar venda:', error);
		res.status(500).json({ erro: 'Erro ao registrar venda' });
	}
});

// GET /vendas - Listar todas as vendas
router.get('/', (req, res) => {
	try {
		// Retorna vendas ordenadas por ID decrescente (mais recentes primeiro)
		const vendasOrdenadas = [...vendas].reverse();
		res.json(vendasOrdenadas);
	} catch (error) {
		console.error('Erro ao listar vendas:', error);
		res.status(500).json({ erro: 'Erro ao carregar vendas' });
	}
});

// GET /vendas/:id - Buscar venda específica
router.get('/:id', (req, res) => {
	try {
		const venda = vendas.find(v => v.id === parseInt(req.params.id));
		if (!venda) return res.status(404).json({ erro: 'Venda não encontrada' });
		res.json(venda);
	} catch (error) {
		console.error('Erro ao buscar venda:', error);
		res.status(500).json({ erro: 'Erro ao buscar venda' });
	}
});

// DELETE /vendas/:id - Cancelar venda
router.delete('/:id', (req, res) => {
	try {
		const index = vendas.findIndex(v => v.id === parseInt(req.params.id));
		if (index === -1) return res.status(404).json({ erro: 'Venda não encontrada' });
		
		vendas[index].status = 'Cancelado';
		res.json({ message: 'Venda cancelada com sucesso', venda: vendas[index] });
	} catch (error) {
		console.error('Erro ao cancelar venda:', error);
		res.status(500).json({ erro: 'Erro ao cancelar venda' });
	}
});

export default router;
