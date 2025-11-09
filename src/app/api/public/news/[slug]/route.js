import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Força execução dinâmica e desabilita cache no handler
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Buscar notícia por slug (API pública)
export async function GET(request, { params }) {
  const resolvedParams = await params
  const rawSlug = resolvedParams?.slug ?? ''
  const slug = decodeURIComponent(String(rawSlug))
  
  try {
    // Busca case-insensitive e só publicadas
    const item = await prisma.news.findFirst({
      where: {
        AND: [
          { slug: { equals: slug, mode: 'insensitive' } },
          { published: true }
        ]
      },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    })

    if (!item) {
      return new NextResponse(
        JSON.stringify({ error: 'Notícia não encontrada', slug }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'CDN-Cache-Control': 'no-store',
            'Vercel-CDN-Cache-Control': 'no-store',
            'x-app-route': 'public-news-by-slug'
          }
        }
      )
    }

    return new NextResponse(
      JSON.stringify(item),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
          'x-app-route': 'public-news-by-slug'
        }
      }
    )
  } catch (error) {
    console.error('[API PUBLIC NEWS BY SLUG] Erro:', error)

    // Fallback amigável em desenvolvimento quando DB não está disponível
    const isDevelopment = !process.env.VERCEL_URL && process.env.NODE_ENV !== 'production'
    if (isDevelopment && (error.message?.includes('datasource') || error.message?.includes('DATABASE_URL'))) {
      const { news: staticNews } = await import('@/data/news')
      const staticItem = staticNews.find(n => n.slug === slug)
      if (staticItem) {
        const converted = {
          ...staticItem,
          id: `static-${staticItem.slug}`,
          author: { name: staticItem.author || 'InPacta' },
          publishedAt: staticItem.date,
          createdAt: staticItem.date,
          published: true
        }
        return NextResponse.json(converted, { headers: { 'Cache-Control': 'no-store' } })
      }
    }

    return new NextResponse(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
          'x-app-route': 'public-news-by-slug'
        }
      }
    )
  }
}