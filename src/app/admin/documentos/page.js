'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import Pagination from '@/components/admin/Pagination';

import { categoriaMacroLabels, categoriaMacroOptions } from '@/lib/documentosTaxonomy';
import { canCreateNewVersion } from '@/lib/documentosVersioning';

// Componente de menu dropdown para ações
function ActionsMenu({ doc, canVersion }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [openUpwards, setOpenUpwards] = useState(false);
  const buttonRef = useState(null)[0];
  const router = useRouter();

  const handleToggle = (e) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuHeight = canVersion ? 200 : 160; // Altura aproximada do menu
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Abre para cima se não houver espaço suficiente abaixo
      const shouldOpenUpwards = spaceBelow < menuHeight && spaceAbove > menuHeight;
      setOpenUpwards(shouldOpenUpwards);
      
      setMenuPosition({
        top: shouldOpenUpwards ? rect.top - 4 : rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  const handleRevogar = async () => {
    if (!confirm('Tem certeza que deseja revogar este documento?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/documentos/${doc.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });

      if (res.ok) {
        alert('Documento revogado com sucesso');
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data?.error || 'Erro ao revogar documento');
      }
    } catch (err) {
      alert('Erro ao revogar documento');
    }
  };

  return (
    <div className="admin-dropdown">
      <button
        type="button"
        className="admin-dropdown-trigger"
        onClick={handleToggle}
        aria-label="Menu de ações"
      >
        ⋮
      </button>
      
      {isOpen && (
        <>
          <div 
            className="admin-dropdown-overlay" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="admin-dropdown-menu" 
            style={{
              position: 'fixed',
              top: openUpwards ? 'auto' : `${menuPosition.top}px`,
              bottom: openUpwards ? `${window.innerHeight - menuPosition.top}px` : 'auto',
              right: `${menuPosition.right}px`,
              left: 'auto',
            }}
          >
            {canVersion ? (
              <>
                <Link
                  href={`/admin/documentos/${doc.id}?tab=versoes&action=nova`}
                  className="admin-dropdown-item"
                  onClick={() => setIsOpen(false)}
                >
                  Nova versão
                </Link>
                <Link
                  href={`/admin/documentos/${doc.id}?tab=versoes`}
                  className="admin-dropdown-item"
                  onClick={() => setIsOpen(false)}
                >
                  Ver versões
                </Link>
                <Link
                  href={`/admin/documentos/${doc.id}`}
                  className="admin-dropdown-item"
                  onClick={() => setIsOpen(false)}
                >
                  Editar dados básicos
                </Link>
                <button
                  type="button"
                  className="admin-dropdown-item admin-dropdown-item-danger"
                  onClick={() => {
                    setIsOpen(false);
                    handleRevogar();
                  }}
                >
                  Revogar documento
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/admin/documentos/${doc.id}?view=true`}
                  className="admin-dropdown-item"
                  onClick={() => setIsOpen(false)}
                >
                  Visualizar
                </Link>
                <Link
                  href={`/admin/documentos/${doc.id}`}
                  className="admin-dropdown-item"
                  onClick={() => setIsOpen(false)}
                >
                  Editar
                </Link>
                <button
                  type="button"
                  className="admin-dropdown-item admin-dropdown-item-danger"
                  onClick={() => {
                    setIsOpen(false);
                    handleRevogar();
                  }}
                >
                  Revogar
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

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
          {categoriaMacroOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {/* Legado (caso existam documentos antigos nesta categoria) */}
          <option value="CONTRATOS_PARCERIAS">{categoriaMacroLabels.CONTRATOS_PARCERIAS}</option>

          {/* mantém compatibilidade para quaisquer outros valores existentes no mapa */}
          {Object.entries(categoriaMacroLabels)
            .filter(([value]) => !categoriaMacroOptions.some((opt) => opt.value === value) && value !== 'CONTRATOS_PARCERIAS')
            .map(([value, label]) => (
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
          placeholder="Buscar por título, slug, tipo..."
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
                  <th>Tipo</th>
                  <th>Destino</th>
                  <th>Status</th>
                  <th>Versão atual</th>
                  <th>Atualizado</th>
                  <th className="admin-table-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="admin-table-empty">
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
                      <td>
                        {canCreateNewVersion(doc.categoriaMacro, doc.subcategoria) && doc?.versaoVigente?.versao
                          ? `v${doc.versaoVigente.versao}`
                          : '—'}
                      </td>
                      <td>{formatDate(doc.updatedAt)}</td>
                      <td className="admin-table-actions">
                        <ActionsMenu 
                          doc={doc} 
                          canVersion={canCreateNewVersion(doc.categoriaMacro, doc.subcategoria)} 
                        />
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
