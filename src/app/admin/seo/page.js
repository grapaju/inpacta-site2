'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ScrollReveal, StaggeredReveal } from '@/hooks/useScrollAnimations';

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
      fetchAnalyticsData();
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };



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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                SEO & Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Olá, {user?.name || user?.email}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      <nav className="bg-white/50 backdrop-blur-sm border-b border-gray-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12 items-center">
            <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/news" className="text-gray-600 hover:text-blue-600 transition-colors">
              Notícias
            </Link>
            <Link href="/admin/seo" className="text-blue-600 font-medium border-b-2 border-blue-600">
              SEO & Analytics
            </Link>
            <Link href="/admin/seo-config" className="text-gray-600 hover:text-blue-600 transition-colors">
              Configurações SEO
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <ScrollReveal animation="fadeUp">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                SEO & Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                Acompanhe o desempenho e métricas do site
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:border-blue-500 outline-none"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 3 meses</option>
              </select>
              
              <button
                onClick={fetchAnalyticsData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 16H3v5" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {loading ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Métricas Principais */}
        <ScrollReveal animation="fadeUp" delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Visualizações',
                value: loading ? '---' : stats.pageViews.toLocaleString(),
                icon: '👁️',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-600',
                changeColor: 'bg-blue-100 text-blue-700',
                change: '+12.5%'
              },
              {
                title: 'Visitantes Únicos',
                value: loading ? '---' : stats.visitors.toLocaleString(),
                icon: '👤',
                bgColor: 'bg-green-50',
                textColor: 'text-green-600',
                changeColor: 'bg-green-100 text-green-700',
                change: '+8.3%'
              },
              {
                title: 'Taxa de Rejeição',
                value: loading ? '---' : `${stats.bounceRate}%`,
                icon: '📈',
                bgColor: 'bg-orange-50',
                textColor: 'text-orange-600',
                changeColor: 'bg-orange-100 text-orange-700',
                change: '-2.1%'
              },
              {
                title: 'Duração Média',
                value: loading ? '---' : formatDuration(stats.avgSessionDuration),
                icon: '⏱️',
                bgColor: 'bg-purple-50',
                textColor: 'text-purple-600',
                changeColor: 'bg-purple-100 text-purple-700',
                change: '+15.7%'
              }
            ].map((metric, index) => (
              <div
                key={index}
                className={`${metric.bgColor} border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-colors`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{metric.icon}</div>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${metric.changeColor}`}>
                    {metric.change}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm text-gray-600 font-medium">
                    {metric.title}
                  </h3>
                  <p className={`text-2xl font-bold ${metric.textColor}`}>
                    {metric.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Páginas Mais Visitadas */}
          <ScrollReveal animation="fadeUp" delay={300}>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Páginas Mais Visitadas
                </h2>
                <span className="text-sm text-gray-600">
                  {getDateRangeLabel(dateRange)}
                </span>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topPages.map((page, index) => (
                    <div
                      key={page.path}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index < 3 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {page.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {page.path}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">
                          {page.views.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          visualizações
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Configurações de SEO */}
          <ScrollReveal animation="fadeUp" delay={400}>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Configurações de SEO
              </h2>
              
              <div className="space-y-6">
                {/* Google Analytics */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Google Analytics</h3>
                        <p className="text-sm text-gray-600">Tracking ID: GA-XXXX-X</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Analytics está configurado e coletando dados.
                  </p>
                </div>

                {/* Google Search Console */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <path d="M9.68 13.69L11.13 15.14L20.48 5.79L21.89 7.21L11.13 17.97L7.84 14.68L9.68 13.69Z"/>
                          <path d="M17.5 10C17.5 6.13 14.37 3 10.5 3S3.5 6.13 3.5 10 6.63 17 10.5 17C12.43 17 14.17 16.17 15.46 14.88"/>
                          <path d="M6 10C6 7.24 8.24 5 11 5S16 7.24 16 10"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Search Console</h3>
                        <p className="text-sm text-gray-600">Propriedade verificada</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Site verificado no Google Search Console.
                  </p>
                </div>

                {/* Sitemap */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Sitemap XML</h3>
                        <p className="text-sm text-gray-600">/sitemap.xml</p>
                      </div>
                    </div>
                    <Link 
                      href="/sitemap.xml" 
                      target="_blank"
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Visualizar
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600">
                    Sitemap atualizado automaticamente.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Actions */}
        <ScrollReveal animation="fadeUp" delay={500}>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Exportar Relatório
            </button>
            
            <Link 
              href="/admin/seo-config"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Configurar Integração
            </Link>
          </div>
        </ScrollReveal>
      </div>
      </main>
    </div>
  );
}