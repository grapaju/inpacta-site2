'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Configurações de SEO</h1>
          <span className="admin-subtitle">Metadados, integrações e SEO técnico</span>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={handleLogout}>
          Sair
        </button>
      </header>

      {message && (
        <div className={`admin-notice ${message.toLowerCase().includes('sucesso') ? 'admin-notice-success' : 'admin-notice-error'}`}>
          {message}
        </div>
      )}

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="admin-form admin-form-flush">
          <div className="admin-form-section admin-form-section-pad admin-form-section-compact">
            <h2>Google Services</h2>
            <div className="admin-form-row">
              <div className="admin-form-group admin-form-group-compact">
                <label className="admin-form-label">Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.google_analytics_id}
                  onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                  className="admin-form-input"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div className="admin-form-group admin-form-group-compact">
                <label className="admin-form-label">Google Search Console ID</label>
                <input
                  type="text"
                  value={settings.google_search_console_id}
                  onChange={(e) => setSettings({ ...settings, google_search_console_id: e.target.value })}
                  className="admin-form-input"
                  placeholder="google-site-verification=..."
                />
              </div>
            </div>
          </div>

          <div className="admin-form-section admin-form-section-pad admin-form-section-compact">
            <h2>Meta Tags</h2>
            <div className="admin-form-group">
              <label className="admin-form-label">Título da página (Meta Title)</label>
              <input
                type="text"
                value={settings.meta_title}
                onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                className="admin-form-input"
                placeholder="INPACTA - Instituto de Pesquisa e Análise"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Descrição (Meta Description)</label>
              <textarea
                rows={3}
                value={settings.meta_description}
                onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                className="admin-form-input admin-form-textarea"
                placeholder="Descrição do site para motores de busca..."
              />
            </div>
            <div className="admin-form-group admin-form-group-compact">
              <label className="admin-form-label">Palavras-chave (Meta Keywords)</label>
              <input
                type="text"
                value={settings.meta_keywords}
                onChange={(e) => setSettings({ ...settings, meta_keywords: e.target.value })}
                className="admin-form-input"
                placeholder="inpacta, pesquisa, análise, dados..."
              />
            </div>
          </div>

          <div className="admin-form-section admin-form-section-pad admin-form-section-compact">
            <h2>Open Graph</h2>
            <div className="admin-form-group">
              <label className="admin-form-label">OG Title</label>
              <input
                type="text"
                value={settings.og_title}
                onChange={(e) => setSettings({ ...settings, og_title: e.target.value })}
                className="admin-form-input"
                placeholder="Título para compartilhamento"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">OG Description</label>
              <textarea
                rows={3}
                value={settings.og_description}
                onChange={(e) => setSettings({ ...settings, og_description: e.target.value })}
                className="admin-form-input admin-form-textarea"
                placeholder="Descrição para compartilhamento..."
              />
            </div>
            <div className="admin-form-group admin-form-group-compact">
              <label className="admin-form-label">OG Image URL</label>
              <input
                type="text"
                value={settings.og_image}
                onChange={(e) => setSettings({ ...settings, og_image: e.target.value })}
                className="admin-form-input"
                placeholder="/logo.png"
              />
            </div>
          </div>

          <div className="admin-form-section admin-form-section-pad admin-form-section-compact">
            <h2>Twitter Cards</h2>
            <div className="admin-form-row">
              <div className="admin-form-group admin-form-group-compact">
                <label className="admin-form-label">Tipo de card</label>
                <select
                  value={settings.twitter_card}
                  onChange={(e) => setSettings({ ...settings, twitter_card: e.target.value })}
                  className="admin-form-input"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                </select>
              </div>

              <div className="admin-form-group admin-form-group-compact">
                <label className="admin-form-label">Twitter Site (@usuário)</label>
                <input
                  type="text"
                  value={settings.twitter_site}
                  onChange={(e) => setSettings({ ...settings, twitter_site: e.target.value })}
                  className="admin-form-input"
                  placeholder="@inpacta"
                />
              </div>
            </div>
          </div>

          <div className="admin-form-section admin-form-section-pad admin-form-section-compact admin-form-section-borderless">
            <h2>SEO Técnico</h2>
            <div className="admin-form-group">
              <label className="admin-form-label">Robots.txt</label>
              <textarea
                rows={4}
                value={settings.robots_txt}
                onChange={(e) => setSettings({ ...settings, robots_txt: e.target.value })}
                className="admin-form-input admin-form-textarea"
                placeholder="User-agent: *\nAllow: /"
              />
            </div>

            <div className="admin-form-group admin-form-group-compact">
              <label className="admin-checkbox-label" htmlFor="sitemap_enabled">
                <input
                  type="checkbox"
                  id="sitemap_enabled"
                  checked={settings.sitemap_enabled}
                  onChange={(e) => setSettings({ ...settings, sitemap_enabled: e.target.checked })}
                  className="admin-checkbox"
                />
                Gerar sitemap.xml automaticamente
              </label>
            </div>
          </div>

          <div className="admin-form-actions admin-form-actions-flush">
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}