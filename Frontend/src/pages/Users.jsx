import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  MoreVertical,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, filterActive]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        active: filterActive !== '' ? filterActive : undefined
      };

      const data = await userService.getUsers(params);
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterActive(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário ${userName}?`)) {
      try {
        await userService.deleteUser(userId);
        toast.success('Usuário deletado com sucesso');
        loadUsers();
      } catch (error) {
        toast.error('Erro ao deletar usuário');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      if (currentStatus) {
        await userService.deactivateUser(userId);
        toast.success('Usuário desativado com sucesso');
      } else {
        await userService.activateUser(userId);
        toast.success('Usuário ativado com sucesso');
      }
      loadUsers();
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone) => {
    if (!phone) return 'Não informado';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gerenciar Usuários</h1>
          <p>Visualize e gerencie todos os usuários do sistema</p>
        </div>
        <button className="add-user-btn">
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={20} />
          <select
            value={filterActive}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Todos os usuários</option>
            <option value="true">Apenas ativos</option>
            <option value="false">Apenas inativos</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando usuários...</p>
          </div>
        ) : (
          <>
            <div className="table-header">
              <div className="table-info">
                <span>
                  {totalItems} usuário{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="users-table">
              <div className="table-header-row">
                <div className="col-name">Nome</div>
                <div className="col-email">Email</div>
                <div className="col-phone">Telefone</div>
                <div className="col-cpf">CPF</div>
                <div className="col-status">Status</div>
                <div className="col-date">Cadastrado em</div>
                <div className="col-actions">Ações</div>
              </div>

              {users.length === 0 ? (
              <div className="empty-state">
                <UsersIcon size={48} />
                <h3>Nenhum usuário encontrado</h3>
                <p>Tente ajustar os filtros de busca</p>
              </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="table-row">
                    <div className="col-name">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{user.nome}</span>
                          {user.pronome && (
                            <span className="user-pronoun">{user.pronome}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-email">{user.email}</div>
                    <div className="col-phone">{formatPhone(user.tel)}</div>
                    <div className="col-cpf">{formatCPF(user.cpf)}</div>
                    <div className="col-status">
                      <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="col-date">{formatDate(user.created_at)}</div>
                    <div className="col-actions">
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() => {/* Implementar edição */}}
                          title="Editar usuário"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className={`action-btn ${user.active ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleStatus(user.id, user.active)}
                          title={user.active ? 'Desativar usuário' : 'Ativar usuário'}
                        >
                          {user.active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(user.id, user.nome)}
                          title="Deletar usuário"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                
                <div className="pagination-info">
                  Página {currentPage} de {totalPages}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
