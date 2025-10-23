// Middleware de tratamento de erros centralizado
const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro de validação do banco de dados
  if (err.code === '23505') { // Unique violation
    const field = err.constraint.includes('email') ? 'email' : 
                  err.constraint.includes('cpf') ? 'cpf' : 'campo único';
    
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} já está em uso`,
      field
    });
  }

  // Erro de foreign key constraint
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referência inválida - registro relacionado não existe'
    });
  }

  // Erro de not null constraint
  if (err.code === '23502') {
    return res.status(400).json({
      success: false,
      message: `Campo obrigatório não informado: ${err.column}`
    });
  }

  // Erro de formato de dados
  if (err.code === '22P02') {
    return res.status(400).json({
      success: false,
      message: 'Formato de dados inválido'
    });
  }

  // Erro de conexão com banco
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: 'Serviço temporariamente indisponível'
    });
  }

  // Erro de timeout
  if (err.code === 'ETIMEDOUT') {
    return res.status(504).json({
      success: false,
      message: 'Timeout na operação'
    });
  }

  // Erro de sintaxe SQL
  if (err.code === '42601') {
    console.error('Erro de sintaxe SQL:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }

  // Erro de permissão
  if (err.code === '42501') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado'
    });
  }

  // Erro de limite de conexões
  if (err.code === '53300') {
    return res.status(503).json({
      success: false,
      message: 'Muitas conexões ativas'
    });
  }

  // Erro de validação personalizado
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'Dados inválidos'
    });
  }

  // Erro de autenticação
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Não autorizado'
    });
  }

  // Erro de não encontrado
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      message: err.message || 'Recurso não encontrado'
    });
  }

  // Erro de conflito
  if (err.name === 'ConflictError') {
    return res.status(409).json({
      success: false,
      message: err.message || 'Conflito de dados'
    });
  }

  // Erro de limite excedido
  if (err.name === 'LimitExceededError') {
    return res.status(429).json({
      success: false,
      message: err.message || 'Limite excedido'
    });
  }

  // Erro padrão do servidor
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      details: err 
    })
  });
};

// Middleware para capturar rotas não encontradas
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Classe para erros personalizados
class AppError extends Error {
  constructor(message, statusCode, name = 'AppError') {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Funções para criar erros específicos
const createError = {
  badRequest: (message = 'Requisição inválida') => 
    new AppError(message, 400, 'BadRequestError'),
  
  unauthorized: (message = 'Não autorizado') => 
    new AppError(message, 401, 'UnauthorizedError'),
  
  forbidden: (message = 'Acesso negado') => 
    new AppError(message, 403, 'ForbiddenError'),
  
  notFound: (message = 'Recurso não encontrado') => 
    new AppError(message, 404, 'NotFoundError'),
  
  conflict: (message = 'Conflito de dados') => 
    new AppError(message, 409, 'ConflictError'),
  
  tooManyRequests: (message = 'Muitas requisições') => 
    new AppError(message, 429, 'TooManyRequestsError'),
  
  internal: (message = 'Erro interno do servidor') => 
    new AppError(message, 500, 'InternalServerError'),
  
  serviceUnavailable: (message = 'Serviço indisponível') => 
    new AppError(message, 503, 'ServiceUnavailableError')
};

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
  createError
};
