'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '../../../../components/ImageUpload'
import RichTextEditor from '../../../../components/RichTextEditor'

export default function NewsForm() {
  const router = useRouter()
  const params = useParams()
  const isEdit = params.id !== 'new'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [news, setNews] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'tecnologia',
    tags: [],
    published: true, // Por padrão, novas notícias são publicadas
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    ogImage: ''
  })

  const fetchNews = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/news/${params.id}`, {
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
        setNews({
          title: data.title,
          summary: data.summary,
          content: data.content,
          category: data.category,
          tags: data.tags ? JSON.parse(data.tags) : [],
          published: data.published,
          featuredImage: data.featuredImage || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          ogImage: data.ogImage || ''
        })
      } else {
        alert('Notícia não encontrada')
        router.push('/admin/news')
      }
    } catch (error) {
      console.error('Erro ao carregar notícia:', error)
      alert('Erro ao carregar notícia')
      router.push('/admin/news')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    if (isEdit) {
      fetchNews()
    } else {
      setLoading(false)
    }
  }, [isEdit, fetchNews, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!news.title || !news.summary || !news.content) {
      alert('Título, resumo e conteúdo são obrigatórios')
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('adminToken')
      const url = isEdit ? `/api/admin/news/${params.id}` : '/api/admin/news'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(news)
      })

      if (response.status === 401) {
        router.push('/admin/login')
        return
      }

      if (response.ok) {
        alert(isEdit ? 'Notícia atualizada com sucesso!' : 'Notícia criada com sucesso!')
        router.push('/admin/news')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar notícia')
      }
    } catch (error) {
      console.error('Erro ao salvar notícia:', error)
      alert('Erro ao salvar notícia')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setNews(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = () => {
    const tagInput = document.getElementById('tagInput')
    const tag = tagInput.value.trim()
    
    if (tag && !news.tags.includes(tag)) {
      handleChange('tags', [...news.tags, tag])
      tagInput.value = ''
    }
  }

  const removeTag = (index) => {
    handleChange('tags', news.tags.filter((_, i) => i !== index))
  }

  const handleImageSelect = (imageData) => {
    if (imageData) {
      handleChange('featuredImage', imageData.url)
      // Se não houver ogImage definida, usar a mesma imagem
      if (!news.ogImage) {
        handleChange('ogImage', imageData.url)
      }
    } else {
      handleChange('featuredImage', '')
    }
  }

  const handleSeoImageSelect = (imageData) => {
    if (imageData) {
      handleChange('ogImage', imageData.url)
    } else {
      handleChange('ogImage', '')
    }
  }

  if (loading) {
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
          <h1 className="admin-page-title">{isEdit ? 'Editar Notícia' : 'Nova Notícia'}</h1>
        </div>
        <Link href="/admin/news" className="admin-btn-secondary">
          Voltar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-section">
          <h2>Informações da Notícia</h2>

          <div>
              {/* Título */}
              <div className="admin-form-group">
                <label htmlFor="title" className="admin-form-label">
                  Título <span className="admin-required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={news.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="admin-form-input"
                  placeholder="Digite o título da notícia"
                  required
                />
              </div>

              {/* Resumo */}
              <div className="admin-form-group">
                <label htmlFor="summary" className="admin-form-label">
                  Resumo <span className="admin-required">*</span>
                </label>
                <textarea
                  id="summary"
                  value={news.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  rows={3}
                  className="admin-form-input admin-form-textarea"
                  placeholder="Resumo da notícia (será exibido na listagem)"
                  required
                />
              </div>

              {/* Categoria */}
              <div className="admin-form-group">
                <label htmlFor="category" className="admin-form-label">Categoria</label>
                <select
                  id="category"
                  value={news.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="admin-form-input"
                >
                  <option value="tecnologia">Tecnologia</option>
                  <option value="inovacao">Inovação</option>
                  <option value="mercado">Mercado</option>
                  <option value="negocios">Negócios</option>
                  <option value="sustentabilidade">Sustentabilidade</option>
                  <option value="capacitacao">Capacitação</option>
                </select>
              </div>

              {/* Tags */}
              <div className="admin-form-group">
                <label className="admin-form-label">Tags</label>
                <div className="admin-inline-row">
                  <input
                    type="text"
                    id="tagInput"
                    className="admin-form-input"
                    placeholder="Digite uma tag e pressione Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="admin-btn-secondary"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="admin-tag-list">
                  {news.tags.map((tag, index) => (
                    <span key={index} className="admin-tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="admin-tag-remove"
                        aria-label="Remover tag"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Conteúdo <span className="admin-required">*</span>
                </label>
                <RichTextEditor
                  content={news.content}
                  onChange={(content) => handleChange('content', content)}
                  placeholder="Escreva o conteúdo da notícia aqui. Use a barra de ferramentas para formatação."
                />
                <span className="admin-form-hint">
                  Use a barra de ferramentas para formatação (negrito, listas, links e outros).
                </span>
              </div>
            </div>
          </div>

          {/* Card Imagem Destacada */}
          <div className="admin-form-section">
            <h2>Imagem Destacada</h2>

            <div className="admin-form-group">
              <label className="admin-form-label">Imagem Principal da Notícia</label>
              <ImageUpload
                onImageSelect={handleImageSelect}
                currentImage={news.featuredImage}
                category="news"
                className="w-full"
              />
              <span className="admin-form-hint">Esta imagem será exibida na listagem de notícias e no topo do artigo.</span>
            </div>
          </div>

          {/* Card SEO */}
          <div className="admin-form-section">
            <h2>Otimização SEO</h2>

            <div>
              {/* Meta Title */}
              <div className="admin-form-group">
                <label htmlFor="metaTitle" className="admin-form-label">Meta Título</label>
                <input
                  type="text"
                  id="metaTitle"
                  value={news.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  className="admin-form-input"
                  placeholder="Título para SEO (deixe vazio para usar o título da notícia)"
                />
              </div>

              {/* Meta Description */}
              <div className="admin-form-group">
                <label htmlFor="metaDescription" className="admin-form-label">Meta Descrição</label>
                <textarea
                  id="metaDescription"
                  value={news.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  rows={3}
                  className="admin-form-input admin-form-textarea"
                  placeholder="Descrição para SEO (deixe vazio para usar o resumo)"
                />
              </div>

              {/* OG Image */}
              <div className="admin-form-group">
                <label className="admin-form-label">Imagem para Redes Sociais</label>
                <ImageUpload
                  onImageSelect={handleSeoImageSelect}
                  currentImage={news.ogImage}
                  category="seo"
                  className="w-full"
                />
                <span className="admin-form-hint">Se não definida, será usada a imagem destacada da notícia.</span>
              </div>
            </div>
          </div>

          {/* Card Status */}
          <div className="admin-form-section">
            <h2>Status de Publicação</h2>

            <label className="admin-checkbox-label" htmlFor="published">
              <input
                type="checkbox"
                id="published"
                checked={news.published}
                onChange={(e) => handleChange('published', e.target.checked)}
                className="admin-checkbox"
              />
              <span>Publicar notícia</span>
            </label>
            <span className="admin-form-hint">Notícias não publicadas ficam como rascunho e não aparecem no site.</span>
          </div>

          {/* Botões */}
        <div className="admin-form-actions">
          <Link href="/admin/news" className="admin-btn-secondary">
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="admin-btn-primary">
            {saving ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Notícia
          </button>
        </div>
      </form>
    </div>
  )
}