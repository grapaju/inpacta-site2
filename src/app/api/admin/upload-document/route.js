import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

// Função para validar JWT
function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Token não fornecido');
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
}

function sanitizeForUrl(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function getFileExtension(fileName) {
  const parts = String(fileName || '').split('.');
  if (parts.length < 2) return '';
  return parts.pop().toLowerCase();
}

export async function POST(request) {
  try {
    // Verificar autenticação
    const decoded = verifyToken(request);
    
    // Verificar permissão
    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const documentSlug = formData.get('documentSlug');
    const yearFromClient = formData.get('year');
    const subcategoria = formData.get('subcategoria'); // Ex: "Contrato", "Termo Aditivo"
    const numeroDocumento = formData.get('numeroDocumento'); // Ex: "001/2024"

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    if (!documentSlug) {
      return NextResponse.json(
        { success: false, error: 'documentSlug é obrigatório' },
        { status: 400 }
      );
    }

    // Validar tamanho (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Arquivo muito grande. Máximo: 50MB' },
        { status: 400 }
      );
    }

    // Documentos públicos: somente PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Envie apenas PDF' },
        { status: 400 }
      );
    }

    // Preparar arquivo
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = getFileExtension(file.name);
    
    // Gerar nome no padrão: tipo-numero-ano-inpacta.pdf
    const year = yearFromClient ? parseInt(String(yearFromClient), 10) : new Date().getFullYear();
    let filename;
    
    if (subcategoria && numeroDocumento) {
      // Padrão personalizado: tipo-numero-ano-inpacta.pdf
      const tipoSanitized = sanitizeForUrl(subcategoria);
      const numeroSanitized = sanitizeForUrl(numeroDocumento).replace(/\//g, '-');
      filename = `${tipoSanitized}-${numeroSanitized}-${year}-inpacta${ext ? `.${ext}` : '.pdf'}`;
    } else {
      // Fallback: timestamp-nome-original
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const safeBaseName = sanitizeForUrl(baseName) || 'arquivo';
      const timestamp = Date.now();
      filename = `${timestamp}-${safeBaseName}${ext ? `.${ext}` : ''}`;
    }

    const safeSlug = sanitizeForUrl(documentSlug);

    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'documentos',
      String(year),
      safeSlug
    );

    const publicPath = `/uploads/documentos/${year}/${safeSlug}/${filename}`;

    // Criar diretórios se não existirem
    await mkdir(uploadDir, { recursive: true });

    // Salvar arquivo
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      filePath: publicPath,
      fileSize: file.size,
      fileType: file.type,
      fileName: file.name,
      fileHash
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}
