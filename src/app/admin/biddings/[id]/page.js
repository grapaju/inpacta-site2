/**
 * Página de Edição/Detalhes de Licitação
 * /admin/biddings/[id]
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import BiddingForm from '@/components/admin/BiddingForm';
import BiddingPhases from '@/components/admin/BiddingPhases';
import BiddingTimeline from '@/components/admin/BiddingTimeline';
import StatusBadgeBidding from '@/components/admin/StatusBadgeBidding';
import FileUploadZone from '@/components/admin/FileUploadZone';

export default function BiddingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const biddingId = params.id;

  const [activeTab, setActiveTab] = useState('info'); // info, documents, timeline
  const [bidding, setBidding] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadPhase, setUploadPhase] = useState(null);

  // Modal de movimentação
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementData, setMovementData] = useState({ phase: 'ABERTURA', description: '' });

  // Modal de status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState({ newStatus: '', biddingId: null });

  const fetchBidding = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/biddings/${biddingId}`, {
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
        throw new Error('Erro ao carregar licitação');
      }

      const data = await response.json();
      const biddingData = data?.data;
      setBidding(biddingData);
      setDocuments(biddingData?.documents || []);
      setMovements(biddingData?.movements || []);
    } catch (error) {
      console.error('Erro ao carregar:', error);
      setError('Erro ao carregar licitação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBidding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biddingId]);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'documents' || tab === 'timeline' || tab === 'info') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleUploadClick = (phase) => {
    setUploadPhase(phase);
    setShowUploadModal(true);
  };

  const handleUploadComplete = (newDocuments) => {
    setShowUploadModal(false);
    setUploadPhase(null);
    fetchBidding(); // Recarregar dados
  };

  const handleDeleteDocument = async (docId, docTitle) => {
    if (!confirm(`Tem certeza que deseja excluir o documento "${docTitle}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`/api/admin/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir documento');
      }

      alert('Documento excluído com sucesso!');
      fetchBidding();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir documento');
    }
  };

  const handleUpdateDocStatus = (docId, currentStatus) => {
    // Implementar modal de alteração de status
    alert('Funcionalidade de alteração de status em desenvolvimento');
  };

  const handleAddMovement = () => {
    setShowMovementModal(true);
  };

  const handleSaveMovement = async () => {
    if (!movementData.description.trim()) {
      alert('Descrição é obrigatória');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`/api/admin/biddings/${biddingId}/movements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phase: movementData.phase,
          description: movementData.description,
          date: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar movimentação');
      }

      alert('Movimentação adicionada com sucesso!');
      setShowMovementModal(false);
      setMovementData({ phase: 'ABERTURA', description: '' });
      fetchBidding();
    } catch (error) {
      console.error('Erro ao adicionar movimentação:', error);
      alert('Erro ao adicionar movimentação');
    }
  };

  const handleChangeStatus = () => {
    setStatusData({ newStatus: bidding.status, biddingId: bidding.id });
    setShowStatusModal(true);
  };

  const handleSaveStatus = async () => {
    if (!statusData.newStatus) {
      alert('Selecione um status');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`/api/admin/biddings/${biddingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: statusData.newStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar status');
      }

      alert('Status atualizado com sucesso!');
      setShowStatusModal(false);
      fetchBidding();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert(error.message || 'Erro ao atualizar status');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <p>Carregando licitação...</p>
        </div>
      </div>
    );
  }

  if (error || !bidding) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <p>{error || 'Licitação não encontrada'}</p>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => router.push('/admin/biddings')}
          >
            ← Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 className="admin-page-title">Licitação {bidding.number}</h1>
            <StatusBadgeBidding status={bidding.status} />
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={handleChangeStatus}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Alterar status
            </button>
          </div>
          {bidding.title ? (
            <span className="admin-form-hint">{bidding.title}</span>
          ) : null}
        </div>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={() => router.push('/admin/biddings')}
        >
          ← Voltar
        </button>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${activeTab === 'info' ? 'admin-tab-active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Dados gerais
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'documents' ? 'admin-tab-active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documentação ({documents.length})
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'timeline' ? 'admin-tab-active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Histórico ({movements.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-tab-content">
        {activeTab === 'info' && (
          <BiddingForm biddingId={biddingId} initialData={bidding} />
        )}

        {activeTab === 'documents' && (
          <BiddingPhases
            biddingId={biddingId}
            documents={documents}
            onUpload={handleUploadClick}
            onDelete={handleDeleteDocument}
            onUpdateStatus={handleUpdateDocStatus}
          />
        )}

        {activeTab === 'timeline' && (
          <BiddingTimeline
            movements={movements}
            onAddMovement={handleAddMovement}
          />
        )}
      </div>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="admin-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Adicionar Documentos</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <FileUploadZone
                biddingId={biddingId}
                phase={uploadPhase}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Movimentação */}
      {showMovementModal && (
        <div className="admin-modal-overlay" onClick={() => setShowMovementModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Adicionar Movimentação</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowMovementModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Fase <span className="admin-required">*</span>
                </label>
                <select
                  value={movementData.phase}
                  onChange={(e) => setMovementData({ ...movementData, phase: e.target.value })}
                  className="admin-form-input"
                >
                  <option value="ABERTURA">Abertura</option>
                  <option value="QUESTIONAMENTOS">Questionamentos</option>
                  <option value="JULGAMENTO">Julgamento</option>
                  <option value="RECURSO">Recurso</option>
                  <option value="HOMOLOGACAO">Homologação</option>
                  <option value="CONTRATACAO">Contratação</option>
                  <option value="EXECUCAO">Execução</option>
                  <option value="ENCERRAMENTO">Encerramento</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Descrição <span className="admin-required">*</span>
                </label>
                <textarea
                  value={movementData.description}
                  onChange={(e) => setMovementData({ ...movementData, description: e.target.value })}
                  className="admin-form-input admin-form-textarea"
                  rows={4}
                  placeholder="Descreva a movimentação..."
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowMovementModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleSaveMovement}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Status */}
      {showStatusModal && (
        <div className="admin-modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Alterar Status da Licitação</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowStatusModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Novo status <span className="admin-required">*</span>
                </label>
                <select
                  value={statusData.newStatus}
                  onChange={(e) => setStatusData({ ...statusData, newStatus: e.target.value })}
                  className="admin-form-input"
                >
                  <option value="PLANEJAMENTO">Planejamento</option>
                  <option value="PUBLICADO">Publicado</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="SUSPENSA">Suspensa</option>
                  <option value="HOMOLOGADO">Homologado</option>
                  <option value="ADJUDICADO">Adjudicado</option>
                  <option value="REVOGADO">Revogado</option>
                  <option value="ANULADO">Anulado</option>
                  <option value="FRACASSADO">Fracassado</option>
                  <option value="DESERTO">Deserto</option>
                  <option value="CONCLUIDA">Concluída</option>
                </select>
              </div>
              <span className="admin-form-hint">
                Esta ação criará uma movimentação automática no histórico.
              </span>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleSaveStatus}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
