import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar serviço por slug (API pública)
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const service = await prisma.service.findFirst({
      where: { 
        slug: resolvedParams.slug,
        active: true
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

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    // Buscar serviços relacionados (mesma categoria, excluindo o atual)
    const relatedServices = await prisma.service.findMany({
      where: {
        active: true,
        category: service.category,
        NOT: { id: service.id }
      },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        price: true,
        priceType: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      ...service,
      relatedServices
    })

  } catch (error) {
    console.error('Erro ao buscar serviço público:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}