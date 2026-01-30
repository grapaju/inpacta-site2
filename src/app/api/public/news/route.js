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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}