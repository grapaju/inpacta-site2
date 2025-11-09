import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024'

// Configurações de upload
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// Função para validar JWT
function verifyToken(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Token não fornecido')
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Token inválido')
  }
}

// Função para gerar nome único do arquivo
function generateUniqueFilename(originalName) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = path.extname(originalName).toLowerCase()
  return `${timestamp}_${random}${extension}`
}

// Função para garantir que o diretório existe
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(request) {
  try {
    // Verificar autenticação
    const decoded = verifyToken(request)
    
    // Verificar se é admin ou editor
    if (!['ADMIN', 'EDITOR'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores e editores podem fazer upload.' },
        { status: 403 }
      )
    }

    // Obter dados do form
    const formData = await request.formData()
    const file = formData.get('image')
    const category = formData.get('category') || 'general' // news, seo, general

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB' },
        { status: 400 }
      )
    }

    // VERCEL FIX: Em produção no Vercel, não podemos escrever no sistema de arquivos
    // Por isso, vamos usar uma solução temporária com Base64
    if (process.env.VERCEL) {
      // Converter arquivo para base64 para armazenamento temporário
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      
      // Gerar nome único para referência
      const fileName = generateUniqueFilename(file.name)
      
      // Criar objeto de resposta
      const uploadResult = {
        url: dataUrl, // Retorna data URL para uso imediato
        filename: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        category: category,
        uploadedBy: decoded.email,
        uploadedAt: new Date().toISOString(),
        isDataUrl: true // Flag para indicar que é data URL
      }

      return NextResponse.json({
        success: true,
        message: 'Upload realizado com sucesso (modo data URL)',
        data: uploadResult
      }, { status: 200 })
    }

    // Para desenvolvimento local, manter o upload para arquivo
    // Garantir que o diretório existe
    await ensureUploadDir()

    // Criar subdiretório por categoria
    const categoryDir = path.join(UPLOAD_DIR, category)
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const fileName = generateUniqueFilename(file.name)
    const filePath = path.join(categoryDir, fileName)

    // Converter arquivo para buffer e salvar
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Gerar URL pública
    const publicUrl = `/uploads/${category}/${fileName}`

    // Criar objeto de resposta com metadados
    const uploadResult = {
      url: publicUrl,
      filename: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      category: category,
      uploadedBy: decoded.email,
      uploadedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Upload realizado com sucesso',
      data: uploadResult
    }, { status: 200 })

  } catch (error) {
    console.error('Erro no upload:', error)
    
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

// Listar arquivos uploadeados (opcional)
export async function GET(request) {
  try {
    // Verificar autenticação
    const decoded = verifyToken(request)
    
    if (!['ADMIN', 'EDITOR'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'general'

    // Aqui poderia implementar listagem de arquivos
    // Por enquanto, retorna estrutura básica
    return NextResponse.json({
      success: true,
      message: 'Endpoint de listagem disponível',
      category: category
    })

  } catch (error) {
    console.error('Erro ao listar uploads:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}