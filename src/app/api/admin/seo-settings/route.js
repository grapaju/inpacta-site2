import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

async function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido');
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET);
}

export async function GET(request) {
  try {
    await verifyAuth(request);

    // Buscar configurações de SEO do banco
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'google_analytics_id',
            'google_search_console_id',
            'meta_title',
            'meta_description',
            'meta_keywords',
            'og_title',
            'og_description',
            'og_image',
            'twitter_card',
            'twitter_site',
            'robots_txt',
            'sitemap_enabled'
          ]
        }
      }
    });

    // Converter para objeto
    const seoSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Valores padrão se não existirem
    const defaultSettings = {
      google_analytics_id: '',
      google_search_console_id: '',
      meta_title: 'INPACTA - Instituto de Pesquisa e Análise',
      meta_description: 'Instituto dedicado à pesquisa e análise de dados para desenvolvimento social',
      meta_keywords: 'inpacta, pesquisa, análise, dados, desenvolvimento social',
      og_title: 'INPACTA - Instituto de Pesquisa e Análise',
      og_description: 'Instituto dedicado à pesquisa e análise de dados para desenvolvimento social',
      og_image: '/logo.png',
      twitter_card: 'summary_large_image',
      twitter_site: '@inpacta',
      robots_txt: 'User-agent: *\nAllow: /',
      sitemap_enabled: 'true',
      ...seoSettings
    };

    return NextResponse.json(defaultSettings);

  } catch (error) {
    console.error('Erro ao buscar configurações de SEO:', error);
    if (error.message === 'Token não fornecido') {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await verifyAuth(request);

    const data = await request.json();

    // Atualizar ou criar configurações
    for (const [key, value] of Object.entries(data)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }

    return NextResponse.json({ message: 'Configurações atualizadas com sucesso' });

  } catch (error) {
    console.error('Erro ao salvar configurações de SEO:', error);
    if (error.message === 'Token não fornecido') {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}