/**
 * Zona de Upload de Arquivos
 * Componente drag & drop com progresso e gerenciamento de arquivos
 */
'use client';

import { useState, useRef } from 'react';

export default function FileUploadZone({ 
  biddingId,
  phase,
  onUploadComplete,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = '.pdf,.docx,.xlsx'
}) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    setError(null);

    // Validar número de arquivos
    if (files.length + newFiles.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    // Validar tamanho e tipo
    const validFiles = [];
    const errors = [];

    newFiles.forEach(file => {
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: arquivo muito grande (máximo ${maxFileSize / (1024 * 1024)}MB)`);
        return;
      }

      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      const acceptedArray = acceptedTypes.split(',');
      if (!acceptedArray.includes(fileExt)) {
        errors.push(`${file.name}: tipo de arquivo não permitido`);
        return;
      }

      validFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extensão
        progress: 0,
        status: 'pending' // pending, uploading, success, error
      });
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const updateFileTitle = (id, newTitle) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, title: newTitle } : f
    ));
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveFile = (id, direction) => {
    setFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError('Nenhum arquivo selecionado');
      return;
    }

    if (!biddingId || !phase) {
      setError('Licitação e fase são obrigatórios');
      return;
    }

    setUploading(true);
    setError(null);

    const token = localStorage.getItem('adminToken');
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      
      try {
        // Atualizar status para uploading
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        // 1) Upload do arquivo (storage)
        const uploadForm = new FormData();
        uploadForm.append('file', fileData.file);
        uploadForm.append('module', 'LICITACAO');
        uploadForm.append('biddingId', biddingId);
        uploadForm.append('phase', phase);
        if (token) uploadForm.append('token', token);

        const uploadResponse = await fetch('/api/admin/upload-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadForm
        });

        const uploadJson = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadJson?.success) {
          throw new Error(uploadJson?.error || 'Erro ao fazer upload do arquivo');
        }

        // 2) Criar registro do documento
        const createPayload = {
          title: fileData.title,
          description: '',
          module: 'LICITACAO',
          biddingId,
          phase,
          order: i,
          status: 'PUBLISHED',
          fileName: uploadJson.fileName,
          filePath: uploadJson.filePath,
          fileSize: uploadJson.fileSize,
          fileType: uploadJson.fileType,
          fileHash: uploadJson.fileHash,
        };

        const response = await fetch('/api/admin/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(createPayload)
        });

        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.error || 'Erro ao registrar documento');
        }
        
        // Atualizar status para success
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'success', progress: 100 } : f
        ));

        results.push(data.data);
      } catch (error) {
        console.error(`Erro ao fazer upload de ${fileData.title}:`, error);
        
        // Atualizar status para error
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'error', progress: 0 } : f
        ));
      }
    }

    setUploading(false);

    if (results.length > 0) {
      alert(`${results.length} arquivo(s) enviado(s) com sucesso!`);
      
      if (onUploadComplete) {
        onUploadComplete(results);
      }

      // Limpar arquivos bem-sucedidos
      setFiles(prev => prev.filter(f => f.status !== 'success'));
    }

    const errorFiles = files.filter(f => f.status === 'error');
    if (errorFiles.length > 0) {
      setError(`${errorFiles.length} arquivo(s) falharam no upload`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return (ext || 'arquivo').toUpperCase();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading': return 'Enviando';
      case 'success': return 'Concluído';
      case 'error': return 'Falhou';
      default: return 'Pendente';
    }
  };

  return (
    <div className="file-upload-zone">
      {error && (
        <div className="admin-error" style={{ marginBottom: '1rem' }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{error}</pre>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragging ? 'drop-zone-active' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-zone-icon">Upload</div>
        <div className="drop-zone-text">
          <strong>Clique ou arraste arquivos aqui</strong>
          <p>
            Máximo {maxFiles} arquivos • Até {maxFileSize / (1024 * 1024)}MB cada
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-text)' }}>
            Formatos aceitos: {acceptedTypes}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <h3>Arquivos Selecionados ({files.length})</h3>
          </div>

          {files.map((fileData, index) => (
            <div key={fileData.id} className={`file-item file-item-${fileData.status}`}>
              <div className="file-item-icon">
                {fileData.status === 'pending' 
                  ? getFileIcon(fileData.file.name)
                  : getStatusIcon(fileData.status)
                }
              </div>

              <div className="file-item-content">
                <input
                  type="text"
                  value={fileData.title}
                  onChange={(e) => updateFileTitle(fileData.id, e.target.value)}
                  className="file-item-title-input"
                  disabled={fileData.status !== 'pending'}
                  placeholder="Título do documento"
                />
                <div className="file-item-meta">
                  <span>{fileData.file.name}</span>
                  <span>{formatFileSize(fileData.file.size)}</span>
                </div>
                
                {fileData.status === 'uploading' && (
                  <div className="file-item-progress">
                    <div 
                      className="file-item-progress-bar" 
                      style={{ width: `${fileData.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {fileData.status === 'pending' && (
                <div className="file-item-actions">
                  <button
                    type="button"
                    className="admin-btn-icon"
                    onClick={() => moveFile(fileData.id, 'up')}
                    disabled={index === 0}
                    title="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="admin-btn-icon"
                    onClick={() => moveFile(fileData.id, 'down')}
                    disabled={index === files.length - 1}
                    title="Mover para baixo"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="admin-btn-icon admin-btn-danger"
                    onClick={() => removeFile(fileData.id)}
                    title="Remover"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Botões de Ação */}
          <div className="file-list-actions">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Limpar todos
            </button>
            <button
              type="button"
              className="admin-btn-primary"
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
            >
              {uploading ? 'Enviando...' : `Enviar ${files.length} arquivo(s)`}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .file-upload-zone {
          width: 100%;
        }

        .drop-zone {
          border: 2px dashed var(--border);
          border-radius: 0.5rem;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--card);
        }

        .drop-zone:hover {
          border-color: var(--primary);
          background: var(--accent);
        }

        .drop-zone-active {
          border-color: var(--primary);
          background: var(--accent);
          transform: scale(1.02);
        }

        .drop-zone-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .drop-zone-text strong {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }

        .drop-zone-text p {
          color: var(--muted-text);
          font-size: 0.875rem;
          margin: 0.25rem 0;
        }

        .file-list {
          margin-top: 1.5rem;
        }

        .file-list-header {
          margin-bottom: 1rem;
        }

        .file-list-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--foreground);
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .file-item-success {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .file-item-error {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .file-item-uploading {
          border-color: #3b82f6;
        }

        .file-item-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .file-item-content {
          flex: 1;
          min-width: 0;
        }

        .file-item-title-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 0.25rem;
          background: var(--background);
          color: var(--foreground);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .file-item-title-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .file-item-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: var(--muted-text);
        }

        .file-item-progress {
          margin-top: 0.5rem;
          height: 4px;
          background: var(--border);
          border-radius: 9999px;
          overflow: hidden;
        }

        .file-item-progress-bar {
          height: 100%;
          background: var(--primary);
          transition: width 0.3s ease;
        }

        .file-item-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .file-list-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        @media (max-width: 768px) {
          .drop-zone {
            padding: 2rem 1rem;
          }

          .file-item {
            flex-wrap: wrap;
          }

          .file-item-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .file-list-actions {
            flex-direction: column;
          }

          .file-list-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
