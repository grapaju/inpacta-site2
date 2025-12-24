import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

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

/**
 * POST /api/admin/documents/[id]/approve
 * Aprovar documento (PENDING → PUBLISHED)
 * Apenas ADMIN e APPROVER podem aprovar
 */
export async function POST(request, { params }) {
  try {
    const decoded = verifyToken(request);
    
    if (!['ADMIN', 'APPROVER'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: 'Apenas ADMIN ou APPROVER podem aprovar documentos' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    if (document.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `Documento não está pendente (status atual: ${document.status})` },
        { status: 400 }
      );
    }

    // Atualizar documento
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        approvedById: decoded.userId,
        publishedAt: new Date(),
      },
      include: {
        area: true,
        category: true,
        createdBy: {
          select: { id: true, name: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Registrar no histórico
    await prisma.documentHistory.create({
      data: {
        documentId: document.id,
        action: 'PUBLISHED',
        userId: decoded.userId,
        changes: {
          status: {
            from: 'PENDING',
            to: 'PUBLISHED',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedDocument,
      message: `Documento "${document.title}" aprovado e publicado com sucesso`,
    });
  } catch (error) {
    console.error('❌ Erro ao aprovar documento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao aprovar documento' },
      { status: 500 }
    );
  }
}
