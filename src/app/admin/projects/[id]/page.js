'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('adminToken')
        const resp = await fetch(`/api/admin/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (resp.status === 401) {
          router.push('/admin/login')
          return
        }

        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || 'Erro ao carregar projeto')

        let parsedTags = ''
        try {
          const arr = data.tags ? JSON.parse(data.tags) : []
          parsedTags = Array.isArray(arr) ? arr.join(', ') : ''
        } catch {
          parsedTags = data.tags || ''
        }

        setForm({
          title: data.title || '',
          description: data.description || '',
          content: data.content || '',
          status: data.status || 'concluido',
          category: data.category || 'desenvolvimento',
          tags: parsedTags,
          featuredImage: data.featuredImage || '',
          published: !!data.published,
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          ogImage: data.ogImage || ''
        })
      } catch (e) {
        console.error(e)
        setError(e.message || 'Erro ao carregar projeto')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId, router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
      setError('Título, descrição e conteúdo são obrigatórios')
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken')

      const resp = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : null
        })
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Erro ao salvar projeto')

      alert('Projeto atualizado com sucesso!')
      router.refresh()
    } catch (e2) {
      console.error(e2)
      setError(e2.message || 'Erro ao salvar projeto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <p>{error || 'Projeto não encontrado'}</p>
          <button type="button" className="admin-btn-secondary" onClick={() => router.push('/admin/projects')}>
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Editar projeto</h1>
          <span className="admin-form-hint">Atualize as informações do projeto.</span>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={() => router.push('/admin/projects')}>
          ← Voltar
        </button>
      </header>

      <form className="admin-form" onSubmit={handleSave}>
        {error ? (
          <div className="admin-error" style={{ marginBottom: '1rem' }}>
            <p>{error}</p>
          </div>
        ) : null}

        <div className="admin-form-section">
          <h2 className="admin-section-title">Informações</h2>

          <div className="admin-form-group">
            <label className="admin-label required">Título</label>
            <input className="admin-input" name="title" value={form.title} onChange={handleChange} required />
          </div>

          <div className="admin-form-group">
            <label className="admin-label required">Descrição</label>
            <textarea className="admin-textarea" name="description" value={form.description} onChange={handleChange} rows={3} required />
          </div>

          <div className="admin-form-group">
            <label className="admin-label required">Conteúdo (JSON ou texto)</label>
            <textarea className="admin-textarea" name="content" value={form.content} onChange={handleChange} rows={8} required />
          </div>

          <div className="admin-form-grid admin-form-grid-3">
            <div className="admin-form-group">
              <label className="admin-label">Status do projeto</label>
              <select className="admin-input" name="status" value={form.status} onChange={handleChange}>
                <option value="em-andamento">Em andamento</option>
                <option value="concluido">Concluído</option>
                <option value="pausado">Pausado</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Categoria</label>
              <input className="admin-input" name="category" value={form.category} onChange={handleChange} />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Tags (separadas por vírgula)</label>
              <input className="admin-input" name="tags" value={form.tags} onChange={handleChange} />
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">Imagem destacada (URL)</label>
              <input className="admin-input" name="featuredImage" value={form.featuredImage} onChange={handleChange} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">OG Image (URL)</label>
              <input className="admin-input" name="ogImage" value={form.ogImage} onChange={handleChange} />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-checkbox-label">
              <input type="checkbox" className="admin-checkbox" name="published" checked={form.published} onChange={handleChange} />
              <span>Publicado</span>
            </label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2 className="admin-section-title">SEO</h2>
          <div className="admin-form-group">
            <label className="admin-label">Meta Title</label>
            <input className="admin-input" name="metaTitle" value={form.metaTitle} onChange={handleChange} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Meta Description</label>
            <textarea className="admin-textarea" name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={3} />
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="button" className="admin-btn-secondary" onClick={() => router.push('/admin/projects')} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="admin-btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
