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
                Nova Notícia
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Informações Básicas</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resumo *
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({...prev, content}))}
                placeholder="Escreva o conteúdo da notícia aqui. Use a barra de ferramentas para formatação."
              />
              <p className="text-sm text-gray-500 mt-1">
                Use a barra de ferramentas para formatar seu texto com negrito, cores, listas e mais
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tecnologia">Tecnologia</option>
                  <option value="projetos">Projetos</option>
                  <option value="inovacao">Inovação</option>
                  <option value="parceria">Parceria</option>
                  <option value="evento">Evento</option>
                  <option value="comunicado">Comunicado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="tecnologia, desenvolvimento, inovação"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separe as tags por vírgula
                </p>
              </div>
            </div>
          </div>

          {/* Imagem Destacada */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Imagem Destacada</h2>
            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImage={formData.featuredImage}
              category="news"
              className="w-full"
            />
          </div>

          {/* Configurações SEO */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">SEO e Redes Sociais</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título SEO
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                placeholder="Se vazio, usará o título da notícia"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição SEO
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="Se vazio, usará o resumo da notícia"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem para Redes Sociais
              </label>
              <ImageUpload
                onImageSelect={handleSeoImageSelect}
                currentImage={formData.ogImage}
                category="seo"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Se não definida, usará a imagem destacada
              </p>
            </div>
          </div>

          {/* Publicação */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Publicação</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-900">
                Publicar imediatamente
              </label>
            </div>
            <p className="text-sm text-green-600">
              ✓ Marcado: A notícia será publicada e ficará visível no site
            </p>
            <p className="text-sm text-gray-500">
              Se desmarcar, a notícia será salva como rascunho
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link
              href="/admin/news"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Criar Notícia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}