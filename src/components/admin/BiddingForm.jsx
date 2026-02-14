/**
 * Formulário de Licitação
 * Componente para criar/editar licitações
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadgeBidding from './StatusBadgeBidding';

export default function BiddingForm({ biddingId = null, initialData = null }) {
  const router = useRouter();
  const isEditing = !!biddingId;

  const [step, setStep] = useState(1); // 1: básicos, 2: prazos/valores, 3: edital, 4: revisão
  const totalSteps = 4;

  const getNextStepLabel = (currentStep) => {
    const map = {
      1: 'Prazos e Valores',
      2: 'Anexar Edital',
      3: 'Revisar e Criar'
    };
    return map[currentStep] || null;
  };

  // Helper function for date conversion (movida para antes do useState)
  const toDateInputHelper = (value) => {
    if (!value || value === null || value === undefined) return '';
    
    try {
      let dateStr = '';
      
      // Se já é uma string no formato YYYY-MM-DD HH:mm:ss, extrair apenas a data
      if (typeof value === 'string' && value.includes(' ')) {
        dateStr = value.split(' ')[0]; // Pega apenas "2025-12-22"
      } 
      // Se é string ISO ou outro formato de data
      else if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          dateStr = date.toISOString().split('T')[0];
        }
      } 
      // Se é um objeto Date
      else if (value instanceof Date) {
        if (!isNaN(value.getTime())) {
          dateStr = value.toISOString().split('T')[0];
        }
      }
      
      // Verificar se o resultado é uma data válida no formato YYYY-MM-DD
      if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      return '';
    } catch (error) {
      console.error('Erro ao converter data:', value, error);
      return '';
    }
  };
  
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    object: '',
    description: '',
    legalBasis: '',
    modality: 'PREGAO_ELETRONICO',
    type: 'MENOR_PRECO',
    status: 'PLANEJAMENTO',
    publicationDate: '',
    openingDate: '',
    closingDate: '',
    estimatedValue: '',
    finalValue: '',
    srp: false,
    // Garantir que initialData não sobrescreva com valores null
    // E processar datas se necessário
    ...(initialData && Object.fromEntries(
      Object.entries(initialData).map(([key, value]) => {
        if (value === null || value === undefined) {
          return [key, ''];
        }
        // Processar campos de data se necessário
        if (['publicationDate', 'openingDate', 'closingDate'].includes(key) && value) {
          return [key, toDateInputHelper(value)];
        }
        return [key, value];
      })
    ))
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // No wizard de criação, o edital só pode ser enviado após criar a licitação (precisa do biddingId).
  // Então aqui guardamos o arquivo local e fazemos o upload no submit.
  const [editalFile, setEditalFile] = useState(null);

  // Carregar dados se estiver editando
  useEffect(() => {
    if (biddingId && !initialData) {
      fetchBidding();
    }
  }, [biddingId]);

  const fetchBidding = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`/api/admin/biddings/${biddingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar licitação');
      }

      const data = await response.json();

      const bidding = data?.data;
      if (!bidding) {
        throw new Error('Resposta inválida ao carregar licitação');
      }

      const toDateInput = (value) => {
        if (!value || value === null || value === undefined) return '';
        
        try {
          let dateStr = '';
          
          // Se já é uma string no formato YYYY-MM-DD HH:mm:ss, extrair apenas a data
          if (typeof value === 'string' && value.includes(' ')) {
            dateStr = value.split(' ')[0]; // Pega apenas "2025-12-22"
          } 
          // Se é string ISO ou outro formato de data
          else if (typeof value === 'string') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              dateStr = date.toISOString().split('T')[0];
            }
          } 
          // Se é um objeto Date
          else if (value instanceof Date) {
            if (!isNaN(value.getTime())) {
              dateStr = value.toISOString().split('T')[0];
            }
          }
          
          // Verificar se o resultado é uma data válida no formato YYYY-MM-DD
          if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }
          
          return '';
        } catch (error) {
          console.error('Erro ao converter data:', value, error);
          return '';
        }
      };

      setFormData({
        number: bidding.number || '',
        title: bidding.title || '',
        object: bidding.object || '',
        description: bidding.description || '',
        legalBasis: bidding.legalBasis || '',
        modality: bidding.modality || 'PREGAO_ELETRONICO',
        type: bidding.type || 'MENOR_PRECO',
        status: bidding.status || 'PLANEJAMENTO',
        publicationDate: toDateInput(bidding.publicationDate),
        openingDate: toDateInput(bidding.openingDate),
        closingDate: toDateInput(bidding.closingDate),
        estimatedValue: bidding.estimatedValue ?? '',
        finalValue: bidding.finalValue ?? '',
        srp: bidding.srp || false
      });
    } catch (error) {
      console.error('Erro ao carregar:', error);
      setError('Erro ao carregar dados da licitação');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro de validação do campo
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (targetStep = null) => {
    const errors = {};

    const stepToValidate = targetStep || (isEditing ? null : step);

    if (!formData.number.trim()) {
      errors.number = 'Número é obrigatório';
    } else if (!/^\d{3}\/\d{4}$/.test(formData.number)) {
      errors.number = 'Formato inválido. Use: XXX/YYYY';
    }

    if (!formData.title.trim()) {
      errors.title = 'Título é obrigatório';
    }

    if (!formData.object.trim()) {
      errors.object = 'Objeto é obrigatório';
    } else if (formData.object.trim().length < 20) {
      errors.object = 'Objeto deve ter pelo menos 20 caracteres';
    }

    if (!formData.modality) {
      errors.modality = 'Modalidade é obrigatória';
    }

    if (!formData.type) {
      errors.type = 'Tipo é obrigatório';
    }

    if (stepToValidate === 2 || stepToValidate === null) {
      if (!formData.publicationDate) {
        errors.publicationDate = 'Data de publicação é obrigatória';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setError(null);
    if (!validateForm(step)) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm(isEditing ? null : totalSteps)) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');

      const payload = {
        ...formData,
        publicationDate: formData.publicationDate || null,
        openingDate: formData.openingDate || null,
        closingDate: formData.closingDate || null,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        finalValue: formData.finalValue ? parseFloat(formData.finalValue) : null
      };

      const url = isEditing 
        ? `/api/admin/biddings/${biddingId}`
        : '/api/admin/biddings';

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar licitação');
      }

      alert(isEditing ? 'Licitação atualizada com sucesso!' : 'Licitação criada com sucesso!');
      
      if (isEditing) {
        router.refresh();
      } else {
        const createdBidding = data?.data;
        if (!createdBidding?.id) {
          throw new Error('Licitação criada, mas a resposta não trouxe o ID');
        }

        if (editalFile) {
          // 1) Upload do arquivo (storage LICITACAO)
          const uploadForm = new FormData();
          uploadForm.append('file', editalFile);
          uploadForm.append('module', 'LICITACAO');
          uploadForm.append('biddingId', createdBidding.id);
          uploadForm.append('phase', 'ABERTURA');
          if (token) uploadForm.append('token', token);

          const uploadResp = await fetch('/api/admin/upload-document', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: uploadForm
          });

          const uploadJson = await uploadResp.json();
          if (!uploadResp.ok || !uploadJson?.success) {
            throw new Error(uploadJson?.error || 'Licitação criada, mas falhou ao fazer upload do Edital');
          }

          // 2) Criar registro do documento (bidding_documents)
          const createDocResp = await fetch('/api/admin/documents', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              module: 'LICITACAO',
              biddingId: createdBidding.id,
              phase: 'ABERTURA',
              title: `Edital - ${formData.number}`,
              description: '',

              // Tipagem/status (payload PT-BR)
              tipo_documento: 'EDITAL',
              titulo_exibicao: 'Edital',
              status_documento: 'PUBLICADO',
              status: 'PUBLISHED',

              fileName: uploadJson.fileName,
              filePath: uploadJson.filePath,
              fileSize: uploadJson.fileSize,
              fileType: uploadJson.fileType,
              fileHash: uploadJson.fileHash
            })
          });

          const createDocData = await createDocResp.json();
          if (!createDocResp.ok || !createDocData?.success) {
            throw new Error(createDocData?.error || 'Licitação criada, mas falhou ao cadastrar o Edital');
          }
        }

        router.push(`/admin/biddings/${createdBidding.id}?tab=documents`);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setError(error.message || 'Erro ao salvar licitação');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing && !formData.number) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div>
      {!isEditing && (
        <div className="admin-wizard-container" style={{ marginBottom: '2rem' }}>
          <div className="admin-wizard-header">
            <h3 className="admin-wizard-title">Assistente de Criação</h3>
            <p className="admin-wizard-subtitle">Siga os passos para criar sua licitação</p>
          </div>
          
          {/* Progress bar */}
          <div className="admin-wizard-progress">
            <div className="admin-wizard-steps">
              {[1, 2, 3, 4].map(stepNum => (
                <div key={stepNum} className={`admin-wizard-step ${
                  stepNum <= step ? 'admin-wizard-step-active' : 'admin-wizard-step-inactive'
                }`}>
                  <div className="admin-wizard-step-circle">
                    {stepNum}
                  </div>
                  <div className="admin-wizard-step-label">
                    {stepNum === 1 && 'Informações Básicas'}
                    {stepNum === 2 && 'Prazos e Valores'}
                    {stepNum === 3 && 'Anexar Edital'}
                    {stepNum === 4 && 'Revisar e Criar'}
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-wizard-progress-bar">
              <div 
                className="admin-wizard-progress-fill" 
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="admin-wizard-actions">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => router.push('/admin/biddings')}
              disabled={loading}
            >
              Cancelar
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {step > 1 && (
                <button 
                  type="button" 
                  className="admin-btn-secondary" 
                  onClick={handleBack} 
                  disabled={loading}
                >
                  Voltar
                </button>
              )}
              {step < totalSteps ? (
                <button 
                  type="button" 
                  className="admin-btn-primary" 
                  onClick={handleNext} 
                  disabled={loading}
                >
                  Próximo
                </button>
              ) : (
                <button 
                  type="button" 
                  className="admin-btn-primary" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Licitação'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={`admin-form ${!isEditing ? 'admin-form-with-wizard-footer' : ''}`}>
      {error && (
        <div className="admin-error" style={{ marginBottom: '1.5rem' }}>
          <p>{error}</p>
        </div>
      )}

      {/* Informações Básicas */}
      {isEditing || step === 1 ? (
        <div className="admin-form-section">
          {!isEditing && (
            <div className="admin-step-guidance">
              <h2 className="admin-section-title">Passo 1: Informações Básicas</h2>
              <p className="admin-form-hint">
                Comece preenchendo as informações fundamentais da licitação: número, título e objeto.
                Essas informações são obrigatórias e serão usadas para identificar a licitação no sistema.
              </p>
            </div>
          )}
          {isEditing && <h2 className="admin-section-title">Informações Básicas</h2>}

        <div className="admin-form-grid">
          {/* Número */}
          <div className="admin-form-group">
            <label htmlFor="number" className="admin-label required">
              Número
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="001/2024"
              disabled={isEditing}
              className={`admin-input ${validationErrors.number ? 'admin-input-error' : ''}`}
              required
            />
            {validationErrors.number && (
              <span className="admin-error-text">{validationErrors.number}</span>
            )}
            <small className="admin-help-text">Formato: XXX/YYYY</small>
          </div>

          {/* Status */}
          {isEditing && (
            <div className="admin-form-group">
              <label htmlFor="status" className="admin-label">
                Status Atual
              </label>
              <div style={{ paddingTop: '0.5rem' }}>
                <StatusBadgeBidding status={formData.status} />
              </div>
            </div>
          )}
        </div>

        {/* Título */}
        <div className="admin-form-group">
          <label htmlFor="title" className="admin-label required">
            Título
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex: Aquisição de Material de Escritório"
            className={`admin-input ${validationErrors.title ? 'admin-input-error' : ''}`}
            required
          />
          {validationErrors.title && (
            <span className="admin-error-text">{validationErrors.title}</span>
          )}
        </div>

        {/* Objeto */}
        <div className="admin-form-group">
          <label htmlFor="object" className="admin-label required">
            Objeto
          </label>
          <textarea
            id="object"
            name="object"
            value={formData.object}
            onChange={handleChange}
            placeholder="Descrição detalhada do objeto da licitação..."
            rows={4}
            className={`admin-input ${validationErrors.object ? 'admin-input-error' : ''}`}
            required
          />
          {validationErrors.object && (
            <span className="admin-error-text">{validationErrors.object}</span>
          )}
        </div>

        {/* Base Legal */}
        <div className="admin-form-group">
          <label htmlFor="legalBasis" className="admin-label">
            Base Legal
          </label>
          <input
            type="text"
            id="legalBasis"
            name="legalBasis"
            value={formData.legalBasis}
            onChange={handleChange}
            placeholder="Ex: Lei 14.133/2021, Art. 28"
            className="admin-input"
          />
          <small className="admin-help-text">Lei ou decreto que fundamenta a licitação</small>
        </div>
      </div>

      ) : null}

      {isEditing || step === 1 ? (
        <div className="admin-form-section">
          <h2 className="admin-section-title">Características</h2>

          <div className="admin-form-grid admin-form-grid-3">
            <div className="admin-form-group">
              <label htmlFor="modality" className="admin-label required">
                Modalidade
              </label>
              <select
                id="modality"
                name="modality"
                value={formData.modality}
                onChange={handleChange}
                className={`admin-input ${validationErrors.modality ? 'admin-input-error' : ''}`}
                required
              >
                <option value="PREGAO_ELETRONICO">Pregão Eletrônico</option>
                <option value="PREGAO_PRESENCIAL">Pregão Presencial</option>
                <option value="CONCORRENCIA">Concorrência</option>
                <option value="TOMADA_PRECOS">Tomada de Preços</option>
                <option value="CONVITE">Convite</option>
                <option value="DISPENSA">Dispensa</option>
                <option value="INEXIGIBILIDADE">Inexigibilidade</option>
              </select>
              {validationErrors.modality && (
                <span className="admin-error-text">{validationErrors.modality}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="type" className="admin-label required">
                Tipo
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`admin-input ${validationErrors.type ? 'admin-input-error' : ''}`}
                required
              >
                <option value="MENOR_PRECO">Menor Preço</option>
                <option value="MELHOR_TECNICA">Melhor Técnica</option>
                <option value="TECNICA_PRECO">Técnica e Preço</option>
              </select>
              {validationErrors.type && (
                <span className="admin-error-text">{validationErrors.type}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Sistema de Registro de Preços</label>
              <div style={{ paddingTop: '0.5rem' }}>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="srp"
                    checked={formData.srp}
                    onChange={handleChange}
                    className="admin-checkbox"
                  />
                  <span>Esta licitação é SRP</span>
                </label>
              </div>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="description" className="admin-label">
              Resumo (exibição pública)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Frase curta para aparecer no topo do edital (opcional)."
              rows={3}
              className="admin-textarea"
            />
            <small className="admin-help-text">
              Dica: use 1 frase (até ~160 caracteres). Se vazio, o site usa a 1ª frase do objeto.
            </small>
          </div>
        </div>
      ) : null}

      {isEditing || step === 2 ? (
        <div className="admin-form-section">
          {!isEditing && (
            <div className="admin-step-guidance">
              <h2 className="admin-section-title">Passo 2: Prazos e Valores</h2>
              <p className="admin-form-hint">
                Defina as datas importantes da licitação e os valores estimados. 
                A data de publicação é obrigatória - as demais podem ser preenchidas conforme necessário.
              </p>
            </div>
          )}
          {isEditing && <h2 className="admin-section-title">Prazos e Valores</h2>}

          <div className="admin-form-grid admin-form-grid-3">
            <div className="admin-form-group">
              <label htmlFor="publicationDate" className="admin-label required">
                Data de Publicação
              </label>
              <input
                type="date"
                id="publicationDate"
                name="publicationDate"
                value={formData.publicationDate}
                onChange={handleChange}
                className={`admin-input ${validationErrors.publicationDate ? 'admin-input-error' : ''}`}
                required
              />
              {validationErrors.publicationDate && (
                <span className="admin-error-text">{validationErrors.publicationDate}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="openingDate" className="admin-label">
                Data de Abertura
              </label>
              <input
                type="date"
                id="openingDate"
                name="openingDate"
                value={formData.openingDate}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="closingDate" className="admin-label">
                Data de Encerramento
              </label>
              <input
                type="date"
                id="closingDate"
                name="closingDate"
                value={formData.closingDate}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="estimatedValue" className="admin-label">
                Valor Estimado (R$)
              </label>
              <input
                type="number"
                id="estimatedValue"
                name="estimatedValue"
                value={formData.estimatedValue}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="finalValue" className="admin-label">
                Valor Final (R$)
              </label>
              <input
                type="number"
                id="finalValue"
                name="finalValue"
                value={formData.finalValue}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="admin-input"
              />
              <small className="admin-help-text">Preencha quando houver resultado/homologação</small>
            </div>
          </div>
        </div>
      ) : null}

      {!isEditing && step === 3 ? (
        <div className="admin-form-section">
          <div className="admin-step-guidance">
            <h2 className="admin-section-title">Passo 3: Anexar Edital (Opcional)</h2>
            <p className="admin-form-hint" style={{ marginTop: 0 }}>
              Você pode anexar o arquivo do edital agora ou fazer isso depois. 
              Se anexar neste momento, o documento será automaticamente cadastrado na fase de Abertura.
            </p>
          </div>

          <div className="admin-card" style={{ marginTop: '1rem' }}>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-label">Arquivo do edital</label>
              <input
                type="file"
                className="admin-input"
                accept=".pdf,.docx,.xlsx,.doc,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setEditalFile(file);
                }}
                disabled={loading}
              />
              <small className="admin-help-text">
                O upload será feito somente após criar a licitação (necessita do ID do processo).
              </small>
            </div>

            {editalFile ? (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div className="admin-form-hint" style={{ margin: 0 }}>
                  Selecionado: <strong>{editalFile?.name}</strong>
                </div>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setEditalFile(null)}
                  disabled={loading}
                >
                  Remover edital
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isEditing && step === 4 ? (
        <div className="admin-form-section">
          <div className="admin-step-guidance">
            <h2 className="admin-section-title">Passo 4: Revisão Final</h2>
            <p className="admin-form-hint">
              Revise todas as informações antes de criar a licitação. 
              Depois de criada, você poderá editar alguns campos e adicionar mais documentos.
            </p>
          </div>

          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--foreground)', fontSize: '1rem' }}>
              Resumo da Licitação
            </h3>
            <div className="admin-form-grid">
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Número</label>
                <div className="admin-form-hint"><strong>{formData.number || '—'}</strong></div>
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Título</label>
                <div className="admin-form-hint"><strong>{formData.title || '—'}</strong></div>
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Modalidade</label>
                <div className="admin-form-hint">{formData.modality?.replace('_', ' ') || '—'}</div>
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Data de Publicação</label>
                <div className="admin-form-hint">{formData.publicationDate ? new Date(formData.publicationDate + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</div>
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Edital Anexado</label>
                <div className="admin-form-hint">
                  {editalFile ? (
                    <span style={{ color: 'var(--success)' }}>Selecionado: {editalFile.name}</span>
                  ) : (
                    <span style={{ color: 'var(--muted)' }}>Não anexado (pode ser feito depois)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      ) : null}

      {!isEditing ? (
        <div className="admin-wizard-footer" aria-label="Ações do assistente">
          <div className="admin-wizard-footer-inner">
            <div className="admin-wizard-footer-hint">
              {step < totalSteps
                ? `Próximo passo: ${getNextStepLabel(step)}`
                : 'Pronto para criar a licitação'}
            </div>
            <div className="admin-wizard-footer-actions">
              {step > 1 && (
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Voltar
                </button>
              )}
              {step < totalSteps ? (
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {`Próximo: ${getNextStepLabel(step)}`}
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Licitação'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
      </form>
    </div>
  );
}
