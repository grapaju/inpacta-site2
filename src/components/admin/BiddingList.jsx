/**
 * Lista de Licitações
 * Componente principal para exibir e gerenciar licitações
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import StatusBadgeBidding from './StatusBadgeBidding';
import BiddingFilters from './BiddingFilters';
import BiddingDashboard from './BiddingDashboard';
import BiddingQuickFilters from './BiddingQuickFilters';
import BiddingAlerts, { getUrgencyLevel } from './BiddingAlerts';

export default function BiddingList() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdminAuth();
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

  // Filtro rápido
  const [quickFilter, setQuickFilter] = useState(null);

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

  const phaseLabels = {
    ABERTURA: 'Abertura',
    QUESTIONAMENTOS: 'Questionamentos',
    JULGAMENTO: 'Julgamento',
    RECURSO: 'Recurso',
    HOMOLOGACAO: 'Homologação',
    CONTRATACAO: 'Contratação',
    EXECUCAO: 'Execução',
    ENCERRAMENTO: 'Encerramento'
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBiddings();
    }
  }, [page, filters, isAuthenticated]);

  const fetchBiddings = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) return;

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

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR');
  };

  // Aplicar filtro rápido
  const getFilteredBiddings = () => {
    if (!quickFilter) return biddings;

    const now = new Date();

    if (quickFilter === 'attention') {
      return biddings.filter((b) => {
        const urgency = getUrgencyLevel(b);
        return urgency === 'urgent' || urgency === 'warning';
      });
    }

    if (quickFilter === 'upcoming') {
      return biddings.filter((b) => {
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (b.openingDate) {
          const opening = new Date(b.openingDate);
          const diff = opening.getTime() - now.getTime();
          if (diff > 0 && diff <= sevenDays) return true;
        }

        if (b.closingDate) {
          const closing = new Date(b.closingDate);
          const diff = closing.getTime() - now.getTime();
          if (diff > 0 && diff <= sevenDays) return true;
        }

        return false;
      });
    }

    if (quickFilter === 'nomovement') {
      return biddings.filter((b) => {
        const status = String(b?.status || '');
        if (status !== 'PUBLICADO' && status !== 'EM_ANDAMENTO') return false;

        const lastMovement = b.movements?.[0];
        if (!lastMovement?.date) return true;

        const lastDate = new Date(lastMovement.date);
        const daysDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        return daysDiff > 7;
      });
    }

    return biddings;
  };

  const filteredBiddings = getFilteredBiddings();

  const getPendingItems = (bidding) => {
    const pending = [];

    if (!bidding?.legalBasis) pending.push('Base legal');
    if (!bidding?.openingDate) pending.push('Data de abertura');
    if (!bidding?.closingDate) pending.push('Data de encerramento');

    const status = String(bidding?.status || '');
    if ((status === 'PUBLICADO' || status === 'EM_ANDAMENTO') && (bidding?._count?.movements ?? 0) <= 1) {
      pending.push('Atualizar movimentações');
    }

    if ((status === 'HOMOLOGADO' || status === 'ADJUDICADO' || status === 'CONCLUIDA') && !bidding?.winner) {
      pending.push('Vencedor');
    }

    if ((status === 'HOMOLOGADO' || status === 'ADJUDICADO' || status === 'CONCLUIDA') && !bidding?.finalValue) {
      pending.push('Valor final');
    }

    return pending;
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Licitações</h1>
          <span className="admin-form-hint">
            Gerencie processos licitatórios, prazos e movimentações.
          </span>
        </div>
        <Link href="/admin/biddings/new" className="admin-btn-primary">
          Nova Licitação
        </Link>
      </header>

      {/* Dashboard com estatísticas */}
      <BiddingDashboard biddings={biddings} />

      {/* Filtros */}
      <BiddingFilters
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
          setQuickFilter(null);
        }}
      />

      {/* Filtros rápidos */}
      <BiddingQuickFilters
        biddings={biddings}
        activeFilter={quickFilter}
        onFilterChange={(filter) => setQuickFilter(filter)}
      />

      {/* Contadores */}
      {!loading && (
        <div className="admin-info-bar">
          <p>
            Exibindo <strong>{filteredBiddings.length}</strong> de <strong>{total}</strong> licitações
            {filters.status || filters.modality || filters.year || filters.search || quickFilter ? ' (filtrado)' : ''}
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
      {!loading && !error && filteredBiddings.length === 0 && (
        <div className="admin-empty-state">
          <p>
            {filters.status || filters.modality || filters.year || filters.search || quickFilter
              ? 'Nenhuma licitação encontrada com os filtros aplicados.'
              : 'Nenhuma licitação cadastrada ainda.'
            }
          </p>
          {!filters.status && !filters.modality && !filters.year && !filters.search && !quickFilter && (
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
      {!loading && !error && filteredBiddings.length > 0 && (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>Identificação</th>
                  <th style={{ width: '35%' }}>Licitação</th>
                  <th style={{ width: '22%' }}>Última Movimentação</th>
                  <th style={{ width: '18%' }}>Próxima Ação</th>
                  <th className="admin-table-actions" style={{ width: '7%' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBiddings.map((bidding) => {
                  const urgency = getUrgencyLevel(bidding);
                  const borderColor = urgency === 'urgent'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : urgency === 'warning'
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'var(--border)';

                  return (
                    <tr
                      key={bidding.id}
                      style={{
                        borderLeft: `3px solid ${borderColor}`,
                        background: urgency === 'urgent'
                          ? 'rgba(239, 68, 68, 0.02)'
                          : urgency === 'warning'
                          ? 'rgba(245, 158, 11, 0.02)'
                          : 'transparent'
                      }}
                    >
                      {/* Coluna 1: Identificação */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div>
                            <div
                              style={{
                                fontSize: '1.125rem',
                                fontWeight: 700,
                                color: 'var(--foreground)',
                                marginBottom: '0.25rem'
                              }}
                            >
                              {bidding.number}
                            </div>
                            <StatusBadgeBidding status={bidding.status} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)', fontWeight: 500 }}>
                              {modalityLabels[bidding.modality] || bidding.modality}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>
                              {typeLabels[bidding.type] || bidding.type}
                            </div>
                            {bidding.srp && (
                              <div
                                style={{
                                  display: 'inline-block',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '4px',
                                  fontSize: '0.625rem',
                                  fontWeight: 600,
                                  background: 'rgba(139, 92, 246, 0.08)',
                                  color: '#7c3aed',
                                  marginTop: '0.25rem',
                                  width: 'fit-content'
                                }}
                              >
                                SRP
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Coluna 2: Licitação */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: 'var(--foreground)',
                              fontSize: '0.9375rem',
                              lineHeight: 1.3
                            }}
                          >
                            {bidding.title}
                          </div>
                          {bidding.object && (
                            <div
                              style={{
                                fontSize: '0.8125rem',
                                color: 'var(--muted-text)',
                                lineHeight: 1.4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {bidding.object}
                            </div>
                          )}
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.75rem',
                              fontSize: '0.75rem',
                              color: 'var(--muted-text)',
                              marginTop: '0.125rem'
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 500 }}>Publicação:</span> {formatDate(bidding.publicationDate)}
                            </div>
                            {bidding.openingDate && (
                              <div>
                                <span style={{ fontWeight: 500 }}>Abertura:</span> {formatDate(bidding.openingDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Coluna 3: Última movimentação */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          {bidding?.movements?.[0] ? (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span
                                  style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: 'var(--primary)'
                                  }}
                                >
                                  {bidding?._count?.movements ?? 0}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)', fontWeight: 500 }}>
                                  movimentações
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: '0.8125rem',
                                  color: 'var(--foreground)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.125rem'
                                }}
                              >
                                <div style={{ fontWeight: 500 }}>
                                  {phaseLabels[bidding.movements[0].phase] || String(bidding.movements[0].phase)}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>
                                  {formatDateTime(bidding.movements[0].date)}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize: '0.8125rem', color: 'var(--muted-text)', fontStyle: 'italic' }}>
                              Sem movimentações
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Coluna 4: Próxima ação / alertas */}
                      <td>
                        <BiddingAlerts bidding={bidding} />
                      </td>

                      {/* Coluna 5: Ações */}
                      <td className="admin-table-actions">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          <button
                            type="button"
                            className="admin-btn-icon"
                            onClick={() => router.push(`/admin/biddings/${bidding.id}`)}
                            title="Editar"
                            style={{
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.8125rem',
                              borderRadius: '6px',
                              background: 'var(--primary)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 500,
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'color-mix(in oklab, var(--primary), black 15%)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--primary)';
                            }}
                          >
                            Abrir
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon admin-btn-danger"
                            onClick={() => handleDelete(bidding.id, bidding.number)}
                            disabled={deleting === bidding.id}
                            title="Excluir"
                            style={{
                              padding: '0.375rem 0.625rem',
                              fontSize: '0.75rem',
                              borderRadius: '6px',
                              background: 'transparent',
                              color: 'var(--danger)',
                              border: '1px solid var(--border)',
                              cursor: deleting === bidding.id ? 'not-allowed' : 'pointer',
                              fontWeight: 500,
                              opacity: deleting === bidding.id ? 0.6 : 1,
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (deleting !== bidding.id) {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)';
                                e.currentTarget.style.borderColor = 'var(--danger)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (deleting !== bidding.id) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'var(--border)';
                              }
                            }}
                          >
                            {deleting === bidding.id ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
