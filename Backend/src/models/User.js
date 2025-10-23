const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.nome = data.nome;
    this.pronome = data.pronome;
    this.senha = data.senha;
    this.email = data.email;
    this.tel = data.tel;
    this.data_nascimento = data.data_nascimento;
    this.cpf = data.cpf;
    this.active = data.active !== undefined ? data.active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.deleted_at = data.deleted_at;
    this.deleted_by = data.deleted_by;
  }

  // Hash da senha
  async hashPassword() {
    if (this.senha) {
      this.senha = await bcrypt.hash(this.senha, 12);
    }
  }

  // Verificar senha
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.senha);
  }

  // Gerar JWT token
  generateToken() {
    return jwt.sign(
      { 
        id: this.id, 
        email: this.email,
        nome: this.nome 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Remover dados sensíveis antes de retornar
  toJSON() {
    const { senha, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Validar dados obrigatórios
  validate() {
    const errors = [];
    
    if (!this.nome || this.nome.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Email inválido');
    }
    
    if (!this.senha || this.senha.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (this.cpf && !this.isValidCPF(this.cpf)) {
      errors.push('CPF inválido');
    }
    
    return errors;
  }

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar CPF
  isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  // Métodos estáticos para operações no banco
  static async create(userData) {
    const user = new User(userData);
    const errors = user.validate();
    
    if (errors.length > 0) {
      throw new Error(`Dados inválidos: ${errors.join(', ')}`);
    }
    
    await user.hashPassword();
    
    const query = `
      INSERT INTO public.usuario (
        id, nome, pronome, senha, email, tel, data_nascimento, cpf, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      user.id, user.nome, user.pronome, user.senha, user.email,
      user.tel, user.data_nascimento, user.cpf, user.active
    ];
    
    return { query, values };
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM public.usuario WHERE email = $1 AND deleted_at IS NULL';
    return { query, values: [email] };
  }

  static async findById(id) {
    const query = 'SELECT * FROM public.usuario WHERE id = $1 AND deleted_at IS NULL';
    return { query, values: [id] };
  }

  static async findAll(limit = 10, offset = 0) {
    const query = `
      SELECT * FROM public.usuario 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    return { query, values: [limit, offset] };
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });
    
    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE public.usuario 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING *
    `;
    
    return { query, values };
  }

  static async softDelete(id, deletedBy) {
    const query = `
      UPDATE public.usuario 
      SET deleted_at = NOW(), deleted_by = $2 
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    return { query, values: [id, deletedBy] };
  }

  static async count() {
    const query = 'SELECT COUNT(*) FROM public.usuario WHERE deleted_at IS NULL';
    return { query, values: [] };
  }
}

module.exports = User;
