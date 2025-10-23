const Joi = require('joi');

// Schemas de validação para usuários
const userSchemas = {
  // Schema para criação de usuário
  create: Joi.object({
    nome: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    pronome: Joi.string().max(50).optional().allow('').messages({
      'string.max': 'Pronome deve ter no máximo 50 caracteres'
    }),
    senha: Joi.string().min(6).max(255).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'string.max': 'Senha deve ter no máximo 255 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
    email: Joi.string().email().max(255).required().messages({
      'string.email': 'Email deve ter um formato válido',
      'string.max': 'Email deve ter no máximo 255 caracteres',
      'any.required': 'Email é obrigatório'
    }),
    tel: Joi.string().max(20).optional().allow('').messages({
      'string.max': 'Telefone deve ter no máximo 20 caracteres'
    }),
    data_nascimento: Joi.date().max('now').optional().messages({
      'date.max': 'Data de nascimento não pode ser no futuro'
    }),
    cpf: Joi.string().length(11).pattern(/^\d{11}$/).optional().messages({
      'string.length': 'CPF deve ter exatamente 11 dígitos',
      'string.pattern.base': 'CPF deve conter apenas números'
    })
  }),

  // Schema para atualização de usuário
  update: Joi.object({
    nome: Joi.string().min(2).max(255).optional().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres'
    }),
    pronome: Joi.string().max(50).optional().allow('').messages({
      'string.max': 'Pronome deve ter no máximo 50 caracteres'
    }),
    email: Joi.string().email().max(255).optional().messages({
      'string.email': 'Email deve ter um formato válido',
      'string.max': 'Email deve ter no máximo 255 caracteres'
    }),
    tel: Joi.string().max(20).optional().allow('').messages({
      'string.max': 'Telefone deve ter no máximo 20 caracteres'
    }),
    data_nascimento: Joi.date().max('now').optional().messages({
      'date.max': 'Data de nascimento não pode ser no futuro'
    }),
    cpf: Joi.string().length(11).pattern(/^\d{11}$/).optional().messages({
      'string.length': 'CPF deve ter exatamente 11 dígitos',
      'string.pattern.base': 'CPF deve conter apenas números'
    }),
    active: Joi.boolean().optional()
  }),

  // Schema para login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
    senha: Joi.string().required().messages({
      'any.required': 'Senha é obrigatória'
    })
  }),

  // Schema para mudança de senha
  changePassword: Joi.object({
    senha_atual: Joi.string().required().messages({
      'any.required': 'Senha atual é obrigatória'
    }),
    nova_senha: Joi.string().min(6).max(255).required().messages({
      'string.min': 'Nova senha deve ter pelo menos 6 caracteres',
      'string.max': 'Nova senha deve ter no máximo 255 caracteres',
      'any.required': 'Nova senha é obrigatória'
    })
  }),

  // Schema para parâmetros de query
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255).optional().allow(''),
    active: Joi.boolean().optional()
  })
};

// Middleware de validação genérico
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors
      });
    }

    // Substituir os dados validados
    req[property] = value;
    next();
  };
};

// Middlewares específicos para cada operação
const validateUserCreate = validate(userSchemas.create);
const validateUserUpdate = validate(userSchemas.update);
const validateLogin = validate(userSchemas.login);
const validateChangePassword = validate(userSchemas.changePassword);
const validateQuery = validate(userSchemas.query, 'query');

module.exports = {
  userSchemas,
  validate,
  validateUserCreate,
  validateUserUpdate,
  validateLogin,
  validateChangePassword,
  validateQuery
};
