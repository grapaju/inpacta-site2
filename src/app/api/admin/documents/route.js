import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

// Função para verificar JWT
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
 * GET /api/admin/documents
 * Lista todos os documentos (admin) com filtros e paginação
 */
export async function GET(request) {
  try {
    const decoded = verifyToken(request);
    
    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Filtros
    const areaId = searchParams.get('areaId');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const documentModule = searchParams.get('module');
    const transparencyStatus = searchParams.get('transparencyStatus');
    const phase = searchParams.get('phase');
    const biddingId = searchParams.get('biddingId');
    const year = searchParams.get('year');
    const fileType = searchParams.get('fileType');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    
    // Paginação
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Construir where
    const where = {};
    
    if (areaId) where.areaId = areaId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (documentModule) where.module = documentModule;
    if (transparencyStatus) where.transparencyStatus = transparencyStatus;
    if (phase) where.phase = phase;
    if (biddingId) where.biddingId = biddingId;
    if (year) where.year = parseInt(year, 10);
    if (fileType) where.fileType = fileType;
    if (subcategory) where.subcategory = subcategory;
    
    // Se não for ADMIN, mostrar apenas documentos criados pelo usuário
    if (decoded.role !== 'ADMIN') {
      where.createdById = decoded.userId;
    }
    
    // Busca textual
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { identifier: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          area: true,
          category: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          updatedBy: {
            select: { id: true, name: true },
          },
          approvedBy: {
            select: { id: true, name: true },
          },
          bidding: {
            select: {
              id: true,
              number: true,
              title: true,
              modality: true,
            },
          },
          _count: {
            select: {
              versions: true,
              history: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        documents,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar documentos (admin):', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar documentos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/documents
 * Criar novo documento
 */
export async function POST(request) {
  try {
    const decoded = verifyToken(request);
    
    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      title,
      description,
      identifier,
      approvalDate,
      issuingBody,
      shortDescription,
      transparencyStatus,
      areaId,
      categoryId,
      fileName,
      filePath,
      fileSize,
      fileType,
      module,
      phase,
      order,
      scheduledPublishAt,
      publishedAt,
      referenceDate,
      biddingId,
      status,
      year,
      subcategory,
    } = body;

    const resolvedModule = module || 'TRANSPARENCIA';

    // Validação básica
    if (!title || !fileName || !filePath) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: title, fileName, filePath' },
        { status: 400 }
      );
    }

    // Licitação: exige processo + fase
    if (resolvedModule === 'LICITACAO') {
      if (!biddingId || !phase) {
        return NextResponse.json(
          { success: false, error: 'Documentos de licitação devem ter biddingId e phase' },
          { status: 400 }
        );
      }
    } else {
      // Módulos não-LICITACAO: exige área + categoria
      if (!areaId || !categoryId) {
        return NextResponse.json(
          { success: false, error: 'Campos obrigatórios: areaId, categoryId' },
          { status: 400 }
        );
      }

      // Módulos não-LICITACAO: exige PDF
      if (fileType && fileType !== 'application/pdf') {
        return NextResponse.json(
          { success: false, error: 'Para este módulo, o arquivo deve ser PDF' },
          { status: 400 }
        );
      }
    }

    // Defaults para área/categoria quando for LICITACAO (para deixar o admin mais prático)
    let resolvedAreaId = areaId;
    let resolvedCategoryId = categoryId;
    let resolvedYear = year ? parseInt(year, 10) : undefined;

    if (resolvedModule === 'LICITACAO') {
      const bidding = await prisma.bidding.findUnique({
        where: { id: biddingId },
        select: { number: true },
      });

      if (!bidding) {
        return NextResponse.json(
          { success: false, error: 'Licitação não encontrada' },
          { status: 400 }
        );
      }

      if (!resolvedYear) {
        const yearFromNumber = parseInt(String(bidding.number || '').split('/')[1], 10);
        resolvedYear = Number.isFinite(yearFromNumber) ? yearFromNumber : new Date().getFullYear();
      }

      if (!resolvedAreaId || !resolvedCategoryId) {
        const [area, category] = await Promise.all([
          prisma.documentArea.findUnique({ where: { slug: 'licitacao' }, select: { id: true } }),
          prisma.documentCategory.findUnique({ where: { slug: 'editais-publicados' }, select: { id: true } }),
        ]);

        resolvedAreaId = resolvedAreaId || area?.id;
        resolvedCategoryId = resolvedCategoryId || category?.id;
      }

      if (!resolvedAreaId || !resolvedCategoryId) {
        return NextResponse.json(
          { success: false, error: 'Estrutura de Licitações (área/categoria padrão) não encontrada no banco. Rode o seed de estrutura.' },
          { status: 400 }
        );
      }
    } else {
      resolvedYear = resolvedYear || new Date().getFullYear();
    }

    // Determinar status inicial baseado no role
    let initialStatus = status || 'DRAFT';
    
    // ADMIN pode publicar direto
    if (decoded.role === 'ADMIN' && !status) {
      initialStatus = 'PUBLISHED';
    }
    // EDITOR precisa de aprovação
    else if (decoded.role === 'EDITOR' && !status) {
      initialStatus = 'PENDING';
    }
    // AUTHOR sempre começa como DRAFT
    else if (decoded.role === 'AUTHOR') {
      initialStatus = 'DRAFT';
    }
    
    const document = await prisma.document.create({
      data: {
        title,
        description,
        identifier: identifier || null,
        approvalDate: approvalDate ? new Date(approvalDate) : null,
        issuingBody: issuingBody || null,
        shortDescription: shortDescription || null,
        transparencyStatus: transparencyStatus || 'PUBLICADO',
        subcategory: subcategory || null,
        fileName,
        filePath,
        fileSize: fileSize ? parseInt(fileSize, 10) : 0,
        fileType: fileType || 'application/pdf',
        module: resolvedModule,
        phase,
        order: order !== undefined ? parseInt(order, 10) : 0,
        areaId: resolvedAreaId,
        categoryId: resolvedCategoryId,
        year: resolvedYear,
        publishedAt: publishedAt ? new Date(publishedAt) : (initialStatus === 'PUBLISHED' ? new Date() : null),
        referenceDate: referenceDate ? new Date(referenceDate) : null,
        scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null,
        biddingId: biddingId || null,
        status: initialStatus,
        version: 1,
        createdById: decoded.userId,
        approvedById: (initialStatus === 'PUBLISHED' && decoded.role === 'ADMIN') ? decoded.userId : null,
        approvedAt: (initialStatus === 'PUBLISHED' && decoded.role === 'ADMIN') ? new Date() : null,
      },
      include: {
        area: true,
        category: true,
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Registrar no histórico
    await prisma.documentHistory.create({
      data: {
        documentId: document.id,
        action: 'CREATED',
        userId: decoded.userId,
        changes: {
          status: initialStatus,
          title,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Documento criado com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao criar documento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar documento' },
      { status: 500 }
    );
  }
}
