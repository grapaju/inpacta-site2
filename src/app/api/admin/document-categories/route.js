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

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
}

/**
 * GET /api/admin/document-categories
 * Listar todas as categorias com contagem de documentos
 */
export async function GET(request) {
  try {
    const decoded = verifyToken(request);
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const categories = await prisma.documentCategory.findMany({
      include: {
        area: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: [
        { areaId: 'asc' },
        { order: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/document-categories
 * Criar nova categoria
 */
export async function POST(request) {
  try {
    const decoded = verifyToken(request);
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, areaId, description, order } = body;

    if (!name || !slug || !areaId) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: name, slug, areaId' },
        { status: 400 }
      );
    }

    // Verificar se slug já existe na área
    const existing = await prisma.documentCategory.findFirst({
      where: {
        slug,
        areaId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Já existe uma categoria com este slug nesta área' },
        { status: 400 }
      );
    }

    const category = await prisma.documentCategory.create({
      data: {
        name,
        slug,
        areaId,
        description,
        order: order || 0,
        active: true,
      },
      include: {
        area: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Categoria criada com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar categoria' },
      { status: 500 }
    );
  }
}
