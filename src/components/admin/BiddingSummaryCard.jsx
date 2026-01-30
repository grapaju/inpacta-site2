/**
 * Card de Resumo da Licitação
 * Exibe informações-chave no topo da página de edição
 */
'use client';

import StatusBadgeBidding from './StatusBadgeBidding';
import BiddingAlerts, { getUrgencyLevel } from './BiddingAlerts';

export default function BiddingSummaryCard({ bidding, onStatusChange }) {
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

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const urgency = getUrgencyLevel(bidding);
  const borderColor = urgency === 'urgent' ? 'rgba(239, 68, 68, 0.3)' : urgency === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border)';

  return (
    <div
      className="admin-card"
      style={{
        marginBottom: '1.5rem',
        borderLeft: `4px solid ${borderColor}`,
        background:
          urgency === 'urgent'
            ? 'rgba(239, 68, 68, 0.02)'
            : urgency === 'warning'
              ? 'rgba(245, 158, 11, 0.02)'
              : 'var(--card)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>{bidding.number}</div>
          <StatusBadgeBidding status={bidding.status} />
        </div>
        <button
          type="button"
          onClick={onStatusChange}
          className="admin-btn-secondary"
          style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
        >
          Alterar status
        </button>
      </div>

      <div
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--foreground)',
          marginBottom: '0.75rem',
          lineHeight: 1.4
        }}
      >
        {bidding.title}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--muted-text)',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <span>{modalityLabels[bidding.modality] || bidding.modality}</span>
        <span style={{ color: 'var(--border)' }}>•</span>
        <span>{typeLabels[bidding.type] || bidding.type}</span>
        {bidding.srp && (
          <>
            <span style={{ color: 'var(--border)' }}>•</span>
            <span
              style={{
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'rgba(139, 92, 246, 0.08)',
                color: '#7c3aed'
              }}
            >
              SRP
            </span>
          </>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          background: 'var(--section-alt-bg)',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}
      >
        <SummaryItem label="Publicação" value={formatDate(bidding.publicationDate)} />
        <SummaryItem label="Abertura" value={formatDate(bidding.openingDate)} />
        <SummaryItem label="Encerramento" value={formatDate(bidding.closingDate)} />
        <SummaryItem label="Movimentações" value={bidding?._count?.movements ?? 0} valueColor="var(--primary)" />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--muted-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}
        >
          Próximas ações
        </div>
        <BiddingAlerts bidding={bidding} />
      </div>
    </div>
  );
}

function SummaryItem({ label, value, valueColor }) {
  return (
    <div>
      <div
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--muted-text)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem'
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: valueColor || 'var(--foreground)' }}>{value}</div>
    </div>
  );
}
