'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '../../../../components/ImageUpload'
import RichTextEditor from '../../../../components/RichTextEditor'

export default function NewNews() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'tecnologia',
    tags: '',
    published: true, // Publicar por padrão
    featuredImage: '',
    // SEO
    metaTitle: '',
    metaDescription: '',
    ogImage: ''
  })

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem('adminToken')
    const userData = localStorage.getItem('adminUser')
    
    if (!token || !userData) {
      router.push('/admin/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      setUser(user)
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      router.push('/admin/login')
    }
  }, [router])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageSelect = (imageData) => {
    if (imageData) {
      setFormData(prev => ({
        ...prev,
        featuredImage: imageData.url,
        // Se não houver ogImage definida, usar a mesma imagem
        ogImage: prev.ogImage || imageData.url
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        featuredImage: ''
      }))
    }
  }

  const handleSeoImageSelect = (imageData) => {
    if (imageData) {
      setFormData(prev => ({
        ...prev,
        ogImage: imageData.url
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        ogImage: ''
      }))
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('adminToken')
      
      // Gerar slug automaticamente
      const slug = generateSlug(formData.title)
      
      // Preparar dados para envio
      const submitData = {
        ...formData,
        slug,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        // Auto-preencher SEO se não fornecido
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.summary,
        ogImage: formData.ogImage || formData.featuredImage
      }

      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (response.ok) {
        alert('Notícia criada com sucesso!')
        router.push('/admin/news')
      } else {
        alert(result.error || 'Erro ao criar notícia')
      }
    } catch (error) {
      console.error('Erro ao criar notícia:', error)
      alert('Erro ao criar notícia')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Nova Notícia</h1>
        </div>
        <Link href="/admin/news" className="admin-btn-secondary">
          Voltar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-section">
          <h2>Informações Básicas</h2>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Título <span className="admin-required">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="admin-form-input"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Resumo <span className="admin-required">*</span>
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows={3}
              className="admin-form-input admin-form-textarea"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Conteúdo <span className="admin-required">*</span>
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({...prev, content}))}
              placeholder="Escreva o conteúdo da notícia aqui. Use a barra de ferramentas para formatação."
            />
            <span className="admin-form-hint">
              Use a barra de ferramentas para formatação (negrito, listas, links e outros).
            </span>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Categoria</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="admin-form-input"
              >
                <option value="tecnologia">Tecnologia</option>
                <option value="projetos">Projetos</option>
                <option value="inovacao">Inovação</option>
                <option value="parceria">Parceria</option>
                <option value="evento">Evento</option>
                <option value="comunicado">Comunicado</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="tecnologia, desenvolvimento, inovação"
                className="admin-form-input"
              />
              <span className="admin-form-hint">Separe as tags por vírgula.</span>
            </div>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Imagem Destacada</h2>
          <ImageUpload
            onImageSelect={handleImageSelect}
            currentImage={formData.featuredImage}
            category="news"
            className="w-full"
          />
        </div>

        <div className="admin-form-section">
          <h2>SEO e Redes Sociais</h2>

          <div className="admin-form-group">
            <label className="admin-form-label">Título SEO</label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleInputChange}
              placeholder="Se vazio, usará o título da notícia"
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Descrição SEO</label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              placeholder="Se vazio, usará o resumo da notícia"
              rows={2}
              className="admin-form-input admin-form-textarea"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Imagem para Redes Sociais</label>
            <ImageUpload
              onImageSelect={handleSeoImageSelect}
              currentImage={formData.ogImage}
              category="seo"
              className="w-full"
            />
            <span className="admin-form-hint">Se não definida, usará a imagem destacada.</span>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Publicação</h2>

          <label className="admin-checkbox-label">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleInputChange}
              className="admin-checkbox"
            />
            <span>Publicar imediatamente</span>
          </label>
          <span className="admin-form-hint">
            Se desmarcar, a notícia será salva como rascunho e não aparecerá no site.
          </span>
        </div>

        <div className="admin-form-actions">
          <Link href="/admin/news" className="admin-btn-secondary">
            Cancelar
          </Link>
          <button type="submit" disabled={loading} className="admin-btn-primary">
            {loading ? 'Salvando...' : 'Criar Notícia'}
          </button>
        </div>
      </form>
    </div>
  )
}