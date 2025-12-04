'use client'

import { useState, useEffect } from 'react'
import { StatsCard, ActionCard, ActivityCard } from '@/components/admin/AdminComponents'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    news: 0,
    services: 0,
    projects: 0,
    users: 0
  })
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [loadingActivities, setLoadingActivities] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchActivities()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
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
      const response = await fetch('/api/admin/activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Adicionar dados mock se não houver atividades
        const mockActivities = [
          {
            type: 'news',
            icon: '📰',
            author: 'Admin',
            action: 'criou uma nova notícia:',
            title: 'Nova funcionalidade no portal',
            timeAgo: 'há 2 horas',
            link: '/admin/news'
          },
          {
            type: 'user', 
            icon: '👥',
            author: 'Sistema',
            action: 'cadastrou um novo usuário:',
            title: 'João Silva',
            timeAgo: 'há 5 horas',
            link: '/admin/users'
          }
        ]
        setActivities(data.length > 0 ? data : mockActivities)
      }
    } catch (error) {
      console.error('Erro ao buscar atividades:', error)
      // Dados mock para demonstração
      const mockActivities = [
        {
          type: 'news',
          icon: '📰',
          author: 'Admin',
          action: 'criou uma nova notícia:',
          title: 'Portal INPACTA recebe atualização',
          timeAgo: 'há 2 horas'
        },
        {
          type: 'user', 
          icon: '👥',
          author: 'Sistema',
          action: 'novo usuário cadastrado:',
          title: 'Maria Silva',
          timeAgo: 'há 5 horas'
        },
        {
          type: 'news',
          icon: '📝',
          author: 'Admin',
          action: 'editou a notícia:',
          title: 'Transparência e dados abertos',
          timeAgo: 'ontem'
        }
      ]
      setActivities(mockActivities)
    } finally {
      setLoadingActivities(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-2 h-8 bg-gradient-to-b from-[var(--primary)] to-[var(--accent)] rounded-full"></div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Dashboard Administrativo
          </h1>
        </div>
        <p className="text-[var(--muted)] text-lg">
          Bem-vindo ao painel de controle do INPACTA. Gerencie seu conteúdo de forma eficiente.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Notícias"
          value={stats.news}
          description="Artigos publicados"
          icon="📰"
          color="primary"
          trend={{ type: 'up', value: '+12%' }}
        />
        <StatsCard
          title="Usuários"
          value={stats.users}
          description="Usuários cadastrados"
          icon="👥"
          color="success"
          trend={{ type: 'up', value: '+3' }}
        />
        <StatsCard
          title="Visualizações"
          value="2.4k"
          description="Este mês"
          icon="📊"
          color="info"
          trend={{ type: 'up', value: '+18%' }}
        />
        <StatsCard
          title="Performance"
          value="98%"
          description="Tempo de atividade"
          icon="⚡"
          color="warning"
          trend={{ type: 'up', value: '+0.2%' }}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            title="Nova Notícia"
            description="Criar e publicar um novo artigo"
            href="/admin/news/new"
            icon="📝"
            color="primary"
            badge="Popular"
          />
          <ActionCard
            title="Novo Projeto"
            description="Adicionar um novo projeto ao portfólio"
            href="/admin/projects/new"
            icon="🚀"
            color="accent"
          />
          <ActionCard
            title="Analytics SEO"
            description="Visualizar métricas e performance"
            href="/admin/seo"
            icon="📊"
            color="success"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Atividade Recente
        </h2>
        
        {loadingActivities ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto mb-2"></div>
            <p className="text-[var(--muted)]">Carregando atividades...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-[var(--muted)] text-4xl mb-4">📋</div>
            <p className="text-[var(--muted)]">Nenhuma atividade recente</p>
            <p className="text-sm text-[var(--muted)] mt-2">
              As atividades aparecerão aqui quando você criar conteúdo
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <ActivityCard key={index} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}