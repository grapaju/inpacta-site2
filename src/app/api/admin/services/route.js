import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

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
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  return decoded;
}

// GET - Listar serviços
export async function GET(request) {
  try {
    // Verificar token JWT
    const decoded = verifyToken(request);

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.service.count()
    ])

    return NextResponse.json({
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST - Criar novo serviço
export async function POST(request) {
  try {
    // Verificar token JWT
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    const body = await request.json()
    const { 
      title, 
      summary, 
      description, 
      category, 
      features, 
      benefits, 
      price,
      priceType,
      duration,
      active, 
      metaTitle, 
      metaDescription, 
      ogImage 
    } = body

    if (!title || !summary || !description) {
      return NextResponse.json(
        { error: 'Título, resumo e descrição são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar slug único
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    let slug = baseSlug
    let counter = 1
    
    while (await prisma.service.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const service = await prisma.service.create({
      data: {
        title,
        slug,
        summary,
        description,
        category: category || 'consultoria',
        features: features ? JSON.stringify(features) : null,
        benefits: benefits ? JSON.stringify(benefits) : null,
        price: price || null,
        priceType: priceType || 'custom',
        duration: duration || null,
        active: active !== undefined ? active : true,
        metaTitle,
        metaDescription,
        ogImage,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar serviço:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}