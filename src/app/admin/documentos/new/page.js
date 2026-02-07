'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  categoriaMacroOptions,
  statusPublicacaoOptions,
  subcategoriasPorMacro,
  limparCamposNaoVisiveis,
  categoriaMacroLabels,
  getCamposObrigatorios,
  getCamposVisiveis,
} from '@/lib/documentosTaxonomy';
import { formatCurrencyBRL } from '@/lib/currencyBRL';
import { getYearFromDateInputUTC } from '@/lib/dateOnly';

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const safeTrim = (value) => (typeof value === 'string' ? value.trim() : '');

export default function NovoDocumentoPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [vigenciaMode, setVigenciaMode] = useState('NONE');

  const [duplicateModal, setDuplicateModal] = useState({
    open: false,
    existingId: null,
    canVersion: false,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugEditing, setSlugEditing] = useState(false);
  const [ordemManuallyEdited, setOrdemManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    categoria_macro: 'INSTITUCIONAL',
    subcategoria: subcategoriasPorMacro.INSTITUCIONAL?.[0] || '',
    categoria_macro_licitacoes: '',
    subcategoria_licitacoes: '',
    ano: new Date().getFullYear(),
    data_documento: '',
    descricao_curta: '',
    orgao_emissor: '',
    numero_documento: '',
    contratada_parceiro: '',
    valor_global: '',
    vigencia_meses: '',
    vigencia_inicio: '',
    vigencia_fim: '',
    periodo: '',
    aparece_em: ['TRANSPARENCIA'],
    status: 'DRAFT',
    ordem_exibicao: '',
  });

  const closeDuplicateModal = () => {
    setDuplicateModal({ open: false, existingId: null, canVersion: false });
  };

  const handleGoToExistingForNewVersion = () => {
    if (!duplicateModal?.existingId) return;
    router.push(`/admin/documentos/${duplicateModal.existingId}?tab=versoes`);
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const apareceEmSet = useMemo(() => new Set(formData.aparece_em), [formData.aparece_em]);

  const subcategoriaOptionsWithCurrent = useMemo(() => {
    const base = subcategoriasPorMacro[formData.categoria_macro] || [];
    if (formData.subcategoria && !base.includes(formData.subcategoria)) {
      return [formData.subcategoria, ...base];
    }
    return base;
  }, [formData.categoria_macro, formData.subcategoria]);

  const categoriaMacroOptionsWithCurrent = useMemo(() => {
    const current = String(formData.categoria_macro || '').trim();
    const hasCurrent = categoriaMacroOptions.some((opt) => opt.value === current);
    if (current && !hasCurrent && categoriaMacroLabels[current]) {
      return [{ value: current, label: categoriaMacroLabels[current] }, ...categoriaMacroOptions];
    }
    return categoriaMacroOptions;
  }, [formData.categoria_macro]);

  const camposVisiveis = useMemo(
    () => getCamposVisiveis(formData.categoria_macro, formData.subcategoria),
    [formData.categoria_macro, formData.subcategoria]
  );

  const camposObrigatorios = useMemo(
    () => getCamposObrigatorios(formData.categoria_macro, formData.subcategoria),
    [formData.categoria_macro, formData.subcategoria]
  );

  const numeroDocumentoLabel = useMemo(() => {
    return formData.categoria_macro === 'CONTRATOS_PARCERIAS' ? 'Número' : 'Número do documento';
  }, [formData.categoria_macro]);

  const subcategoriaLicitacoesOptions = useMemo(() => {
    const base = subcategoriasPorMacro[formData.categoria_macro_licitacoes] || [];
    if (formData.subcategoria_licitacoes && !base.includes(formData.subcategoria_licitacoes)) {
      return [formData.subcategoria_licitacoes, ...base];
    }
    return base;
  }, [formData.categoria_macro_licitacoes, formData.subcategoria_licitacoes]);

  const fetchOrdemSugerida = async (categoriaMacro) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;

    const res = await fetch(`/api/admin/documentos/ordem-sugerida?categoria_macro=${encodeURIComponent(categoriaMacro)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json().catch(() => null);

    if (res.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
      return null;
    }

    if (!res.ok) return null;

    const suggested = data?.data?.suggested_ordem_exibicao;
    if (typeof suggested !== 'number') return null;
    return suggested;
  };

  const applySuggestedOrdemIfAllowed = async (categoriaMacro) => {
    const suggested = await fetchOrdemSugerida(categoriaMacro);
    if (suggested === null) return;

    setFormData((prev) => {
      if (ordemManuallyEdited) return prev;
      const raw = prev.ordem_exibicao;
      const isEmpty = raw === '' || raw === null || raw === undefined;
      if (!isEmpty) return prev;
      if (prev.categoria_macro !== categoriaMacro) return prev;
      return { ...prev, ordem_exibicao: suggested };
    });
  };

  useEffect(() => {
    if (!formData.categoria_macro) return;
    if (ordemManuallyEdited) return;

    const raw = formData.ordem_exibicao;
    const isEmpty = raw === '' || raw === null || raw === undefined;
    if (!isEmpty) return;

    applySuggestedOrdemIfAllowed(formData.categoria_macro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.categoria_macro, ordemManuallyEdited]);

  const toggleApareceEm = (value) => {
    setFormData((prev) => {
      const next = new Set(prev.aparece_em);
      if (next.has(value)) {
        next.delete(value);
        if (value === 'LICITACOES') {
          return {
            ...prev,
            aparece_em: Array.from(next),
            categoria_macro_licitacoes: '',
            subcategoria_licitacoes: '',
          };
        }

        return { ...prev, aparece_em: Array.from(next) };
      }

      next.add(value);
      return { ...prev, aparece_em: Array.from(next) };
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name === 'titulo') {
      setFormData((prev) => {
        const nextTitulo = value;
        const next = { ...prev, titulo: nextTitulo };

        if (!slugManuallyEdited) {
          next.slug = slugify(nextTitulo);
        }

        return next;
      });
      return;
    }

    if (name === 'slug') {
      setSlugManuallyEdited(true);
    }

    if (name === 'data_documento') {
      const nextYear = getYearFromDateInputUTC(value);
      setFormData((prev) => ({
        ...prev,
        data_documento: value,
        ano: typeof nextYear === 'number' ? nextYear : prev.ano,
      }));
      return;
    }

    if (name === 'ordem_exibicao') {
      setOrdemManuallyEdited(true);
    }

    if (name === 'categoria_macro') {
      const nextMacro = value;
      const nextSubcats = subcategoriasPorMacro[nextMacro] || [];
      const nextSub = nextSubcats.includes(formData.subcategoria) ? formData.subcategoria : (nextSubcats[0] || '');

      if (nextMacro !== 'CONTRATOS_PARCERIAS') {
        setVigenciaMode('NONE');
      }

      setFormData((prev) => ({
        ...limparCamposNaoVisiveis(prev, nextMacro, nextSub),
        categoria_macro: nextMacro,
        subcategoria: nextSub,
      }));
      return;
    }

    if (name === 'subcategoria') {
      const nextSub = value;
      setFormData((prev) => ({
        ...limparCamposNaoVisiveis(prev, prev.categoria_macro, nextSub),
        subcategoria: nextSub,
      }));
      return;
    }

    if (name === 'categoria_macro_licitacoes') {
      const nextMacro = value;
      const nextSubcats = subcategoriasPorMacro[nextMacro] || [];
      setFormData((prev) => ({
        ...prev,
        categoria_macro_licitacoes: nextMacro,
        subcategoria_licitacoes: nextSubcats.includes(prev.subcategoria_licitacoes)
          ? prev.subcategoria_licitacoes
          : (nextSubcats[0] || ''),
      }));
      return;
    }

    if (name === 'subcategoria_licitacoes' && !safeTrim(formData.categoria_macro_licitacoes)) {
      setFormData((prev) => ({ ...prev, subcategoria_licitacoes: '' }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleValorGlobalBlur = () => {
    setFormData((prev) => ({ 
      ...prev, 
      valor_global: prev.valor_global ? formatCurrencyBRL(prev.valor_global) : '' 
    }));
  };

  const handleVigenciaModeChange = (e) => {
    const next = e.target.value;
    setVigenciaMode(next);

    setFormData((prev) => {
      if (next === 'MESES') {
        return { ...prev, vigencia_inicio: '', vigencia_fim: '' };
      }
      if (next === 'PERIODO') {
        return { ...prev, vigencia_meses: '' };
      }
      return { ...prev, vigencia_meses: '', vigencia_inicio: '', vigencia_fim: '' };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.titulo.trim()) return setError('Título é obrigatório');
    if (!formData.subcategoria.trim()) return setError('Tipo de documento é obrigatório');
    if (!formData.ano || formData.ano < 1900 || formData.ano > new Date().getFullYear() + 10) {
      return setError('Ano é obrigatório e deve ser válido');
    }
    if (!formData.data_documento.trim()) return setError('Data do documento é obrigatória');
    if (!formData.descricao_curta.trim()) return setError('Descrição curta é obrigatória');
    if (!Array.isArray(formData.aparece_em) || formData.aparece_em.length === 0) {
      return setError('Selecione ao menos um destino (Transparência e/ou Licitações)');
    }

    // Validações específicas por categoria
    const required = getCamposObrigatorios(formData.categoria_macro, formData.subcategoria);

    if (required.has('orgao_emissor') && !safeTrim(formData.orgao_emissor)) {
      return setError('Órgão emissor é obrigatório para este tipo de documento');
    }
    if (required.has('numero_documento') && !safeTrim(formData.numero_documento)) {
      return setError('Número do documento é obrigatório para este tipo de documento');
    }
    if (required.has('contratada_parceiro') && !safeTrim(formData.contratada_parceiro)) {
      return setError('Contratada/Parceiro é obrigatório para este tipo de documento');
    }
    if (required.has('valor_global') && !safeTrim(formData.valor_global)) {
      return setError('Valor global é obrigatório para este tipo de documento');
    }
    if (required.has('periodo') && !safeTrim(formData.periodo)) {
      return setError('Período é obrigatório para este tipo de documento');
    }

    if (vigenciaMode === 'MESES') {
      const raw = String(formData.vigencia_meses ?? '').trim();
      const months = raw ? parseInt(raw, 10) : NaN;
      if (!Number.isInteger(months) || months <= 0) {
        return setError('Informe a vigência em meses (maior que 0)');
      }
    }

    if (vigenciaMode === 'PERIODO') {
      if (!safeTrim(formData.vigencia_inicio) || !safeTrim(formData.vigencia_fim)) {
        return setError('Informe a vigência por período (início e fim)');
      }
      if (formData.vigencia_inicio > formData.vigencia_fim) {
        return setError('Vigência: a data de início deve ser menor ou igual à data de fim');
      }
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const payload = { ...formData };
      if (vigenciaMode === 'NONE') {
        payload.vigencia_meses = '';
        payload.vigencia_inicio = '';
        payload.vigencia_fim = '';
      }
      if (vigenciaMode === 'MESES') {
        payload.vigencia_inicio = '';
        payload.vigencia_fim = '';
      }
      if (vigenciaMode === 'PERIODO') {
        payload.vigencia_meses = '';
      }

      const res = await fetch('/api/admin/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 409 && data?.code === 'DUPLICATE_DOCUMENT') {
        setDuplicateModal({
          open: true,
          existingId: data?.existingId || null,
          canVersion: Boolean(data?.canVersion),
        });
        return;
      }

      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
        return;
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao criar documento');
      }

      if (data.success) {
        router.push(`/admin/documentos/${data.data.id}?tab=versoes`);
      }
    } catch (err) {
      setError(err?.message || 'Erro ao criar documento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Novo Documento</h1>
          <p className="admin-page-subtitle">Preencha os dados fixos do documento e, em seguida, adicione o PDF (versão).</p>
        </div>
        <Link href="/admin/documentos" className="admin-btn-secondary">
          ← Voltar
        </Link>
      </header>

      {duplicateModal.open && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Documento já existe</h2>
              <button type="button" className="admin-modal-close" onClick={closeDuplicateModal} aria-label="Fechar">
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              {duplicateModal.canVersion ? (
                <p>Este documento já existe. Deseja criar uma nova versão?</p>
              ) : (
                <p>
                  Este tipo de documento <strong>não permite versionamento</strong>. Para alterações, crie um novo documento
                  mantendo o PDF anterior como histórico separado.
                </p>
              )}
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn-secondary" onClick={closeDuplicateModal}>
                Cancelar
              </button>
              {duplicateModal.canVersion && (
                <button type="button" className="admin-btn-primary" onClick={handleGoToExistingForNewVersion}>
                  Criar nova versão
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="admin-error">
          <p>Erro: {error}</p>
        </div>
      )}

      <div className="admin-doc-stepper" aria-label="Etapas do cadastro">
        <button
          type="button"
          className="admin-doc-step"
          data-state="active"
          aria-current="step"
        >
          <div className="admin-doc-step-dot">1</div>
          <div>
            <div className="admin-doc-step-title">Metadados</div>
            <div className="admin-doc-step-sub">Preencha as informações do documento</div>
          </div>
        </button>
        <button
          type="button"
          className="admin-doc-step"
          data-state="pending"
          disabled
          title="Salve os metadados para liberar o upload do PDF"
        >
          <div className="admin-doc-step-dot">2</div>
          <div>
            <div className="admin-doc-step-title">Versão PDF</div>
            <div className="admin-doc-step-sub">Disponível após salvar</div>
          </div>
        </button>
      </div>

      <div className="admin-inline-muted" style={{ marginBottom: '1rem' }}>
        Passo 2 (Versão PDF) fica disponível após salvar os metadados.
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-doc-form-block">
          <h2 className="admin-doc-form-block-title">Identificação do Documento</h2>

          <div className="admin-form-group">
            <label className="admin-form-label">Título <span className="admin-required">*</span></label>
            <input
              name="titulo"
              className="admin-form-input"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-form-group">
            <div className="admin-form-label-row">
              <label className="admin-form-label">Slug</label>
              <button
                type="button"
                className="admin-btn-sm admin-btn-secondary"
                onClick={() => {
                  setSlugEditing((prev) => {
                    const next = !prev;
                    if (next) setSlugManuallyEdited(true);
                    return next;
                  });
                }}
              >
                {slugEditing ? 'Concluir slug' : 'Editar slug'}
              </button>
            </div>
            <input
              name="slug"
              className="admin-form-input"
              value={formData.slug}
              onChange={handleChange}
              readOnly={!slugEditing}
            />
            <span className="admin-help-text">Gerado automaticamente a partir do título.</span>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Descrição curta <span className="admin-required">*</span></label>
            <textarea
              name="descricao_curta"
              className="admin-form-input"
              rows={4}
              value={formData.descricao_curta}
              onChange={handleChange}
              placeholder="1-2 linhas descrevendo o documento"
              required
            />
            <div className="admin-form-meta-row">
              <span>Resumo exibido na listagem pública.</span>
              <span>{String(formData.descricao_curta || '').length} caracteres</span>
            </div>
          </div>
        </div>

        <div className="admin-doc-form-block">
          <h2 className="admin-doc-form-block-title">Classificação</h2>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Categoria Macro <span className="admin-required">*</span></label>
              <select
                name="categoria_macro"
                className="admin-form-input"
                value={formData.categoria_macro}
                onChange={handleChange}
                required
              >
                {categoriaMacroOptionsWithCurrent.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Tipo <span className="admin-required">*</span></label>
              <select
                name="subcategoria"
                className="admin-form-input"
                value={formData.subcategoria}
                onChange={handleChange}
                required
              >
                {subcategoriaOptionsWithCurrent.length === 0 && (
                  <option value="">Nenhum tipo cadastrado</option>
                )}
                {subcategoriaOptionsWithCurrent.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {camposVisiveis.has('orgao_emissor') && (
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Órgão emissor{camposObrigatorios.has('orgao_emissor') ? ' ' : ' (opcional)'}
                  {camposObrigatorios.has('orgao_emissor') && <span className="admin-required">*</span>}
                </label>
                <input
                  name="orgao_emissor"
                  className="admin-form-input"
                  value={formData.orgao_emissor}
                  onChange={handleChange}
                  required={camposObrigatorios.has('orgao_emissor')}
                />
              </div>
            )}
          </div>

          <div className="admin-form-row admin-form-row-end">
            {camposVisiveis.has('numero_documento') && (
              <div className="admin-form-group">
                <label className="admin-form-label">
                  {numeroDocumentoLabel}{camposObrigatorios.has('numero_documento') ? ' ' : ' (opcional)'}
                  {camposObrigatorios.has('numero_documento') && <span className="admin-required">*</span>}
                </label>
                <input
                  name="numero_documento"
                  className="admin-form-input"
                  value={formData.numero_documento}
                  onChange={handleChange}
                  placeholder="Ex: 001/2026"
                  required={camposObrigatorios.has('numero_documento')}
                />
              </div>
            )}

            <div className="admin-form-group">
              <label className="admin-form-label">Ano <span className="admin-required">*</span></label>
              <input
                name="ano"
                type="number"
                className="admin-form-input"
                value={formData.ano}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear() + 10}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Data do documento <span className="admin-required">*</span></label>
              <input
                name="data_documento"
                type="date"
                className="admin-form-input"
                value={formData.data_documento}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Campos específicos por tipo (categoria + subcategoria) */}
          {camposVisiveis.size > 0 && (
            <div style={{ marginTop: '1rem' }}>

              {(camposVisiveis.has('contratada_parceiro') || camposVisiveis.has('valor_global')) && (
                <>
                  <div className="admin-form-row">
                    {camposVisiveis.has('contratada_parceiro') && (
                      <div className="admin-form-group">
                        <label className="admin-form-label">
                          Contratada / Parceiro{camposObrigatorios.has('contratada_parceiro') ? ' ' : ' (opcional)'}
                          {camposObrigatorios.has('contratada_parceiro') && <span className="admin-required">*</span>}
                        </label>
                        <input
                          name="contratada_parceiro"
                          className="admin-form-input"
                          value={formData.contratada_parceiro}
                          onChange={handleChange}
                          required={camposObrigatorios.has('contratada_parceiro')}
                        />
                      </div>
                    )}

                    {camposVisiveis.has('valor_global') && (
                      <div className="admin-form-group">
                        <label className="admin-form-label">
                          Valor global (R$){camposObrigatorios.has('valor_global') ? ' ' : ' (opcional)'}
                          {camposObrigatorios.has('valor_global') && <span className="admin-required">*</span>}
                        </label>
                        <input
                          name="valor_global"
                          type="text"
                          inputMode="decimal"
                          className="admin-form-input"
                          value={formData.valor_global}
                          onChange={handleChange}
                          onBlur={handleValorGlobalBlur}
                          placeholder="0,00"
                          required={camposObrigatorios.has('valor_global')}
                        />
                      </div>
                    )}
                  </div>

                  {(camposVisiveis.has('vigencia_meses') || camposVisiveis.has('vigencia_inicio') || camposVisiveis.has('vigencia_fim')) && (
                    <>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Vigência</label>
                          <select
                            className="admin-form-input"
                            value={vigenciaMode}
                            onChange={handleVigenciaModeChange}
                          >
                            <option value="NONE">Não informar</option>
                            <option value="MESES">Por meses</option>
                            <option value="PERIODO">Por período (início/fim)</option>
                          </select>
                        </div>
                      </div>

                      {vigenciaMode === 'MESES' && camposVisiveis.has('vigencia_meses') && (
                        <div className="admin-form-row">
                          <div className="admin-form-group">
                            <label className="admin-form-label">Vigência (meses)</label>
                            <input
                              name="vigencia_meses"
                              type="number"
                              className="admin-form-input"
                              value={formData.vigencia_meses}
                              onChange={handleChange}
                              placeholder="Ex: 12"
                              min="1"
                            />
                          </div>
                        </div>
                      )}

                      {vigenciaMode === 'PERIODO' && (
                        <div className="admin-form-row">
                          {camposVisiveis.has('vigencia_inicio') && (
                            <div className="admin-form-group">
                              <label className="admin-form-label">Vigência - Início</label>
                              <input
                                name="vigencia_inicio"
                                type="date"
                                className="admin-form-input"
                                value={formData.vigencia_inicio}
                                onChange={handleChange}
                              />
                            </div>
                          )}
                          {camposVisiveis.has('vigencia_fim') && (
                            <div className="admin-form-group">
                              <label className="admin-form-label">Vigência - Fim</label>
                              <input
                                name="vigencia_fim"
                                type="date"
                                className="admin-form-input"
                                value={formData.vigencia_fim}
                                onChange={handleChange}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {camposVisiveis.has('periodo') && (
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Período{camposObrigatorios.has('periodo') ? ' ' : ' (opcional)'}
                    {camposObrigatorios.has('periodo') && <span className="admin-required">*</span>}
                  </label>
                  <input
                    name="periodo"
                    className="admin-form-input"
                    value={formData.periodo}
                    onChange={handleChange}
                    placeholder="Ex: Janeiro/2026, 1º Trimestre 2026, Exercício 2025"
                    required={camposObrigatorios.has('periodo')}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="admin-doc-form-block">
          <h2 className="admin-doc-form-block-title">Publicação e Exibição</h2>

          <div className="admin-form-group">
            <label className="admin-form-label">Destino <span className="admin-required">*</span></label>
            <div className="admin-segmented" role="group" aria-label="Destino do documento">
              <button
                type="button"
                className="admin-segmented-btn"
                aria-pressed={apareceEmSet.has('TRANSPARENCIA')}
                onClick={() => toggleApareceEm('TRANSPARENCIA')}
              >
                Transparência
              </button>
              <button
                type="button"
                className="admin-segmented-btn"
                aria-pressed={apareceEmSet.has('LICITACOES')}
                onClick={() => toggleApareceEm('LICITACOES')}
              >
                Licitações
              </button>
            </div>
          </div>

          {apareceEmSet.has('LICITACOES') && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Classificação para Licitações (opcional)</h3>
              <p className="admin-inline-muted" style={{ marginTop: '0.35rem' }}>
                Use quando o documento precisa aparecer em Licitações com categoria/subcategoria diferentes da classificação principal.
              </p>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Categoria Macro (Licitações)</label>
                  <select
                    name="categoria_macro_licitacoes"
                    className="admin-form-input"
                    value={formData.categoria_macro_licitacoes}
                    onChange={handleChange}
                  >
                    <option value="">(usar classificação principal)</option>
                    {categoriaMacroOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Tipo (Licitações)</label>
                  <input
                    name="subcategoria_licitacoes"
                    className="admin-form-input"
                    value={formData.subcategoria_licitacoes}
                    onChange={handleChange}
                    list="subcategoria-licitacoes-suggestions"
                    placeholder="Escolha uma sugestão ou digite outra"
                    disabled={!formData.categoria_macro_licitacoes}
                  />
                  <datalist id="subcategoria-licitacoes-suggestions">
                    {subcategoriaLicitacoesOptions.map((sub) => (
                      <option key={sub} value={sub} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          )}

          <div className="admin-form-row admin-form-row-end">
            <div className="admin-form-group">
              <label className="admin-form-label">Status</label>
              <select
                name="status"
                className="admin-form-input"
                value={formData.status}
                onChange={handleChange}
              >
                {statusPublicacaoOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <div className="admin-form-label-row">
                <label className="admin-form-label">Prioridade na listagem</label>
                <span className="admin-tooltip" title="Quanto menor o número, mais acima o documento aparece." aria-label="Ajuda">
                  ?
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  name="ordem_exibicao"
                  type="number"
                  className="admin-form-input"
                  value={formData.ordem_exibicao}
                  onChange={handleChange}
                  placeholder="Automático"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="admin-btn-sm admin-btn-secondary"
                  onClick={async () => {
                    setOrdemManuallyEdited(false);
                    setFormData((prev) => ({ ...prev, ordem_exibicao: '' }));
                    await applySuggestedOrdemIfAllowed(formData.categoria_macro);
                  }}
                >
                  Auto
                </button>
              </div>
              <span className="admin-help-text">Deixe vazio (ou clique em Auto) para sugerir automaticamente.</span>
            </div>
          </div>

          <div className="admin-form-actions">
            <button className="admin-btn-primary" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar metadados e enviar PDF'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
