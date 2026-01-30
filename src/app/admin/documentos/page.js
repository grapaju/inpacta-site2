'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import Pagination from '@/components/admin/Pagination';

const categoriaMacroLabels = {
  RELATORIOS_FINANCEIROS: 'Relatórios Financeiros',
  RELATORIOS_GESTAO: 'Relatórios de Gestão',
  DOCUMENTOS_OFICIAIS: 'Documentos Oficiais',
  LICITACOES_E_REGULAMENTOS: 'Licitações e Regulamentos',
};

const apareceEmLabels = {
  TRANSPARENCIA: 'Transparência',
  LICITACOES: 'Licitações',
};

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
}

export default function AdminDocumentosPage() {
  const router = useRouter();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    categoria_macro: '',
    aparece_em: '',
    status: '',
    search: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const params = new URLSearchParams({
          page: String(currentPage),
          limit: '20',
          ...filters,
        });

        for (const [key, value] of [...params.entries()]) {
          if (!value) params.delete(key);
        }

        const res = await fetch(`/api/admin/documentos?${params}`, {
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
          throw new Error(data?.error || 'Erro ao buscar documentos');
        }

        if (data.success) {
          setDocuments(data.data.documents);
          setTotalPages(data.data.totalPages);
          setTotal(data.data.total);
        }
      } catch (err) {
        setError(err?.message || 'Erro ao buscar documentos');
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [currentPage, filters, router]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ categoria_macro: '', aparece_em: '', status: '', search: '' });
    setCurrentPage(1);
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">Documentos</h1>
        <Link href="/admin/documentos/new" className="admin-btn-primary">
          + Novo Documento
        </Link>
      </header>

      <div className="admin-filters">
        <select
          className="admin-filter-select"
          value={filters.aparece_em}
          onChange={(e) => handleFilterChange('aparece_em', e.target.value)}
        >
          <option value="">Todos os Destinos</option>
          <option value="TRANSPARENCIA">Transparência</option>
          <option value="LICITACOES">Licitações</option>
        </select>

        <select
          className="admin-filter-select"
          value={filters.categoria_macro}
          onChange={(e) => handleFilterChange('categoria_macro', e.target.value)}
        >
          <option value="">Todas as Categorias Macro</option>
          {Object.entries(categoriaMacroLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          className="admin-filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="DRAFT">Rascunho</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>

        <input
          type="search"
          className="admin-filter-input"
          placeholder="Buscar por título, slug, subcategoria..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <button className="admin-btn-secondary" onClick={handleClearFilters}>
          Limpar
        </button>
      </div>

      <div className="admin-content-info">
        <p>{total} documento(s) encontrado(s)</p>
      </div>

      {loading && <div className="admin-loading">Carregando...</div>}

      {error && (
        <div className="admin-error">
          <p>Erro: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Subcategoria</th>
                  <th>Destino</th>
                  <th>Status</th>
                  <th>Atualizado</th>
                  <th className="admin-table-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-table-empty">
                      Nenhum documento encontrado
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <strong>{doc.titulo}</strong>
                        <div className="admin-inline-muted">{doc.slug}</div>
                      </td>
                      <td>{categoriaMacroLabels[doc.categoriaMacro] || doc.categoriaMacro}</td>
                      <td>{doc.subcategoria}</td>
                      <td>
                        <div className="admin-inline-chips">
                          {(Array.isArray(doc.apareceEm) ? doc.apareceEm : []).map((item) => (
                            <span key={item} className="admin-badge admin-badge-info admin-inline-chip">
                              {apareceEmLabels[item] || item}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={doc.status} />
                      </td>
                      <td>{formatDate(doc.updatedAt)}</td>
                      <td className="admin-table-actions">
                        <div className="admin-table-actions-inner">
                          <Link
                            href={`/admin/documentos/${doc.id}`}
                            className="admin-btn-sm admin-btn-secondary"
                          >
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
