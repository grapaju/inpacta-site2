import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

const subcategoriasPorMacro = {
  RELATORIOS_FINANCEIROS: [
    'Balanços',
    'Demonstrativos de Receitas e Despesas',
    'Execução Orçamentária',
    'Auditorias',
  ],
  RELATORIOS_GESTAO: [
    'Relatórios de Atividades',
    'Resultados Alcançados',
    'Impacto dos Projetos',
  ],
  DOCUMENTOS_OFICIAIS: [
    'Atos Normativos',
    'Regimentos',
    'Estatuto Social',
    'Documentos de Constituição',
    'Resoluções da Diretoria',
  ],
  LICITACOES_E_REGULAMENTOS: [
    'Regulamento',
    'Modelos de Edital',
    'Termos de Referência',
  ],
};

function isSubcategoriaValida(categoriaMacro, subcategoria) {
  const allowed = subcategoriasPorMacro[categoriaMacro];
  if (!Array.isArray(allowed) || allowed.length === 0) return false;
  return allowed.includes(subcategoria);
}

function normalizeSubcategoria(categoriaMacro, subcategoria) {
  const raw = typeof subcategoria === 'string' ? subcategoria.trim() : '';
  if (raw) return raw;
  const suggested = subcategoriasPorMacro[categoriaMacro];
  if (Array.isArray(suggested) && suggested.length > 0) return suggested[0];
  return '';
}

function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Token não fornecido');
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err?.name === 'TokenExpiredError') {
      const error = new Error('Token expirado');
      error.status = 401;
      throw error;
    }

    const error = new Error('Token inválido');
    error.status = 401;
    throw error;
  }
}

/**
 * GET /api/admin/documentos/[id]
 */
