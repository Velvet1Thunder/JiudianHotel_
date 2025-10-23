const express = require('express');
const User = require('../models/User');
const { query } = require('../config/database');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');
const { validateUserUpdate, validateQuery } = require('../middleware/validation');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/users - Listar usuários (com paginação e filtros)
router.get('/', authenticateToken, validateQuery, async (req, res, next) => {
  try {
    const { page, limit, search, active } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE deleted_at IS NULL';
    const queryParams = [];
    let paramCount = 1;

    // Filtro por status ativo
    if (active !== undefined) {
      whereClause += ` AND active = $${paramCount}`;
      queryParams.push(active);
      paramCount++;
    }

    // Filtro por busca (nome ou email)
    if (search) {
      whereClause += ` AND (nome ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    // Query principal
    const mainQuery = `
      SELECT * FROM public.usuario 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    queryParams.push(limit, offset);

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) FROM public.usuario 
      ${whereClause}
    `;

    const [usersResult, countResult] = await Promise.all([
      query(mainQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2)) // Remove limit e offset do count
    ]);

    const users = usersResult.rows.map(userData => {
      const user = new User(userData);
      return user.toJSON();
    });

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Obter usuário específico
router.get('/:id', authenticateToken, requireOwnershipOrAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { query: userQuery, values: userValues } = await User.findById(id);
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

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', authenticateToken, requireOwnershipOrAdmin, validateUserUpdate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se usuário existe
    const { query: checkQuery, values: checkValues } = await User.findById(id);
    const checkResult = await query(checkQuery, checkValues);

    if (checkResult.rows.length === 0) {
      throw createError.notFound('Usuário não encontrado');
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (updateData.email) {
      const emailQuery = 'SELECT id FROM public.usuario WHERE email = $1 AND id != $2 AND deleted_at IS NULL';
      const emailResult = await query(emailQuery, [updateData.email, id]);
      
      if (emailResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // Verificar se CPF já existe (se estiver sendo alterado)
    if (updateData.cpf) {
      const cpfQuery = 'SELECT id FROM public.usuario WHERE cpf = $1 AND id != $2 AND deleted_at IS NULL';
      const cpfResult = await query(cpfQuery, [updateData.cpf, id]);
      
      if (cpfResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'CPF já está em uso'
        });
      }
    }

    // Atualizar usuário
    const { query: updateQuery, values: updateValues } = await User.update(id, updateData);
    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      throw createError.internal('Erro ao atualizar usuário');
    }

    const updatedUser = new User(result.rows[0]);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: {
        user: updatedUser.toJSON()
      }
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Deletar usuário (soft delete)
router.delete('/:id', authenticateToken, requireOwnershipOrAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user.id;

    // Verificar se usuário existe
    const { query: checkQuery, values: checkValues } = await User.findById(id);
    const checkResult = await query(checkQuery, checkValues);

    if (checkResult.rows.length === 0) {
      throw createError.notFound('Usuário não encontrado');
    }

    // Verificar se usuário não está tentando deletar a si mesmo
    if (id === deletedBy) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar sua própria conta'
      });
    }

    // Soft delete
    const { query: deleteQuery, values: deleteValues } = await User.softDelete(id, deletedBy);
    const result = await query(deleteQuery, deleteValues);

    if (result.rows.length === 0) {
      throw createError.internal('Erro ao deletar usuário');
    }

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/activate - Ativar usuário
router.put('/:id/activate', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { query: updateQuery, values: updateValues } = await User.update(id, { active: true });
    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      throw createError.notFound('Usuário não encontrado');
    }

    res.json({
      success: true,
      message: 'Usuário ativado com sucesso'
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/deactivate - Desativar usuário
router.put('/:id/deactivate', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar se usuário não está tentando desativar a si mesmo
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode desativar sua própria conta'
      });
    }

    const { query: updateQuery, values: updateValues } = await User.update(id, { active: false });
    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      throw createError.notFound('Usuário não encontrado');
    }

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/users/stats - Estatísticas dos usuários (opcional)
router.get('/stats/overview', authenticateToken, async (req, res, next) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE active = true) as active_users,
        COUNT(*) FILTER (WHERE active = false) as inactive_users,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_last_30_days,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_last_7_days
      FROM public.usuario 
      WHERE deleted_at IS NULL
    `;

    const result = await query(statsQuery);

    res.json({
      success: true,
      data: {
        stats: result.rows[0]
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
