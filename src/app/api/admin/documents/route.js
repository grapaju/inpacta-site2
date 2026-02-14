import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  formatDocumentoPublicTitle,
  normalizeStatusDocumento,
  normalizeTipoDocumento,
  validateAnexoFields,
  validateTipoDocumentoPhase
} from '@/lib/biddingDocumentRules';
import { registrarHistoricoLicitacao } from '@/lib/licitacaoHistorico';

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

    // Campos novos (PT-BR no payload/UI)
    const tipoDocumento = normalizeTipoDocumento(
      body.tipo_documento ?? body.tipoDocumento ?? body.documentType
    );
    const numeroAnexoRaw = body.numero_anexo ?? body.numeroAnexo ?? body.annexNumber;
    const numeroAnexo =
      numeroAnexoRaw === null || numeroAnexoRaw === undefined || numeroAnexoRaw === ''
        ? null
        : parseInt(numeroAnexoRaw, 10);
    const tituloExibicao =
      body.titulo_exibicao ?? body.tituloExibicao ?? body.displayTitle ?? null;

    const rawStatusForValidation = body.status_documento ?? body.statusDocumento ?? status;
    const normalizedStatus = normalizeStatusDocumento(rawStatusForValidation);

    if (rawStatusForValidation !== undefined && rawStatusForValidation !== null && rawStatusForValidation !== '') {
      if (!normalizedStatus) {
        return NextResponse.json(
          { success: false, error: 'status_documento inválido (use RASCUNHO/PUBLICADO)' },
          { status: 400 }
        );
      }
    }

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

    if ((body.tipo_documento ?? body.tipoDocumento ?? body.documentType) && !tipoDocumento) {
      return NextResponse.json(
        { success: false, error: 'tipo_documento inválido' },
        { status: 400 }
      );
    }

    const tipoPhaseError = validateTipoDocumentoPhase({ tipoDocumento, phase });
    if (tipoPhaseError) {
      return NextResponse.json(
        { success: false, error: tipoPhaseError },
        { status: 400 }
      );
    }

    const anexoError = validateAnexoFields({ tipoDocumento, numeroAnexo: numeroAnexoRaw });
    if (anexoError) {
      return NextResponse.json(
        { success: false, error: anexoError },
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

    const initialStatus = normalizedStatus || (decoded.role === 'ADMIN' ? 'PUBLISHED' : 'DRAFT');

    if (initialStatus === 'PUBLISHED' && decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Apenas ADMIN pode publicar documentos' },
        { status: 403 }
      );
    }

    // Hotfix compat: alguns ambientes legados possuem colunas snake_case NOT NULL (ex: file_name).
    // Para evitar violação de constraint, inserimos preenchendo camelCase e snake_case quando existirem.
    const now = new Date();
    const id = randomUUID();

    const cols = await prisma.$queryRaw(
      Prisma.sql`
        SELECT column_name, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'bidding_documents'
      `
    );

    const columnInfo = new Map(
      (cols || []).map((c) => [c.column_name, { udt_name: c.udt_name }])
    );
    const columnSet = new Set(columnInfo.keys());

    const safeCol = (name) => {
      if (!columnSet.has(name)) return null;
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) return null;
      return name;
    };

    const dataByColumn = {
      id,

      // FK licitação
      biddingId,
      bidding_id: biddingId,

      // classificação
      phase,
      title,
      description: description || null,

      // tipagem formal
      tipoDocumento: tipoDocumento || null,
      tipo_documento: tipoDocumento || null,
      document_type: tipoDocumento || null,

      numeroAnexo: numeroAnexo,
      numero_anexo: numeroAnexo,
      annex_number: numeroAnexo,

      tituloExibicao: tituloExibicao || null,
      titulo_exibicao: tituloExibicao || null,
      display_title: tituloExibicao || null,

      // ordenação/status
      order: order !== undefined && order !== null ? parseInt(order, 10) : 0,
      status: initialStatus,

      // arquivo (camel + snake)
      fileName,
      file_name: fileName,
      filename: fileName,

      filePath,
      file_path: filePath,
      filepath: filePath,
      path: filePath,

      fileSize: fileSize ? parseInt(fileSize, 10) : 0,
      file_size: fileSize ? parseInt(fileSize, 10) : 0,

      fileType: fileType || 'application/pdf',
      file_type: fileType || 'application/pdf',
      mimetype: fileType || 'application/pdf',

      fileHash: fileHash || null,
      file_hash: fileHash || null,

      // auditoria (camel + snake)
      createdById: decoded.userId,
      created_by: decoded.userId,
      created_by_id: decoded.userId,
      user_id: decoded.userId,

      createdAt: now,
      created_at: now,

      updatedAt: now,
      updated_at: now,
    };

    const insertColumns = [];
    const insertValues = [];
    for (const [rawName, value] of Object.entries(dataByColumn)) {
      const name = safeCol(rawName);
      if (!name) continue;
      insertColumns.push(Prisma.raw(`"${name}"`));

      const udtName = columnInfo.get(name)?.udt_name;
      if (udtName === 'BiddingPhase') {
        insertValues.push(Prisma.sql`${value}::"BiddingPhase"`);
      } else if (udtName === 'DocumentoStatusPublicacao') {
        insertValues.push(Prisma.sql`${value}::"DocumentoStatusPublicacao"`);
      } else {
        insertValues.push(Prisma.sql`${value}`);
      }
    }

    if (insertColumns.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tabela bidding_documents sem colunas compatíveis' },
        { status: 500 }
      );
    }

    await prisma.$executeRaw(
      Prisma.sql`INSERT INTO "bidding_documents" (${Prisma.join(insertColumns)}) VALUES (${Prisma.join(insertValues)})`
    );

    let document = null;
    try {
      document = await prisma.biddingDocument.findUnique({
        where: { id },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          bidding: { select: { id: true, number: true, title: true } }
        }
      });
    } catch {
      // ok: em ambientes com schema divergente, retornamos payload mínimo
    }

    if (initialStatus === 'PUBLISHED') {
      const label = formatDocumentoPublicTitle({
        tipoDocumento,
        numeroAnexo,
        tituloExibicao,
        title
      });
      await registrarHistoricoLicitacao({
        licitacaoId: biddingId,
        acao: 'DOCUMENTO_PUBLICADO',
        descricao: `Documento publicado: ${label}`,
        usuarioId: decoded.userId
      });
    }

    return NextResponse.json({
      success: true,
      data: document || { id, biddingId, phase, title, description: description || null, order: dataByColumn.order, status: initialStatus, fileName, filePath },
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
