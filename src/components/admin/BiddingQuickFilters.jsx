/**
 * Filtros Rápidos para Licitações
 * Badges clicáveis para filtros contextuais - Estilo TailAdmin
 */
'use client';

import { getUrgencyLevel } from './BiddingAlerts';

export default function BiddingQuickFilters({ biddings = [], activeFilter, onFilterChange }) {
  const now = new Date();

  const requiresAttention = biddings.filter((b) => {
    const urgency = getUrgencyLevel(b);
    return urgency === 'urgent' || urgency === 'warning';
  }).length;

  const upcoming7Days = biddings.filter((b) => {
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
  }).length;

  const noMovement = biddings.filter((b) => {
    const status = String(b?.status || '');
    if (status !== 'PUBLICADO' && status !== 'EM_ANDAMENTO') return false;

    const lastMovement = b.movements?.[0];
    if (!lastMovement?.date) return true;

    const lastDate = new Date(lastMovement.date);
    const daysDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysDiff > 7;
  }).length;

  const filters = [
    {
      id: 'attention',
      label: 'Requer Atenção',
      count: requiresAttention,
      icon: '⚠️',
      color: 'orange'
    },
    {
      id: 'upcoming',
      label: 'Próximos 7 dias',
      count: upcoming7Days,
      icon: '📅',
      color: 'blue'
    },
    {
      id: 'nomovement',
      label: 'Sem movimento',
      count: noMovement,
      icon: '💤',
      color: 'gray'
    }
  ];

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--muted-text)',
            marginRight: '0.25rem'
          }}
        >
          Filtros rápidos:
        </span>
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(activeFilter === filter.id ? null : filter.id)}
            disabled={filter.count === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              border: '1px solid',
              cursor: filter.count === 0 ? 'not-allowed' : 'pointer',
              opacity: filter.count === 0 ? 0.5 : 1,
              transition: 'all 0.15s ease',
              background: activeFilter === filter.id ? getFilterBackground(filter.color, true) : getFilterBackground(filter.color, false),
              color: activeFilter === filter.id ? getFilterTextColor(filter.color, true) : getFilterTextColor(filter.color, false),
              borderColor: activeFilter === filter.id ? getFilterBorderColor(filter.color, true) : getFilterBorderColor(filter.color, false)
            }}
            onMouseEnter={(e) => {
              if (filter.count > 0 && activeFilter !== filter.id) {
                e.currentTarget.style.background = getFilterBackground(filter.color, true);
                e.currentTarget.style.borderColor = getFilterBorderColor(filter.color, true);
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== filter.id) {
                e.currentTarget.style.background = getFilterBackground(filter.color, false);
                e.currentTarget.style.borderColor = getFilterBorderColor(filter.color, false);
              }
            }}
          >
            <span style={{ fontSize: '0.875rem' }}>{filter.icon}</span>
            <span>{filter.label}</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '1.25rem',
                height: '1.25rem',
                padding: '0 0.25rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: activeFilter === filter.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.06)',
                color: activeFilter === filter.id ? 'inherit' : 'var(--foreground)'
              }}
            >
              {filter.count}
            </span>
          </button>
        ))}
        {activeFilter && (
          <button
            type="button"
            onClick={() => onFilterChange(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--muted-text)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--section-alt-bg)';
              e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--muted-text)';
            }}
          >
            <span>✕</span>
            <span>Limpar</span>
          </button>
        )}
      </div>
    </div>
  );
}

function getFilterBackground(color, active) {
  if (!active) return 'var(--card)';

  const backgrounds = {
    orange: 'rgba(245, 158, 11, 0.1)',
    blue: 'rgba(59, 130, 246, 0.1)',
    gray: 'rgba(100, 116, 139, 0.1)'
  };
  return backgrounds[color] || backgrounds.gray;
}

function getFilterTextColor(color, active) {
  if (!active) return 'var(--foreground)';

  const colors = {
    orange: '#d97706',
    blue: '#2563eb',
    gray: '#475569'
  };
  return colors[color] || colors.gray;
}

function getFilterBorderColor(color, active) {
  if (!active) return 'var(--border)';

  const borders = {
    orange: 'rgba(245, 158, 11, 0.3)',
    blue: 'rgba(59, 130, 246, 0.3)',
    gray: 'rgba(100, 116, 139, 0.3)'
  };
  return borders[color] || borders.gray;
}
