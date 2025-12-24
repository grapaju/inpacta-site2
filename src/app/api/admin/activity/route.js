import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    // Verificar token JWT
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Buscar atividades recentes de diferentes modelos
    const [recentNews, recentServices, recentProjects] = await Promise.all([
      prisma.news.findMany({
        take: Math.ceil(limit / 3),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          published: true,
          author: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.service.findMany({
        take: Math.ceil(limit / 3),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          active: true,
          author: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.project.findMany({
        take: Math.ceil(limit / 3),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }).catch(() => []) // Projects pode não existir ainda
    ])

    // Converter para formato uniforme
    const activities = [
      ...recentNews.map(item => ({
        id: item.id,
        type: 'news',
        title: item.title,
        status: item.published ? 'Publicado' : 'Rascunho',
        statusColor: item.published ? 'green' : 'yellow',
        author: item.author.name || item.author.email,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'criou' : 'atualizou',
        icon: '',
        link: `/admin/news/${item.id}`
      })),
      ...recentServices.map(item => ({
        id: item.id,
        type: 'service',
        title: item.title,
        status: item.active ? 'Ativo' : 'Inativo',
        statusColor: item.active ? 'green' : 'red',
        author: item.author.name || item.author.email,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'criou' : 'atualizou',
        icon: '',
        link: `/admin/services/${item.id}`
      })),
      ...recentProjects.map(item => ({
        id: item.id,
        type: 'project',
        title: item.title,
        status: 'Ativo',
        statusColor: 'blue',
        author: item.author.name || item.author.email,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'criou' : 'atualizou',
        icon: '',
        link: `/admin/projects/${item.id}`
      }))
    ]

    // Ordenar por data mais recente e limitar
    const sortedActivities = activities
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit)

    return NextResponse.json(sortedActivities)

  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}