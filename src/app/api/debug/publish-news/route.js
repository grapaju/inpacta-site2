import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ROTA TEMPORÁRIA - Publicar todas as notícias (sem autenticação para teste)
export async function GET() {
  try {
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

    // Buscar todas as notícias atualizadas
    const allNews = await prisma.news.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        publishedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      message: `${result.count} notícias foram publicadas`,
      updatedCount: result.count,
      totalNews: allNews.length,
      news: allNews
    })

  } catch (error) {
    console.error('Erro ao publicar notícias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}