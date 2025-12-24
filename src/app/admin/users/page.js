'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1,
    limit: 10
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' ou 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'AUTHOR'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role })
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setMessage('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [filters.limit, filters.page, filters.role, filters.search]);

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        router.push('/admin');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetchUsers();
  }, [user, fetchUsers]);

  const openModal = (type, userData = null) => {
    setModalType(type);
    setSelectedUser(userData);
    
    if (type === 'edit' && userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        password: '',
        role: userData.role || 'AUTHOR'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'AUTHOR'
      });
    }
    
    setShowModal(true);
    setMessage('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'AUTHOR'
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = modalType === 'create' 
        ? '/api/admin/users'
        : `/api/admin/users/${selectedUser.id}`;
      
      const method = modalType === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar usuário');
      }

      setMessage(`Usuário ${modalType === 'create' ? 'criado' : 'atualizado'} com sucesso!`);
      fetchUsers();
      
      setTimeout(() => {
        closeModal();
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setMessage(error.message || 'Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir usuário');
      }

      setMessage('Usuário excluído com sucesso!');
      fetchUsers();
      
      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setMessage(error.message || 'Erro ao excluir usuário');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'EDITOR': return 'Editor';
      case 'AUTHOR': return 'Autor';
      default: return role;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Usuários</h1>
          <span className="admin-subtitle">Gestão de administradores, editores e autores</span>
        </div>
        <button type="button" className="admin-btn-primary" onClick={() => openModal('create')}>
          Novo usuário
        </button>
      </header>

      {message && (
        <div className={`admin-notice ${message.toLowerCase().includes('sucesso') ? 'admin-notice-success' : 'admin-notice-error'}`}>
          {message}
        </div>
      )}

      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <div className="admin-form-row">
          <div className="admin-form-group admin-form-group-compact">
            <label className="admin-form-label">Buscar</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="admin-form-input"
              placeholder="Nome ou email..."
            />
          </div>

          <div className="admin-form-group admin-form-group-compact">
            <label className="admin-form-label">Função</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              className="admin-form-input"
            >
              <option value="">Todas</option>
              <option value="ADMIN">Administrador</option>
              <option value="EDITOR">Editor</option>
              <option value="AUTHOR">Autor</option>
            </select>
          </div>

          <div className="admin-form-group admin-form-group-compact">
            <label className="admin-form-label">Itens por página</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              className="admin-form-input"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Função</th>
                <th>Conteúdo</th>
                <th>Criado em</th>
                <th className="admin-table-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={5} style={{ color: 'var(--muted-text)' }}>Carregando...</td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ color: 'var(--muted-text)' }}>Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                users.map((userData) => (
                  <tr key={userData.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{userData.name || 'Sem nome'}</div>
                      <div className="admin-table-muted">{userData.email}</div>
                    </td>
                    <td>{getRoleLabel(userData.role)}</td>
                    <td>{userData._count?.news || 0} notícias</td>
                    <td>{new Date(userData.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="admin-table-actions">
                      <button type="button" className="admin-btn-icon" onClick={() => openModal('edit', userData)}>
                        Editar
                      </button>
                      {userData.id !== user?.id && (
                        <button type="button" className="admin-btn-icon admin-btn-danger" onClick={() => handleDelete(userData.id)}>
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="admin-pagination" style={{ padding: '1rem' }}>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page <= 1}
            >
              ← Anterior
            </button>
            <div className="admin-pagination-info">
              Página <strong>{pagination.page}</strong> de <strong>{pagination.totalPages}</strong>
            </div>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{modalType === 'create' ? 'Novo usuário' : 'Editar usuário'}</h2>
              <button type="button" className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="admin-modal-body">
              {message && (
                <div className={`admin-notice ${message.toLowerCase().includes('sucesso') ? 'admin-notice-success' : 'admin-notice-error'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="admin-form-input"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="admin-form-input"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    {modalType === 'create' ? 'Senha' : 'Nova senha (deixe vazio para manter a atual)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="admin-form-input"
                    required={modalType === 'create'}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Função</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="admin-form-input"
                    required
                  >
                    <option value="AUTHOR">Autor</option>
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="admin-btn-primary" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}