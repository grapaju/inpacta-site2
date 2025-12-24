import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

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
    try {
      verifyToken(request);
    } catch (authError) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

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

    return NextResponse.json({
      success: true,
      data: bidding
    });
  } catch (error) {
    console.error('❌ Erro ao buscar licitação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar licitação' },
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
