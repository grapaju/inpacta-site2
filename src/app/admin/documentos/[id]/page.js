'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DocumentUpload from '@/components/admin/DocumentUpload';
import StatusBadge from '@/components/admin/StatusBadge';

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

const categoriaMacroOptions = [
  { value: 'RELATORIOS_FINANCEIROS', label: 'Relatórios Financeiros' },
  { value: 'RELATORIOS_GESTAO', label: 'Relatórios de Gestão' },
  { value: 'DOCUMENTOS_OFICIAIS', label: 'Documentos Oficiais' },
  { value: 'LICITACOES_E_REGULAMENTOS', label: 'Licitações e Regulamentos' },
];

const subcategoriasPorMacro = {
  RELATORIOS_FINANCEIROS: [
    'Balanços',
    'Demonstrativos de Receitas e Despesas',
    'Execução Orçamentária',
    'Auditorias',
  ],
  RELATORIOS_GESTAO: [
    'Relatórios de Atividades',
    'Resultados Alcançados',
    'Impacto dos Projetos',
  ],
  DOCUMENTOS_OFICIAIS: [
    'Atos Normativos',
    'Regimentos',
    'Estatuto Social',
    'Documentos de Constituição',
    'Resoluções da Diretoria',
  ],
  LICITACOES_E_REGULAMENTOS: [
    'Regulamento',
    'Modelos de Edital',
    'Termos de Referência',
  ],
};