export async function GET(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const documento = await prisma.documento.findUnique({
      where: { id },
      include: {
        versaoVigente: true,
        versoes: { orderBy: { versao: 'desc' } },
      },
    });

    if (!documento) {
      return NextResponse.json({ success: false, error: 'Documento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: documento });
  } catch (error) {
    console.error('❌ Erro ao buscar documento (admin):', error);

    if (error?.status === 401 || error?.message === 'Token não fornecido') {
      return NextResponse.json(
        { success: false, error: error?.message || 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: false, error: 'Erro ao buscar documento' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/documentos/[id]
 *
 * Atualiza apenas metadados do Documento.
 */
export async function PATCH(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const categoriaMacroProvided = body?.categoria_macro !== undefined;
    const subcategoriaProvided = body?.subcategoria !== undefined;

    const categoriaMacroLicitacoesProvided = body?.categoria_macro_licitacoes !== undefined;
    const subcategoriaLicitacoesProvided = body?.subcategoria_licitacoes !== undefined;

    if (categoriaMacroProvided || subcategoriaProvided) {
      let effectiveCategoriaMacro = body?.categoria_macro;
      let effectiveSubcategoria = body?.subcategoria;

      if (!categoriaMacroProvided || !subcategoriaProvided) {
        const current = await prisma.documento.findUnique({
          where: { id },
          select: { categoriaMacro: true, subcategoria: true },
        });

        if (!current) {
          return NextResponse.json({ success: false, error: 'Documento não encontrado' }, { status: 404 });
        }

        if (!categoriaMacroProvided) effectiveCategoriaMacro = current.categoriaMacro;
        if (!subcategoriaProvided) effectiveSubcategoria = current.subcategoria;
      }

      if (!effectiveCategoriaMacro) {
        return NextResponse.json({ success: false, error: 'categoria_macro é obrigatório' }, { status: 400 });
      }

      effectiveSubcategoria = normalizeSubcategoria(effectiveCategoriaMacro, effectiveSubcategoria);
      if (!effectiveSubcategoria) {
        return NextResponse.json(
          {
            success: false,
            error: 'subcategoria é obrigatório',
            suggested: subcategoriasPorMacro[effectiveCategoriaMacro] || [],
          },
          { status: 400 }
        );
      }

      // Se subcategoria foi enviada (mesmo vazia), persistimos a efetiva (normalizada)
      if (subcategoriaProvided) {
        body.subcategoria = effectiveSubcategoria;
      }
    }

    if (categoriaMacroLicitacoesProvided || subcategoriaLicitacoesProvided) {
      const rawIncomingMacro = typeof body?.categoria_macro_licitacoes === 'string'
        ? body.categoria_macro_licitacoes.trim()
        : body?.categoria_macro_licitacoes;
      const rawIncomingSub = typeof body?.subcategoria_licitacoes === 'string'
        ? body.subcategoria_licitacoes.trim()
        : body?.subcategoria_licitacoes;

      if (categoriaMacroLicitacoesProvided && subcategoriaLicitacoesProvided && !rawIncomingMacro && !rawIncomingSub) {
        body.categoria_macro_licitacoes = null;
        body.subcategoria_licitacoes = null;
      } else {
      let effectiveCategoriaMacroLicitacoes = body?.categoria_macro_licitacoes;
      let effectiveSubcategoriaLicitacoes = body?.subcategoria_licitacoes;

      if (!categoriaMacroLicitacoesProvided || !subcategoriaLicitacoesProvided) {
        const current = await prisma.documento.findUnique({
          where: { id },
          select: { categoriaMacroLicitacoes: true, subcategoriaLicitacoes: true },
        });

        if (!current) {
          return NextResponse.json({ success: false, error: 'Documento não encontrado' }, { status: 404 });
        }

        if (!categoriaMacroLicitacoesProvided) {
          effectiveCategoriaMacroLicitacoes = current.categoriaMacroLicitacoes;
        }
        if (!subcategoriaLicitacoesProvided) {
          effectiveSubcategoriaLicitacoes = current.subcategoriaLicitacoes;
        }
      }

      if (!effectiveCategoriaMacroLicitacoes) {
        return NextResponse.json(
          { success: false, error: 'categoria_macro_licitacoes é obrigatório' },
          { status: 400 }
        );
      }

      effectiveSubcategoriaLicitacoes = normalizeSubcategoria(
        effectiveCategoriaMacroLicitacoes,
        effectiveSubcategoriaLicitacoes
      );

      if (!effectiveSubcategoriaLicitacoes) {
        return NextResponse.json(
          {
            success: false,
            error: 'subcategoria_licitacoes é obrigatório',
            suggested: subcategoriasPorMacro[effectiveCategoriaMacroLicitacoes] || [],
          },
          { status: 400 }
        );
      }

      if (subcategoriaLicitacoesProvided) {
        body.subcategoria_licitacoes = effectiveSubcategoriaLicitacoes;
      }
      }
    }

    const updateData = {};

    if (body?.titulo !== undefined) updateData.titulo = body.titulo;
    if (body?.categoria_macro !== undefined) updateData.categoriaMacro = body.categoria_macro;
    if (body?.subcategoria !== undefined) updateData.subcategoria = body.subcategoria;
    if (body?.categoria_macro_licitacoes !== undefined) {
      updateData.categoriaMacroLicitacoes = body.categoria_macro_licitacoes || null;
    }
    if (body?.subcategoria_licitacoes !== undefined) {
      updateData.subcategoriaLicitacoes = body.subcategoria_licitacoes || null;
    }
    if (body?.descricao_curta !== undefined) updateData.descricaoCurta = body.descricao_curta;
    if (body?.orgao_emissor !== undefined) updateData.orgaoEmissor = body.orgao_emissor;
    if (body?.aparece_em !== undefined) updateData.apareceEm = body.aparece_em;
    if (body?.status !== undefined) updateData.status = body.status;
    if (body?.ordem_exibicao !== undefined) {
      updateData.ordemExibicao = body.ordem_exibicao === null || body.ordem_exibicao === ''
        ? 0
        : parseInt(String(body.ordem_exibicao), 10);
    }

    const documento = await prisma.documento.update({
      where: { id },
      data: updateData,
      include: { versaoVigente: true },
    });

    return NextResponse.json({ success: true, data: documento, message: 'Metadados atualizados' });
  } catch (error) {
    console.error('❌ Erro ao atualizar documento (admin):', error);

    if (error?.status === 401 || error?.message === 'Token não fornecido') {
      return NextResponse.json(
        { success: false, error: error?.message || 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: false, error: 'Erro ao atualizar documento' }, { status: 500 });
  }
}
