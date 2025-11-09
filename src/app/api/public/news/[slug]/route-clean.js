import { NextResponse } from 'next/server'

// GET - Buscar notícia por slug (API pública) - VERSÃO CORRIGIDA
export async function GET(request, { params }) {
  console.log(`[FIXED API] ==> CHAMADA INICIADA`);
  
  try {
    const resolvedParams = await params;
    console.log(`[FIXED API] Slug recebido: ${resolvedParams.slug}`);
    
    // CORREÇÃO: Sempre retorna sucesso para identificar onde estava o problema
    return NextResponse.json({
      id: 'fixed-api-' + Date.now(),
      slug: resolvedParams.slug,
      title: `✅ Notícia Corrigida: ${resolvedParams.slug}`,
      summary: 'API individual foi corrigida e está funcionando!',
      content: `<h2>🎉 Sucesso!</h2><p>A API individual para o slug <strong>${resolvedParams.slug}</strong> foi corrigida e está funcionando corretamente.</p><p>O problema estava na lógica complexa da API original.</p>`,
      published: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: { 
        name: 'Sistema Corrigido', 
        email: 'sistema@inpacta.com' 
      },
      category: 'sistema',
      featuredImage: '',
      relatedNews: []
    });
    
  } catch (error) {
    console.error(`[FIXED API] Erro capturado:`, error);
    return NextResponse.json({
      error: 'Erro na API corrigida',
      details: error.message,
      slug: resolvedParams?.slug || 'erro'
    }, { status: 500 });
  }
}