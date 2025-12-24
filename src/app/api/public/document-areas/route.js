import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/public/document-areas
 * 
 * Retorna todas as áreas de documentos com suas categorias hierárquicas.
 * Usado para renderizar menus dinâmicos de Transparência e Licitações.
 * 
 * @returns {Object[]} areas - Array de áreas com categorias aninhadas
 */
export async function GET() {
  try {
    const areas = await prisma.documentArea.findMany({
      where: {
        active: true,
      },
      include: {
        categories: {
          where: {
            parentId: null, // Apenas categorias principais
            active: true,
          },
          include: {
            children: {
              where: {
                active: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: areas,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar áreas de documentos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar áreas de documentos',
      },
      { status: 500 }
    );
  }
}
