'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ScrollReveal } from '@/hooks/useScrollAnimations';

export default function SEOConfigPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    google_analytics_id: '',
    google_search_console_id: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_card: 'summary_large_image',
    twitter_site: '',
    robots_txt: '',
    sitemap_enabled: true
  });

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
      fetchSettings();
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/admin/login');
    }
  }, [router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/seo-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/seo-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage('Configurações salvas com sucesso!');
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                INPACTA Admin
              </Link>
              <span className="ml-4 text-gray-400">|</span>
              <span className="ml-4 text-gray-600">Configurações de SEO</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/50 backdrop-blur-sm border-b border-gray-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12 items-center">
            <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/news" className="text-gray-600 hover:text-blue-600 transition-colors">
              Notícias
            </Link>
            <Link href="/admin/seo" className="text-gray-600 hover:text-blue-600 transition-colors">
              SEO & Analytics
            </Link>
            <Link href="/admin/seo-config" className="text-blue-600 font-medium border-b-2 border-blue-600">
              Configurações SEO
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollReveal>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Configurações de SEO
            </h1>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('sucesso') 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Google Services */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Google Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={settings.google_analytics_id}
                      onChange={(e) => setSettings({...settings, google_analytics_id: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Search Console ID
                    </label>
                    <input
                      type="text"
                      value={settings.google_search_console_id}
                      onChange={(e) => setSettings({...settings, google_search_console_id: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="google-site-verification=..."
                    />
                  </div>
                </div>
              </div>

              {/* Meta Tags */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Meta Tags</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título da Página (Meta Title)
                    </label>
                    <input
                      type="text"
                      value={settings.meta_title}
                      onChange={(e) => setSettings({...settings, meta_title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="INPACTA - Instituto de Pesquisa e Análise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição (Meta Description)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.meta_description}
                      onChange={(e) => setSettings({...settings, meta_description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descrição do site para motores de busca..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Palavras-chave (Meta Keywords)
                    </label>
                    <input
                      type="text"
                      value={settings.meta_keywords}
                      onChange={(e) => setSettings({...settings, meta_keywords: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="inpacta, pesquisa, análise, dados..."
                    />
                  </div>
                </div>
              </div>

              {/* Open Graph */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Open Graph (Facebook)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Title
                    </label>
                    <input
                      type="text"
                      value={settings.og_title}
                      onChange={(e) => setSettings({...settings, og_title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Título para compartilhamento no Facebook"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Description
                    </label>
                    <textarea
                      rows={3}
                      value={settings.og_description}
                      onChange={(e) => setSettings({...settings, og_description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descrição para compartilhamento no Facebook..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Image URL
                    </label>
                    <input
                      type="text"
                      value={settings.og_image}
                      onChange={(e) => setSettings({...settings, og_image: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="/logo.png"
                    />
                  </div>
                </div>
              </div>

              {/* Twitter Cards */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Twitter Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter Card Type
                    </label>
                    <select
                      value={settings.twitter_card}
                      onChange={(e) => setSettings({...settings, twitter_card: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter Site (@username)
                    </label>
                    <input
                      type="text"
                      value={settings.twitter_site}
                      onChange={(e) => setSettings({...settings, twitter_site: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="@inpacta"
                    />
                  </div>
                </div>
              </div>

              {/* Technical SEO */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">SEO Técnico</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Robots.txt
                    </label>
                    <textarea
                      rows={4}
                      value={settings.robots_txt}
                      onChange={(e) => setSettings({...settings, robots_txt: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="User-agent: *&#10;Allow: /"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sitemap_enabled"
                      checked={settings.sitemap_enabled}
                      onChange={(e) => setSettings({...settings, sitemap_enabled: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sitemap_enabled" className="ml-2 text-sm text-gray-700">
                      Gerar sitemap.xml automaticamente
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}