'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminServices() {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})

  const fetchServices = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/admin/services?page=${page}&limit=10`, {
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
        setServices(data.services)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchServices()
  }, [fetchServices, router])

  const deleteService = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
    }
  }

  const toggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...services.find(s => s.id === id),
          active: !currentStatus 
        })
      })
      if (response.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Carregando serviços...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => router.push('/admin')}
            >
              ← Voltar ao painel
            </button>
            <h1 className="admin-page-title" style={{ fontSize: '1.75rem' }}>Serviços</h1>
          </div>
          <span className="admin-subtitle">Gestão de serviços publicados no site</span>
        </div>
        <Link href="/admin/services/new" className="admin-btn-primary">
          Novo serviço
        </Link>
      </header>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            Todos os serviços ({pagination.total || 0})
          </h2>
        </div>

        {services.length === 0 ? (
          <div className="admin-loading" style={{ padding: '2rem 1rem' }}>
            <p style={{ margin: 0, marginBottom: '0.75rem' }}>Nenhum serviço encontrado.</p>
            <Link href="/admin/services/new" className="admin-btn-primary">
              Criar serviço
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th>Autor</th>
                  <th>Data</th>
                  <th className="admin-table-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{service.title}</div>
                      <div style={{ color: 'var(--muted-text)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {(service.summary || '').substring(0, 100)}{(service.summary || '').length > 100 ? '...' : ''}
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-info">{service.category}</span>
                    </td>
                    <td>
                      <div>{service.price ? `R$ ${service.price}` : 'Sob consulta'}</div>
                      <div style={{ color: 'var(--muted-text)', fontSize: '0.875rem' }}>{service.priceType}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={service.active ? 'admin-badge admin-badge-published' : 'admin-badge admin-badge-archived'}
                        onClick={() => toggleActive(service.id, service.active)}
                        title="Alterar status"
                      >
                        {service.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td>{service.author?.name || service.author?.email}</td>
                    <td>{new Date(service.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="admin-table-actions">
                      <Link
                        href={`/admin/services/${service.id}`}
                        className="admin-btn-icon"
                        title="Editar"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/servicos/${service.slug}`}
                        target="_blank"
                        className="admin-btn-icon"
                        title="Abrir no site"
                      >
                        Ver
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteService(service.id)}
                        className="admin-btn-icon admin-btn-danger"
                        title="Excluir"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="admin-pagination">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => fetchServices(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              ← Anterior
            </button>
            <div className="admin-pagination-info">
              Página <strong>{pagination.page}</strong> de <strong>{pagination.pages}</strong>
            </div>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => fetchServices(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}