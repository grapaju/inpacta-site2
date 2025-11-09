import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

export async function GET(request) {
  try {
    // Verificar token JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '7d';

    // Simulando dados de analytics
    // Em produção, estes dados viriam do Google Analytics API ou sistema próprio
    const mockAnalytics = {
      stats: {
        pageViews: Math.floor(Math.random() * 10000) + 5000,
        visitors: Math.floor(Math.random() * 3000) + 1500,
        bounceRate: Math.floor(Math.random() * 30) + 30,
        avgSessionDuration: Math.floor(Math.random() * 300) + 120
      },
      topPages: [
        { 
          path: '/', 
          views: Math.floor(Math.random() * 2000) + 1000, 
          title: 'Página Inicial',
          avgTimeOnPage: Math.floor(Math.random() * 180) + 60
        },
        { 
          path: '/noticias', 
          views: Math.floor(Math.random() * 1500) + 800, 
          title: 'Notícias',
          avgTimeOnPage: Math.floor(Math.random() * 240) + 120
        },
        { 
          path: '/servicos', 
          views: Math.floor(Math.random() * 1200) + 600, 
          title: 'Serviços',
          avgTimeOnPage: Math.floor(Math.random() * 200) + 90
        },
        { 
          path: '/sobre', 
          views: Math.floor(Math.random() * 1000) + 500, 
          title: 'Sobre',
          avgTimeOnPage: Math.floor(Math.random() * 150) + 80
        },
        { 
          path: '/contato', 
          views: Math.floor(Math.random() * 800) + 400, 
          title: 'Contato',
          avgTimeOnPage: Math.floor(Math.random() * 120) + 60
        },
        { 
          path: '/transparencia', 
          views: Math.floor(Math.random() * 600) + 300, 
          title: 'Transparência',
          avgTimeOnPage: Math.floor(Math.random() * 180) + 100
        },
        { 
          path: '/governanca', 
          views: Math.floor(Math.random() * 500) + 250, 
          title: 'Governança',
          avgTimeOnPage: Math.floor(Math.random() * 160) + 90
        },
        { 
          path: '/dados', 
          views: Math.floor(Math.random() * 400) + 200, 
          title: 'Dados Abertos',
          avgTimeOnPage: Math.floor(Math.random() * 200) + 120
        },
      ].sort((a, b) => b.views - a.views),
      traffic: {
        organic: 65,
        direct: 20,
        referral: 10,
        social: 5
      },
      devices: {
        desktop: 55,
        mobile: 40,
        tablet: 5
      },
      performance: {
        loadTime: Math.floor(Math.random() * 2) + 1,
        firstContentfulPaint: Math.floor(Math.random() * 1000) + 500,
        largestContentfulPaint: Math.floor(Math.random() * 2000) + 1000,
        cumulativeLayoutShift: (Math.random() * 0.1).toFixed(3)
      }
    };

    // Simular variação baseada no período
    const multiplier = dateRange === '7d' ? 1 : dateRange === '30d' ? 4 : 12;
    mockAnalytics.stats.pageViews *= multiplier;
    mockAnalytics.stats.visitors *= multiplier;

    return NextResponse.json(mockAnalytics);

  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}