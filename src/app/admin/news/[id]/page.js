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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/news" className="text-blue-600 hover:text-blue-700">
                ← Voltar às Notícias
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar Notícia' : 'Nova Notícia'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Principal */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações da Notícia</h2>
            
            <div className="space-y-6">
              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  value={news.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o título da notícia"
                  required
                />
              </div>

              {/* Resumo */}
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                  Resumo *
                </label>
                <textarea
                  id="summary"
                  value={news.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Resumo da notícia (será exibido na listagem)"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  id="category"
                  value={news.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    id="tagInput"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {news.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Conteúdo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo *
                </label>
                <RichTextEditor
                  content={news.content}
                  onChange={(content) => handleChange('content', content)}
                  placeholder="Escreva o conteúdo da notícia aqui. Use a barra de ferramentas para formatação."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use a barra de ferramentas para formatar seu texto com negrito, cores, listas e mais
                </p>
              </div>
            </div>
          </div>

          {/* Card Imagem Destacada */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Imagem Destacada</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem Principal da Notícia
              </label>
              <ImageUpload
                onImageSelect={handleImageSelect}
                currentImage={news.featuredImage}
                category="news"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                Esta imagem será exibida na listagem de notícias e no topo do artigo
              </p>
            </div>
          </div>

          {/* Card SEO */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Otimização SEO</h2>
            
            <div className="space-y-6">
              {/* Meta Title */}
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Título
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  value={news.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título para SEO (deixe vazio para usar o título da notícia)"
                />
              </div>

              {/* Meta Description */}
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Descrição
                </label>
                <textarea
                  id="metaDescription"
                  value={news.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição para SEO (deixe vazio para usar o resumo)"
                />
              </div>

              {/* OG Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem para Redes Sociais
                </label>
                <ImageUpload
                  onImageSelect={handleSeoImageSelect}
                  currentImage={news.ogImage}
                  category="seo"
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Se não definida, será usada a imagem destacada da notícia
                </p>
              </div>
            </div>
          </div>

          {/* Card Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Status de Publicação</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={news.published}
                onChange={(e) => handleChange('published', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                Publicar notícia
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Notícias não publicadas ficam como rascunho e não aparecem no site
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/news"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {saving ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Notícia
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}