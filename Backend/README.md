# API CRUD de Usuários - Documentação

## 📋 Visão Geral

Esta API fornece operações CRUD completas para gerenciamento de usuários, incluindo autenticação JWT, validação de dados e tratamento de erros.

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
cd Backend
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
NODE_ENV=development
PORT=3000

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sua_database
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_URL=postgresql://usuario:senha@localhost:5432/database

# JWT configuration
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=7d

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Executar o Servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📊 Endpoints da API

### 🔐 Autenticação (`/api/auth`)

#### POST `/api/auth/register`
Registrar novo usuário.

**Body:**
```json
{
  "nome": "João Silva",
  "pronome": "ele/dele",
  "senha": "123456",
  "email": "joao@email.com",
  "tel": "11999999999",
  "data_nascimento": "1990-01-01",
  "cpf": "12345678901"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "nome": "João Silva",
      "email": "joao@email.com",
      "active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_aqui"
  }
}
```

#### POST `/api/auth/login`
Fazer login.

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

#### POST `/api/auth/change-password`
Alterar senha (requer autenticação).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "senha_atual": "123456",
  "nova_senha": "nova123456"
}
```

#### GET `/api/auth/me`
Obter dados do usuário logado (requer autenticação).

**Headers:** `Authorization: Bearer <token>`

#### POST `/api/auth/logout`
Fazer logout (requer autenticação).

#### POST `/api/auth/refresh`
Renovar token (requer autenticação).

### 👥 Usuários (`/api/users`)

#### GET `/api/users`
Listar usuários com paginação e filtros.

**Query Parameters:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10, máximo: 100)
- `search` (string): Buscar por nome ou email
- `active` (boolean): Filtrar por status ativo

**Exemplo:** `GET /api/users?page=1&limit=10&search=joão&active=true`

#### GET `/api/users/:id`
Obter usuário específico por ID.

#### PUT `/api/users/:id`
Atualizar usuário (requer autenticação).

**Body:** (campos opcionais)
```json
{
  "nome": "João Silva Santos",
  "pronome": "ele/dele",
  "email": "novo@email.com",
  "tel": "11888888888",
  "data_nascimento": "1990-01-01",
  "cpf": "12345678901"
}
```

#### DELETE `/api/users/:id`
Deletar usuário (soft delete, requer autenticação).

#### PUT `/api/users/:id/activate`
Ativar usuário (requer autenticação).

#### PUT `/api/users/:id/deactivate`
Desativar usuário (requer autenticação).

#### GET `/api/users/stats/overview`
Obter estatísticas dos usuários (requer autenticação).

## 🔒 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## 📝 Validações

### Campos Obrigatórios (Criação):
- `nome`: Mínimo 2 caracteres
- `email`: Formato de email válido
- `senha`: Mínimo 6 caracteres

### Campos Opcionais:
- `pronome`: Máximo 50 caracteres
- `tel`: Máximo 20 caracteres
- `data_nascimento`: Data válida (não pode ser no futuro)
- `cpf`: Exatamente 11 dígitos numéricos

## ⚠️ Códigos de Erro

- `400`: Dados inválidos
- `401`: Não autorizado
- `403`: Acesso negado
- `404`: Recurso não encontrado
- `409`: Conflito (email/CPF já existe)
- `429`: Muitas requisições
- `500`: Erro interno do servidor

## 🛡️ Segurança

- ✅ Senhas são hasheadas com bcrypt
- ✅ Rate limiting implementado
- ✅ Validação de dados com Joi
- ✅ Headers de segurança com Helmet
- ✅ CORS configurado
- ✅ Soft delete para preservar dados
- ✅ Autenticação JWT obrigatória para rotas protegidas

## 🗄️ Estrutura do Banco

A API trabalha com a seguinte estrutura de tabela:

```sql
CREATE TABLE public.usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  pronome TEXT,
  senha TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  tel TEXT,
  data_nascimento DATE,
  cpf CHAR(11) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES public.usuario(id) ON DELETE SET NULL
);
```

## 🧪 Testando a API

### Com curl:

```bash
# Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@email.com","senha":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","senha":"123456"}'

# Listar usuários (com token)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Health Check:
```bash
curl http://localhost:3000/health
```
