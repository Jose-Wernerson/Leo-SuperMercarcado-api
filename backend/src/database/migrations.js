import pool from './database.js';

export async function createTables() {
  try {
    // Tabela de clientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf_cnpj VARCHAR(20),
        endereco TEXT,
        telefone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de produtos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nome VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        preco DECIMAL(10, 2) NOT NULL,
        estoque INT DEFAULT 0,
        codigo_barras VARCHAR(50),
        unidade VARCHAR(20) DEFAULT 'UN',
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_nome (nome),
        INDEX idx_categoria (categoria),
        INDEX idx_codigo_barras (codigo_barras)
      )
    `);

    // Tabela de vendas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero_recibo VARCHAR(20) NOT NULL,
        data DATETIME NOT NULL,
        motorista VARCHAR(255),
        rota VARCHAR(255),
        cliente_id INT NOT NULL,
        total_bruto DECIMAL(10, 2) NOT NULL,
        desconto DECIMAL(10, 2) DEFAULT 0,
        total_liquido DECIMAL(10, 2) NOT NULL,
        forma_pagamento VARCHAR(50) NOT NULL,
        uuid VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'Concluído',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    // Tabela de itens de venda
    await pool.query(`
      CREATE TABLE IF NOT EXISTS itens_venda (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venda_id INT NOT NULL,
        produto_id INT NOT NULL,
        quantidade INT NOT NULL,
        preco_unitario DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
        FOREIGN KEY (produto_id) REFERENCES produtos(id)
      )
    `);

    // Tabela de rotas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rotas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        motorista VARCHAR(255),
        clientes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    // Verificar se já existem dados
    const [clientes] = await pool.query('SELECT COUNT(*) as count FROM clientes');
    if (clientes[0].count > 0) {
      console.log('ℹ️  Banco de dados já possui dados');
      return;
    }

    // Inserir clientes de exemplo
    await pool.query(`
      INSERT INTO clientes (nome, cpf_cnpj, endereco, telefone) VALUES
      ('João Silva', '123.456.789-00', 'Rua A, 123', '(11) 98765-4321'),
      ('Maria Santos', '987.654.321-00', 'Av. B, 456', '(11) 91234-5678'),
      ('Pedro Oliveira', '456.789.123-00', 'Rua C, 789', '(11) 99876-5432')
    `);

    // Inserir produtos de exemplo
    await pool.query(`
      INSERT INTO produtos (codigo, nome, categoria, preco, estoque, codigo_barras, unidade) VALUES
      ('001', 'Arroz 5kg', 'Alimentos', 25.90, 100, '7891234567890', 'UN'),
      ('002', 'Feijão 1kg', 'Alimentos', 8.50, 150, '7891234567891', 'UN'),
      ('003', 'Óleo de Soja 900ml', 'Alimentos', 7.80, 80, '7891234567892', 'UN'),
      ('004', 'Açúcar 1kg', 'Alimentos', 4.50, 120, '7891234567893', 'UN'),
      ('005', 'Café 500g', 'Bebidas', 12.90, 60, '7891234567894', 'UN'),
      ('006', 'Refrigerante 2L', 'Bebidas', 8.90, 200, '7891234567895', 'UN'),
      ('007', 'Sabonete', 'Higiene', 3.50, 300, '7891234567896', 'UN'),
      ('008', 'Detergente', 'Limpeza', 2.90, 150, '7891234567897', 'UN')
    `);

    console.log('✅ Dados de exemplo inseridos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
    throw error;
  }
}
