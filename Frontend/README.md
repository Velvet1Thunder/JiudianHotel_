# Frontend - Sistema de Usuários

## 📋 Visão Geral

Frontend moderno desenvolvido com React, Vite e React Router para gerenciamento de usuários. Inclui páginas de login, cadastro, dashboard e gerenciamento de usuários com interface responsiva e moderna.

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
cd Frontend
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Sistema de Usuários
VITE_APP_VERSION=1.0.0
```

### 3. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3001`

## 🎨 Funcionalidades

### 🔐 **Autenticação**
- ✅ **Página de Login** com validação em tempo real
- ✅ **Página de Cadastro** com validação completa
- ✅ **Gerenciamento de estado** com Context API
- ✅ **Proteção de rotas** com React Router
- ✅ **Armazenamento seguro** de tokens JWT

### 📱 **Interface**
- ✅ **Design responsivo** para mobile e desktop
- ✅ **Tema moderno** com cores consistentes
- ✅ **Componentes reutilizáveis** e bem estruturados
- ✅ **Feedback visual** com toasts e loading states
- ✅ **Navegação intuitiva** com sidebar

### 👥 **Gerenciamento de Usuários**
- ✅ **Dashboard** com estatísticas e atividades
- ✅ **Listagem de usuários** com paginação e filtros
- ✅ **Perfil do usuário** com edição inline
- ✅ **Alteração de senha** com validação
- ✅ **Busca e filtros** em tempo real

## 🛠️ **Tecnologias Utilizadas**

- **React 18** - Biblioteca principal
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificações
- **Lucide React** - Ícones
- **CSS3** - Estilização moderna

## 📁 **Estrutura do Projeto**

```
Frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # Layout principal com sidebar
│   │   └── ProtectedRoute.jsx   # Proteção de rotas
│   ├── contexts/
│   │   └── AuthContext.jsx      # Context de autenticação
│   ├── pages/
│   │   ├── Login.jsx            # Página de login
│   │   ├── Register.jsx         # Página de cadastro
│   │   ├── Dashboard.jsx        # Dashboard principal
│   │   ├── Profile.jsx          # Perfil do usuário
│   │   └── Users.jsx            # Gerenciamento de usuários
│   ├── services/
│   │   └── api.js               # Serviços de API
│   ├── styles/
│   │   └── auth.css             # Estilos específicos
│   ├── App.jsx                  # Componente principal
│   ├── App.css                  # Estilos globais
│   └── main.jsx                 # Ponto de entrada
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 **Páginas Disponíveis**

### **Login** (`/login`)
- Formulário de login com validação
- Campos: email e senha
- Validação em tempo real
- Redirecionamento automático

### **Cadastro** (`/register`)
- Formulário completo de cadastro
- Campos: nome, pronome, email, telefone, data de nascimento, CPF, senha
- Validação de CPF
- Validação de email único

### **Dashboard** (`/dashboard`)
- Estatísticas do sistema
- Atividade recente
- Informações da conta
- Cards com métricas

### **Perfil** (`/profile`)
- Visualização de dados pessoais
- Edição inline de informações
- Alteração de senha
- Validação de segurança

### **Usuários** (`/users`)
- Listagem com paginação
- Busca por nome ou email
- Filtros por status
- Ações: editar, ativar/desativar, deletar

## 🔧 **Configuração da API**

O frontend está configurado para se comunicar com a API do backend através do proxy do Vite:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
```

## 📱 **Responsividade**

- **Desktop**: Layout com sidebar fixa
- **Tablet**: Sidebar colapsável
- **Mobile**: Menu hambúrguer com overlay

## 🎨 **Design System**

### **Cores**
- **Primária**: Azul (#3b82f6)
- **Sucesso**: Verde (#10b981)
- **Erro**: Vermelho (#ef4444)
- **Aviso**: Amarelo (#f59e0b)
- **Info**: Azul (#3b82f6)

### **Tipografia**
- **Fonte**: Inter (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

### **Espaçamentos**
- **Padding**: 0.5rem, 1rem, 1.5rem, 2rem
- **Margins**: 0.25rem, 0.5rem, 1rem, 2rem
- **Gaps**: 0.5rem, 1rem, 1.5rem, 2rem

## 🚀 **Scripts Disponíveis**

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Linting do código
```

## 🔒 **Segurança**

- ✅ **Tokens JWT** armazenados no localStorage
- ✅ **Interceptors** para renovação automática
- ✅ **Validação** de dados no frontend
- ✅ **Proteção** de rotas sensíveis
- ✅ **Sanitização** de inputs

## 📊 **Performance**

- ✅ **Lazy loading** de componentes
- ✅ **Otimização** de re-renders
- ✅ **Debounce** em buscas
- ✅ **Paginação** para grandes listas
- ✅ **Cache** de requisições

## 🧪 **Testando a Aplicação**

1. **Acesse** `http://localhost:3001`
2. **Cadastre** um novo usuário
3. **Faça login** com as credenciais
4. **Explore** o dashboard e funcionalidades
5. **Teste** a responsividade em diferentes dispositivos

## 🔄 **Integração com Backend**

O frontend está totalmente integrado com a API do backend:

- **Autenticação**: Login e registro
- **Usuários**: CRUD completo
- **Perfil**: Edição e alteração de senha
- **Dashboard**: Estatísticas e atividades

## 📝 **Próximos Passos**

- [ ] Implementar testes unitários
- [ ] Adicionar PWA capabilities
- [ ] Implementar dark mode
- [ ] Adicionar internacionalização
- [ ] Implementar notificações push
