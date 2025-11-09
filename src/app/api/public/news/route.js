import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar notícias publicadas (API pública)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')
    const category = searchParams.get('category')
    const skip = (page - 1) * limit

    // Construir filtros
    const where = {
      published: true
    }

    if (category && category !== 'all') {
      where.category = category
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        }
      }),
      prisma.news.count({ where })
    ])

    return NextResponse.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar notícias públicas:', error)
    
    // Usar fallback para dados estáticos apenas em desenvolvimento
    const isDevelopment = !process.env.VERCEL_URL && process.env.NODE_ENV !== 'production';
    
    if (isDevelopment && (error.message?.includes('datasource') || error.message?.includes('DATABASE_URL'))) {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '6')
      const category = searchParams.get('category')
      const skip = (page - 1) * limit
      
      // Import dinâmico dos dados estáticos
      const { news: staticNews } = await import('@/data/news')
      
      // Filtrar por categoria se especificada
      let filteredNews = staticNews
      if (category && category !== 'all') {
        filteredNews = staticNews.filter(n => n.category === category)
      }
      
      // Converter dados estáticos para formato da API
      const convertedNews = filteredNews
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(skip, skip + limit)
        .map(item => ({
          ...item,
          id: `static-${item.slug}`,
          author: { name: item.author || 'InPacta' },
          publishedAt: item.date,
          createdAt: item.date,
          published: true
        }))
      
      return NextResponse.json({
        news: convertedNews,
        pagination: {
          page,
          limit,
          total: filteredNews.length,
          pages: Math.ceil(filteredNews.length / limit)
        }
      })
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}