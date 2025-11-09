'use client'

import { useState, useRef } from 'react'

export default function ImageUpload({
  onImageSelect,
  currentImage = null,
  category = 'general',
  className = '',
  acceptedTypes = 'image/*',
  maxSizeMB = 5,
  preview = true
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentImage)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  // Validar arquivo
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = maxSizeMB * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.')
    }

    if (file.size > maxSize) {
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`)
    }

    return true
  }

  // Upload do arquivo
  const uploadFile = async (file) => {
    setError(null)
    setUploading(true)

    try {
      validateFile(file)

      const formData = new FormData()
      formData.append('image', file)
      formData.append('category', category)

      const token = localStorage.getItem('adminToken')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload')
      }

      // Atualizar preview
      if (preview) {
        setPreviewUrl(result.data.url)
      }

      // Chamar callback com os dados da imagem
      if (onImageSelect) {
        onImageSelect(result.data)
      }

      return result.data

    } catch (error) {
      console.error('Erro no upload:', error)
      setError(error.message)
      throw error
    } finally {
      setUploading(false)
    }
  }

  // Handlers de drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      uploadFile(files[0])
    }
  }

  // Handler de seleção de arquivo
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  // Abrir seletor de arquivo
  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  // Remover imagem
  const removeImage = () => {
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onImageSelect) {
      onImageSelect(null)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Área de upload */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">Fazendo upload...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-600 mb-1">
              Clique para selecionar ou arraste uma imagem aqui
            </p>
            <p className="text-sm text-gray-400">
              JPEG, PNG, WebP ou GIF (máx. {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="text-red-500 mr-2">⚠️</div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Preview da imagem */}
      {preview && previewUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Preview:</span>
            <button
              onClick={removeImage}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Remover
            </button>
          </div>
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-48 object-cover rounded-lg border border-gray-200"
            />
          </div>
        </div>
      )}
    </div>
  )
}