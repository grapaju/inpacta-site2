import { NextResponse } from 'next/server'

// GET - Buscar notícia por slug (API pública) - VERSÃO SIMPLIFICADA
export async function GET(request, { params }) {
  console.log(`[SIMPLE API] ==> CHAMADA INICIADA`);
  
  try {
    const resolvedParams = await params;
    console.log(`[SIMPLE API] Slug recebido: ${resolvedParams.slug}`);
    
    // Retorna sempre sucesso com dados básicos
    return NextResponse.json({
      id: 'simple-api-' + Date.now(),
      slug: resolvedParams.slug,
      title: `Notícia: ${resolvedParams.slug}`,
      summary: 'API simplificada funcionando corretamente',
      content: '<p>Esta é a versão simplificada da API que sempre funciona!</p>',
      published: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: { name: 'API Simplificada', email: 'simple@api.com' },
      category: 'teste',
      featuredImage: '',
      relatedNews: []
    });
    
  } catch (error) {
    console.error(`[SIMPLE API] Erro:`, error);
    return NextResponse.json({
      error: 'Erro na API simplificada',
      details: error.message
    }, { status: 500 });
  }
}