import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

function verifyToken(request) {
  // Tentar primeiro Authorization header
  const authHeader = request.headers.get('authorization');
  let token = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Fallback para cookies (para navegador simples do VS Code)
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/adminToken=([^;]+)/);
    if (tokenMatch) {
      token = tokenMatch[1];
    }
  }
  
  if (!token) {
    throw new Error('Token não fornecido');
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded;
}

/**
 * GET /api/admin/biddings/[id]
 * Obter licitação com documentos e movimentações
 */
export async function GET(request, { params }) {
  try {
    let decoded;
    try {
      decoded = verifyToken(request);
    } catch {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;

    const bidding = await prisma.bidding.findUnique({
      where: { id },
      include: {
        movements: {
          orderBy: { date: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!bidding) {
      return NextResponse.json(
        { success: false, error: 'Licitação não encontrada' },
        { status: 404 }
      );
    }

    // Carregar documentos em query separada. Compatível com colunas camelCase e snake_case.
    let documents = [];
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

      const bidCol = safe('biddingId') || safe('bidding_id');
      if (!bidCol) {
        documents = [];
      } else {
        const fileNameCol = safe('fileName') || safe('file_name') || safe('filename');
        const filePathCol = safe('filePath') || safe('file_path') || safe('filepath') || safe('path');
        const fileSizeCol = safe('fileSize') || safe('file_size');
        const fileTypeCol = safe('fileType') || safe('file_type') || safe('mimetype');
        const fileHashCol = safe('fileHash') || safe('file_hash');
        const createdAtCol = safe('createdAt') || safe('created_at');

        const selectCoalesce = (primary, fallback) => {
          if (primary && fallback && primary !== fallback) {
            return Prisma.raw(`COALESCE("${primary}", "${fallback}")`);
          }
          if (primary) return Prisma.raw(`"${primary}"`);
          if (fallback) return Prisma.raw(`"${fallback}"`);
          return Prisma.raw('NULL');
        };

        const fileNameExpr = selectCoalesce(safe('fileName'), safe('file_name') || safe('filename'));
        const filePathExpr = selectCoalesce(safe('filePath'), safe('file_path') || safe('filepath') || safe('path'));
        const fileSizeExpr = selectCoalesce(safe('fileSize'), safe('file_size'));
        const fileTypeExpr = selectCoalesce(safe('fileType'), safe('file_type') || safe('mimetype'));
        const fileHashExpr = selectCoalesce(safe('fileHash'), safe('file_hash'));
        const createdAtExpr = selectCoalesce(safe('createdAt'), safe('created_at'));

        const bidColIdent = Prisma.raw(`"${bidCol}"`);
        documents = await prisma.$queryRaw(
          Prisma.sql`
            SELECT
              "id",
              "phase",
              "title",
              "description",
              "order",
              "status",
              ${fileNameExpr} AS "fileName",
              ${filePathExpr} AS "filePath",
              ${fileSizeExpr} AS "fileSize",
              ${fileTypeExpr} AS "fileType",
              ${fileHashExpr} AS "fileHash",
              ${createdAtExpr} AS "createdAt"
            FROM "bidding_documents"
            WHERE ${bidColIdent} = ${id}
            ORDER BY "phase" ASC, "order" ASC, "createdAt" DESC
          `
        );
      }
    } catch (docError) {
      console.error('⚠️ Erro ao carregar documentos da licitação:', docError);
      documents = [];
    }

    return NextResponse.json({
      success: true,
      data: { ...bidding, documents }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar licitação:', error);
    const includeDetails = process.env.API_DEBUG_ERRORS === 'true';
    const details = includeDetails && error?.message ? String(error.message) : undefined;
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar licitação', ...(details ? { details } : {}) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/biddings/[id]
 * Atualizar licitação
 */
export async function PATCH(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem atualizar licitações' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Buscar licitação atual
    const currentBidding = await prisma.bidding.findUnique({
      where: { id }
    });

    if (!currentBidding) {
      return NextResponse.json(
        { success: false, error: 'Licitação não encontrada' },
        { status: 404 }
      );
    }

    // Preparar dados de atualização
    const updateData = {};

    // Campos que podem ser atualizados
    const allowedFields = [
      'title', 'object', 'description', 'modality', 'type', 'status',
      'legalBasis', 'srp', 'publicationDate', 'openingDate', 'closingDate',
      'estimatedValue', 'finalValue', 'winner', 'winnerDocument', 'notes'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        if (field.includes('Date') && body[field]) {
          updateData[field] = new Date(body[field]);
        } else if (field === 'estimatedValue' || field === 'finalValue') {
          updateData[field] = body[field] ? parseFloat(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Validações específicas por status
    if (updateData.status === 'HOMOLOGADO' || updateData.status === 'ADJUDICADO') {
      if (!body.winner || !body.finalValue) {
        return NextResponse.json(
          { success: false, error: 'Status HOMOLOGADO/ADJUDICADO requer empresa vencedora e valor final' },
          { status: 400 }
        );
      }
    }

    // Atualizar licitação
    const bidding = await prisma.bidding.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            movements: true
          }
        }
      }
    });

    // Registrar mudança de status se houver
    if (updateData.status && updateData.status !== currentBidding.status) {
      const phaseMap = {
        'PLANEJAMENTO': 'ABERTURA',
        'PUBLICADO': 'ABERTURA',
        'EM_ANDAMENTO': 'JULGAMENTO',
        'SUSPENSA': 'JULGAMENTO',
        'HOMOLOGADO': 'HOMOLOGACAO',
        'ADJUDICADO': 'CONTRATACAO',
        'CONCLUIDA': 'ENCERRAMENTO'
      };

      await prisma.biddingMovement.create({
        data: {
          biddingId: id,
          phase: phaseMap[updateData.status] || 'ABERTURA',
          description: `Status alterado de ${currentBidding.status} para ${updateData.status}`,
          createdById: decoded.userId
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: bidding,
      message: 'Licitação atualizada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar licitação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar licitação' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/biddings/[id]
 * Deletar licitação (apenas em planejamento)
 */
export async function DELETE(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem deletar licitações' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const bidding = await prisma.bidding.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            movements: true
          }
        }
      }
    });

    if (!bidding) {
      return NextResponse.json(
        { success: false, error: 'Licitação não encontrada' },
        { status: 404 }
      );
    }

    // Não pode deletar se status diferente de PLANEJAMENTO
    if (bidding.status !== 'PLANEJAMENTO') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Não é possível excluir licitações publicadas. Use os status REVOGADO ou ANULADO ao invés de excluir.' 
        },
        { status: 403 }
      );
    }

    // Deletar licitação (cascade vai deletar movimentações)
    await prisma.bidding.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Licitação deletada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar licitação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar licitação' },
      { status: 500 }
    );
  }
}
