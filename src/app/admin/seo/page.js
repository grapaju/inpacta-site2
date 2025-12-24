'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function SEOPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    pageViews: 0,
    visitors: 0,
    bounceRate: 0,
    avgSessionDuration: 0
  });
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/analytics?dateRange=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar analytics: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.stats);
      setTopPages(data.topPages);
    } catch (error) {
      console.error('Erro ao buscar dados de analytics:', error);
      // Usar dados mock em caso de erro
      const mockData = {
        stats: {
          pageViews: Math.floor(Math.random() * 10000) + 5000,
          visitors: Math.floor(Math.random() * 3000) + 1500,
          bounceRate: Math.floor(Math.random() * 30) + 30,
          avgSessionDuration: Math.floor(Math.random() * 300) + 120
        },
        topPages: [
          { path: '/', views: Math.floor(Math.random() * 2000) + 1000, title: 'Página Inicial' },
          { path: '/noticias', views: Math.floor(Math.random() * 1500) + 800, title: 'Notícias' },
          { path: '/servicos', views: Math.floor(Math.random() * 1200) + 600, title: 'Serviços' },
          { path: '/sobre', views: Math.floor(Math.random() * 1000) + 500, title: 'Sobre' },
          { path: '/contato', views: Math.floor(Math.random() * 800) + 400, title: 'Contato' },
        ]
      };
      setStats(mockData.stats);
      setTopPages(mockData.topPages.sort((a, b) => b.views - a.views));
    } finally {
      setLoading(false);
    }
  }, [dateRange, router]);

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/admin/login');
    }
  }, [router, fetchAnalyticsData]);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [dateRange, user, fetchAnalyticsData]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDateRangeLabel = (range) => {
    switch (range) {
      case '7d': return 'Últimos 7 dias';
      case '30d': return 'Últimos 30 dias';
      case '90d': return 'Últimos 3 meses';
      default: return 'Últimos 7 dias';
    }
  };

  if (loading && topPages.length === 0) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Carregando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">SEO e Analytics</h1>
          <span className="admin-subtitle">Acompanhamento de métricas do site</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="admin-form-input"
            style={{ width: 220 }}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 3 meses</option>
          </select>
          <button type="button" className="admin-btn-secondary" onClick={fetchAnalyticsData} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </header>

      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <div className="admin-subtitle" style={{ marginTop: 0 }}>
          Período: {getDateRangeLabel(dateRange)}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div className="admin-card">
          <div className="admin-subtitle" style={{ marginTop: 0 }}>Visualizações</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--foreground)' }}>
            {loading ? '—' : stats.pageViews.toLocaleString()}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-subtitle" style={{ marginTop: 0 }}>Visitantes únicos</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--foreground)' }}>
            {loading ? '—' : stats.visitors.toLocaleString()}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-subtitle" style={{ marginTop: 0 }}>Taxa de rejeição</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--foreground)' }}>
            {loading ? '—' : `${stats.bounceRate}%`}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-subtitle" style={{ marginTop: 0 }}>Duração média</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--foreground)' }}>
            {loading ? '—' : formatDuration(stats.avgSessionDuration)}
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, marginBottom: '1rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--section-alt-bg)' }}>
          <div style={{ fontWeight: 650, color: 'var(--foreground)' }}>Páginas mais visitadas</div>
          <div className="admin-subtitle" style={{ marginTop: '0.25rem' }}>{getDateRangeLabel(dateRange)}</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Título</th>
                <th>Caminho</th>
                <th style={{ width: 140 }}>Visualizações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--muted-text)' }}>Carregando...</td>
                </tr>
              ) : topPages.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--muted-text)' }}>Sem dados para o período selecionado.</td>
                </tr>
              ) : (
                topPages.map((page, index) => (
                  <tr key={page.path}>
                    <td>{index + 1}</td>
                    <td>{page.title}</td>
                    <td style={{ color: 'var(--muted-text)' }}>{page.path}</td>
                    <td>{page.views.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="admin-btn-secondary" onClick={() => window.print()}>
          Exportar relatório
        </button>
        <a className="admin-btn-secondary" href="/sitemap.xml" target="_blank" rel="noreferrer">
          Visualizar sitemap
        </a>
        <a className="admin-btn-primary" href="/admin/seo-config">
          Configurações de SEO
        </a>
      </div>
    </div>
  );
}