function toDateInputValue(value) {
  if (!value) return '';
  if (typeof value === 'string' && value.includes('T')) return value.split('T')[0];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
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

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    categoria_macro: 'RELATORIOS_FINANCEIROS',
    subcategoria: '',
    categoria_macro_licitacoes: '',
    subcategoria_licitacoes: '',
    descricao_curta: '',
    orgao_emissor: '',
    aparece_em: [],
    status: 'DRAFT',
    ordem_exibicao: 0,
  });

  const [novaVersao, setNovaVersao] = useState({
    numero_identificacao: '',
    data_aprovacao: '',
    descricao_alteracao: '',
    arquivo_pdf: '',
    file_size: 0,
    file_hash: '',
  });

  const apareceEmSet = useMemo(() => new Set(formData.aparece_em), [formData.aparece_em]);

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

      if (value === 'LICITACOES') {
        const nextMacro = prev.categoria_macro_licitacoes || 'LICITACOES_E_REGULAMENTOS';
        const nextSubcats = subcategoriasPorMacro[nextMacro] || [];
        const nextSub = prev.subcategoria_licitacoes || (nextSubcats[0] || '');

        return {
          ...prev,
          aparece_em: Array.from(next),
          categoria_macro_licitacoes: prev.categoria_macro_licitacoes || nextMacro,
          subcategoria_licitacoes: prev.subcategoria_licitacoes || nextSub,
        };
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

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao carregar documento');
      }

      if (data.success) {
        const doc = data.data;
        setDocumento(doc);
        const categoriaMacro = doc.categoriaMacro || 'RELATORIOS_FINANCEIROS';
        const subcats = subcategoriasPorMacro[categoriaMacro] || [];
        setSlugManuallyEdited(Boolean(doc.slug));
        setFormData({
          titulo: doc.titulo || '',
          slug: doc.slug || '',
          categoria_macro: categoriaMacro,
          subcategoria: doc.subcategoria || subcats[0] || '',
          categoria_macro_licitacoes: doc.categoriaMacroLicitacoes || '',
          subcategoria_licitacoes: doc.categoriaMacroLicitacoes ? (doc.subcategoriaLicitacoes || '') : '',
          descricao_curta: doc.descricaoCurta || '',
          orgao_emissor: doc.orgaoEmissor || '',
          aparece_em: Array.isArray(doc.apareceEm) ? doc.apareceEm : [],
          status: doc.status || 'DRAFT',
          ordem_exibicao: doc.ordemExibicao ?? 0,
        });
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

  const setTab = (nextTab) => {
    setActiveTab(nextTab);

    const nextParams = new URLSearchParams(searchParams?.toString() || '');
    if (nextTab === 'metadados') nextParams.delete('tab');
    else nextParams.set('tab', nextTab);

    const qs = nextParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleMetaChange = (e) => {
    const { name, value, type } = e.target;

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

    if (name === 'categoria_macro') {
      const nextMacro = value;
      const nextSubcats = subcategoriasPorMacro[nextMacro] || [];
      setFormData((prev) => ({
        ...prev,
        categoria_macro: nextMacro,
        subcategoria: nextSubcats.includes(prev.subcategoria) ? prev.subcategoria : (nextSubcats[0] || ''),
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
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSalvarMetadados = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      if (!formData.titulo.trim()) throw new Error('Título é obrigatório');
      if (!formData.subcategoria.trim()) throw new Error('Subcategoria é obrigatória');
      if (!formData.descricao_curta.trim()) throw new Error('Descrição curta é obrigatória');
      if (!formData.orgao_emissor.trim()) throw new Error('Órgão emissor é obrigatório');
      if (!Array.isArray(formData.aparece_em) || formData.aparece_em.length === 0) {
        throw new Error('Selecione ao menos um destino (Transparência e/ou Licitações)');
      }

      const res = await fetch(`/api/admin/documentos/${documentoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao salvar metadados');
      }

      if (data.success) {
        await fetchDocumento();
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

      <div className="admin-card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <strong>Passo 1:</strong> Metadados {documento ? '✓' : ''}
          </div>
          <div>
            <strong>Passo 2:</strong> Versão PDF {documento?.versaoVigente ? '✓' : ''}
          </div>
          {!documento?.versaoVigente && activeTab !== 'versoes' && (
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setTab('versoes')}
            >
              Ir para Versões
            </button>
          )}
        </div>
        {!documento?.versaoVigente && (
          <div className="admin-inline-muted" style={{ marginTop: '0.5rem' }}>
            Ainda não há PDF vigente. Adicione uma versão para publicar/atualizar o documento.
          </div>
        )}
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'metadados' ? 'active' : ''}`}
          onClick={() => setTab('metadados')}
          type="button"
        >
          Metadados
        </button>
        <button
          className={`admin-tab ${activeTab === 'versoes' ? 'active' : ''}`}
          onClick={() => setTab('versoes')}
          type="button"
        >
          Versões
        </button>
      </div>

      {activeTab === 'metadados' && (
        <form className="admin-form" onSubmit={handleSalvarMetadados}>
          <div className="admin-form-section">
            <h2>Metadados</h2>

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
              <label className="admin-form-label">Slug</label>
              <input
                className="admin-form-input"
                value={formData.slug}
                readOnly
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Categoria Macro <span className="admin-required">*</span></label>
                <select
                  name="categoria_macro"
                  className="admin-form-input"
                  value={formData.categoria_macro}
                  onChange={handleMetaChange}
                  required
                >
                  {categoriaMacroOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Subcategoria <span className="admin-required">*</span></label>
                <input
                  name="subcategoria"
                  className="admin-form-input"
                  value={formData.subcategoria}
                  onChange={handleMetaChange}
                  list="subcategoria-suggestions"
                  placeholder="Escolha uma sugestão ou digite outra"
                  required
                />
                <datalist id="subcategoria-suggestions">
                  {subcategoriaOptions.map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </div>
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
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Órgão emissor <span className="admin-required">*</span></label>
                <input
                  name="orgao_emissor"
                  className="admin-form-input"
                  value={formData.orgao_emissor}
                  onChange={handleMetaChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Ordem de exibição</label>
                <input
                  name="ordem_exibicao"
                  type="number"
                  className="admin-form-input"
                  value={formData.ordem_exibicao}
                  onChange={handleMetaChange}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Destino (aparece em) <span className="admin-required">*</span></label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={apareceEmSet.has('TRANSPARENCIA')}
                    onChange={() => toggleApareceEm('TRANSPARENCIA')}
                  />
                  Transparência
                </label>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={apareceEmSet.has('LICITACOES')}
                    onChange={() => toggleApareceEm('LICITACOES')}
                  />
                  Licitações
                </label>
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
                      {categoriaMacroOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Subcategoria (Licitações)</label>
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

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Status</label>
                <select
                  name="status"
                  className="admin-form-input"
                  value={formData.status}
                  onChange={handleMetaChange}
                >
                  <option value="DRAFT">Rascunho</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="ARCHIVED">Arquivado</option>
                </select>
              </div>
            </div>

            <div className="admin-form-actions">
              <button className="admin-btn-primary" type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Metadados'}
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'versoes' && (
        <div className="admin-form">
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

          <div className="admin-form-section">
            <h2>Adicionar Nova Versão</h2>

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

              <div className="admin-form-group">
                <label className="admin-form-label">PDF <span className="admin-required">*</span></label>
                <DocumentUpload
                  onUploadComplete={handleUploadComplete}
                  uploadContext={{
                    documentSlug: formData.slug,
                    year: (novaVersao.data_aprovacao ? new Date(novaVersao.data_aprovacao).getFullYear() : new Date().getFullYear()),
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
                  {saving ? 'Salvando...' : 'Adicionar Versão (vira vigente)'}
                </button>
              </div>
            </form>
          </div>

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
