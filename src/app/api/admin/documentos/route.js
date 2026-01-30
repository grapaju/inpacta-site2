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

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function ensureUniqueSlug(baseSlug) {
  const normalized = slugify(baseSlug);
  if (!normalized) return null;

  const existing = await prisma.documento.findUnique({ where: { slug: normalized } });
  if (!existing) return normalized;

  for (let i = 2; i <= 50; i += 1) {
    const candidate = `${normalized}-${i}`;
    const taken = await prisma.documento.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
  }

  return `${normalized}-${Date.now()}`;
}

function parseOptionalInt(value) {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

/**
 * GET /api/admin/documentos
 *
 * Filtros:
 * - categoria_macro
 * - status
 * - aparece_em
 * - search
 * - page, limit
 */
export async function GET(request) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoriaMacro = searchParams.get('categoria_macro');
    const status = searchParams.get('status');
    const apareceEm = searchParams.get('aparece_em');
    const search = searchParams.get('search');

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where = {};

    if (categoriaMacro) where.categoriaMacro = categoriaMacro;
    if (status) where.status = status;
    if (apareceEm) where.apareceEm = { has: apareceEm };

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { subcategoria: { contains: search, mode: 'insensitive' } },
        { orgaoEmissor: { contains: search, mode: 'insensitive' } },
        { descricaoCurta: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.documento.findMany({
        where,
        include: { versaoVigente: true },
        orderBy: [{ updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.documento.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        documents,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Erro ao listar documentos (admin):', error);

    if (error?.status === 401 || error?.message === 'Token não fornecido') {
      return NextResponse.json(
        { success: false, error: error?.message || 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao listar documentos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/documentos
 *
 * Cria apenas o Documento (metadados). A versão é gerida separadamente.
 */
export async function POST(request) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const titulo = body?.titulo;
    const categoriaMacro = body?.categoria_macro;
    const subcategoria = body?.subcategoria;
    const descricaoCurta = body?.descricao_curta;
    const orgaoEmissor = body?.orgao_emissor;
    const apareceEm = Array.isArray(body?.aparece_em) ? body.aparece_em : [];
    const status = body?.status;
    const ordemExibicao = body?.ordem_exibicao;

    const categoriaMacroLicitacoes = body?.categoria_macro_licitacoes;
    const subcategoriaLicitacoes = body?.subcategoria_licitacoes;

    if (!titulo) {
      return NextResponse.json({ success: false, error: 'Título é obrigatório' }, { status: 400 });
    }
    if (!categoriaMacro) {
      return NextResponse.json({ success: false, error: 'categoria_macro é obrigatório' }, { status: 400 });
    }

    const effectiveSubcategoria = normalizeSubcategoria(categoriaMacro, subcategoria);
    if (!effectiveSubcategoria) {
      return NextResponse.json(
        {
          success: false,
          error: 'subcategoria é obrigatório',
          suggested: subcategoriasPorMacro[categoriaMacro] || [],
        },
        { status: 400 }
      );
    }
    if (!descricaoCurta) {
      return NextResponse.json({ success: false, error: 'descricao_curta é obrigatório' }, { status: 400 });
    }
    if (!orgaoEmissor) {
      return NextResponse.json({ success: false, error: 'orgao_emissor é obrigatório' }, { status: 400 });
    }
    if (!Array.isArray(apareceEm) || apareceEm.length === 0) {
      return NextResponse.json({ success: false, error: 'aparece_em é obrigatório' }, { status: 400 });
    }

    let effectiveCategoriaMacroLicitacoes = categoriaMacroLicitacoes;
    let effectiveSubcategoriaLicitacoes = subcategoriaLicitacoes;

    const rawMacroLic = typeof effectiveCategoriaMacroLicitacoes === 'string'
      ? effectiveCategoriaMacroLicitacoes.trim()
      : effectiveCategoriaMacroLicitacoes;
    const rawSubLic = typeof effectiveSubcategoriaLicitacoes === 'string'
      ? effectiveSubcategoriaLicitacoes.trim()
      : effectiveSubcategoriaLicitacoes;

    const licitacoesProvided = effectiveCategoriaMacroLicitacoes !== undefined || effectiveSubcategoriaLicitacoes !== undefined;
    const licitacoesHasValue = Boolean(rawMacroLic) || Boolean(rawSubLic);

    if (licitacoesProvided && !licitacoesHasValue) {
      effectiveCategoriaMacroLicitacoes = null;
      effectiveSubcategoriaLicitacoes = null;
    } else if (licitacoesProvided) {
      if (!rawMacroLic) {
        return NextResponse.json(
          { success: false, error: 'categoria_macro_licitacoes é obrigatório quando informar subcategoria_licitacoes' },
          { status: 400 }
        );
      }

      effectiveCategoriaMacroLicitacoes = rawMacroLic;
      effectiveSubcategoriaLicitacoes = normalizeSubcategoria(
        effectiveCategoriaMacroLicitacoes,
        rawSubLic
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
    }

    const requestedSlug = body?.slug || titulo;
    const slug = await ensureUniqueSlug(requestedSlug);

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Não foi possível gerar slug' }, { status: 400 });
    }

    let effectiveOrdemExibicao = parseOptionalInt(ordemExibicao);

    if (effectiveOrdemExibicao === null) {
      const aggregate = await prisma.documento.aggregate({
        where: { categoriaMacro },
        _max: { ordemExibicao: true },
      });
      effectiveOrdemExibicao = (aggregate?._max?.ordemExibicao ?? -1) + 1;
    }

    const documento = await prisma.documento.create({
      data: {
        titulo,
        slug,
        categoriaMacro,
        subcategoria: effectiveSubcategoria,
        categoriaMacroLicitacoes: effectiveCategoriaMacroLicitacoes || null,
        subcategoriaLicitacoes: effectiveSubcategoriaLicitacoes || null,
        descricaoCurta,
        orgaoEmissor,
        apareceEm,
        status: status || 'DRAFT',
        ordemExibicao: effectiveOrdemExibicao,
      },
    });

    return NextResponse.json({
      success: true,
      data: documento,
      message: 'Documento criado. Agora adicione a versão.'
    });
  } catch (error) {
    console.error('❌ Erro ao criar documento (admin):', error);

    if (error?.status === 401 || error?.message === 'Token não fornecido') {
      return NextResponse.json(
        { success: false, error: error?.message || 'Não autorizado' },
        { status: 401 }
      );
    }

    if (String(error?.code) === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Slug já existe. Tente novamente.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao criar documento' },
      { status: 500 }
    );
  }
}
