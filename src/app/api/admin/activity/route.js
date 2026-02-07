import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024'

export async function GET(request) {
  try {
    // Verificar token JWT
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      if (!['ADMIN', 'EDITOR'].includes(decoded?.role)) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10

    // Buscar atividades recentes dos módulos atuais
    const [recentNews, recentDocVersions, recentDocs, recentBiddings, recentBiddingMovements] = await Promise.all([
      prisma.news.findMany({
        take: safeLimit,
        orderBy: { updatedAt: 'desc' },
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
      prisma.versaoDocumento.findMany({
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          documentoId: true,
          versao: true,
          createdAt: true,
          createdBy: {
            select: {
              name: true,
              email: true
            }
          },
          documento: {
            select: {
              titulo: true
            }
          }
        }
      }),
      prisma.documento.findMany({
        take: safeLimit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          titulo: true,
          createdAt: true,
          updatedAt: true,
          status: true
        }
      }),
      prisma.bidding.findMany({
        take: safeLimit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          number: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.biddingMovement.findMany({
        take: safeLimit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          date: true,
          phase: true,
          bidding: {
            select: {
              id: true,
              number: true,
              title: true
            }
          },
          createdBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ])

    const activities = [
      ...recentNews.map(item => ({
        id: item.id,
        type: 'news',
        title: item.title,
        status: item.published ? 'Publicado' : 'Rascunho',
        statusColor: item.published ? 'green' : 'yellow',
        author: item.author?.name || item.author?.email || 'Sistema',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'criou notícia' : 'atualizou notícia',
        icon: '',
        link: `/admin/news/${item.id}`
      })),
      ...recentDocVersions.map(item => ({
        id: item.id,
        type: 'documento',
        title: item.documento?.titulo || 'Documento',
        status: 'Versão',
        statusColor: 'blue',
        author: item.createdBy?.name || item.createdBy?.email || 'Sistema',
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
        action: `publicou versão v${item.versao}`,
        icon: '',
        link: `/admin/documentos/${item.documentoId}?tab=versoes`
      })),
      ...recentDocs.map(item => ({
        id: item.id,
        type: 'documento',
        title: item.titulo,
        status: item.status,
        statusColor: item.status === 'PUBLISHED' ? 'green' : item.status === 'ARCHIVED' ? 'red' : 'yellow',
        author: 'Sistema',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'criou documento' : 'atualizou documento',
        icon: '',
        link: `/admin/documentos/${item.id}`
      })),
      ...recentBiddingMovements.map(item => ({
        id: item.id,
        type: 'bidding',
        title: `${item.bidding?.number || ''} ${item.bidding?.title || 'Licitação'}`.trim(),
        status: item.phase,
        statusColor: 'blue',
        author: item.createdBy?.name || item.createdBy?.email || 'Sistema',
        createdAt: item.date,
        updatedAt: item.date,
        action: 'registrou movimentação',
        icon: '',
        link: item.bidding?.id ? `/admin/biddings/${item.bidding.id}` : '/admin/biddings'
      })),
      ...recentBiddings.map(item => ({
        id: item.id,
        type: 'bidding',
        title: `${item.number} ${item.title}`.trim(),
        status: item.status,
        statusColor: 'blue',
        author: 'Sistema',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'criou licitação' : 'atualizou licitação',
        icon: '',
        link: `/admin/biddings/${item.id}`
      }))
    ]

    // Ordenar por data mais recente e limitar
    const sortedActivities = activities
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, safeLimit)

    return NextResponse.json(sortedActivities)

  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}