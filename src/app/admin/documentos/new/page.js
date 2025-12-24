'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function NovoDocumentoPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    categoria_macro: 'RELATORIOS_FINANCEIROS',
    subcategoria: subcategoriasPorMacro.RELATORIOS_FINANCEIROS?.[0] || '',
    categoria_macro_licitacoes: '',
    subcategoria_licitacoes: '',
    descricao_curta: '',
    orgao_emissor: '',
    aparece_em: ['TRANSPARENCIA'],
    status: 'DRAFT',
    ordem_exibicao: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const apareceEmSet = useMemo(() => new Set(formData.aparece_em), [formData.aparece_em]);

  const subcategoriaOptions = useMemo(() => {
    return subcategoriasPorMacro[formData.categoria_macro] || [];
  }, [formData.categoria_macro]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.titulo.trim()) return setError('Título é obrigatório');
    if (!formData.subcategoria.trim()) return setError('Subcategoria é obrigatória');
    if (!formData.descricao_curta.trim()) return setError('Descrição curta é obrigatória');
    if (!formData.orgao_emissor.trim()) return setError('Órgão emissor é obrigatório');
    if (!Array.isArray(formData.aparece_em) || formData.aparece_em.length === 0) {
      return setError('Selecione ao menos um destino (Transparência e/ou Licitações)');
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const res = await fetch('/api/admin/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

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
          <p className="admin-page-subtitle">Crie o documento (metadados) e depois adicione a versão PDF.</p>
        </div>
        <Link href="/admin/documentos" className="admin-btn-secondary">
          ← Voltar
        </Link>
      </header>

      {error && (
        <div className="admin-error">
          <p>Erro: {error}</p>
        </div>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-section">
          <h2>Metadados</h2>

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
            <label className="admin-form-label">Slug (opcional)</label>
            <input
              name="slug"
              className="admin-form-input"
              value={formData.slug}
              onChange={handleChange}
              placeholder="Deixe vazio para gerar automaticamente"
            />
          </div>

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
                onChange={handleChange}
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
              onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Destino (aparece em) <span className="admin-required">*</span></label>
            <div className="admin-inline-chips" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
                    onChange={handleChange}
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

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Status</label>
              <select
                name="status"
                className="admin-form-input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
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
