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
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-6 bg-[var(--card)] rounded animate-pulse"></div>
              <div className="w-48 h-8 bg-[var(--card)] rounded animate-pulse"></div>
            </div>
            <div className="w-32 h-10 bg-[var(--card)] rounded animate-pulse"></div>
          </div>
          
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[var(--card)] rounded-2xl h-64 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin" 
              className="flex items-center text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-[var(--primary)] to-[var(--accent)] rounded-full"></div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                Gerenciar Notícias
              </h1>
              <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-sm font-medium">
                {pagination.total || 0}
              </span>
            </div>
          </div>
          
          <Link
            href="/admin/news/new"
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-lg text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nova Notícia</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              >
                <option value="all">Todos os status</option>
                <option value="published">Publicados</option>
                <option value="draft">Rascunhos</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-[var(--background)] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-[var(--primary)] text-white shadow-sm' 
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'table' 
                    ? 'bg-[var(--primary)] text-white shadow-sm' 
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📰</div>
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
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Criar Primeira Notícia</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <GridView news={filteredNews} onDelete={deleteNews} />
        ) : (
          <TableView news={filteredNews} onDelete={deleteNews} />
        )}
      </div>
    </div>
  )
}

function GridView({ news, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item) => (
        <div
          key={item.id}
          className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-lg transition-all duration-300 group"
        >
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10">
            {item.featuredImage ? (
              <Image
                src={item.featuredImage}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                item.published 
                  ? 'bg-emerald-500/90 text-white' 
                  : 'bg-amber-500/90 text-white'
              }`}>
                {item.published ? 'Publicado' : 'Rascunho'}
              </span>
            </div>

            {/* Category */}
            <div className="absolute top-3 right-3">
              <span className="bg-[var(--primary)]/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                {item.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
              {item.title}
            </h3>
            <p className="text-[var(--muted)] text-sm mb-4 line-clamp-3">
              {item.summary}
            </p>
            
            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-4">
              <span>{item.author?.name || item.author?.email}</span>
              <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Link
                href={`/admin/news/${item.id}`}
                className="flex-1 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors text-center"
              >
                Editar
              </Link>
              <Link
                href={`/noticias/${item.slug}`}
                target="_blank"
                className="px-4 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--section-alt-bg)] transition-colors"
              >
                Ver
              </Link>
              <button
                onClick={() => onDelete(item.id, item.title)}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
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
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--section-alt-bg)]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Notícia
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-[var(--section-alt-bg)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 rounded-lg overflow-hidden">
                      {item.featuredImage ? (
                        <Image
                          src={item.featuredImage}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[var(--muted)] line-clamp-2">
                        {item.summary}
                      </p>
                      <span className="inline-block mt-2 bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    item.published 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {item.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                  {item.author?.name || item.author?.email}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--muted)]">
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/news/${item.id}`}
                      className="text-[var(--primary)] hover:text-[var(--primary)]/80 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/noticias/${item.slug}`}
                      target="_blank"
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => onDelete(item.id, item.title)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
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
    </div>
  )
}