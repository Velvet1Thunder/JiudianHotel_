import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  Calendar, 
  CreditCard,
  UserPlus 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch
  } = useForm();

  const senha = watch('senha');

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    clearErrors();

    try {
      await registerUser(data);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar usuário';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validação de CPF
  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return 'CPF deve ter 11 dígitos';
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return 'CPF inválido';
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return 'CPF inválido';
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return 'CPF inválido';
    
    return true;
  };

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-icon">
            <UserPlus size={32} />
          </div>
          <h1>Criar Conta</h1>
          <p>Preencha os dados para criar sua conta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome" className="form-label">
                Nome Completo *
              </label>
              <div className="input-group">
                <User size={20} className="input-icon" />
                <input
                  id="nome"
                  type="text"
                  className={`form-input ${errors.nome ? 'error' : ''}`}
                  placeholder="Digite seu nome completo"
                  {...register('nome', {
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Nome deve ter pelo menos 2 caracteres'
                    },
                    maxLength: {
                      value: 255,
                      message: 'Nome deve ter no máximo 255 caracteres'
                    }
                  })}
                />
              </div>
              {errors.nome && (
                <span className="error-message">{errors.nome.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="pronome" className="form-label">
                Pronome
              </label>
              <input
                id="pronome"
                type="text"
                className={`form-input ${errors.pronome ? 'error' : ''}`}
                placeholder="Ex: ele/dele, ela/dela"
                {...register('pronome', {
                  maxLength: {
                    value: 50,
                    message: 'Pronome deve ter no máximo 50 caracteres'
                  }
                })}
              />
              {errors.pronome && (
                <span className="error-message">{errors.pronome.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <div className="input-group">
              <Mail size={20} className="input-icon" />
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Digite seu email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido'
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tel" className="form-label">
                Telefone
              </label>
              <div className="input-group">
                <Phone size={20} className="input-icon" />
                <input
                  id="tel"
                  type="tel"
                  className={`form-input ${errors.tel ? 'error' : ''}`}
                  placeholder="(11) 99999-9999"
                  {...register('tel', {
                    maxLength: {
                      value: 20,
                      message: 'Telefone deve ter no máximo 20 caracteres'
                    }
                  })}
                />
              </div>
              {errors.tel && (
                <span className="error-message">{errors.tel.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="data_nascimento" className="form-label">
                Data de Nascimento
              </label>
              <div className="input-group">
                <Calendar size={20} className="input-icon" />
                <input
                  id="data_nascimento"
                  type="date"
                  className={`form-input ${errors.data_nascimento ? 'error' : ''}`}
                  {...register('data_nascimento', {
                    validate: (value) => {
                      if (value && new Date(value) > new Date()) {
                        return 'Data de nascimento não pode ser no futuro';
                      }
                      return true;
                    }
                  })}
                />
              </div>
              {errors.data_nascimento && (
                <span className="error-message">{errors.data_nascimento.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cpf" className="form-label">
              CPF
            </label>
            <div className="input-group">
              <CreditCard size={20} className="input-icon" />
              <input
                id="cpf"
                type="text"
                className={`form-input ${errors.cpf ? 'error' : ''}`}
                placeholder="000.000.000-00"
                maxLength="14"
                {...register('cpf', {
                  validate: validateCPF,
                  setValueAs: (value) => value.replace(/[^\d]/g, '')
                })}
              />
            </div>
            {errors.cpf && (
              <span className="error-message">{errors.cpf.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="senha" className="form-label">
              Senha *
            </label>
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.senha ? 'error' : ''}`}
                placeholder="Digite sua senha"
                {...register('senha', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  }
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.senha && (
              <span className="error-message">{errors.senha.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="button-spinner"></div>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Já tem uma conta?{' '}
            <Link to="/login" className="auth-link">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
