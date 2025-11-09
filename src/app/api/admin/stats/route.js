import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de acesso requerido' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'inpacta-jwt-secret-2024')
      
      // Verificar se o usuário tem permissão
      if (!['ADMIN', 'EDITOR'].includes(decoded.role)) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }

      // Buscar estatísticas
      const [newsCount, projectsCount, usersCount, publishedNewsCount] = await Promise.all([
        prisma.news.count(),
        prisma.project.count(),
        prisma.user.count(),
        prisma.news.count({ where: { published: true } })
      ])

      return NextResponse.json({
        news: newsCount,
        projects: projectsCount,
        users: usersCount,
        publishedNews: publishedNewsCount
      })

    } catch (jwtError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}