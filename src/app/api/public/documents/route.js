import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/public/documents
 * 
 * Lista documentos públicos com filtros semânticos.
 * 
 * Query params:
 * - areaSlug: string (transparencia | licitacoes)
 * - categorySlug: string (slug da categoria)
 * - subcategorySlug: string (slug da subcategoria)
 * - status: string (PUBLISHED por padrão)
 * - page: number (paginação, padrão 1)
 * - limit: number (itens por página, padrão 20)
 * - sortBy: string (publishDate | title, padrão publishDate)
 * - sortOrder: string (asc | desc, padrão desc)
 * 
 * @returns {Object} { success, data: { documents, total, page, totalPages }, metadata }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros de filtro
    const areaSlug = searchParams.get('areaSlug');
    const categorySlug = searchParams.get('categorySlug');
    const subcategorySlug = searchParams.get('subcategorySlug');
    const status = searchParams.get('status') || 'PUBLISHED';
    
    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Parâmetros de ordenação
    const sortBy = searchParams.get('sortBy') || 'publishDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construir filtros
    const where = {
      status: status,
    };

    // Filtro por área
    if (areaSlug) {
      const area = await prisma.documentArea.findUnique({
        where: { slug: areaSlug },
      });
      
      if (!area) {
        return NextResponse.json(
          {
            success: false,
            error: 'Área não encontrada',
          },
          { status: 404 }
        );
      }
      
      where.areaId = area.id;
    }

    // Filtro por categoria ou subcategoria
    if (subcategorySlug) {
      const subcategory = await prisma.documentCategory.findUnique({
        where: { slug: subcategorySlug },
      });
      
      if (!subcategory) {
        return NextResponse.json(
          {
            success: false,
            error: 'Subcategoria não encontrada',
          },
          { status: 404 }
        );
      }
      
      where.categoryId = subcategory.id;
    } else if (categorySlug) {
      const category = await prisma.documentCategory.findUnique({
        where: { slug: categorySlug },
        include: {
          children: true,
        },
      });
      
      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: 'Categoria não encontrada',
          },
          { status: 404 }
        );
      }
      
      // Se a categoria tem filhos, buscar docs da categoria + subcategorias
      if (category.children.length > 0) {
        const categoryIds = [category.id, ...category.children.map(c => c.id)];
        where.categoryId = {
          in: categoryIds,
        };
      } else {
        where.categoryId = category.id;
      }
    }

    // Buscar documentos
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          area: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              displayType: true,
              parent: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          bidding: {
            select: {
              id: true,
              number: true,
              year: true,
              modality: true,
              object: true,
              status: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        documents,
        total,
        page,
        limit,
        totalPages,
      },
      metadata: {
        filters: {
          areaSlug,
          categorySlug,
          subcategorySlug,
          status,
        },
        sort: {
          sortBy,
          sortOrder,
        },
      },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar documentos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar documentos',
      },
      { status: 500 }
    );
  }
}
