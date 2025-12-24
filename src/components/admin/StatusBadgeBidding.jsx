/**
 * Badge de Status para Licitações
 * Exibe o status da licitação com cor apropriada
 */
export default function StatusBadgeBidding({ status }) {
  const statusConfig = {
    PLANEJAMENTO: {
      label: 'Planejamento',
      color: '#6b7280',
      bgColor: 'rgba(107, 114, 128, 0.1)'
    },
    PUBLICADO: {
      label: 'Publicado',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    EM_ANDAMENTO: {
      label: 'Em Andamento',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    SUSPENSA: {
      label: 'Suspensa',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    HOMOLOGADO: {
      label: 'Homologado',
      color: '#6b7280',
      bgColor: 'rgba(107, 114, 128, 0.1)'
    },
    ADJUDICADO: {
      label: 'Adjudicado',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    REVOGADO: {
      label: 'Revogado',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    ANULADO: {
      label: 'Anulado',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    DESERTO: {
      label: 'Deserto',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    FRACASSADO: {
      label: 'Fracassado',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    CONCLUIDA: {
      label: 'Concluída',
      color: '#6b7280',
      bgColor: 'rgba(107, 114, 128, 0.1)'
    }
  };

  const config = statusConfig[status] || {
    label: status,
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)'
  };

  return (
    <span
      className="status-badge-bidding"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}40`,
        whiteSpace: 'nowrap'
      }}
    >
      <span>{config.label}</span>
    </span>
  );
}
