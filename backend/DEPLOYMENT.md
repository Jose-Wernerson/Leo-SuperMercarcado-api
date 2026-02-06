# Guia de Deploy na Hostinger

## Pré-requisitos

1. **Conta na Hostinger** com acesso a:
   - MySQL Database
   - SSH/Terminal
   - File Manager ou FTP

## Passo 1: Configurar Banco de Dados MySQL

1. **Criar Banco de Dados**:
   - Acesse o painel da Hostinger
   - Vá em "Banco de Dados MySQL"
   - Clique em "Criar Banco de Dados"
   - Anote as credenciais:
     - Host (geralmente localhost ou um domínio)
     - Nome do banco
     - Usuário
     - Senha

2. **Configurar o arquivo .env**:
   ```env
   PORT=3001
   DB_HOST=seu_host_mysql
   DB_USER=seu_usuario_mysql
   DB_PASSWORD=sua_senha_mysql
   DB_NAME=seu_banco_de_dados
   ```

## Passo 2: Fazer Upload dos Arquivos

### Opção A: Via FTP/File Manager
1. Fazer upload da pasta `backend` completa
2. Fazer upload da pasta `frontend-web` completa

### Opção B: Via Git (recomendado)
1. Conectar via SSH
2. Clonar o repositório:
   ```bash
   git clone seu-repositorio.git
   cd Leo\ Super\ Mercado
   ```

## Passo 3: Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend-web
npm install
npm run build
```

## Passo 4: Inicializar o Banco de Dados

```bash
cd backend
npm run db:init
```

Este comando irá:
- Criar todas as tabelas necessárias
- Criar índices para otimização
- Inserir dados de exemplo

## Passo 5: Configurar o Servidor

### Para Node.js Hosting:
1. No painel da Hostinger, configure:
   - **Porta da aplicação**: 3001
   - **Comando de start**: `npm start`
   - **Diretório**: `/backend`

### Para VPS/Cloud:
1. Instalar PM2:
   ```bash
   npm install -g pm2
   ```

2. Iniciar o backend:
   ```bash
   cd backend
   pm2 start server.js --name leo-backend
   pm2 save
   pm2 startup
   ```

## Passo 6: Configurar o Frontend

1. **Atualizar a URL da API**:
   Edite `frontend-web/src/services/api.js`:
   ```javascript
   const API_URL = 'https://seu-dominio.com:3001';
   ```

2. **Fazer build do frontend**:
   ```bash
   cd frontend-web
   npm run build
   ```

3. **Servir o build**:
   - Copie o conteúdo da pasta `build` para o diretório público (public_html)
   - Configure o servidor web para servir os arquivos estáticos

## Otimizações Implementadas

### 1. Paginação
- A API agora retorna produtos paginados (50 por página por padrão)
- Parâmetros: `?page=1&limit=50`

### 2. Busca Otimizada
- Busca por nome, código ou código de barras
- Parâmetro: `?search=arroz`

### 3. Filtro por Categoria
- Filtrar produtos por categoria
- Parâmetro: `?categoria=Alimentos`

### 4. Índices no Banco
- Índices em `nome`, `categoria` e `codigo_barras`
- Melhora performance de buscas em milhares de produtos

### 5. Soft Delete
- Produtos não são deletados fisicamente
- Apenas marcados como inativos (ativo = false)

## Exemplo de Uso da API

```javascript
// Listar produtos com paginação
GET /produtos?page=1&limit=50

// Buscar produtos
GET /produtos?search=arroz

// Filtrar por categoria
GET /produtos?categoria=Alimentos

// Combinar filtros
GET /produtos?page=1&limit=20&search=arroz&categoria=Alimentos

// Listar todas as categorias
GET /produtos/categorias
```

## Capacidade do Sistema

Com as otimizações implementadas, o sistema suporta:
- ✅ 10.000 - 30.000 produtos sem problemas
- ✅ Buscas rápidas com índices
- ✅ Paginação para não carregar tudo de uma vez
- ✅ Filtros por categoria para organização

## Troubleshooting

### Erro de conexão com MySQL:
- Verifique se as credenciais no .env estão corretas
- Confirme que o host MySQL está acessível

### Porta 3001 em uso:
```bash
lsof -ti:3001 | xargs kill -9
```

### Backend não inicia:
- Verifique os logs: `pm2 logs leo-backend`
- Confirme que o Node.js está instalado: `node --version`

### Frontend não carrega:
- Verifique se a URL da API está correta
- Confirme que o CORS está configurado no backend

## Backup do Banco de Dados

```bash
# Fazer backup
mysqldump -u usuario -p nome_banco > backup.sql

# Restaurar backup
mysql -u usuario -p nome_banco < backup.sql
```

## Contato e Suporte

Para dúvidas sobre o deploy, consulte a documentação da Hostinger ou entre em contato com o suporte técnico.
