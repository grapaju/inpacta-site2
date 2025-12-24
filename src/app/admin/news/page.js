'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminNews() {
  const router = useRouter()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'table'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'published', 'draft'

  const fetchNews = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/admin/news?page=${page}&limit=12`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setNews(data.news || [])
        setPagination(data.pagination || {})
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const deleteNews = async (id, title) => {
    if (!confirm(`Tem certeza que deseja excluir a notícia "${title}"?`)) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchNews()
      }
    } catch (error) {
      console.error('Erro ao excluir notícia:', error)
    }
  }

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && item.published) ||
                         (filterStatus === 'draft' && !item.published)
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Carregando notícias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Notícias</h1>
          <span className="admin-subtitle">Gestão de notícias publicadas no portal</span>
        </div>
        <Link href="/admin/news/new" className="admin-btn-primary">
          Nova notícia
        </Link>
      </header>

      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <div className="admin-form-row admin-form-row-end">
          <div className="admin-form-group admin-form-group-compact">
            <label className="admin-form-label">Buscar</label>
            <input
              type="text"
              placeholder="Título ou resumo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group admin-form-group-compact">
            <label className="admin-form-label">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="admin-form-input"
            >
              <option value="all">Todos</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
            </select>
          </div>

          <div className="admin-form-group admin-form-group-compact admin-actions-end">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setViewMode('grid')}
              disabled={viewMode === 'grid'}
            >
              Grade
            </button>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setViewMode('table')}
              disabled={viewMode === 'table'}
            >
              Tabela
            </button>
          </div>
        </div>
      </div>

        {/* Content */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-[var(--foreground)] mb-3">
              {searchTerm || filterStatus !== 'all' ? 'Nenhuma notícia encontrada' : 'Nenhuma notícia criada'}
            </h3>
            <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tente ajustar seus filtros de busca para encontrar o que procura'
                : 'Comece criando sua primeira notícia para o portal'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link
                href="/admin/news/new"
                className="admin-btn-primary"
              >
                Criar primeira notícia
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <GridView news={filteredNews} onDelete={deleteNews} />
        ) : (
          <TableView news={filteredNews} onDelete={deleteNews} />
        )}
    </div>
  )
}

function GridView({ news, onDelete }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
      {news.map((item) => (
        <div
          key={item.id}
          className="admin-card"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          {/* Image */}
          <div className="relative" style={{ height: 192, background: 'var(--section-alt-bg)' }}>
            {item.featuredImage ? (
              <Image
                src={item.featuredImage}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-16 h-16 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                </svg>
              </div>
            )}
            
            {/* Status badge */}
            <div className="absolute top-3 left-3">
              <span className={`admin-badge ${item.published ? 'admin-badge-published' : 'admin-badge-draft'}`}>
                {item.published ? 'Publicado' : 'Rascunho'}
              </span>
            </div>

            {/* Category */}
            <div className="absolute top-3 right-3">
              <span className="admin-badge admin-badge-info">
                {item.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '1rem' }}>
            <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>
              {item.title}
            </h3>
            <p style={{ margin: 0, marginBottom: '0.75rem', color: 'var(--muted-text)', fontSize: '0.875rem' }}>
              {item.summary}
            </p>
            
            {/* Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: 'var(--muted-text)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.author?.name || item.author?.email}</span>
              <span style={{ whiteSpace: 'nowrap' }}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link
                href={`/admin/news/${item.id}`}
                className="admin-btn-secondary"
              >
                Editar
              </Link>
              <Link
                href={`/noticias/${item.slug}`}
                target="_blank"
                className="admin-btn-secondary"
              >
                Ver
              </Link>
              <button
                onClick={() => onDelete(item.id, item.title)}
                className="admin-btn-danger"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TableView({ news, onDelete }) {
  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Notícia</th>
            <th>Status</th>
            <th>Autor</th>
            <th>Data</th>
            <th className="admin-table-actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          {news.map((item) => (
            <tr key={item.id}>
              <td>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</div>
                <div className="admin-table-muted" style={{ marginBottom: '0.5rem' }}>{item.summary}</div>
                <span className="admin-badge admin-badge-info">{item.category}</span>
              </td>
              <td>
                <span className={`admin-badge ${item.published ? 'admin-badge-published' : 'admin-badge-draft'}`}>
                  {item.published ? 'Publicado' : 'Rascunho'}
                </span>
              </td>
              <td>{item.author?.name || item.author?.email}</td>
              <td>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
              <td className="admin-table-actions">
                <div className="admin-table-actions-inner">
                  <Link href={`/admin/news/${item.id}`} className="admin-btn-icon">Editar</Link>
                  <Link href={`/noticias/${item.slug}`} target="_blank" className="admin-btn-icon">Ver</Link>
                  <button type="button" onClick={() => onDelete(item.id, item.title)} className="admin-btn-icon admin-btn-danger">Excluir</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}