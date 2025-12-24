/**
 * Filtros para Lista de Licitações
 * Permite filtrar por status, modalidade, ano e busca
 */
export default function BiddingFilters({ filters, onFilterChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'PLANEJAMENTO', label: 'Planejamento' },
    { value: 'PUBLICADO', label: 'Publicado' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'SUSPENSA', label: 'Suspensa' },
    { value: 'HOMOLOGADO', label: 'Homologado' },
    { value: 'ADJUDICADO', label: 'Adjudicado' },
    { value: 'REVOGADO', label: 'Revogado' },
    { value: 'ANULADO', label: 'Anulado' },
    { value: 'DESERTO', label: 'Deserto' },
    { value: 'FRACASSADO', label: 'Fracassado' },
    { value: 'CONCLUIDA', label: 'Concluída' }
  ];

  const modalityOptions = [
    { value: '', label: 'Todas as Modalidades' },
    { value: 'PREGAO_ELETRONICO', label: 'Pregão Eletrônico' },
    { value: 'PREGAO_PRESENCIAL', label: 'Pregão Presencial' },
    { value: 'CONCORRENCIA', label: 'Concorrência' },
    { value: 'TOMADA_PRECOS', label: 'Tomada de Preços' },
    { value: 'CONVITE', label: 'Convite' },
    { value: 'DISPENSA', label: 'Dispensa' },
    { value: 'INEXIGIBILIDADE', label: 'Inexigibilidade' }
  ];

  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value,
      page: 1 // Reset para primeira página ao filtrar
    });
  };

  return (
    <div className="admin-filters">
      {/* Status */}
      <div className="admin-filter-group">
        <label htmlFor="filter-status" className="admin-filter-label">
          Status
        </label>
        <select
          id="filter-status"
          className="admin-filter-select"
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Modalidade */}
      <div className="admin-filter-group">
        <label htmlFor="filter-modality" className="admin-filter-label">
          Modalidade
        </label>
        <select
          id="filter-modality"
          className="admin-filter-select"
          value={filters.modality || ''}
          onChange={(e) => handleChange('modality', e.target.value)}
        >
          {modalityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Ano */}
      <div className="admin-filter-group">
        <label htmlFor="filter-year" className="admin-filter-label">
          Ano
        </label>
        <select
          id="filter-year"
          className="admin-filter-select"
          value={filters.year || ''}
          onChange={(e) => handleChange('year', e.target.value)}
        >
          <option value="">Todos os Anos</option>
          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Busca */}
      <div className="admin-filter-group" style={{ flex: 1 }}>
        <label htmlFor="filter-search" className="admin-filter-label">
          Buscar
        </label>
        <input
          id="filter-search"
          type="text"
          className="admin-filter-input"
          placeholder="Número, título ou objeto..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      {/* Botão Limpar */}
      {(filters.status || filters.modality || filters.year || filters.search) && (
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={() => onFilterChange({ page: 1, limit: filters.limit || 20 })}
          style={{ alignSelf: 'flex-end' }}
        >
          Limpar Filtros
        </button>
      )}
    </div>
  );
}
