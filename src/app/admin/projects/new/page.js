'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    status: 'concluido',
    category: 'desenvolvimento',
    tags: '',
    featuredImage: '',
    published: false,
    metaTitle: '',
    metaDescription: '',
    ogImage: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
      setError('Título, descrição e conteúdo são obrigatórios')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')

      const resp = await fetch('/api/admin/projects', {
        method: 'POST',
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
      if (!resp.ok) throw new Error(data.error || 'Erro ao criar projeto')

      alert('Projeto criado com sucesso!')
      router.push(`/admin/projects/${data.id}`)
    } catch (e2) {
      console.error(e2)
      setError(e2.message || 'Erro ao criar projeto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Novo projeto</h1>
          <span className="admin-form-hint">Cadastro de projeto para o portal.</span>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={() => router.push('/admin/projects')}>
          ← Voltar
        </button>
      </header>

      <form className="admin-form" onSubmit={handleSubmit}>
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
            <small className="admin-help-text">Por enquanto, este campo é livre. Pode ser JSON ou texto.</small>
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
          <button type="button" className="admin-btn-secondary" onClick={() => router.push('/admin/projects')} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="admin-btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Criar projeto'}
          </button>
        </div>
      </form>
    </div>
  )
}
