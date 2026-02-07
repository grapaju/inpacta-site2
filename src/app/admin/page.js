'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageBreadcrumb from '@/components/admin/tailadmin/PageBreadcrumb'
import ComponentCard from '@/components/admin/tailadmin/ComponentCard'
import PageMeta from '@/components/admin/tailadmin/PageMeta'

function formatTimeAgo(dateLike) {
  const date = dateLike ? new Date(dateLike) : null
  if (!date || Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000))

  if (diffSeconds < 60) return 'agora'
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `há ${diffMinutes} min`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `há ${diffHours} h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `há ${diffDays} d`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `há ${diffMonths} mês${diffMonths > 1 ? 'es' : ''}`
  const diffYears = Math.floor(diffMonths / 12)
  return `há ${diffYears} ano${diffYears > 1 ? 's' : ''}`
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    news: 0,
    documentos: 0,
    biddings: 0,
    users: 0
  })
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [isTokenReady, setIsTokenReady] = useState(false)

  // Verificar se o token está disponível
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('adminToken')
      if (token) {
        setIsTokenReady(true)
      } else {
        // Se não há token, pode estar carregando ou usuário não autenticado
        setTimeout(checkToken, 100) // Verificar novamente em 100ms
      }
    }
    
    checkToken()
  }, [])

  // Fazer requisições apenas quando token estiver pronto
  useEffect(() => {
    if (isTokenReady) {
      fetchStats()
      fetchActivities()
    }
  }, [isTokenReady])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.log('Token não encontrado')
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Erro na resposta da API:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setActivities([])
        return
      }

      const response = await fetch('/api/admin/activity?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        console.error('Erro ao buscar atividades:', response.status, response.statusText)
        setActivities([])
        return
      }

      const data = await response.json()
      const normalized = Array.isArray(data)
        ? data.map((a) => ({
            ...a,
            author: a.author || 'Sistema',
            action: a.action || 'atualizou',
            timeAgo: a.timeAgo || formatTimeAgo(a.updatedAt || a.createdAt),
          }))
        : []

      setActivities(normalized)
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      setActivities([])
    } finally {
      setLoadingActivities(false);
    }
  }

  return (
    <>
      <PageMeta
        title="Admin Dashboard | INPACTA"
        description="Painel administrativo do INPACTA"
      />
      <PageBreadcrumb pageTitle="Dashboard" />
      
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Stats Cards */}
        <div className="col-span-12 space-y-6 xl:col-span-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ComponentCard title="Notícias">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '—' : stats.news}
              </div>
              <p className="text-sm text-gray-500">Total de notícias</p>
            </ComponentCard>

            <ComponentCard title="Documentos">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '—' : stats.documentos}
              </div>
              <p className="text-sm text-gray-500">Documentos cadastrados</p>
            </ComponentCard>

            <ComponentCard title="Licitações">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '—' : stats.biddings}
              </div>
              <p className="text-sm text-gray-500">Processos cadastrados</p>
            </ComponentCard>

            <ComponentCard title="Usuários">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '—' : stats.users}
              </div>
              <p className="text-sm text-gray-500">Usuários cadastrados</p>
            </ComponentCard>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-12">
          <ComponentCard title="Ações Rápidas">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/admin/news/new" className="admin-button admin-button-primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nova Notícia
              </Link>
              <Link href="/admin/documentos/new" className="admin-button admin-button-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Doc Transparência
              </Link>
              <Link href="/admin/biddings/new" className="admin-button admin-button-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Criar Licitação
              </Link>
            </div>
          </ComponentCard>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12">
          <ComponentCard title="Atividade Recente">
            {loadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <div className="admin-spinner border-primary"></div>
                <span className="ml-2 text-gray-500">Carregando atividades...</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                Nenhuma atividade recente.
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <Link
                    key={index}
                    href={activity.link}
                    className="flex items-start p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:border-primary dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {activity.author} {activity.action}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.title} • {activity.timeAgo}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </ComponentCard>
        </div>
      </div>
    </>
  )
}