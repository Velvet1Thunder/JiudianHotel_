import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserCheck, UserX, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Usuários Ativos',
      value: '1,234',
      icon: UserCheck,
      color: 'green',
      change: '+12%'
    },
    {
      title: 'Novos Usuários',
      value: '89',
      icon: Users,
      color: 'blue',
      change: '+5%'
    },
    {
      title: 'Usuários Inativos',
      value: '45',
      icon: UserX,
      color: 'red',
      change: '-2%'
    },
    {
      title: 'Total de Usuários',
      value: '1,368',
      icon: Calendar,
      color: 'purple',
      change: '+8%'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bem-vindo, {user?.nome}!</h1>
        <p>Aqui está um resumo do seu sistema</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-change">{stat.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-content">
        <div className="content-card">
          <h2>Atividade Recente</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <Users size={16} />
              </div>
              <div className="activity-content">
                <p>Novo usuário cadastrado</p>
                <span className="activity-time">Há 2 horas</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <UserCheck size={16} />
              </div>
              <div className="activity-content">
                <p>Usuário ativado</p>
                <span className="activity-time">Há 4 horas</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <UserX size={16} />
              </div>
              <div className="activity-content">
                <p>Usuário desativado</p>
                <span className="activity-time">Há 6 horas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>Informações da Conta</h2>
          <div className="account-info">
            <div className="info-item">
              <label>Nome:</label>
              <span>{user?.nome}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status ${user?.active ? 'active' : 'inactive'}`}>
                {user?.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="info-item">
              <label>Membro desde:</label>
              <span>{new Date(user?.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
