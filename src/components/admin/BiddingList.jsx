/**
 * Lista de Licitações
 * Componente principal para exibir e gerenciar licitações
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StatusBadgeBidding from './StatusBadgeBidding';
import BiddingFilters from './BiddingFilters';

export default function BiddingList() {
  const router = useRouter();
  const [biddings, setBiddings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    modality: '',
    year: '',
    search: ''
  });

  // Deletar
  const [deleting, setDeleting] = useState(null);

  const modalityLabels = {
    PREGAO_ELETRONICO: 'Pregão Eletrônico',
    PREGAO_PRESENCIAL: 'Pregão Presencial',
    CONCORRENCIA: 'Concorrência',
    TOMADA_PRECOS: 'Tomada de Preços',
    CONVITE: 'Convite',
    DISPENSA: 'Dispensa',
    INEXIGIBILIDADE: 'Inexigibilidade'
  };

  const typeLabels = {
    MENOR_PRECO: 'Menor Preço',
    MELHOR_TECNICA: 'Melhor Técnica',
    TECNICA_PRECO: 'Técnica e Preço'
  };

  useEffect(() => {
    fetchBiddings();
  }, [page, filters]);

  const fetchBiddings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Construir query string
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.modality) params.append('modality', filters.modality);
      if (filters.year) params.append('year', filters.year);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/admin/biddings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar licitações');
      }

      const data = await response.json();
      const payload = data?.data || {};
      setBiddings(payload.biddings || []);
      setTotalPages(payload.totalPages || 1);
      setTotal(payload.total || 0);
    } catch (error) {
      console.error('Erro ao carregar licitações:', error);
      setError('Erro ao carregar licitações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, number) => {
    if (!confirm(`Tem certeza que deseja excluir a licitação ${number}?\n\nATENÇÃO: Esta ação não pode ser desfeita!`)) {
      return;
    }

    try {
      setDeleting(id);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`/api/admin/biddings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir licitação');
      }

      alert('Licitação excluída com sucesso!');
      fetchBiddings();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert(error.message || 'Erro ao excluir licitação. Verifique se não há movimentações vinculadas.');
    } finally {
      setDeleting(null);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Licitações</h1>
          <span className="admin-form-hint">
            Gerencie processos licitatórios e documentos relacionados.
          </span>
        </div>
        <Link href="/admin/biddings/new" className="admin-btn-primary">
          Nova Licitação
        </Link>
      </header>

      {/* Filtros */}
      <BiddingFilters
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />

      {/* Contadores */}
      {!loading && (
        <div className="admin-info-bar">
          <p>
            Exibindo <strong>{biddings.length}</strong> de <strong>{total}</strong> licitações
            {filters.status || filters.modality || filters.year || filters.search ? ' (filtrado)' : ''}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Carregando licitações...</p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={fetchBiddings}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Lista vazia */}
      {!loading && !error && biddings.length === 0 && (
        <div className="admin-empty-state">
          <p>
            {filters.status || filters.modality || filters.year || filters.search
              ? 'Nenhuma licitação encontrada com os filtros aplicados.'
              : 'Nenhuma licitação cadastrada ainda.'
            }
          </p>
          {!filters.status && !filters.modality && !filters.year && !filters.search && (
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => router.push('/admin/biddings/new')}
            >
              Criar primeira licitação
            </button>
          )}
        </div>
      )}

      {/* Tabela */}
      {!loading && !error && biddings.length > 0 && (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Título</th>
                  <th>Modalidade</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Movimentações</th>
                  <th>Abertura</th>
                  <th className="admin-table-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {biddings.map((bidding) => (
                  <tr key={bidding.id}>
                    <td>
                      <strong>{bidding.number}</strong>
                    </td>
                    <td>
                      <div style={{ maxWidth: '300px' }}>
                        <div style={{ fontWeight: 500 }}>{bidding.title}</div>
                        {bidding.object && (
                          <div style={{ 
                            fontSize: '0.875rem', 
                            color: 'var(--muted-text)',
                            marginTop: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {bidding.object}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{modalityLabels[bidding.modality] || bidding.modality}</td>
                    <td>{typeLabels[bidding.type] || bidding.type}</td>
                    <td>
                      <StatusBadgeBidding status={bidding.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600 }}>{bidding?._count?.movements ?? 0}</span>
                      </div>
                    </td>
                    <td>{formatDate(bidding.openingDate)}</td>
                    <td className="admin-table-actions">
                      <button
                        type="button"
                        className="admin-btn-icon"
                        onClick={() => router.push(`/admin/biddings/${bidding.id}`)}
                        title="Editar"
                      >
                        Abrir
                      </button>
                      <button
                        type="button"
                        className="admin-btn-icon admin-btn-danger"
                        onClick={() => handleDelete(bidding.id, bidding.number)}
                        disabled={deleting === bidding.id}
                        title="Excluir"
                      >
                        {deleting === bidding.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Anterior
              </button>
              
              <div className="admin-pagination-info">
                Página <strong>{page}</strong> de <strong>{totalPages}</strong>
              </div>

              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
