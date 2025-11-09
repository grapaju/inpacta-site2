import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar serviços ativos (API pública)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')
    const category = searchParams.get('category')
    const skip = (page - 1) * limit

    // Construir filtros
    const where = {
      active: true
    }

    if (category && category !== 'all') {
      where.category = category
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
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
          createdAt: 'desc'
        }
      }),
      prisma.service.count({ where })
    ])

    return NextResponse.json({
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar serviços públicos:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}