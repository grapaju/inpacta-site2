'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DocumentUpload from '@/components/admin/DocumentUpload';
import StatusBadge from '@/components/admin/StatusBadge';
import { formatDateOnlyPtBR, getYearFromDateInputUTC } from '@/lib/dateOnly';
import { canCreateNewVersion } from '@/lib/documentosVersioning';
import { formatCurrencyBRL } from '@/lib/currencyBRL';

import {
  categoriaMacroOptions,
  subcategoriasPorMacro,
  categoriaMacroLabels,
  statusPublicacaoOptions,
  statusNormativoOptions,
  statusContratoOptions,
  limparCamposNaoVisiveis,
  getCamposObrigatorios,
  getCamposVisiveis,
  getRegrasVersaoPorTipo,
} from '@/lib/documentosTaxonomy';

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

function toDateInputValue(value) {
  if (!value) return '';
  if (typeof value === 'string' && value.includes('T')) return value.split('T')[0];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function formatDate(dateString) {
  return formatDateOnlyPtBR(dateString);
}

function fileNameFromPath(filePath) {
  if (!filePath) return '';
  const parts = String(filePath).split('/');
  return parts[parts.length - 1] || filePath;
}

export default function DocumentoAdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const documentoId = params.id;

  const [activeTab, setActiveTab] = useState('metadados');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [documento, setDocumento] = useState(null);
  const [vigenciaMode, setVigenciaMode] = useState('NONE');

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugEditing, setSlugEditing] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    categoria_macro: 'INSTITUCIONAL',
    subcategoria: '',
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
    aparece_em: [],
    status: 'DRAFT',
    ordem_exibicao: 0,
  });

  const [novaVersao, setNovaVersao] = useState({
    numero_identificacao: '',
    data_aprovacao: '',
    descricao_alteracao: '',
    status_normativo: 'VIGENTE',
    status_contrato: 'VIGENTE',
    arquivo_pdf: '',
    file_size: 0,
    file_hash: '',
  });

  const apareceEmSet = useMemo(() => new Set(formData.aparece_em), [formData.aparece_em]);

  const categoriaMacroOptionsWithCurrent = useMemo(() => {
    const current = String(formData.categoria_macro || '').trim();
    const hasCurrent = categoriaMacroOptions.some((opt) => opt.value === current);
    if (current && !hasCurrent && categoriaMacroLabels[current]) {
      return [{ value: current, label: categoriaMacroLabels[current] }, ...categoriaMacroOptions];
    }
    return categoriaMacroOptions;
  }, [formData.categoria_macro]);

  const categoriaMacroLicitacoesOptionsWithCurrent = useMemo(() => {
    const current = String(formData.categoria_macro_licitacoes || '').trim();
    if (!current) return categoriaMacroOptions;
    const hasCurrent = categoriaMacroOptions.some((opt) => opt.value === current);
    if (!hasCurrent && categoriaMacroLabels[current]) {
      return [{ value: current, label: categoriaMacroLabels[current] }, ...categoriaMacroOptions];
    }
    return categoriaMacroOptions;
  }, [formData.categoria_macro_licitacoes]);

  const camposVisiveis = useMemo(
    () => getCamposVisiveis(formData.categoria_macro, formData.subcategoria),
    [formData.categoria_macro, formData.subcategoria]
  );

  const camposObrigatorios = useMemo(
    () => getCamposObrigatorios(formData.categoria_macro, formData.subcategoria),
    [formData.categoria_macro, formData.subcategoria]
  );

  const regrasVersao = useMemo(
    () => getRegrasVersaoPorTipo(formData.categoria_macro, formData.subcategoria),
    [formData.categoria_macro, formData.subcategoria]
  );

  const canVersion = useMemo(
    () => canCreateNewVersion(formData.categoria_macro, formData.subcategoria),
    [formData.categoria_macro, formData.subcategoria]
  );

  const canAddVersion = Boolean(canVersion || !documento?.versaoVigente);

  // Bloqueia alteração de categoria/tipo apenas quando está publicado E tem versão vigente
  // Usa formData.status (estado atual do form) ao invés de documento.status (estado salvo)
  const lockCategoriaTipo = Boolean(formData.status === 'PUBLISHED' && documento?.versaoVigente);

  const numeroDocumentoLabel = useMemo(() => {
    return formData.categoria_macro === 'CONTRATOS_PARCERIAS' ? 'Número' : 'Número do documento';
  }, [formData.categoria_macro]);

  const subcategoriaOptions = useMemo(() => {
    const base = subcategoriasPorMacro[formData.categoria_macro] || [];
    if (formData.subcategoria && !base.includes(formData.subcategoria)) {
      return [formData.subcategoria, ...base];
    }
    return base;
  }, [formData.categoria_macro, formData.subcategoria]);

  const subcategoriaLicitacoesOptions = useMemo(() => {
    const base = subcategoriasPorMacro[formData.categoria_macro_licitacoes] || [];
    if (formData.subcategoria_licitacoes && !base.includes(formData.subcategoria_licitacoes)) {
      return [formData.subcategoria_licitacoes, ...base];
    }
    return base;
  }, [formData.categoria_macro_licitacoes, formData.subcategoria_licitacoes]);

  const toggleApareceEm = (value) => {
    setFormData((prev) => {
      const next = new Set(prev.aparece_em);
      if (next.has(value)) {
        next.delete(value);
        return { ...prev, aparece_em: Array.from(next) };
      }

      next.add(value);

      // Para Licitações, a classificação secundária é opcional.
      // Não preenche automaticamente com um valor não suportado pelo enum do banco.
      if (value === 'LICITACOES') {
        return { ...prev, aparece_em: Array.from(next) };
      }

      return { ...prev, aparece_em: Array.from(next) };
    });
  };

  const fetchDocumento = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const res = await fetch(`/api/admin/documentos/${documentoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
        return;
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao carregar documento');
      }

      if (data.success) {
        const doc = data.data;
        setDocumento(doc);
        const categoriaMacro = doc.categoriaMacro || 'INSTITUCIONAL';
        const subcats = subcategoriasPorMacro[categoriaMacro] || [];
        setSlugManuallyEdited(Boolean(doc.slug));
        const nextFormData = {
          titulo: doc.titulo || '',
          slug: doc.slug || '',
          categoria_macro: categoriaMacro,
          subcategoria: doc.subcategoria || subcats[0] || '',
          categoria_macro_licitacoes: doc.categoriaMacroLicitacoes || '',
          subcategoria_licitacoes: doc.categoriaMacroLicitacoes ? (doc.subcategoriaLicitacoes || '') : '',
          ano: doc.ano ?? new Date().getFullYear(),
          data_documento: toDateInputValue(doc.dataDocumento),
          descricao_curta: doc.descricaoCurta || '',
          orgao_emissor: doc.orgaoEmissor || '',
          numero_documento: doc.numeroDocumento || '',
          contratada_parceiro: doc.contratadaParceiro || '',
          valor_global: doc.valorGlobal ? formatCurrencyBRL(String(doc.valorGlobal)) : '',
          vigencia_meses: doc.vigenciaMeses ?? '',
          vigencia_inicio: toDateInputValue(doc.vigenciaInicio),
          vigencia_fim: toDateInputValue(doc.vigenciaFim),
          periodo: doc.periodo || '',
          aparece_em: Array.isArray(doc.apareceEm) ? doc.apareceEm : [],
          status: doc.status || 'DRAFT',
          ordem_exibicao: doc.ordemExibicao ?? 0,
        };

        setFormData(nextFormData);

        if (categoriaMacro !== 'CONTRATOS_PARCERIAS') {
          setVigenciaMode('NONE');
        } else if (String(nextFormData.vigencia_meses ?? '').trim()) {
          setVigenciaMode('MESES');
        } else if (safeTrim(nextFormData.vigencia_inicio) || safeTrim(nextFormData.vigencia_fim)) {
          setVigenciaMode('PERIODO');
        } else {
          setVigenciaMode('NONE');
        }
      }
    } catch (err) {
      setError(err?.message || 'Erro ao carregar documento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!documentoId) return;
    fetchDocumento();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentoId]);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'versoes' || tab === 'metadados') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!metaSaved) return;
    const t = setTimeout(() => setMetaSaved(false), 2200);
    return () => clearTimeout(t);
  }, [metaSaved]);

  const setTab = (nextTab) => {
    setActiveTab(nextTab);

    const nextParams = new URLSearchParams(searchParams?.toString() || '');
    if (nextTab === 'metadados') nextParams.delete('tab');
    else nextParams.set('tab', nextTab);

    const qs = nextParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const goToVersoesAndScroll = () => {
    setTab('versoes');

    setTimeout(() => {
      const upload = document.getElementById('admin-doc-upload');
      if (upload) {
        upload.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const versionsTop = document.getElementById('admin-doc-versions');
      versionsTop?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleMetaChange = (e) => {
    const { name, value, type } = e.target;

    if (lockCategoriaTipo && (name === 'categoria_macro' || name === 'subcategoria')) {
      return;
    }

    if (name === 'titulo') {
      setFormData((prev) => {
        const nextTitulo = value;
        const next = { ...prev, titulo: nextTitulo };

        // Só sugere/atualiza slug se o usuário não travou manualmente e se estiver vazio
        if (!slugManuallyEdited && !String(prev.slug || '').trim()) {
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

  const handleSalvarMetadados = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMetaSaved(false);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      if (!formData.titulo.trim()) throw new Error('Título é obrigatório');
      if (!formData.subcategoria.trim()) throw new Error('Tipo de documento é obrigatório');
      if (!formData.ano || formData.ano < 1900 || formData.ano > new Date().getFullYear() + 10) {
        throw new Error('Ano é obrigatório e deve ser válido');
      }
      if (!String(formData.data_documento || '').trim()) throw new Error('Data do documento é obrigatória');
      if (!formData.descricao_curta.trim()) throw new Error('Descrição curta é obrigatória');

      const required = getCamposObrigatorios(formData.categoria_macro, formData.subcategoria);

      if (required.has('orgao_emissor') && !safeTrim(formData.orgao_emissor)) {
        throw new Error('Órgão emissor é obrigatório para este tipo de documento');
      }
      if (required.has('numero_documento') && !safeTrim(formData.numero_documento)) {
        throw new Error('Número do documento é obrigatório para este tipo de documento');
      }
      if (required.has('contratada_parceiro') && !safeTrim(formData.contratada_parceiro)) {
        throw new Error('Contratada/Parceiro é obrigatório para este tipo de documento');
      }
      if (required.has('valor_global') && !safeTrim(formData.valor_global)) {
        throw new Error('Valor global é obrigatório para este tipo de documento');
      }
      if (required.has('periodo') && !safeTrim(formData.periodo)) {
        throw new Error('Período é obrigatório para este tipo de documento');
      }
      if (!Array.isArray(formData.aparece_em) || formData.aparece_em.length === 0) {
        throw new Error('Selecione ao menos um destino (Transparência e/ou Licitações)');
      }

      if (vigenciaMode === 'MESES') {
        const raw = String(formData.vigencia_meses ?? '').trim();
        const months = raw ? parseInt(raw, 10) : NaN;
        if (!Number.isInteger(months) || months <= 0) {
          throw new Error('Informe a vigência em meses (maior que 0)');
        }
      }

      if (vigenciaMode === 'PERIODO') {
        if (!safeTrim(formData.vigencia_inicio) || !safeTrim(formData.vigencia_fim)) {
          throw new Error('Informe a vigência por período (início e fim)');
        }
        if (formData.vigencia_inicio > formData.vigencia_fim) {
          throw new Error('Vigência: a data de início deve ser menor ou igual à data de fim');
        }
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

      const res = await fetch(`/api/admin/documentos/${documentoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao salvar metadados');
      }

      if (data.success) {
        await fetchDocumento();
        setMetaSaved(true);
      }
    } catch (err) {
      setError(err?.message || 'Erro ao salvar metadados');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadComplete = (upload) => {
    setNovaVersao((prev) => ({
      ...prev,
      arquivo_pdf: upload.filePath,
      file_size: upload.fileSize,
      file_hash: upload.fileHash,
    }));
  };

  const handleNovaVersaoChange = (e) => {
    const { name, value } = e.target;
    setNovaVersao((prev) => ({ ...prev, [name]: value }));
  };

  const handleCriarVersao = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      if (!novaVersao.numero_identificacao.trim()) throw new Error('Número/Identificação é obrigatório');
      if (!novaVersao.data_aprovacao) throw new Error('Data de aprovação é obrigatória');

      const rules = getRegrasVersaoPorTipo(formData.categoria_macro, formData.subcategoria);
      if (rules.requiresStatusNormativo && !safeTrim(novaVersao.status_normativo)) {
        throw new Error('Status (normativo) é obrigatório para este tipo de documento');
      }
      if (rules.requiresStatusContrato && !safeTrim(novaVersao.status_contrato)) {
        throw new Error('Status (contrato) é obrigatório para este tipo de documento');
      }

      if (!novaVersao.arquivo_pdf) throw new Error('Faça o upload do PDF');
      if (!novaVersao.file_size) throw new Error('file_size ausente (reenvie o PDF)');
      if (!novaVersao.file_hash) throw new Error('file_hash ausente (reenvie o PDF)');

      const res = await fetch(`/api/admin/documentos/${documentoId}/versoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novaVersao),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao criar versão');
      }

      if (data.success) {
        setNovaVersao({
          numero_identificacao: '',
          data_aprovacao: '',
          descricao_alteracao: '',
          status_normativo: 'VIGENTE',
          status_contrato: 'VIGENTE',
          arquivo_pdf: '',
          file_size: 0,
          file_hash: '',
        });
        await fetchDocumento();
      }
    } catch (err) {
      setError(err?.message || 'Erro ao criar versão');
    } finally {
      setSaving(false);
    }
  };

  const handleTornarVigente = async (versaoId) => {
    if (!confirm('Definir esta versão como vigente?')) return;

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const res = await fetch(
        `/api/admin/documentos/${documentoId}/versoes/${versaoId}/tornar-vigente`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao tornar vigente');
      }

      if (data.success) {
        await fetchDocumento();
      }
    } catch (err) {
      setError(err?.message || 'Erro ao tornar vigente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Documento</h1>
          <p className="admin-page-subtitle">{documento?.titulo || '-'}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <StatusBadge status={formData.status} />
          <Link href="/admin/documentos" className="admin-btn-secondary">
            ← Voltar
          </Link>
        </div>
      </header>

      {error && (
        <div className="admin-error">
          <p>Erro: {error}</p>
        </div>
      )}

      <div className="admin-doc-stepper" aria-label="Etapas do documento">
        <button
          type="button"
          className="admin-doc-step"
          data-state={activeTab === 'metadados' ? 'active' : (documento ? 'completed' : 'pending')}
          onClick={() => setTab('metadados')}
          disabled={loading}
        >
          <div className="admin-doc-step-dot">
            {activeTab === 'metadados' ? '1' : (documento ? '✓' : '1')}
          </div>
          <div>
            <div className="admin-doc-step-title">Metadados</div>
            <div className="admin-doc-step-sub">Dados e classificação</div>
          </div>
        </button>

        <button
          type="button"
          className="admin-doc-step"
          data-state={activeTab === 'versoes' ? 'active' : (documento?.versaoVigente ? 'completed' : 'pending')}
          onClick={goToVersoesAndScroll}
          disabled={loading || !documento}
          title={!documento?.versaoVigente ? 'Ainda não há PDF vigente' : undefined}
        >
          <div className="admin-doc-step-dot">
            {activeTab === 'versoes' ? '2' : (documento?.versaoVigente ? '✓' : '2')}
          </div>
          <div>
            <div className="admin-doc-step-title">Versão PDF</div>
            <div className="admin-doc-step-sub">
              {documento?.versaoVigente ? 'PDF vigente configurado' : 'Pendente'}
            </div>
          </div>
        </button>
      </div>

      {activeTab === 'metadados' && (
        <form className="admin-form" onSubmit={handleSalvarMetadados}>
          <div className="admin-doc-form-block">
            <h2 className="admin-doc-form-block-title">Identificação do Documento</h2>

            <div className="admin-form-group">
              <label className="admin-form-label">Título <span className="admin-required">*</span></label>
              <input
                name="titulo"
                className="admin-form-input"
                value={formData.titulo}
                onChange={handleMetaChange}
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
                onChange={handleMetaChange}
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
                onChange={handleMetaChange}
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
                <div className="admin-form-label-row">
                  <label className="admin-form-label">Categoria Macro <span className="admin-required">*</span></label>
                  {lockCategoriaTipo && (
                    <span className="admin-badge-lock">🔒 Bloqueado após publicação</span>
                  )}
                </div>
                <select
                  name="categoria_macro"
                  className="admin-form-input"
                  value={formData.categoria_macro}
                  onChange={handleMetaChange}
                  disabled={lockCategoriaTipo}
                  required
                >
                  {categoriaMacroOptionsWithCurrent.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <div className="admin-form-label-row">
                  <label className="admin-form-label">Tipo <span className="admin-required">*</span></label>
                  {lockCategoriaTipo && (
                    <span className="admin-badge-lock">🔒 Bloqueado após publicação</span>
                  )}
                </div>
                <input
                  name="subcategoria"
                  className="admin-form-input"
                  value={formData.subcategoria}
                  onChange={handleMetaChange}
                  list="subcategoria-suggestions"
                  placeholder="Escolha uma sugestão ou digite outra"
                  disabled={lockCategoriaTipo}
                  required
                />
                <datalist id="subcategoria-suggestions">
                  {subcategoriaOptions.map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
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
                    onChange={handleMetaChange}
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
                    onChange={handleMetaChange}
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
                  onChange={handleMetaChange}
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
                  onChange={handleMetaChange}
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
                            onChange={handleMetaChange}
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
                            onChange={handleMetaChange}
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
                                onChange={handleMetaChange}
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
                                  onChange={handleMetaChange}
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
                                  onChange={handleMetaChange}
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
                      onChange={handleMetaChange}
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
                      onChange={handleMetaChange}
                    >
                      <option value="">(usar classificação principal)</option>
                      {categoriaMacroLicitacoesOptionsWithCurrent.map((opt) => (
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
                      onChange={handleMetaChange}
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
                  onChange={handleMetaChange}
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
                <input
                  name="ordem_exibicao"
                  type="number"
                  className="admin-form-input"
                  value={formData.ordem_exibicao}
                  onChange={handleMetaChange}
                />
              </div>
            </div>

            <div className="admin-form-actions">
              <button
                className={metaSaved && !saving ? 'admin-btn-success' : 'admin-btn-primary'}
                type="submit"
                disabled={saving}
              >
                {saving ? 'Salvando...' : (metaSaved ? '✔ Metadados salvos' : 'Salvar Metadados')}
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'versoes' && (
        <div className="admin-form" id="admin-doc-versions">
          <div className="admin-form-section">
            <h2>Versão Vigente</h2>

            {documento?.versaoVigente ? (
              <div className="admin-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <strong>v{documento.versaoVigente.versao}</strong> • {documento.versaoVigente.numeroIdentificacao}
                    <div className="admin-inline-muted">Aprovado em: {formatDate(documento.versaoVigente.dataAprovacao)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      className="admin-btn-sm admin-btn-secondary"
                      href={documento.versaoVigente.arquivoPdf}
                      target="_blank"
                      rel="noopener"
                    >
                      Abrir PDF
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-loading" style={{ padding: '0.75rem 0' }}>
                Nenhuma versão vigente definida.
              </div>
            )}
          </div>

          {canAddVersion ? (
            <div className="admin-form-section" id="admin-doc-upload">
              <h2>{canVersion ? 'Adicionar Nova Versão' : 'Adicionar PDF'}</h2>

              <form onSubmit={handleCriarVersao}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Número/Identificação <span className="admin-required">*</span></label>
                  <input
                    name="numero_identificacao"
                    className="admin-form-input"
                    value={novaVersao.numero_identificacao}
                    onChange={handleNovaVersaoChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Data de aprovação <span className="admin-required">*</span></label>
                  <input
                    name="data_aprovacao"
                    type="date"
                    className="admin-form-input"
                    value={novaVersao.data_aprovacao}
                    onChange={handleNovaVersaoChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Descrição da alteração</label>
                <textarea
                  name="descricao_alteracao"
                  className="admin-form-input"
                  rows={3}
                  value={novaVersao.descricao_alteracao}
                  onChange={handleNovaVersaoChange}
                />
              </div>

              {regrasVersao.requiresStatusNormativo && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Status (Normativo) <span className="admin-required">*</span></label>
                  <select
                    name="status_normativo"
                    className="admin-form-input"
                    value={novaVersao.status_normativo}
                    onChange={handleNovaVersaoChange}
                    required
                  >
                    {statusNormativoOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {regrasVersao.requiresStatusContrato && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Status (Contrato) <span className="admin-required">*</span></label>
                  <select
                    name="status_contrato"
                    className="admin-form-input"
                    value={novaVersao.status_contrato}
                    onChange={handleNovaVersaoChange}
                    required
                  >
                    {statusContratoOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="admin-form-group">
                <label className="admin-form-label">PDF <span className="admin-required">*</span></label>
                <DocumentUpload
                  onUploadComplete={handleUploadComplete}
                  uploadContext={{
                    documentSlug: formData.slug,
                    year: (getYearFromDateInputUTC(novaVersao.data_aprovacao) || new Date().getFullYear()),
                    subcategoria: formData.subcategoria,
                    numeroDocumento: formData.numero_documento || novaVersao.numero_identificacao,
                  }}
                  currentFile={novaVersao.arquivo_pdf
                    ? {
                      fileName: fileNameFromPath(novaVersao.arquivo_pdf),
                      filePath: novaVersao.arquivo_pdf,
                      fileSize: novaVersao.file_size || 0,
                      fileType: 'application/pdf',
                    }
                    : (documento?.versaoVigente
                      ? {
                        fileName: fileNameFromPath(documento.versaoVigente.arquivoPdf),
                        filePath: documento.versaoVigente.arquivoPdf,
                        fileSize: documento.versaoVigente.fileSize,
                        fileType: 'application/pdf',
                      }
                      : null)}
                  allowedTypes={['application/pdf']}
                />
              </div>

                <div className="admin-form-actions">
                  <button className="admin-btn-primary" type="submit" disabled={saving}>
                    {saving
                      ? 'Salvando...'
                      : (canVersion ? 'Adicionar Versão (vira vigente)' : 'Adicionar PDF (vira vigente)')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="admin-form-section">
              <h2>Versionamento</h2>
              <div className="admin-inline-muted">
                Este tipo de documento não permite versionamento. Para alterações, crie um novo documento.
              </div>
            </div>
          )}

          <div className="admin-form-section">
            <h2>Histórico de Versões</h2>

            {Array.isArray(documento?.versoes) && documento.versoes.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Versão</th>
                      <th>Identificação</th>
                      <th>Aprovação</th>
                      <th>Vigente</th>
                      <th className="admin-table-actions">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documento.versoes.map((v) => (
                      <tr key={v.id}>
                        <td>v{v.versao}</td>
                        <td>{v.numeroIdentificacao}</td>
                        <td>{formatDate(v.dataAprovacao)}</td>
                        <td>{v.isVigente ? 'Sim' : 'Não'}</td>
                        <td className="admin-table-actions">
                          <div className="admin-table-actions-inner">
                            <a
                              className="admin-btn-sm admin-btn-secondary"
                              href={v.arquivoPdf}
                              target="_blank"
                              rel="noopener"
                            >
                              PDF
                            </a>
                            {!v.isVigente && (
                              <button
                                type="button"
                                className="admin-btn-sm admin-btn-success"
                                onClick={() => handleTornarVigente(v.id)}
                                disabled={saving}
                              >
                                Tornar vigente
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-loading" style={{ padding: '0.75rem 0' }}>
                Nenhuma versão cadastrada.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
