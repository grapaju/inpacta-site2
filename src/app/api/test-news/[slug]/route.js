import { NextResponse } from 'next/server'

// API de teste simples para confirmar roteamento
export async function GET(request, { params }) {
  console.log('[TEST API] ==> API DE TESTE CHAMADA');
  
  try {
    const resolvedParams = await params;
    console.log('[TEST API] Slug recebido:', resolvedParams.slug);
    
    return NextResponse.json({
      message: 'API de teste funcionando!',
      slug: resolvedParams.slug,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[TEST API] Erro:', error);
    return NextResponse.json({ error: 'Erro na API de teste' }, { status: 500 });
  }
}