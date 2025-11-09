import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// ROTA TEMPORÁRIA - Publicar todas as notícias não publicadas
export async function POST(request) {
  try {
    // Verificar autenticação de admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'inpacta-jwt-secret-2024')
      if (decoded.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Apenas administradores podem executar esta ação' }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Atualizar todas as notícias não publicadas
    const result = await prisma.news.updateMany({
      where: {
        published: false
      },
      data: {
        published: true,
        publishedAt: new Date()
      }
    })

    return NextResponse.json({
      message: `${result.count} notícias foram publicadas`,
      count: result.count
    })

  } catch (error) {
    console.error('Erro ao publicar notícias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}