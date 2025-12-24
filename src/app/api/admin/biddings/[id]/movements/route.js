import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido');
  }
  
  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded;
}

/**
 * POST /api/admin/biddings/[id]/movements
 * Adicionar movimentação à licitação
 */
export async function POST(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para adicionar movimentações' },
        { status: 403 }
      );
    }

    const { id: biddingId } = await params;
    const body = await request.json();

    const { phase, description, date } = body;

    // Validações
    if (!phase || !description) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: phase, description' },
        { status: 400 }
      );
    }

    // Verificar se licitação existe
    const bidding = await prisma.bidding.findUnique({
      where: { id: biddingId }
    });

    if (!bidding) {
      return NextResponse.json(
        { success: false, error: 'Licitação não encontrada' },
        { status: 404 }
      );
    }

    // Criar movimentação
    const movement = await prisma.biddingMovement.create({
      data: {
        biddingId,
        phase,
        description,
        date: date ? new Date(date) : new Date(),
        createdById: decoded.userId
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: movement,
      message: 'Movimentação adicionada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar movimentação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao adicionar movimentação' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/biddings/[id]/movements
 * Listar movimentações da licitação
 */
export async function GET(request, { params }) {
  try {
    verifyToken(request);

    const { id: biddingId } = await params;

    const movements = await prisma.biddingMovement.findMany({
      where: { biddingId },
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: movements
    });
  } catch (error) {
    console.error('❌ Erro ao listar movimentações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar movimentações' },
      { status: 500 }
    );
  }
}
