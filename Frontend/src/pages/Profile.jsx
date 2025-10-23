import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  Save,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user: currentUser, changePassword } = useAuth();
  const [user, setUser] = useState(currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm();

  const newPassword = watch('nova_senha');

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      resetProfile(currentUser);
    }
  }, [currentUser, resetProfile]);

  const onProfileSubmit = async (data) => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateUser(user.id, data);
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsLoading(true);
    try {
      await changePassword(data.senha_atual, data.nova_senha);
      setIsChangingPassword(false);
      resetPassword();
      toast.success('Senha alterada com sucesso!');
    } catch (error) {
      toast.error('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    resetProfile(user);
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    resetPassword();
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.nome?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user?.nome}</h1>
          <p>{user?.email}</p>
          <span className={`status ${user?.active ? 'active' : 'inactive'}`}>
            {user?.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>Informações Pessoais</h2>
            {!isEditing && (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo *</label>
                  <div className="input-group">
                    <User size={20} className="input-icon" />
                    <input
                      id="nome"
                      type="text"
                      className={`form-input ${profileErrors.nome ? 'error' : ''}`}
                      {...registerProfile('nome', {
                        required: 'Nome é obrigatório',
                        minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                      })}
                    />
                  </div>
                  {profileErrors.nome && (
                    <span className="error-message">{profileErrors.nome.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="pronome">Pronome</label>
                  <input
                    id="pronome"
                    type="text"
                    className={`form-input ${profileErrors.pronome ? 'error' : ''}`}
                    placeholder="Ex: ele/dele, ela/dela"
                    {...registerProfile('pronome')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <div className="input-group">
                  <Mail size={20} className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    className={`form-input ${profileErrors.email ? 'error' : ''}`}
                    {...registerProfile('email', {
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Email inválido'
                      }
                    })}
                  />
                </div>
                {profileErrors.email && (
                  <span className="error-message">{profileErrors.email.message}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tel">Telefone</label>
                  <div className="input-group">
                    <Phone size={20} className="input-icon" />
                    <input
                      id="tel"
                      type="tel"
                      className={`form-input ${profileErrors.tel ? 'error' : ''}`}
                      {...registerProfile('tel')}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="data_nascimento">Data de Nascimento</label>
                  <div className="input-group">
                    <Calendar size={20} className="input-icon" />
                    <input
                      id="data_nascimento"
                      type="date"
                      className={`form-input ${profileErrors.data_nascimento ? 'error' : ''}`}
                      {...registerProfile('data_nascimento')}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cpf">CPF</label>
                <div className="input-group">
                  <CreditCard size={20} className="input-icon" />
                  <input
                    id="cpf"
                    type="text"
                    className={`form-input ${profileErrors.cpf ? 'error' : ''}`}
                    {...registerProfile('cpf')}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={cancelEdit}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-item">
                <label>Nome:</label>
                <span>{user?.nome}</span>
              </div>
              <div className="detail-item">
                <label>Pronome:</label>
                <span>{user?.pronome || 'Não informado'}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="detail-item">
                <label>Telefone:</label>
                <span>{user?.tel || 'Não informado'}</span>
              </div>
              <div className="detail-item">
                <label>Data de Nascimento:</label>
                <span>{user?.data_nascimento ? new Date(user.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}</span>
              </div>
              <div className="detail-item">
                <label>CPF:</label>
                <span>{user?.cpf || 'Não informado'}</span>
              </div>
              <div className="detail-item">
                <label>Membro desde:</label>
                <span>{new Date(user?.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>Segurança</h2>
            {!isChangingPassword && (
              <button 
                className="edit-btn"
                onClick={() => setIsChangingPassword(true)}
              >
                Alterar Senha
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="password-form">
              <div className="form-group">
                <label htmlFor="senha_atual">Senha Atual *</label>
                <div className="input-group">
                  <Lock size={20} className="input-icon" />
                  <input
                    id="senha_atual"
                    type={showCurrentPassword ? 'text' : 'password'}
                    className={`form-input ${passwordErrors.senha_atual ? 'error' : ''}`}
                    {...registerPassword('senha_atual', {
                      required: 'Senha atual é obrigatória'
                    })}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordErrors.senha_atual && (
                  <span className="error-message">{passwordErrors.senha_atual.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nova_senha">Nova Senha *</label>
                <div className="input-group">
                  <Lock size={20} className="input-icon" />
                  <input
                    id="nova_senha"
                    type={showNewPassword ? 'text' : 'password'}
                    className={`form-input ${passwordErrors.nova_senha ? 'error' : ''}`}
                    {...registerPassword('nova_senha', {
                      required: 'Nova senha é obrigatória',
                      minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
                    })}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordErrors.nova_senha && (
                  <span className="error-message">{passwordErrors.nova_senha.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmar_senha">Confirmar Nova Senha *</label>
                <div className="input-group">
                  <Lock size={20} className="input-icon" />
                  <input
                    id="confirmar_senha"
                    type="password"
                    className={`form-input ${passwordErrors.confirmar_senha ? 'error' : ''}`}
                    {...registerPassword('confirmar_senha', {
                      required: 'Confirmação de senha é obrigatória',
                      validate: value => value === newPassword || 'Senhas não coincidem'
                    })}
                  />
                </div>
                {passwordErrors.confirmar_senha && (
                  <span className="error-message">{passwordErrors.confirmar_senha.message}</span>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={cancelPasswordChange}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          ) : (
            <div className="security-info">
              <p>Para sua segurança, recomendamos:</p>
              <ul>
                <li>Usar uma senha forte com pelo menos 8 caracteres</li>
                <li>Incluir letras maiúsculas, minúsculas, números e símbolos</li>
                <li>Não reutilizar senhas de outras contas</li>
                <li>Alterar sua senha regularmente</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
