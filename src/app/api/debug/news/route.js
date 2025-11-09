import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ROTA TEMPORÁRIA - Verificar todas as notícias no banco
export async function GET(request) {
  try {
    const allNews = await prisma.news.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        publishedAt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Também testar busca por slug específico se fornecido
    const { searchParams } = new URL(request.url)
    const testSlug = searchParams.get('slug')
    
    let testResult = null
    if (testSlug) {
      testResult = await prisma.news.findFirst({
        where: { 
          slug: testSlug,
          published: true
        }
      })
    }

    return NextResponse.json({
      total: allNews.length,
      news: allNews,
      ...(testSlug && { testSlug, testResult })
    })

  } catch (error) {
    console.error('Erro ao buscar notícias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}