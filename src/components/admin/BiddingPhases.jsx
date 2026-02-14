/**
 * Fases da Licitação
 * Accordion com documentos organizados por fase
 */
'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';

export default function BiddingPhases({ 
  biddingId, 
  documents = [], 
  onUpload, 
  onDelete,
  onUpdateStatus 
}) {
  const [expandedPhase, setExpandedPhase] = useState('ABERTURA');

  const phases = [
    { key: 'ABERTURA', label: 'Abertura', description: 'Edital, avisos e documentos iniciais' },
    { key: 'QUESTIONAMENTOS', label: 'Questionamentos', description: 'Esclarecimentos e impugnações' },
    { key: 'JULGAMENTO', label: 'Julgamento', description: 'Análise de propostas e documentos' },
    { key: 'RECURSO', label: 'Recurso', description: 'Recursos administrativos' },
    { key: 'HOMOLOGACAO', label: 'Homologação', description: 'Resultado e homologação' },
    { key: 'CONTRATACAO', label: 'Contratação', description: 'Contratos e aditivos' },
    { key: 'EXECUCAO', label: 'Execução', description: 'Documentos da execução contratual' },
    { key: 'ENCERRAMENTO', label: 'Encerramento', description: 'Termos de encerramento e avaliações' }
  ];

  const getPhaseDocuments = (phase) => {
    return documents
      .filter(doc => doc.phase === phase)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const togglePhase = (phase) => {
    setExpandedPhase(expandedPhase === phase ? null : phase);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSafeFilename = (doc) => {
    const raw = doc?.fileName || doc?.filename;
    if (raw) return raw;
    const path = doc?.filePath;
    if (typeof path === 'string' && path) {
      const last = path.split('/').pop();
      return last || null;
    }
    return null;
  };

  const getFileIcon = (filename) => {
    if (!filename || typeof filename !== 'string') return 'ARQ';
    const ext = filename.split('.').pop()?.toLowerCase();
    const labels = {
      pdf: 'PDF',
      doc: 'DOC',
      docx: 'DOCX',
      xls: 'XLS',
      xlsx: 'XLSX',
    };
    return labels[ext] || 'ARQ';
  };

  const formatDocumentTitle = (doc) => {
    const tipo = doc?.tipoDocumento;
    if (tipo === 'ANEXO') {
      const num = doc?.numeroAnexo ? String(doc.numeroAnexo) : '?';
      const extra = doc?.tituloExibicao ? ` – ${doc.tituloExibicao}` : '';
      return `Anexo ${num}${extra}`;
    }
    return doc?.tituloExibicao || doc?.title || 'Documento';
  };

  return (
    <div className="bidding-phases">
      {phases.map((phase) => {
        const phaseDocuments = getPhaseDocuments(phase.key);
        const isExpanded = expandedPhase === phase.key;

        return (
          <div key={phase.key} className="phase-item">
            <button
              type="button"
              className={`phase-header ${isExpanded ? 'phase-header-active' : ''}`}
              onClick={() => togglePhase(phase.key)}
            >
              <div className="phase-header-content">
                <div className="phase-info">
                  <div className="phase-name">{phase.label}</div>
                  <div className="phase-description">{phase.description}</div>
                </div>
              </div>
              <div className="phase-meta">
                <span className="phase-count">
                  {phaseDocuments.length} {phaseDocuments.length === 1 ? 'documento' : 'documentos'}
                </span>
                <span className="phase-toggle-arrow">▼</span>
              </div>
            </button>

            {isExpanded && (
              <div className="phase-content">
                {/* Botão Upload */}
                {onUpload && (
                  <div className="phase-upload-area">
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => onUpload(phase.key)}
                    >
                      Adicionar documento
                    </button>
                  </div>
                )}

                {/* Lista de Documentos */}
                {phaseDocuments.length === 0 ? (
                  <div className="phase-empty">
                    <p>Nenhum documento nesta fase ainda.</p>
                  </div>
                ) : (
                  <div className="phase-documents">
                    {phaseDocuments.map((doc) => (
                      (() => {
                        const filename = getSafeFilename(doc);
                        return (
                      <div key={doc.id} className="phase-document">
                        <div className="phase-document-icon">
                          {getFileIcon(filename)}
                        </div>
                        
                        <div className="phase-document-info">
                          <div className="phase-document-title">
                            {formatDocumentTitle(doc)}
                          </div>
                          <div className="phase-document-meta">
                            {doc.tipoDocumento && (
                              <span className="phase-document-filename">
                                {doc.tipoDocumento}
                              </span>
                            )}
                            {filename && (
                              <span className="phase-document-filename">
                                {filename}
                              </span>
                            )}
                            {doc.fileSize && (
                              <span className="phase-document-size">
                                {formatFileSize(doc.fileSize)}
                              </span>
                            )}
                            <span className="phase-document-date">
                              {formatDate(doc.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="phase-document-status">
                          <StatusBadge status={doc.status} />
                        </div>

                        <div className="phase-document-actions">
                          {doc.filePath && (
                            <a
                              href={doc.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-btn-icon"
                              title="Visualizar"
                            >
                              Ver
                            </a>
                          )}
                          
                          {onUpdateStatus && (
                            <button
                              type="button"
                              className="admin-btn-icon"
                              onClick={() => onUpdateStatus(doc.id, doc.status)}
                              title="Alterar Status"
                            >
                              Status
                            </button>
                          )}

                          {onDelete && (
                            <button
                              type="button"
                              className="admin-btn-icon admin-btn-danger"
                              onClick={() => onDelete(doc.id, doc.title)}
                              title="Excluir"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      </div>
                        );
                      })()
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .bidding-phases {
          width: 100%;
        }

        .phase-item {
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          overflow: hidden;
          background: var(--card);
        }

        .phase-header {
          width: 100%;
          padding: 1rem 1.25rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }

        .phase-header:hover {
          background: var(--accent);
        }

        .phase-header-active {
          background: var(--accent);
          border-bottom: 1px solid var(--border);
        }

        .phase-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .phase-header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .phase-icon {
          font-size: 1.5rem;
        }

        .phase-header-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .phase-name {
          font-weight: 600;
          font-size: 1rem;
          color: var(--foreground);
        }

        .phase-description {
          font-size: 0.875rem;
          color: var(--muted-text);
        }

        .phase-header-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .phase-count {
          font-size: 0.875rem;
          color: var(--muted-text);
          font-weight: 500;
        }

        .phase-toggle-icon {
          color: var(--muted-text);
          font-size: 0.875rem;
        }

        .phase-content {
          padding: 1.25rem;
        }

        .phase-upload-area {
          margin-bottom: 1rem;
          display: flex;
          justify-content: flex-end;
        }

        .phase-empty {
          text-align: center;
          padding: 2rem;
          color: var(--muted-text);
        }

        .phase-documents {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .phase-document {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .phase-document:hover {
          border-color: var(--primary);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .phase-document-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .phase-document-info {
          flex: 1;
          min-width: 0;
        }

        .phase-document-title {
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 0.25rem;
        }

        .phase-document-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--muted-text);
        }

        .phase-document-filename,
        .phase-document-size,
        .phase-document-date {
          display: inline-block;
        }

        .phase-document-filename::after,
        .phase-document-size::after {
          content: '•';
          margin-left: 0.5rem;
        }

        .phase-document-status {
          flex-shrink: 0;
        }

        .phase-document-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .phase-header {
            padding: 0.75rem 1rem;
          }

          .phase-header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .phase-document {
            flex-wrap: wrap;
          }

          .phase-document-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
