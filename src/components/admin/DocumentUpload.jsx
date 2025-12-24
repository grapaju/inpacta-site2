
'use client';

import { useMemo, useRef, useState } from 'react';

export default function DocumentUpload({ onUploadComplete, uploadContext, currentFile, allowedTypes }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const resolvedAllowedTypes = useMemo(
    () => (Array.isArray(allowedTypes) && allowedTypes.length > 0
      ? allowedTypes
      : ['application/pdf']),
    [allowedTypes]
  );

  const acceptAttribute = useMemo(() => {
    const extensions = [];
    if (resolvedAllowedTypes.includes('application/pdf')) extensions.push('.pdf');
    if (resolvedAllowedTypes.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) extensions.push('.docx');
    if (resolvedAllowedTypes.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) extensions.push('.xlsx');
    return extensions.join(',');
  }, [resolvedAllowedTypes]);

  const allowedHint = useMemo(() => {
    return 'PDF (máx. 50MB)';
  }, [resolvedAllowedTypes]);

  const maxSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file) => {
    if (!resolvedAllowedTypes.includes(file.type)) {
      return 'Tipo de arquivo não permitido. Use apenas PDF.';
    }
    if (file.size > maxSize) {
      return 'Arquivo muito grande. Tamanho máximo: 50MB.';
    }
    return null;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Nenhum arquivo selecionado');
      return;
    }

    if (!uploadContext?.documentSlug) {
      setError('Documento inválido (documentSlug ausente)');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentSlug', uploadContext.documentSlug);
      if (uploadContext?.year) formData.append('year', String(uploadContext.year));

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        let response;
        try {
          response = JSON.parse(xhr.responseText);
        } catch {
          response = null;
        }

        if (xhr.status === 200 && response?.success) {
          onUploadComplete({
            fileName: selectedFile.name,
            filePath: response.filePath,
            fileSize: response.fileSize,
            fileType: response.fileType,
            fileHash: response.fileHash
          });
          setSelectedFile(null);
        } else {
          setError(response?.error || 'Erro ao fazer upload');
        }

        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Erro de rede ao fazer upload');
        setUploading(false);
      });

      xhr.open('POST', '/api/admin/upload-document');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (err) {
      setError(err?.message || 'Erro ao fazer upload');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toUpperCase();
  };

  return (
    <div className="admin-upload-container">
      {/* Arquivo atual */}
      {currentFile && !selectedFile && (
        <div className="admin-upload-current">
          <div className="admin-upload-current-header">
            <strong>Arquivo atual:</strong>
          </div>
          <div className="admin-upload-file-info">
            <div className="admin-upload-file-icon">
              {getFileExtension(currentFile.fileName)}
            </div>
            <div className="admin-upload-file-details">
              <div className="admin-upload-file-name">{currentFile.fileName}</div>
              <div className="admin-upload-file-meta">
                {formatFileSize(currentFile.fileSize)} • {currentFile.fileType}
              </div>
            </div>
            <a
              href={currentFile.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-sm admin-btn-secondary"
            >
              Baixar
            </a>
          </div>
        </div>
      )}

      {/* Área de upload */}
      {!uploading && !selectedFile && (
        <div
          className={`admin-upload-area ${isDragging ? 'dragover' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="admin-upload-icon">Upload</div>
          <p className="admin-upload-text">
            Arraste um arquivo aqui ou clique para selecionar
          </p>
          <p className="admin-upload-hint">
            {allowedHint}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept={acceptAttribute || undefined}
          />
        </div>
      )}

      {/* Arquivo selecionado */}
      {selectedFile && !uploading && (
        <div className="admin-upload-selected">
          <div className="admin-upload-file-info">
            <div className="admin-upload-file-icon">
              {getFileExtension(selectedFile.name)}
            </div>
            <div className="admin-upload-file-details">
              <div className="admin-upload-file-name">{selectedFile.name}</div>
              <div className="admin-upload-file-meta">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
            <button
              className="admin-btn-sm admin-btn-danger"
              onClick={handleRemove}
            >
              Remover
            </button>
          </div>
          <button
            className="admin-btn-primary"
            onClick={handleUpload}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            Fazer Upload
          </button>
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="admin-upload-progress">
          <div className="admin-upload-progress-text">
            Enviando... {progress}%
          </div>
          <div className="admin-upload-progress-bar">
            <div
              className="admin-upload-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="admin-form-error" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}
