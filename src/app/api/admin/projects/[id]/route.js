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

// GET - Obter projeto
export async function GET(request, { params }) {
  try {
    verifyToken(request)

    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id },
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

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH - Atualizar projeto
export async function PATCH(request, { params }) {
  try {
    verifyToken(request)

    const { id } = await params
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

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        content: content !== undefined ? (typeof content === 'string' ? content : JSON.stringify(content)) : undefined,
        published: published !== undefined ? !!published : undefined,
        featuredImage: featuredImage !== undefined ? (featuredImage || null) : undefined,
        category: category !== undefined ? (category || 'desenvolvimento') : undefined,
        tags: tags !== undefined ? (tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : null) : undefined,
        status: status !== undefined ? (status || 'concluido') : undefined,
        metaTitle: metaTitle !== undefined ? (metaTitle || null) : undefined,
        metaDescription: metaDescription !== undefined ? (metaDescription || null) : undefined,
        ogImage: ogImage !== undefined ? (ogImage || null) : undefined
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

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE - Excluir projeto
export async function DELETE(request, { params }) {
  try {
    verifyToken(request)

    const { id } = await params

    await prisma.project.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir projeto:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
