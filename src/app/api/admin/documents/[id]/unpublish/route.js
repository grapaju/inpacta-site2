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
 * POST /api/admin/documents/[id]/unpublish
 * Despublicar documento (PUBLISHED → ARCHIVED)
 * Apenas ADMIN pode despublicar
 */
export async function POST(request, { params }) {
  try {
    const decoded = verifyToken(request);
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Apenas ADMIN pode despublicar documentos' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    if (document.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: `Documento não está publicado (status atual: ${document.status})` },
        { status: 400 }
      );
    }

    // Atualizar documento
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        updatedById: decoded.userId,
      },
      include: {
        area: true,
        category: true,
        updatedBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Registrar no histórico
    await prisma.documentHistory.create({
      data: {
        documentId: document.id,
        action: 'ARCHIVED',
        userId: decoded.userId,
        changes: {
          status: {
            from: 'PUBLISHED',
            to: 'ARCHIVED',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedDocument,
      message: 'Documento despublicado com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao despublicar documento:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao despublicar documento' },
      { status: 500 }
    );
  }
}
