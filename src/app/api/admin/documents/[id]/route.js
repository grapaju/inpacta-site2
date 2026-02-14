import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import {
  formatDocumentoPublicTitle,
  normalizeStatusDocumento,
  normalizeTipoDocumento,
  validateAnexoFields,
  validateTipoDocumentoPhase
} from '@/lib/biddingDocumentRules';
import { registrarHistoricoLicitacao } from '@/lib/licitacaoHistorico';
import { Prisma } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

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
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('Token inválido');
  }
}

function isAuthError(error) {
  const message = String(error?.message || '');
  return (
    message.includes('Token não fornecido') ||
    message.includes('Token inválido') ||
    message.toLowerCase().includes('jwt')
  );
}

async function getBiddingDocumentCompatById(id) {
  try {
    const cols = await prisma.$queryRaw(
      Prisma.sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'bidding_documents'
      `
    );
    const columnSet = new Set((cols || []).map((c) => c.column_name));

    const safe = (name) => {
      if (!columnSet.has(name)) return null;
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) return null;
      return name;
    };

    const coalesce = (a, b) => {
      if (a && b && a !== b) return Prisma.raw(`COALESCE("${a}", "${b}")`);
      if (a) return Prisma.raw(`"${a}"`);
      if (b) return Prisma.raw(`"${b}"`);
      return Prisma.raw('NULL');
    };

    const biddingIdExpr = coalesce(safe('biddingId'), safe('bidding_id'));
    const createdByIdExpr = coalesce(safe('createdById'), safe('created_by'));

    const tipoDocumentoExpr = coalesce(safe('tipoDocumento'), safe('tipo_documento') || safe('document_type'));
    const numeroAnexoExpr = coalesce(safe('numeroAnexo'), safe('numero_anexo') || safe('annex_number'));
    const tituloExibicaoExpr = coalesce(safe('tituloExibicao'), safe('titulo_exibicao') || safe('display_title'));

    const rows = await prisma.$queryRaw(
      Prisma.sql`
        SELECT
          "id",
          ${biddingIdExpr} AS "biddingId",
          ${createdByIdExpr} AS "createdById",
          "title",
          ${tipoDocumentoExpr} AS "tipoDocumento",
          ${numeroAnexoExpr} AS "numeroAnexo",
          ${tituloExibicaoExpr} AS "tituloExibicao"
        FROM "bidding_documents"
        WHERE "id" = ${id}
        LIMIT 1
      `
    );

    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.id) return null;
    return row;
  } catch {
    return null;
  }
}

/**
 * GET /api/admin/documents/[id]
 * Buscar documento anexo de licitação (biddingDocument)
 */
export async function GET(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const document = await prisma.biddingDocument.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        bidding: { select: { id: true, number: true, title: true, modality: true } },
      },
    });

    if (!document) {
      return NextResponse.json({ success: false, error: 'Documento não encontrado' }, { status: 404 });
    }

    if (decoded.role !== 'ADMIN' && document.createdById !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para visualizar este documento' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    console.error('❌ Erro ao buscar documento (admin):', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar documento' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/documents/[id]
 * Atualizar documento anexo de licitação
 */
export async function PATCH(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const currentDocument = await prisma.biddingDocument.findUnique({ where: { id } });
    if (!currentDocument) {
      return NextResponse.json({ success: false, error: 'Documento não encontrado' }, { status: 404 });
    }

    if (decoded.role !== 'ADMIN' && currentDocument.createdById !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para editar este documento' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData = {
      updatedById: decoded.userId,
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.phase !== undefined) updateData.phase = body.phase;
    if (body.order !== undefined) {
      updateData.order = body.order === null || body.order === '' ? 0 : parseInt(body.order, 10);
    }

    // Campos novos (PT-BR no payload)
    const rawTipo = body.tipo_documento ?? body.tipoDocumento ?? body.documentType;
    const rawNumeroAnexo = body.numero_anexo ?? body.numeroAnexo ?? body.annexNumber;
    const rawTituloExibicao = body.titulo_exibicao ?? body.tituloExibicao ?? body.displayTitle;
    const rawStatusDocumento = body.status_documento ?? body.statusDocumento ?? body.status;

    if (rawTipo !== undefined) {
      const normalizedTipo = normalizeTipoDocumento(rawTipo);
      if (!normalizedTipo && rawTipo !== null && rawTipo !== '') {
        return NextResponse.json({ success: false, error: 'tipo_documento inválido' }, { status: 400 });
      }
      updateData.tipoDocumento = normalizedTipo;
    }

    if (rawNumeroAnexo !== undefined) {
      updateData.numeroAnexo =
        rawNumeroAnexo === null || rawNumeroAnexo === '' ? null : parseInt(rawNumeroAnexo, 10);
    }

    if (rawTituloExibicao !== undefined) {
      updateData.tituloExibicao = rawTituloExibicao ? String(rawTituloExibicao) : null;
    }

    if (rawStatusDocumento !== undefined) {
      const normalized = normalizeStatusDocumento(rawStatusDocumento);
      if (!normalized) {
        return NextResponse.json(
          { success: false, error: 'status_documento inválido (use RASCUNHO/PUBLICADO)' },
          { status: 400 }
        );
      }

      if (normalized === 'PUBLISHED' && decoded.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Apenas ADMIN pode publicar documentos' },
          { status: 403 }
        );
      }
      updateData.status = normalized;
    }

    if (body.fileName !== undefined) updateData.fileName = body.fileName;
    if (body.filePath !== undefined) updateData.filePath = body.filePath;
    if (body.fileSize !== undefined) updateData.fileSize = body.fileSize ? parseInt(body.fileSize, 10) : 0;
    if (body.fileType !== undefined) updateData.fileType = body.fileType || 'application/pdf';
    if (body.fileHash !== undefined) updateData.fileHash = body.fileHash || null;

    // Validações de negócio (tipo → fase e campos de anexo)
    const effectiveTipoDocumento = updateData.tipoDocumento !== undefined ? updateData.tipoDocumento : currentDocument.tipoDocumento;
    const effectivePhase = updateData.phase !== undefined ? updateData.phase : currentDocument.phase;
    const tipoPhaseError = validateTipoDocumentoPhase({ tipoDocumento: effectiveTipoDocumento, phase: effectivePhase });
    if (tipoPhaseError) {
      return NextResponse.json({ success: false, error: tipoPhaseError }, { status: 400 });
    }

    const effectiveNumeroAnexo = updateData.numeroAnexo !== undefined ? updateData.numeroAnexo : currentDocument.numeroAnexo;
    const anexoError = validateAnexoFields({ tipoDocumento: effectiveTipoDocumento, numeroAnexo: effectiveNumeroAnexo });
    if (anexoError) {
      return NextResponse.json({ success: false, error: anexoError }, { status: 400 });
    }

    const document = await prisma.biddingDocument.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        bidding: { select: { id: true, number: true, title: true, modality: true } },
      },
    });

    if (currentDocument.status !== document.status && document.status === 'PUBLISHED') {
      const label = formatDocumentoPublicTitle({
        tipoDocumento: document.tipoDocumento,
        numeroAnexo: document.numeroAnexo,
        tituloExibicao: document.tituloExibicao,
        title: document.title
      });
      await registrarHistoricoLicitacao({
        licitacaoId: document.biddingId,
        acao: 'DOCUMENTO_PUBLICADO',
        descricao: `Documento publicado: ${label}`,
        usuarioId: decoded.userId
      });
    }

    return NextResponse.json({ success: true, data: document, message: 'Documento atualizado com sucesso' });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    console.error('❌ Erro ao atualizar documento (admin):', error);
    const details = error?.message ? String(error.message) : undefined;
    return NextResponse.json({ success: false, error: 'Erro ao atualizar documento', details }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/documents/[id]
 * Remover documento anexo de licitação
 */
export async function DELETE(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    // Compat: em bancos legados, colunas novas (ex: tipoDocumento) podem não existir.
    // Evitamos prisma.biddingDocument.findUnique() para não estourar P2022.
    const document = await getBiddingDocumentCompatById(id);
    if (!document) {
      return NextResponse.json({ success: false, error: 'Documento não encontrado' }, { status: 404 });
    }

    if (decoded.role !== 'ADMIN' && (!document.createdById || document.createdById !== decoded.userId)) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para deletar este documento' },
        { status: 403 }
      );
    }

    // Evita falhas por corrida (ex: já removido em outra aba) e não lança P2025.
    const deleted = await prisma.biddingDocument.deleteMany({ where: { id } });
    if (!deleted?.count) {
      return NextResponse.json({ success: false, error: 'Documento não encontrado' }, { status: 404 });
    }

    const label = formatDocumentoPublicTitle({
      tipoDocumento: document.tipoDocumento,
      numeroAnexo: document.numeroAnexo,
      tituloExibicao: document.tituloExibicao,
      title: document.title
    });
    if (document.biddingId) {
      await registrarHistoricoLicitacao({
        licitacaoId: document.biddingId,
        acao: 'DOCUMENTO_EXCLUIDO',
        descricao: `Documento excluído: ${label}`,
        usuarioId: decoded.userId
      });
    }

    return NextResponse.json({ success: true, message: 'Documento deletado com sucesso' });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    console.error('❌ Erro ao deletar documento (admin):', error);
    const details = error?.message ? String(error.message) : undefined;
    const code = error?.code ? String(error.code) : undefined;
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar documento', details, code },
      { status: 500 }
    );
  }
}
