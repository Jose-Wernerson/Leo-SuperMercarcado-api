import express from 'express';
import { pool } from '../database/database.js';

const router = express.Router();

// Mock temporário
let produtos = [];

// GET /produtos - Com paginação, busca e filtro por categoria
router.get('/', async (req, res) => {
	try {
		// Se não tiver pool MySQL, usa dados em memória
		if (!pool) {
			const { page = 1, limit = 50, search = '', categoria = '' } = req.query;
			let resultados = produtos;
			
			// Filtrar por busca
			if (search) {
				const searchLower = search.toLowerCase();
				resultados = resultados.filter(p => 
					p.nome.toLowerCase().includes(searchLower) || 
					p.codigo.toLowerCase().includes(searchLower)
				);
			}
			
			// Filtrar por categoria
			if (categoria) {
				resultados = resultados.filter(p => p.categoria === categoria);
			}
			
			// Paginação
			const inicio = (page - 1) * limit;
			const fim = inicio + parseInt(limit);
			const produtosPaginados = resultados.slice(inicio, fim);
			
			return res.json({
				produtos: produtosPaginados,
				total: resultados.length,
				pagina: parseInt(page),
				totalPaginas: Math.ceil(resultados.length / limit)
			});
		}
		
		// Query MySQL com paginação e busca
		const { page = 1, limit = 50, search = '', categoria = '' } = req.query;
		const offset = (page - 1) * limit;
		
		let query = 'SELECT * FROM produtos WHERE ativo = true';
		const params = [];
		
		// Filtro de busca
		if (search) {
			query += ' AND (nome LIKE ? OR codigo LIKE ? OR codigo_barras LIKE ?)';
			const searchParam = `%${search}%`;
			params.push(searchParam, searchParam, searchParam);
		}
		
		// Filtro de categoria
		if (categoria) {
			query += ' AND categoria = ?';
			params.push(categoria);
		}
		
		// Ordenar e paginar
		query += ' ORDER BY nome LIMIT ? OFFSET ?';
		params.push(parseInt(limit), parseInt(offset));
		
		const [resultados] = await pool.query(query, params);
		
		// Contar total
		let countQuery = 'SELECT COUNT(*) as total FROM produtos WHERE ativo = true';
		const countParams = [];
		
		if (search) {
			countQuery += ' AND (nome LIKE ? OR codigo LIKE ? OR codigo_barras LIKE ?)';
			const searchParam = `%${search}%`;
			countParams.push(searchParam, searchParam, searchParam);
		}
		
		if (categoria) {
			countQuery += ' AND categoria = ?';
			countParams.push(categoria);
		}
		
		const [countResult] = await pool.query(countQuery, countParams);
		const total = countResult[0].total;
		
		res.json({
			produtos: resultados,
			total,
			pagina: parseInt(page),
			totalPaginas: Math.ceil(total / limit)
		});
	} catch (error) {
		console.error('Erro ao buscar produtos:', error);
		res.status(500).json({ erro: 'Erro ao buscar produtos' });
	}
});

// POST /produtos
router.post('/', async (req, res) => {
	try {
		const { nome, codigo, preco, estoque, categoria, codigo_barras, unidade } = req.body;
		
		// Se não tiver pool MySQL, usa dados em memória
		if (!pool) {
			const novoProduto = {
				id: produtos.length + 1,
				nome,
				codigo,
				preco,
				estoque: estoque || 0,
				categoria: categoria || null,
				codigo_barras: codigo_barras || null,
				unidade: unidade || 'UN',
				ativo: true
			};
			produtos.push(novoProduto);
			return res.status(201).json(novoProduto);
		}
		
		// Inserir no MySQL
		const [resultado] = await pool.query(
			'INSERT INTO produtos (nome, codigo, preco, estoque, categoria, codigo_barras, unidade) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[nome, codigo, preco, estoque || 0, categoria || null, codigo_barras || null, unidade || 'UN']
		);
		
		const novoProduto = {
			id: resultado.insertId,
			nome,
			codigo,
			preco,
			estoque: estoque || 0,
			categoria,
			codigo_barras,
			unidade: unidade || 'UN',
			ativo: true
		};
		
		res.status(201).json(novoProduto);
	} catch (error) {
		console.error('Erro ao criar produto:', error);
		res.status(500).json({ erro: 'Erro ao criar produto' });
	}
});

// PUT /produtos/:id - Atualizar produto
router.put('/:id', async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const { nome, codigo, preco, estoque, categoria, codigo_barras, unidade } = req.body;
		
		// Se não tiver pool MySQL, usa dados em memória
		if (!pool) {
			const index = produtos.findIndex(p => p.id === id);
			
			if (index === -1) {
				return res.status(404).json({ erro: 'Produto não encontrado' });
			}
			
			produtos[index] = {
				id: id,
				nome,
				codigo,
				preco,
				estoque,
				categoria: categoria || null,
				codigo_barras: codigo_barras || null,
				unidade: unidade || 'UN'
			};
			
			return res.json(produtos[index]);
		}
		
		// Atualizar no MySQL
		const [resultado] = await pool.query(
			'UPDATE produtos SET nome = ?, codigo = ?, preco = ?, estoque = ?, categoria = ?, codigo_barras = ?, unidade = ? WHERE id = ?',
			[nome, codigo, preco, estoque, categoria || null, codigo_barras || null, unidade || 'UN', id]
		);
		
		if (resultado.affectedRows === 0) {
			return res.status(404).json({ erro: 'Produto não encontrado' });
		}
		
		res.json({ 
			id, 
			nome, 
			codigo, 
			preco, 
			estoque,
			categoria,
			codigo_barras,
			unidade
		});
	} catch (error) {
		console.error('Erro ao atualizar produto:', error);
		res.status(500).json({ erro: 'Erro ao atualizar produto' });
	}
});

// DELETE /produtos/:id - Excluir produto (soft delete)
router.delete('/:id', async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		
		// Se não tiver pool MySQL, usa dados em memória
		if (!pool) {
			const index = produtos.findIndex(p => p.id === id);
			
			if (index === -1) {
				return res.status(404).json({ erro: 'Produto não encontrado' });
			}
			
			produtos.splice(index, 1);
			return res.json({ message: 'Produto excluído com sucesso' });
		}
		
		// Soft delete no MySQL (marca como inativo)
		const [resultado] = await pool.query(
			'UPDATE produtos SET ativo = false WHERE id = ?',
			[id]
		);
		
		if (resultado.affectedRows === 0) {
			return res.status(404).json({ erro: 'Produto não encontrado' });
		}
		
		res.json({ message: 'Produto excluído com sucesso' });
	} catch (error) {
		console.error('Erro ao excluir produto:', error);
		res.status(500).json({ erro: 'Erro ao excluir produto' });
	}
});

// GET /produtos/categorias - Listar categorias
router.get('/categorias', async (req, res) => {
	try {
		// Se não tiver pool MySQL, usa dados em memória
		if (!pool) {
			const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];
			return res.json(categorias);
		}
		
		// Buscar categorias distintas no MySQL
		const [resultado] = await pool.query(
			'SELECT DISTINCT categoria FROM produtos WHERE categoria IS NOT NULL AND ativo = true ORDER BY categoria'
		);
		
		const categorias = resultado.map(r => r.categoria);
		res.json(categorias);
	} catch (error) {
		console.error('Erro ao buscar categorias:', error);
		res.status(500).json({ erro: 'Erro ao buscar categorias' });
	}
});

export default router;
