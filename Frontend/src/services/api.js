import axios from 'axios';
import toast from 'react-hot-toast';

// Configuração base do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Sessão expirada. Faça login novamente.');
    } else if (error.response?.status === 403) {
      toast.error('Acesso negado');
    } else if (error.response?.status === 404) {
      toast.error('Recurso não encontrado');
    } else if (error.response?.status === 409) {
      toast.error(error.response.data.message || 'Conflito de dados');
    } else if (error.response?.status >= 500) {
      toast.error('Erro interno do servidor');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Timeout na requisição');
    } else if (!error.response) {
      toast.error('Erro de conexão');
    }
    
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  // Login
  async login(email, senha) {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      throw error;
    }
  },

  // Registro
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Alterar senha
  async changePassword(senhaAtual, novaSenha) {
    try {
      const response = await api.post('/auth/change-password', {
        senha_atual: senhaAtual,
        nova_senha: novaSenha
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter dados do usuário logado
  async getMe() {
    try {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  },

  // Renovar token
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data.data;
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      throw error;
    }
  }
};

// Serviços de usuários
export const userService = {
  // Listar usuários
  async getUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter usuário por ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar usuário
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  },

  // Deletar usuário
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Ativar usuário
  async activateUser(id) {
    try {
      const response = await api.put(`/users/${id}/activate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Desativar usuário
  async deactivateUser(id) {
    try {
      const response = await api.put(`/users/${id}/deactivate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter estatísticas
  async getStats() {
    try {
      const response = await api.get('/users/stats/overview');
      return response.data.data.stats;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
