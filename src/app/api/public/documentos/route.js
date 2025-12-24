import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function parseEnumListParam(value) {
  if (!value) return null;
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * GET /api/public/documentos
 *
 * Retorna somente documentos publicados com a versão vigente.
 *
 * Query params:
 * - aparece_em: TRANSPARENCIA | LICITACOES (ou lista separada por vírgula)
 * - categoria_macro: RELATORIOS_FINANCEIROS | RELATORIOS_GESTAO | DOCUMENTOS_OFICIAIS | LICITACOES_E_REGULAMENTOS
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const apareceEm = parseEnumListParam(searchParams.get('aparece_em'));
    const categoriaMacro = searchParams.get('categoria_macro');

    const where = {
      status: 'PUBLISHED',
    };

    if (categoriaMacro) {
      where.categoriaMacro = categoriaMacro;
    }

    if (apareceEm && apareceEm.length > 0) {
      if (apareceEm.length === 1) {
        where.apareceEm = { has: apareceEm[0] };
      } else {
        where.apareceEm = { hasSome: apareceEm };
      }
    }

    const documentos = await prisma.documento.findMany({
      where,
      include: {
        versaoVigente: true,
      },
      orderBy: [{ ordemExibicao: 'asc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: documentos,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar documentos públicos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar documentos públicos' },
      { status: 500 }
    );
  }
}
