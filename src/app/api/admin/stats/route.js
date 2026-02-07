import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    // Verificar token de autenticação - usando cookies como fallback
    let token = null;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Fallback para cookies (para navegador simples do VS Code)
      const cookies = request.headers.get('cookie') || '';
      const tokenMatch = cookies.match(/adminToken=([^;]+)/);
      if (tokenMatch) {
        token = tokenMatch[1];
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Token de acesso requerido' }, { status: 401 });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'inpacta-jwt-secret-2024')
      
      // Verificar se o usuário tem permissão
      if (!['ADMIN', 'EDITOR'].includes(decoded.role)) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }

      // Buscar estatísticas
      const [newsCount, documentosCount, biddingsCount, usersCount, publishedNewsCount] = await Promise.all([
        prisma.news.count(),
        prisma.documento.count(),
        prisma.bidding.count(),
        prisma.user.count(),
        prisma.news.count({ where: { published: true } })
      ])

      return NextResponse.json({
        news: newsCount,
        documentos: documentosCount,
        biddings: biddingsCount,
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