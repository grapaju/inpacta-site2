/**
 * Dashboard de Estatísticas para Licitações
 * Cards informativos no estilo TailAdmin
 */
'use client';

export default function BiddingDashboard({ biddings = [] }) {
  const total = biddings.length;

  const active = biddings.filter((b) => ['PUBLICADO', 'EM_ANDAMENTO'].includes(b.status)).length;

  const requiresAttention = biddings.filter((b) => {
    const pending = getPendingItems(b);
    const hasUrgentDates = hasUrgentDate(b);
    const needsMovement = needsMovementUpdate(b);
    return pending.length > 0 || hasUrgentDates || needsMovement;
  }).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const completedThisMonth = biddings.filter((b) => {
    if (b.status !== 'CONCLUIDA') return false;
    const closingDate = b.closingDate ? new Date(b.closingDate) : null;
    if (!closingDate) return false;
    return closingDate.getMonth() === currentMonth && closingDate.getFullYear() === currentYear;
  }).length;

  function getPendingItems(bidding) {
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
  }

  function hasUrgentDate(bidding) {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;

    if (bidding.openingDate) {
      const opening = new Date(bidding.openingDate);
      const diff = opening.getTime() - now.getTime();
      if (diff > 0 && diff <= threeDays) return true;
    }

    if (bidding.closingDate) {
      const closing = new Date(bidding.closingDate);
      const diff = closing.getTime() - now.getTime();
      if (diff > 0 && diff <= threeDays) return true;
    }

    return false;
  }

  function needsMovementUpdate(bidding) {
    const status = String(bidding?.status || '');
    if (status !== 'PUBLICADO' && status !== 'EM_ANDAMENTO') return false;

    const lastMovement = bidding.movements?.[0];
    if (!lastMovement?.date) return true;

    const now = new Date();
    const lastDate = new Date(lastMovement.date);
    const daysDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysDiff > 15;
  }

  const stats = [
    {
      label: 'Total',
      value: total,
      icon: 'clipboard',
      iconColor: 'var(--muted-text)'
    },
    {
      label: 'Ativas',
      value: active,
      icon: 'pulse',
      iconColor: 'var(--primary)'
    },
    {
      label: 'Requer Atenção',
      value: requiresAttention,
      icon: 'alert',
      iconColor: 'var(--muted-text)'
    },
    {
      label: 'Concluídas (Mês)',
      value: completedThisMonth,
      icon: 'check',
      iconColor: 'var(--muted-text)'
    }
  ];

  return (
    <div
      className="admin-stats-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="admin-stats-card"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '1.25rem',
                height: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: stat.iconColor
              }}
            >
              {renderIcon(stat.icon)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--foreground)',
                  lineHeight: 1,
                  marginBottom: '0.25rem'
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--muted-text)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {stat.label}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderIcon(iconName) {
  const icons = {
    clipboard: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    ),
    pulse: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    alert: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    check: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  };

  return icons[iconName] || null;
}
