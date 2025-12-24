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
 * PATCH /api/admin/document-categories/[id]
 * Atualizar categoria
 */
export async function PATCH(request, { params }) {
  try {
    const decoded = verifyToken(request);
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, order, active } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = parseInt(order, 10);
    if (active !== undefined) updateData.active = active;

    const category = await prisma.documentCategory.update({
      where: { id },
      data: updateData,
      include: {
        area: true,
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Categoria atualizada com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar categoria' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/document-categories/[id]
 * Deletar categoria (apenas se não tiver documentos)
 */
export async function DELETE(request, { params }) {
  try {
    const decoded = verifyToken(request);
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar se há documentos vinculados
    const category = await prisma.documentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    if (category._count.documents > 0) {
      return NextResponse.json(
        { success: false, error: `Não é possível deletar. Existem ${category._count.documents} documento(s) vinculado(s) a esta categoria.` },
        { status: 400 }
      );
    }

    await prisma.documentCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Categoria deletada com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao deletar categoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar categoria' },
      { status: 500 }
    );
  }
}
