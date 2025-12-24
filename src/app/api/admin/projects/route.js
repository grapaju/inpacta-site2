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
  
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// GET - Listar projetos
export async function GET(request) {
  try {
    verifyToken(request)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const published = searchParams.get('published') || ''

    const skip = (page - 1) * limit

    const where = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) where.status = status

    if (published === 'true') where.published = true
    if (published === 'false') where.published = false

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
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
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count({ where })
    ])

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST - Criar novo projeto
export async function POST(request) {
  try {
    const decoded = verifyToken(request)

    const body = await request.json()
    const {
      title,
      description,
      content,
      published,
      featuredImage,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
      ogImage
    } = body

    if (!title || !description || !content) {
      return NextResponse.json(
        { error: 'Título, descrição e conteúdo são obrigatórios' },
        { status: 400 }
      )
    }

    const baseSlug = slugify(title)
    let slug = baseSlug || `projeto-${Date.now()}`
    let counter = 1

    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const project = await prisma.project.create({
      data: {
        slug,
        title,
        description,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        published: published === true,
        featuredImage: featuredImage || null,
        category: category || 'desenvolvimento',
        tags: tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : null,
        status: status || 'concluido',
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
        authorId: decoded.userId
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

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
