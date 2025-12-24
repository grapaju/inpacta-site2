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
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'inpacta-jwt-secret-2024');
  return decoded;
}

// GET - Buscar notícia por ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    
    // Verificar token JWT
    const decoded = verifyToken(request);

    const news = await prisma.news.findUnique({
      where: { id: resolvedParams.id },
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

    if (!news) {
      return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
    }

    return NextResponse.json(news)

  } catch (error) {
    console.error('Erro ao buscar notícia:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT - Atualizar notícia
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    
    // Verificar token JWT
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    const body = await request.json()
    const { title, summary, content, category, tags, published, featuredImage, metaTitle, metaDescription, ogImage } = body

    if (!title || !summary || !content) {
      return NextResponse.json(
        { error: 'Título, resumo e conteúdo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a notícia existe
    const existingNews = await prisma.news.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingNews) {
      return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
    }

    // Gerar novo slug se o título foi alterado
    let slug = existingNews.slug
    if (title !== existingNews.title) {
      const baseSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      let newSlug = baseSlug
      let counter = 1
      
      while (await prisma.news.findFirst({ 
        where: { 
          slug: newSlug,
          NOT: { id: resolvedParams.id }
        } 
      })) {
        newSlug = `${baseSlug}-${counter}`
        counter++
      }
      slug = newSlug
    }

    const news = await prisma.news.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        slug,
        summary,
        content,
        category: category || 'tecnologia',
        tags: tags ? JSON.stringify(tags) : null,
        published: published || false,
        publishedAt: published && !existingNews.published ? new Date() : existingNews.publishedAt,
        featuredImage,
        metaTitle,
        metaDescription,
        ogImage,
        updatedAt: new Date()
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

    return NextResponse.json(news)

  } catch (error) {
    console.error('Erro ao atualizar notícia:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE - Excluir notícia
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    
    // Verificar token JWT
    const decoded = verifyToken(request);

    // Verificar se a notícia existe
    const existingNews = await prisma.news.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingNews) {
      return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
    }

    await prisma.news.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Notícia excluída com sucesso' })

  } catch (error) {
    console.error('Erro ao excluir notícia:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}