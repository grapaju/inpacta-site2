import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), 'public', 'uploads');

function getBearerTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

function getCookieToken(request) {
  try {
    return request.cookies?.get?.('adminToken')?.value || null;
  } catch {
    return null;
  }
}

function verifyJwtToken(token) {
  if (!token) {
    throw new Error('Token não fornecido');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
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

function stripExtension(fileName) {
  return String(fileName || '').replace(/\.[^/.]+$/, '');
}

function isAcceptedMimeOrExtension(file, accepted) {
  const mime = String(file?.type || '').toLowerCase();
  const ext = getFileExtension(file?.name);
  return Boolean(
    (mime && accepted.mimes.includes(mime)) ||
    (ext && accepted.exts.includes(ext))
  );
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    // Verificar autenticação (suporta header, cookie e token no FormData)
    const tokenFromHeader = getBearerTokenFromRequest(request);
    const tokenFromCookie = getCookieToken(request);
    const tokenFromBody = formData.get('token') || formData.get('adminToken');
    const token = tokenFromHeader || tokenFromCookie || tokenFromBody;
    const decoded = verifyJwtToken(token);
    
    // Verificar permissão
    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const file = formData.get('file');
    const moduleFromClient = formData.get('module');
    const biddingId = formData.get('biddingId');
    const phase = formData.get('phase');

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

    const isLicitacaoUpload = String(moduleFromClient || '').toUpperCase() === 'LICITACAO';
    if (isLicitacaoUpload) {
      if (!biddingId) {
        return NextResponse.json(
          { success: false, error: 'biddingId é obrigatório' },
          { status: 400 }
        );
      }

      if (!phase) {
        return NextResponse.json(
          { success: false, error: 'phase é obrigatório' },
          { status: 400 }
        );
      }
    } else {
      if (!documentSlug) {
        return NextResponse.json(
          { success: false, error: 'documentSlug é obrigatório' },
          { status: 400 }
        );
      }
    }

    // Validar tamanho (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Arquivo muito grande. Máximo: 50MB' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (isLicitacaoUpload) {
      const accepted = {
        mimes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword',
          'application/vnd.ms-excel'
        ],
        exts: ['pdf', 'docx', 'xlsx', 'doc', 'xls']
      };

      if (!isAcceptedMimeOrExtension(file, accepted)) {
        return NextResponse.json(
          { success: false, error: 'Tipo de arquivo não permitido. Use PDF, DOCX ou XLSX.' },
          { status: 400 }
        );
      }
    } else {
      // Documentos públicos (central): somente PDF
      const accepted = { mimes: ['application/pdf'], exts: ['pdf'] };
      if (!isAcceptedMimeOrExtension(file, accepted)) {
        return NextResponse.json(
          { success: false, error: 'Envie apenas PDF' },
          { status: 400 }
        );
      }
    }

    // Preparar arquivo
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = getFileExtension(file.name);

    let uploadDir;
    let publicPath;
    let filename;

    if (isLicitacaoUpload) {
      const bidding = await prisma.bidding.findUnique({
        where: { id: String(biddingId) },
        select: { number: true }
      });

      if (!bidding) {
        return NextResponse.json(
          { success: false, error: 'Licitação não encontrada' },
          { status: 400 }
        );
      }

      const safeBiddingNumber = sanitizeForUrl(bidding.number);
      const safePhase = sanitizeForUrl(phase);

      const baseName = stripExtension(file.name);
      const safeBaseName = sanitizeForUrl(baseName) || 'arquivo';
      const timestamp = Date.now();
      filename = `${timestamp}-${safeBaseName}${ext ? `.${ext}` : ''}`;

      uploadDir = path.join(UPLOAD_DIR, 'licitacoes', safeBiddingNumber, safePhase);
      publicPath = `/uploads/licitacoes/${safeBiddingNumber}/${safePhase}/${filename}`;
    } else {
      // Gerar nome no padrão: tipo-numero-ano-inpacta.pdf
      const year = yearFromClient ? parseInt(String(yearFromClient), 10) : new Date().getFullYear();

      if (subcategoria && numeroDocumento) {
        const tipoSanitized = sanitizeForUrl(subcategoria);
        const numeroSanitized = sanitizeForUrl(numeroDocumento).replace(/\//g, '-');
        filename = `${tipoSanitized}-${numeroSanitized}-${year}-inpacta${ext ? `.${ext}` : '.pdf'}`;
      } else {
        const baseName = stripExtension(file.name);
        const safeBaseName = sanitizeForUrl(baseName) || 'arquivo';
        const timestamp = Date.now();
        filename = `${timestamp}-${safeBaseName}${ext ? `.${ext}` : ''}`;
      }

      const safeSlug = sanitizeForUrl(documentSlug);
      uploadDir = path.join(UPLOAD_DIR, 'documentos', String(year), safeSlug);
      publicPath = `/uploads/documentos/${year}/${safeSlug}/${filename}`;
    }

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
