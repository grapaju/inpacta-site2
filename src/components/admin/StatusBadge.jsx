export default function StatusBadge({ status }) {
  const statusConfig = {
    DRAFT: {
      label: 'Rascunho',
      className: 'admin-badge admin-badge-draft'
    },
    PENDING: {
      label: 'Pendente',
      className: 'admin-badge admin-badge-pending'
    },
    PUBLISHED: {
      label: 'Publicado',
      className: 'admin-badge admin-badge-published'
    },
    ARCHIVED: {
      label: 'Arquivado',
      className: 'admin-badge admin-badge-archived'
    }
  };

  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span className={config.className}>
      {config.label}
    </span>
  );
}
