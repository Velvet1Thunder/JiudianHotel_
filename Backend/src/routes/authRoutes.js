const express = require('express');
const User = require('../models/User');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateLogin, validateUserCreate, validateChangePassword } = require('../middleware/validation');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// POST /api/auth/register - Registrar novo usuário
router.post('/register', validateUserCreate, async (req, res, next) => {
  try {
    const userData = req.body;

    // Verificar se email já existe
    const { query: checkQuery, values: checkValues } = await User.findByEmail(userData.email);
    const existingUser = await query(checkQuery, checkValues);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Verificar se CPF já existe (se fornecido)
    if (userData.cpf) {
      const cpfQuery = 'SELECT id FROM public.usuario WHERE cpf = $1 AND deleted_at IS NULL';
      const cpfResult = await query(cpfQuery, [userData.cpf]);
      
      if (cpfResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'CPF já está em uso'
        });
      }
    }

    // Criar usuário
    const { query: createQuery, values: createValues } = await User.create(userData);
    const result = await query(createQuery, createValues);

    if (result.rows.length === 0) {
      throw createError.internal('Erro ao criar usuário');
    }

    const newUser = new User(result.rows[0]);
    const token = newUser.generateToken();

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: newUser.toJSON(),
        token
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - Login do usuário
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    // Buscar usuário por email
    const { query: userQuery, values: userValues } = await User.findByEmail(email);
    const result = await query(userQuery, userValues);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const userData = result.rows[0];
    const user = new User(userData);

    // Verificar se usuário está ativo
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.verifyPassword(senha);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Atualizar último login
    const updateLoginQuery = `
      UPDATE public.usuario 
      SET updated_at = NOW() 
      WHERE id = $1
    `;
    await query(updateLoginQuery, [user.id]);

    // Gerar token
    const token = user.generateToken();

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/auth/change-password - Alterar senha
router.post('/change-password', authenticateToken, validateChangePassword, async (req, res, next) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    const userId = req.user.id;

    // Buscar usuário atual
    const { query: userQuery, values: userValues } = await User.findById(userId);
    const result = await query(userQuery, userValues);

    if (result.rows.length === 0) {
      throw createError.notFound('Usuário não encontrado');
    }

    const user = new User(result.rows[0]);

    // Verificar senha atual
    const isCurrentPasswordValid = await user.verifyPassword(senha_atual);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    const newUser = new User({ senha: nova_senha });
    await newUser.hashPassword();

    const updateQuery = `
      UPDATE public.usuario 
      SET senha = $1, updated_at = NOW() 
      WHERE id = $2
    `;
    await query(updateQuery, [newUser.senha, userId]);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Obter dados do usuário logado
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { query: userQuery, values: userValues } = await User.findById(userId);
    const result = await query(userQuery, userValues);

    if (result.rows.length === 0) {
      throw createError.notFound('Usuário não encontrado');
    }

    const user = new User(result.rows[0]);

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout - Logout (opcional - principalmente para invalidar token no frontend)
router.post('/logout', authenticateToken, (req, res) => {
  // Em uma implementação mais robusta, você poderia manter uma blacklist de tokens
  // Por enquanto, apenas retornamos sucesso
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// POST /api/auth/refresh - Renovar token (opcional)
router.post('/refresh', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Verificar se usuário ainda existe e está ativo
    const { query: userQuery, values: userValues } = await User.findById(userId);
    const result = await query(userQuery, userValues);

    if (result.rows.length === 0) {
      throw createError.notFound('Usuário não encontrado');
    }

    const user = new User(result.rows[0]);

    if (!user.active) {
      throw createError.unauthorized('Usuário inativo');
    }

    // Gerar novo token
    const newToken = user.generateToken();

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token: newToken
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
