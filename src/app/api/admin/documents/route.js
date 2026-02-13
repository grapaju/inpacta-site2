import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

function getBearerTokenFromRequest(request) {
  const authorization = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authorization) return null;

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

function getAdminTokenFromCookies(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const parts = cookieHeader.split(';').map((p) => p.trim());
    for (const part of parts) {
      const [key, ...rest] = part.split('=');
      if (key === 'adminToken') return decodeURIComponent(rest.join('='));
    }
    return null;
  } catch {
    return null;
  }
}

function verifyToken(request) {
  const token = getBearerTokenFromRequest(request) || getAdminTokenFromCookies(request);
  if (!token) throw new Error('Token não fornecido');

  const secret = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';
  return jwt.verify(token, secret);
}

function isAuthError(error) {
  const message = String(error?.message || '');
  return (
    message.includes('Token não fornecido') ||
    message.includes('Token inválido') ||
    message.toLowerCase().includes('jwt')
  );
}

/**
 * GET /api/admin/documents
 * (Compat) Lista documentos anexos da licitação (LICITACAO).
 */
export async function GET(request) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleParam = (searchParams.get('module') || 'LICITACAO').toUpperCase();

    if (moduleParam !== 'LICITACAO') {
      return NextResponse.json(
        {
          success: false,
          error: 'Listagem via /api/admin/documents está disponível apenas para LICITACAO. Para documentos públicos centralizados use /api/admin/documentos.'
        },
        { status: 400 }
      );
    }

    const biddingId = searchParams.get('biddingId') || undefined;
    const phase = searchParams.get('phase') || undefined;
    const status = searchParams.get('status') || undefined;

    const where = {
      ...(biddingId ? { biddingId } : {}),
      ...(phase ? { phase } : {}),
      ...(status ? { status } : {})
    };

    const documents = await prisma.biddingDocument.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        bidding: { select: { id: true, number: true, title: true } }
      }
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    console.error('❌ Erro ao buscar documentos (admin):', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar documentos' }, { status: 500 });
  }
}

/**
 * POST /api/admin/documents
 * (Compat) Criar documento. Atualmente, atende principalmente LICITACAO.
 */
export async function POST(request) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      fileName,
      filePath,
      fileSize,
      fileType,
      module: moduleParam,
      phase,
      order,
      biddingId,
      status,
      fileHash,
    } = body;

    const resolvedModule = (moduleParam || 'LICITACAO').toUpperCase();

    if (resolvedModule !== 'LICITACAO') {
      return NextResponse.json(
        {
          success: false,
          error: 'Criação via /api/admin/documents está disponível apenas para LICITACAO. Para documentos públicos centralizados use /api/admin/documentos.'
        },
        { status: 400 }
      );
    }

    if (!title || !fileName || !filePath) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: title, fileName, filePath' },
        { status: 400 }
      );
    }

    if (!biddingId || !phase) {
      return NextResponse.json(
        { success: false, error: 'Documentos de licitação devem ter biddingId e phase' },
        { status: 400 }
      );
    }

    const bidding = await prisma.bidding.findUnique({
      where: { id: biddingId },
      select: { id: true }
    });

    if (!bidding) {
      return NextResponse.json({ success: false, error: 'Licitação não encontrada' }, { status: 400 });
    }

    const initialStatus = status || (decoded.role === 'ADMIN' ? 'PUBLISHED' : 'DRAFT');

    const document = await prisma.biddingDocument.create({
      data: {
        biddingId,
        phase,
        title,
        description: description || null,
        order: order !== undefined && order !== null ? parseInt(order, 10) : 0,
        status: initialStatus,
        fileName,
        filePath,
        fileSize: fileSize ? parseInt(fileSize, 10) : 0,
        fileType: fileType || 'application/pdf',
        fileHash: fileHash || null,
        createdById: decoded.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        bidding: { select: { id: true, number: true, title: true } }
      }
    });

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Documento criado com sucesso'
    });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    console.error('❌ Erro ao criar documento:', error);
    const details = error?.message ? String(error.message) : undefined;
    return NextResponse.json({ success: false, error: 'Erro ao criar documento', details }, { status: 500 });
  }
}
