/**
 * Sistema de Alertas e Urgência para Licitações
 * Componente que calcula e exibe alertas baseados em datas e status
 */
'use client';

export function getUrgencyLevel(bidding) {
  const now = new Date();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const fifteenDays = 15 * 24 * 60 * 60 * 1000;

  const status = String(bidding?.status || '');

  // Documentos: só validar se a API realmente devolveu documentos.
  // No inpacta-site14 isso pode variar conforme a rota/consulta.
  if (Array.isArray(bidding?.documents)) {
    const documents = bidding.documents;
    const hasEdital = documents.some((doc) => doc.subcategory === 'EDITAL' || doc.title?.toLowerCase().includes('edital'));

    if ((status === 'PUBLICADO' || status === 'EM_ANDAMENTO' || status === 'HOMOLOGADO' || status === 'ADJUDICADO') && !hasEdital) {
      return 'urgent';
    }
  }

  if (bidding.openingDate) {
    const opening = new Date(bidding.openingDate);
    const diff = opening.getTime() - now.getTime();
    if (diff > 0 && diff <= threeDays) return 'urgent';
    if (diff > 0 && diff <= sevenDays) return 'warning';
  }

  if (bidding.closingDate) {
    const closing = new Date(bidding.closingDate);
    const diff = closing.getTime() - now.getTime();
    if (diff > 0 && diff <= threeDays) return 'urgent';
    if (diff > 0 && diff <= sevenDays) return 'warning';
  }

  if (status === 'PUBLICADO' || status === 'EM_ANDAMENTO') {
    const lastMovement = bidding.movements?.[0];
    if (!lastMovement?.date) return 'urgent';

    const lastDate = new Date(lastMovement.date);
    const daysDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > fifteenDays) return 'urgent';
    if (daysDiff > sevenDays) return 'warning';
  }

  if (status === 'HOMOLOGADO' || status === 'ADJUDICADO' || status === 'CONCLUIDA') {
    if (!bidding.winner || !bidding.finalValue) return 'urgent';
  }

  return 'ok';
}

export function getAlertMessages(bidding) {
  const messages = [];
  const now = new Date();

  if (bidding.openingDate) {
    const opening = new Date(bidding.openingDate);
    const diff = opening.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diff > 0 && days <= 3) {
      messages.push({
        type: 'urgent',
        text: days === 0 ? 'Abertura hoje!' : days === 1 ? 'Abertura amanhã!' : `Abertura em ${days} dias`,
        icon: '🔴'
      });
    } else if (diff > 0 && days <= 7) {
      messages.push({ type: 'warning', text: `Abertura em ${days} dias`, icon: '🟡' });
    }
  }

  if (bidding.closingDate) {
    const closing = new Date(bidding.closingDate);
    const diff = closing.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diff > 0 && days <= 3) {
      messages.push({
        type: 'urgent',
        text: days === 0 ? 'Encerramento hoje!' : days === 1 ? 'Encerramento amanhã!' : `Encerramento em ${days} dias`,
        icon: '🔴'
      });
    } else if (diff > 0 && days <= 7) {
      messages.push({ type: 'warning', text: `Encerramento em ${days} dias`, icon: '🟡' });
    }
  }

  const status = String(bidding?.status || '');
  if (status === 'PUBLICADO' || status === 'EM_ANDAMENTO') {
    const lastMovement = bidding.movements?.[0];

    if (!lastMovement?.date) {
      messages.push({ type: 'urgent', text: 'Sem movimentações', icon: '🔴' });
    } else {
      const lastDate = new Date(lastMovement.date);
      const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > 15) {
        messages.push({ type: 'urgent', text: `Sem movimentação há ${daysDiff} dias`, icon: '🔴' });
      } else if (daysDiff > 7) {
        messages.push({ type: 'warning', text: `Atualizar movimentações (${daysDiff} dias)`, icon: '🟡' });
      }
    }
  }

  if (Array.isArray(bidding?.documents)) {
    const documents = bidding.documents;
    const hasEdital = documents.some((doc) => doc.subcategory === 'EDITAL' || doc.title?.toLowerCase().includes('edital'));
    if ((status === 'PUBLICADO' || status === 'EM_ANDAMENTO' || status === 'HOMOLOGADO' || status === 'ADJUDICADO') && !hasEdital) {
      messages.push({ type: 'urgent', text: 'Edital não anexado', icon: '🔴' });
    }
    if ((status === 'HOMOLOGADO' || status === 'ADJUDICADO' || status === 'CONCLUIDA') && documents.length === 0) {
      messages.push({ type: 'warning', text: 'Nenhum documento anexado', icon: '🟡' });
    }
  }

  if (status === 'HOMOLOGADO' || status === 'ADJUDICADO' || status === 'CONCLUIDA') {
    if (!bidding.winner) messages.push({ type: 'warning', text: 'Falta informar vencedor', icon: '🟡' });
    if (!bidding.finalValue) messages.push({ type: 'warning', text: 'Falta informar valor final', icon: '🟡' });
  }

  if (!bidding.legalBasis) {
    messages.push({ type: 'warning', text: 'Falta base legal', icon: '🟡' });
  }

  if (messages.length === 0) {
    messages.push({ type: 'ok', text: 'Tudo em dia', icon: '🟢' });
  }

  return messages;
}

export default function BiddingAlerts({ bidding }) {
  const messages = getAlertMessages(bidding);
  if (messages.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {messages.slice(0, 3).map((msg, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.625rem',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            background: getAlertBackground(msg.type),
            color: getAlertColor(msg.type),
            border: `1px solid ${getAlertBorder(msg.type)}`
          }}
        >
          <span style={{ fontSize: '0.75rem' }}>{msg.icon}</span>
          <span>{msg.text}</span>
        </div>
      ))}
      {messages.length > 3 && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--muted-text)',
            paddingLeft: '0.625rem'
          }}
        >
          +{messages.length - 3} mais
        </div>
      )}
    </div>
  );
}

function getAlertBackground(type) {
  const backgrounds = {
    urgent: 'rgba(239, 68, 68, 0.06)',
    warning: 'rgba(245, 158, 11, 0.06)',
    ok: 'rgba(34, 197, 94, 0.06)'
  };
  return backgrounds[type] || backgrounds.ok;
}

function getAlertColor(type) {
  const colors = {
    urgent: '#dc2626',
    warning: '#d97706',
    ok: '#16a34a'
  };
  return colors[type] || colors.ok;
}

function getAlertBorder(type) {
  const borders = {
    urgent: 'rgba(239, 68, 68, 0.15)',
    warning: 'rgba(245, 158, 11, 0.15)',
    ok: 'rgba(34, 197, 94, 0.15)'
  };
  return borders[type] || borders.ok;
}
