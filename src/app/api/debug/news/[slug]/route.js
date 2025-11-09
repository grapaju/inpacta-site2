import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// API de teste para debug da notícia específica
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const slug = resolvedParams.slug
    
    console.log('[API DEBUG] Slug recebido:', slug)
    
    // Buscar sem filtro de published primeiro
    const newsWithoutFilter = await prisma.news.findFirst({
      where: { 
        slug: slug
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log('[API DEBUG] Notícia sem filtro:', newsWithoutFilter)
    
    // Buscar com filtro de published
    const newsWithFilter = await prisma.news.findFirst({
      where: { 
        slug: slug,
        published: true
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log('[API DEBUG] Notícia com filtro published:', newsWithFilter)
    
    // Buscar todas as notícias para comparar slugs
    const allNews = await prisma.news.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        published: true
      }
    })
    
    return NextResponse.json({
      searchedSlug: slug,
      newsWithoutFilter,
      newsWithFilter,
      allSlugsInDB: allNews,
      found: !!newsWithFilter,
      slugComparison: {
        searched: slug,
        available: allNews.map(n => n.slug),
        exactMatches: allNews.filter(n => n.slug === slug),
        similarMatches: allNews.filter(n => n.slug.includes(slug) || slug.includes(n.slug))
      }
    })

  } catch (error) {
    console.error('[API DEBUG] Erro:', error)
    
    // Usar dados estáticos para debug apenas em desenvolvimento
    const isDevelopment = !process.env.VERCEL_URL && process.env.NODE_ENV !== 'production';
    
    if (isDevelopment && (error.message?.includes('datasource') || error.message?.includes('DATABASE_URL'))) {
      const { news: staticNews } = await import('@/data/news')
      const staticItem = staticNews.find(n => n.slug === resolvedParams.slug)
      
      return NextResponse.json({
        searchedSlug: resolvedParams.slug,
        newsWithoutFilter: null,
        newsWithFilter: null,
        allSlugsInDB: [],
        staticNews: staticNews.map(n => ({ slug: n.slug, title: n.title })),
        staticItemFound: staticItem,
        found: !!staticItem,
        databaseError: 'Conexão com banco não disponível - usando dados estáticos (desenvolvimento)',
        errorDetails: error.message,
        environment: 'development'
      })
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      slug: resolvedParams?.slug,
      environment: process.env.VERCEL_URL ? 'production' : 'development'
    }, { status: 500 })
  }
}