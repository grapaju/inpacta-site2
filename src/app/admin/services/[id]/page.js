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
          <h1 className="admin-page-title">{isEdit ? 'Editar Serviço' : 'Novo Serviço'}</h1>
        </div>
        <Link href="/admin/services" className="admin-btn-secondary">
          Voltar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-section">
          <h2>Informações do Serviço</h2>

          <div>
              {/* Título */}
              <div className="admin-form-group">
                <label htmlFor="title" className="admin-form-label">
                  Título <span className="admin-required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={service.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="admin-form-input"
                  placeholder="Digite o título do serviço"
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
                  value={service.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  rows={3}
                  className="admin-form-input admin-form-textarea"
                  placeholder="Resumo do serviço (será exibido na listagem)"
                  required
                />
              </div>

              {/* Categoria */}
              <div className="admin-form-group">
                <label htmlFor="category" className="admin-form-label">Categoria</label>
                <select
                  id="category"
                  value={service.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="admin-form-input"
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
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="price" className="admin-form-label">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    value={service.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="admin-form-input"
                    placeholder="0.00"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="priceType" className="admin-form-label">Tipo de Preço</label>
                  <select
                    id="priceType"
                    value={service.priceType}
                    onChange={(e) => handleChange('priceType', e.target.value)}
                    className="admin-form-input"
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
              <div className="admin-form-group">
                <label htmlFor="duration" className="admin-form-label">Duração Estimada</label>
                <input
                  type="text"
                  id="duration"
                  value={service.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="admin-form-input"
                  placeholder="Ex: 2-4 semanas, 3 meses, etc."
                />
              </div>

              {/* Características */}
              <div className="admin-form-group">
                <label className="admin-form-label">Características do Serviço</label>
                <div className="admin-inline-row">
                  <input
                    type="text"
                    id="featureInput"
                    className="admin-form-input"
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
                    className="admin-btn-secondary"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="admin-tag-list">
                  {service.features.map((feature, index) => (
                    <span key={index} className="admin-tag">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="admin-tag-remove"
                        aria-label="Remover característica"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefícios */}
              <div className="admin-form-group">
                <label className="admin-form-label">Benefícios para o Cliente</label>
                <div className="admin-inline-row">
                  <input
                    type="text"
                    id="benefitInput"
                    className="admin-form-input"
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
                    className="admin-btn-secondary"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="admin-tag-list">
                  {service.benefits.map((benefit, index) => (
                    <span key={index} className="admin-tag">
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="admin-tag-remove"
                        aria-label="Remover benefício"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div className="admin-form-group">
                <label htmlFor="description" className="admin-form-label">
                  Descrição Completa <span className="admin-required">*</span>
                </label>
                <textarea
                  id="description"
                  value={service.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={10}
                  className="admin-form-input admin-form-textarea"
                  placeholder="Descrição completa do serviço (aceita Markdown)"
                  required
                />
                <span className="admin-form-hint">Você pode usar Markdown para formatação do texto.</span>
              </div>
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
                  value={service.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  className="admin-form-input"
                  placeholder="Título para SEO (deixe vazio para usar o título do serviço)"
                />
              </div>

              {/* Meta Description */}
              <div className="admin-form-group">
                <label htmlFor="metaDescription" className="admin-form-label">Meta Descrição</label>
                <textarea
                  id="metaDescription"
                  value={service.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  rows={3}
                  className="admin-form-input admin-form-textarea"
                  placeholder="Descrição para SEO (deixe vazio para usar o resumo)"
                />
              </div>

              {/* OG Image */}
              <div className="admin-form-group">
                <label htmlFor="ogImage" className="admin-form-label">Imagem de Compartilhamento (URL)</label>
                <input
                  type="url"
                  id="ogImage"
                  value={service.ogImage}
                  onChange={(e) => handleChange('ogImage', e.target.value)}
                  className="admin-form-input"
                  placeholder="URL da imagem para redes sociais"
                />
              </div>
            </div>
          </div>

          {/* Card Status */}
          <div className="admin-form-section">
            <h2>Status do Serviço</h2>

            <label className="admin-checkbox-label" htmlFor="active">
              <input
                type="checkbox"
                id="active"
                checked={service.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="admin-checkbox"
              />
              <span>Serviço ativo</span>
            </label>
            <span className="admin-form-hint">Serviços inativos não aparecem no site público.</span>
          </div>

          {/* Botões */}
        <div className="admin-form-actions">
          <Link href="/admin/services" className="admin-btn-secondary">
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="admin-btn-primary">
            {saving ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Serviço
          </button>
        </div>
      </form>
    </div>
  )
}