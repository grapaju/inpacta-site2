'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminProjectsPage() {
  const router = useRouter()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [filterPublished, setFilterPublished] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchProjects = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: '12'
      })
      if (search) params.set('search', search)
      if (filterPublished) params.set('published', filterPublished)
      if (filterStatus) params.set('status', filterStatus)

      const resp = await fetch(`/api/admin/projects?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (resp.status === 401) {
        router.push('/admin/login')
        return
      }

      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Erro ao carregar projetos')

      setProjects(data.projects || [])
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
    } catch (e) {
      console.error(e)
      alert(e.message || 'Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }, [router, search, filterPublished, filterStatus])

  useEffect(() => {
    fetchProjects(1)
  }, [fetchProjects])

  const handleDelete = async (id, title) => {
    if (!confirm(`Deseja excluir o projeto "${title}"?`)) return

    try {
      const token = localStorage.getItem('adminToken')
      const resp = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Erro ao excluir projeto')

      fetchProjects(pagination.page)
    } catch (e) {
      console.error(e)
      alert(e.message || 'Erro ao excluir projeto')
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Projetos</h1>
          <span className="admin-subtitle">Gestão de projetos do portal</span>
        </div>
        <Link href="/admin/projects/new" className="admin-btn-primary">
          Novo projeto
        </Link>
      </header>

      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <div className="admin-form-row admin-form-row-end">
          <div className="admin-form-group admin-form-group-compact admin-form-group-grow">
            <label className="admin-form-label">Buscar</label>
            <input
              className="admin-form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Título, descrição ou slug..."
            />
          </div>

          <div className="admin-form-group admin-form-group-compact admin-form-minw-220">
            <label className="admin-form-label">Publicado</label>
            <select
              className="admin-form-input"
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Publicado</option>
              <option value="false">Rascunho</option>
            </select>
          </div>

          <div className="admin-form-group admin-form-group-compact admin-form-minw-240">
            <label className="admin-form-label">Status</label>
            <select
              className="admin-form-input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="em-andamento">Em andamento</option>
              <option value="concluido">Concluído</option>
              <option value="pausado">Pausado</option>
            </select>
          </div>

          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => fetchProjects(1)}
            disabled={loading}
          >
            Aplicar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Carregando projetos...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="admin-empty-state">
          <p>Nenhum projeto encontrado.</p>
          <Link href="/admin/projects/new" className="admin-btn-primary">
            Criar primeiro projeto
          </Link>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Status</th>
                <th>Publicado</th>
                <th>Atualizado</th>
                <th className="admin-table-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div className="admin-table-muted">{p.slug}</div>
                  </td>
                  <td>{p.status || '-'}</td>
                  <td>{p.published ? 'Sim' : 'Não'}</td>
                  <td>{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="admin-table-actions">
                    <div className="admin-table-actions-inner">
                      <Link href={`/admin/projects/${p.id}`} className="admin-btn-sm admin-btn-secondary">
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="admin-btn-sm admin-btn-danger"
                        onClick={() => handleDelete(p.id, p.title)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && pagination?.pages > 1 ? (
        <div className="admin-pagination" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => fetchProjects(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
          >
            ← Anterior
          </button>
          <span className="admin-form-hint" style={{ padding: '0 0.75rem' }}>
            Página {pagination.page} de {pagination.pages}
          </span>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => fetchProjects(Math.min(pagination.pages, pagination.page + 1))}
            disabled={pagination.page >= pagination.pages}
          >
            Próxima →
          </button>
        </div>
      ) : null}
    </div>
  )
}
