/**
 * Timeline de Movimentações da Licitação
 * Exibe histórico de movimentações em formato de timeline vertical
 */
export default function BiddingTimeline({ movements, onAddMovement }) {
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

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!movements || movements.length === 0) {
    return (
      <div className="admin-empty-state">
        <p>Nenhuma movimentação registrada ainda.</p>
        {onAddMovement && (
          <button
            type="button"
            className="admin-btn-primary"
            onClick={onAddMovement}
          >
            Adicionar movimentação
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bidding-timeline">
      {onAddMovement && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={onAddMovement}
          >
            Adicionar movimentação
          </button>
        </div>
      )}

      <div className="timeline-container">
        {movements.map((movement, index) => (
          <div key={movement.id} className="timeline-item">
            {/* Linha vertical conectora */}
            {index < movements.length - 1 && (
              <div className="timeline-line" />
            )}

            {/* Bolinha do timeline */}
            <div className="timeline-dot">
              <div className="timeline-dot-inner" />
            </div>

            {/* Conteúdo */}
            <div className="timeline-content">
              <div className="timeline-header">
                <div className="timeline-phase">
                  {phaseLabels[movement.phase] || movement.phase}
                </div>
                <div className="timeline-date">
                  {formatDate(movement.date)}
                </div>
              </div>

              <div className="timeline-description">
                {movement.description}
              </div>

              <div className="timeline-footer">
                <span className="timeline-user">
                  por {movement.createdBy?.name || 'Sistema'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .bidding-timeline {
          width: 100%;
        }

        .timeline-container {
          position: relative;
          padding-left: 2rem;
        }

        .timeline-item {
          position: relative;
          padding-bottom: 2rem;
        }

        .timeline-item:last-child {
          padding-bottom: 0;
        }

        .timeline-line {
          position: absolute;
          left: 0.625rem;
          top: 2rem;
          bottom: 0;
          width: 2px;
          background: var(--border);
        }

        .timeline-dot {
          position: absolute;
          left: 0;
          top: 0.375rem;
          width: 1.5rem;
          height: 1.5rem;
          background: var(--background);
          border: 2px solid var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .timeline-dot-inner {
          width: 0.5rem;
          height: 0.5rem;
          background: var(--primary);
          border-radius: 50%;
        }

        .timeline-content {
          padding-left: 1rem;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }

        .timeline-phase {
          font-weight: 600;
          color: var(--foreground);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }

        .timeline-date {
          color: var(--muted-text);
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .timeline-description {
          color: var(--foreground);
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }

        .timeline-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .timeline-user {
          color: var(--muted-text);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .timeline-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .timeline-date {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
