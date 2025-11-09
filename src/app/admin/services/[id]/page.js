'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ServiceForm() {
  const router = useRouter()
  const params = useParams()
  const isEdit = params.id !== 'new'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [service, setService] = useState({
    title: '',
    summary: '',
    description: '',
    category: 'consultoria',
    features: [],
    benefits: [],
    price: '',
    priceType: 'custom',
    duration: '',
    active: true,
    metaTitle: '',
    metaDescription: '',
    ogImage: ''
  })

  const fetchService = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/services/${params.id}`, {
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
        setService({
          title: data.title,
          summary: data.summary,
          description: data.description,
          category: data.category,
          features: data.features ? JSON.parse(data.features) : [],
          benefits: data.benefits ? JSON.parse(data.benefits) : [],
          price: data.price || '',
          priceType: data.priceType || 'custom',
          duration: data.duration || '',
          active: data.active !== undefined ? data.active : true,
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          ogImage: data.ogImage || ''
        })
      } else {
        alert('Serviço não encontrado')
        router.push('/admin/services')
      }
    } catch (error) {
      console.error('Erro ao carregar serviço:', error)
      alert('Erro ao carregar serviço')
      router.push('/admin/services')
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
      fetchService()
    } else {
      setLoading(false)
    }
  }, [isEdit, fetchService, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!service.title || !service.summary || !service.description) {
      alert('Título, resumo e descrição são obrigatórios')
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('adminToken')
      const url = isEdit ? `/api/admin/services/${params.id}` : '/api/admin/services'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(service)
      })

      if (response.status === 401) {
        router.push('/admin/login')
        return
      }

      if (response.ok) {
        alert(isEdit ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!')
        router.push('/admin/services')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar serviço')
      }
    } catch (error) {
      console.error('Erro ao salvar serviço:', error)
      alert('Erro ao salvar serviço')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setService(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addFeature = () => {
    const featureInput = document.getElementById('featureInput')
    const feature = featureInput.value.trim()
    
    if (feature && !service.features.includes(feature)) {
      handleChange('features', [...service.features, feature])
      featureInput.value = ''
    }
  }

  const removeFeature = (index) => {
    handleChange('features', service.features.filter((_, i) => i !== index))
  }

  const addBenefit = () => {
    const benefitInput = document.getElementById('benefitInput')
    const benefit = benefitInput.value.trim()
    
    if (benefit && !service.benefits.includes(benefit)) {
      handleChange('benefits', [...service.benefits, benefit])
      benefitInput.value = ''
    }
  }

  const removeBenefit = (index) => {
    handleChange('benefits', service.benefits.filter((_, i) => i !== index))
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
              <Link href="/admin/services" className="text-blue-600 hover:text-blue-700">
                ← Voltar aos Serviços
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar Serviço' : 'Novo Serviço'}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações do Serviço</h2>
            
            <div className="space-y-6">
              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  value={service.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o título do serviço"
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
                  value={service.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Resumo do serviço (será exibido na listagem)"
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
                  value={service.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consultoria">Consultoria</option>
                  <option value="desenvolvimento">Desenvolvimento</option>
                  <option value="capacitacao">Capacitação</option>
                  <option value="inovacao">Inovação</option>
                  <option value="transformacao-digital">Transformação Digital</option>
                  <option value="gestao">Gestão</option>
                </select>
              </div>

              {/* Preço e Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    value={service.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="priceType" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Preço
                  </label>
                  <select
                    id="priceType"
                    value={service.priceType}
                    onChange={(e) => handleChange('priceType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="custom">Sob consulta</option>
                    <option value="fixed">Preço fixo</option>
                    <option value="hourly">Por hora</option>
                    <option value="monthly">Mensal</option>
                    <option value="project">Por projeto</option>
                  </select>
                </div>
              </div>

              {/* Duração */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duração Estimada
                </label>
                <input
                  type="text"
                  id="duration"
                  value={service.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 2-4 semanas, 3 meses, etc."
                />
              </div>

              {/* Características */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Características do Serviço
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    id="featureInput"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite uma característica e pressione Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addFeature()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefícios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefícios para o Cliente
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    id="benefitInput"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite um benefício e pressione Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addBenefit()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {service.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição Completa *
                </label>
                <textarea
                  id="description"
                  value={service.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição completa do serviço (aceita Markdown)"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Você pode usar Markdown para formatação do texto
                </p>
              </div>
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
                  value={service.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título para SEO (deixe vazio para usar o título do serviço)"
                />
              </div>

              {/* Meta Description */}
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Descrição
                </label>
                <textarea
                  id="metaDescription"
                  value={service.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição para SEO (deixe vazio para usar o resumo)"
                />
              </div>

              {/* OG Image */}
              <div>
                <label htmlFor="ogImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem de Compartilhamento (URL)
                </label>
                <input
                  type="url"
                  id="ogImage"
                  value={service.ogImage}
                  onChange={(e) => handleChange('ogImage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="URL da imagem para redes sociais"
                />
              </div>
            </div>
          </div>

          {/* Card Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Status do Serviço</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={service.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Serviço ativo
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Serviços inativos não aparecem no site público
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/services"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {saving ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Serviço
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}