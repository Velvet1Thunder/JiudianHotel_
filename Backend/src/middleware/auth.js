const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware de autenticação JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco para verificar se ainda existe e está ativo
    const { query: userQuery, values } = await require('../models/User').findById(decoded.id);
    const result = await query(userQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    const user = result.rows[0];
    
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
    }

    // Adicionar dados do usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      active: user.active
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se o usuário é admin (opcional)
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Privilégios de administrador necessários.'
    });
  }
  next();
};

// Middleware para verificar se o usuário pode acessar o recurso
const requireOwnershipOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.userId || req.params.id;
  
  if (req.user.isAdmin || req.user.id === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Acesso negado. Você só pode acessar seus próprios dados.'
  });
};

// Middleware opcional para autenticação (não bloqueia se não tiver token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { query: userQuery, values } = await require('../models/User').findById(decoded.id);
      const result = await query(userQuery, values);
      
      if (result.rows.length > 0 && result.rows[0].active) {
        req.user = {
          id: result.rows[0].id,
          email: result.rows[0].email,
          nome: result.rows[0].nome,
          active: result.rows[0].active
        };
      }
    }
    
    next();
  } catch (error) {
    // Se houver erro no token, continua sem autenticação
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  optionalAuth
};
