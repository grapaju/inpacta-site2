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

// GET - Buscar serviço por ID
export async function GET(request, { params }) {
  try {
    // Verificar token JWT
    const decoded = verifyToken(request);

    const service = await prisma.service.findUnique({
      where: { id: params.id },
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

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    return NextResponse.json(service)

  } catch (error) {
    console.error('Erro ao buscar serviço:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT - Atualizar serviço
export async function PUT(request, { params }) {
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

    // Verificar se o serviço existe
    const existingService = await prisma.service.findUnique({
      where: { id: params.id }
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    // Gerar novo slug se o título foi alterado
    let slug = existingService.slug
    if (title !== existingService.title) {
      const baseSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      let newSlug = baseSlug
      let counter = 1
      
      while (await prisma.service.findFirst({ 
        where: { 
          slug: newSlug,
          NOT: { id: params.id }
        } 
      })) {
        newSlug = `${baseSlug}-${counter}`
        counter++
      }
      slug = newSlug
    }

    const service = await prisma.service.update({
      where: { id: params.id },
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

    return NextResponse.json(service)

  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE - Excluir serviço
export async function DELETE(request, { params }) {
  try {
    // Verificar token JWT
    const decoded = verifyToken(request);

    // Verificar se o serviço existe
    const existingService = await prisma.service.findUnique({
      where: { id: params.id }
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    await prisma.service.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Serviço excluído com sucesso' })

  } catch (error) {
    console.error('Erro ao excluir serviço:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}