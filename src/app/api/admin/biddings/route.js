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
 * GET /api/admin/biddings
 * Listar licitações com filtros, busca e paginação
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
    const status = searchParams.get('status');
    const modality = searchParams.get('modality');
    const year = searchParams.get('year');
    const search = searchParams.get('search');
    
    // Paginação
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = {};
    
    if (status) where.status = status;
    if (modality) where.modality = modality;
    
    if (year) {
      const yearInt = parseInt(year);
      where.publicationDate = {
        gte: new Date(`${yearInt}-01-01`),
        lt: new Date(`${yearInt + 1}-01-01`)
      };
    }

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { object: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [biddings, total] = await Promise.all([
      prisma.bidding.findMany({
        where,
        include: {
          movements: {
            take: 1,
            orderBy: { date: 'desc' },
            select: { date: true, phase: true }
          },
          _count: {
            select: {
              movements: true
            }
          }
        },
        orderBy: [
          { publicationDate: 'desc' },
          { number: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.bidding.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        biddings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar licitações:', error);

    const message = String(error?.message || '');
    const isAuthError = message.includes('Token não fornecido') || message.includes('jwt') || message.includes('Token inválido');

    if (isAuthError) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar licitações' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/biddings
 * Criar nova licitação
 */
export async function POST(request) {
  try {
    const decoded = verifyToken(request);
    
    // Apenas ADMIN pode criar licitações
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem criar licitações' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const {
      number,
      title,
      object,
      description,
      modality,
      type,
      status,
      legalBasis,
      srp,
      publicationDate,
      openingDate,
      closingDate,
      estimatedValue,
      finalValue,
      winner,
      winnerDocument,
      notes
    } = body;

    // Validações básicas
    if (!number || !title || !object || !modality || !type || !status || !publicationDate) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando: number, title, object, modality, type, status, publicationDate' },
        { status: 400 }
      );
    }

    // Validar formato do número (XXX/YYYY)
    if (!/^\d{3}\/\d{4}$/.test(number)) {
      return NextResponse.json(
        { success: false, error: 'Número deve estar no formato 001/2024' },
        { status: 400 }
      );
    }

    // Validar tamanho mínimo do objeto
    if (object.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Objeto deve ter pelo menos 20 caracteres' },
        { status: 400 }
      );
    }

    // Criar licitação
    const bidding = await prisma.bidding.create({
      data: {
        number,
        title,
        object,
        description: description || '',
        modality,
        type,
        status,
        legalBasis,
        srp: srp || false,
        publicationDate: new Date(publicationDate),
        openingDate: openingDate ? new Date(openingDate) : null,
        closingDate: closingDate ? new Date(closingDate) : null,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        finalValue: finalValue ? parseFloat(finalValue) : null,
        winner,
        winnerDocument,
        notes
      }
    });

    // Criar movimentação inicial
    await prisma.biddingMovement.create({
      data: {
        biddingId: bidding.id,
        phase: 'ABERTURA',
        description: `Licitação ${number} criada - ${title}`,
        createdById: decoded.userId
      }
    });

    return NextResponse.json({
      success: true,
      data: bidding,
      message: 'Licitação criada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar licitação:', error);
    
    // Tratar erro de número duplicado
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Já existe uma licitação com este número' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erro ao criar licitação' },
      { status: 500 }
    );
  }
}
