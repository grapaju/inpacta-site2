import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

import { parseDateInputToUTC } from '@/lib/dateOnly';
import {
  categoriaMacroLabels,
  subcategoriasPorMacro,
  getCamposObrigatorios,
} from '@/lib/documentosTaxonomy';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

const safeTrim = (value) => (typeof value === 'string' ? value.trim() : '');

function parseOptionalDecimalString(value) {
  const raw = safeTrim(value);
  if (!raw) return null;

  // Aceita formatos como: 1234.56, 1234,56, 1.234,56, R$ 1.234,56
  let cleaned = raw.replace(/[^0-9,\.]/g, '');
  if (!cleaned) return null;

  if (cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    const parts = cleaned.split('.').filter(Boolean);
    if (parts.length > 2) {
      const decimal = parts.pop();
      const integer = parts.join('');
      cleaned = `${integer}.${decimal}`;
    }
  }

  if (!/^\d+(?:\.\d{1,2})?$/.test(cleaned)) return null;
  return cleaned;
}

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

    const current = await prisma.documento.findUnique({
      where: { id },
      select: {
        categoriaMacro: true,
        subcategoria: true,
        status: true,
        versaoVigenteId: true,
        ano: true,
        dataDocumento: true,
        descricaoCurta: true,
        orgaoEmissor: true,
        numeroDocumento: true,
        contratadaParceiro: true,
        valorGlobal: true,
        vigenciaMeses: true,
        vigenciaInicio: true,
        vigenciaFim: true,
        periodo: true,
        categoriaMacroLicitacoes: true,
        subcategoriaLicitacoes: true,
      },
    });

    if (!current) {
      return NextResponse.json({ success: false, error: 'Documento não encontrado' }, { status: 404 });
    }

    // Bloqueia mudanças estruturais após existir versão publicada.
    // Consideramos "publicada" quando o Documento está PUBLISHED e já há versão vigente.
    if (
      current.status === 'PUBLISHED' &&
      current.versaoVigenteId &&
      (body?.categoria_macro !== undefined || body?.subcategoria !== undefined)
    ) {
      const incomingMacro = body?.categoria_macro !== undefined
        ? String(body.categoria_macro || '').trim()
        : current.categoriaMacro;
      const incomingSub = body?.subcategoria !== undefined
        ? String(body.subcategoria || '').trim()
        : current.subcategoria;

      const isChanging = incomingMacro !== current.categoriaMacro || incomingSub !== current.subcategoria;
      if (isChanging) {
        return NextResponse.json(
          {
            success: false,
            error: 'Não é permitido alterar categoria/tipo após existir versão publicada. Crie um novo documento.',
          },
          { status: 400 }
        );
      }
    }

    const categoriaMacroProvided = body?.categoria_macro !== undefined;
    const subcategoriaProvided = body?.subcategoria !== undefined;

    const categoriaMacroLicitacoesProvided = body?.categoria_macro_licitacoes !== undefined;
    const subcategoriaLicitacoesProvided = body?.subcategoria_licitacoes !== undefined;

    // Normaliza/valida categoria + subcategoria
    {
      const effectiveCategoriaMacro = safeTrim(
        categoriaMacroProvided ? body?.categoria_macro : current.categoriaMacro
      );
      const effectiveSubcategoriaIncoming = safeTrim(
        subcategoriaProvided ? body?.subcategoria : current.subcategoria
      );

      if (!effectiveCategoriaMacro) {
        return NextResponse.json({ success: false, error: 'categoria_macro é obrigatório' }, { status: 400 });
      }
      if (!categoriaMacroLabels[effectiveCategoriaMacro]) {
        return NextResponse.json({ success: false, error: 'categoria_macro inválido' }, { status: 400 });
      }

      const effectiveSubcategoria = normalizeSubcategoria(effectiveCategoriaMacro, effectiveSubcategoriaIncoming);
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

      if (categoriaMacroProvided) body.categoria_macro = effectiveCategoriaMacro;
      if (subcategoriaProvided) body.subcategoria = effectiveSubcategoria;
    }

    if (categoriaMacroLicitacoesProvided || subcategoriaLicitacoesProvided) {
      const rawIncomingMacro = safeTrim(body?.categoria_macro_licitacoes);
      const rawIncomingSub = safeTrim(body?.subcategoria_licitacoes);

      const clearBoth = categoriaMacroLicitacoesProvided && subcategoriaLicitacoesProvided && !rawIncomingMacro && !rawIncomingSub;

      if (clearBoth) {
        body.categoria_macro_licitacoes = null;
        body.subcategoria_licitacoes = null;
      } else {
        const effectiveMacro = safeTrim(
          categoriaMacroLicitacoesProvided ? body?.categoria_macro_licitacoes : current.categoriaMacroLicitacoes
        );
        const effectiveSubIncoming = safeTrim(
          subcategoriaLicitacoesProvided ? body?.subcategoria_licitacoes : current.subcategoriaLicitacoes
        );

        if (!effectiveMacro) {
          return NextResponse.json(
            { success: false, error: 'categoria_macro_licitacoes é obrigatório' },
            { status: 400 }
          );
        }
        if (!categoriaMacroLabels[effectiveMacro]) {
          return NextResponse.json(
            { success: false, error: 'categoria_macro_licitacoes inválido' },
            { status: 400 }
          );
        }

        const effectiveSub = normalizeSubcategoria(effectiveMacro, effectiveSubIncoming);
        if (!effectiveSub) {
          return NextResponse.json(
            {
              success: false,
              error: 'subcategoria_licitacoes é obrigatório',
              suggested: subcategoriasPorMacro[effectiveMacro] || [],
            },
            { status: 400 }
          );
        }

        if (categoriaMacroLicitacoesProvided) body.categoria_macro_licitacoes = effectiveMacro;
        if (subcategoriaLicitacoesProvided) body.subcategoria_licitacoes = effectiveSub;
      }
    }

    // Validações base + por categoria (usando valores efetivos)
    const effectiveCategoriaMacro = safeTrim(
      body?.categoria_macro !== undefined ? body.categoria_macro : current.categoriaMacro
    );
    const effectiveSubcategoria = safeTrim(
      body?.subcategoria !== undefined ? body.subcategoria : current.subcategoria
    );
    const effectiveAno = body?.ano !== undefined
      ? (typeof body.ano === 'number' ? body.ano : parseInt(String(body.ano || '').trim(), 10))
      : current.ano;
    const effectiveDataDocumento = body?.data_documento !== undefined
      ? parseDateInputToUTC(body.data_documento)
      : current.dataDocumento;
    const effectiveDescricaoCurta = body?.descricao_curta !== undefined
      ? safeTrim(body.descricao_curta)
      : (current.descricaoCurta || '');

    if (!Number.isInteger(effectiveAno) || effectiveAno < 1900 || effectiveAno > new Date().getFullYear() + 10) {
      return NextResponse.json({ success: false, error: 'Ano é obrigatório e deve ser válido' }, { status: 400 });
    }
    if (!effectiveDataDocumento) {
      return NextResponse.json({ success: false, error: 'data_documento é obrigatório e deve ser válido' }, { status: 400 });
    }
    if (!effectiveDescricaoCurta) {
      return NextResponse.json({ success: false, error: 'descricao_curta é obrigatório' }, { status: 400 });
    }

    const effectiveOrgaoEmissor = body?.orgao_emissor !== undefined ? safeTrim(body.orgao_emissor) : (current.orgaoEmissor || '');
    const effectiveNumeroDocumento = body?.numero_documento !== undefined ? safeTrim(body.numero_documento) : (current.numeroDocumento || '');
    const effectiveContratadaParceiro = body?.contratada_parceiro !== undefined ? safeTrim(body.contratada_parceiro) : (current.contratadaParceiro || '');
    const effectiveValorGlobal = body?.valor_global !== undefined
      ? parseOptionalDecimalString(body.valor_global)
      : (current.valorGlobal ? String(current.valorGlobal) : null);
    const effectivePeriodo = body?.periodo !== undefined ? safeTrim(body.periodo) : (current.periodo || '');

    if (body?.valor_global !== undefined && safeTrim(body.valor_global) && !effectiveValorGlobal) {
      return NextResponse.json({ success: false, error: 'valor_global inválido (use números com 2 casas decimais)' }, { status: 400 });
    }

    const required = getCamposObrigatorios(effectiveCategoriaMacro, effectiveSubcategoria);
    if (required.has('orgao_emissor') && !effectiveOrgaoEmissor) {
      return NextResponse.json(
        { success: false, error: 'orgao_emissor é obrigatório para este tipo de documento' },
        { status: 400 }
      );
    }
    if (required.has('numero_documento') && !effectiveNumeroDocumento) {
      return NextResponse.json(
        { success: false, error: 'numero_documento é obrigatório para este tipo de documento' },
        { status: 400 }
      );
    }
    if (required.has('contratada_parceiro') && !effectiveContratadaParceiro) {
      return NextResponse.json(
        { success: false, error: 'contratada_parceiro é obrigatório para este tipo de documento' },
        { status: 400 }
      );
    }
    if (required.has('valor_global') && !effectiveValorGlobal) {
      return NextResponse.json(
        { success: false, error: 'valor_global é obrigatório para este tipo de documento' },
        { status: 400 }
      );
    }
    if (required.has('periodo') && !effectivePeriodo) {
      return NextResponse.json(
        { success: false, error: 'periodo é obrigatório para este tipo de documento' },
        { status: 400 }
      );
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
    if (body?.ano !== undefined) updateData.ano = effectiveAno;
    if (body?.data_documento !== undefined) updateData.dataDocumento = effectiveDataDocumento;
    if (body?.numero_documento !== undefined) updateData.numeroDocumento = safeTrim(body.numero_documento) || null;
    if (body?.contratada_parceiro !== undefined) updateData.contratadaParceiro = safeTrim(body.contratada_parceiro) || null;
    if (body?.valor_global !== undefined) updateData.valorGlobal = (effectiveValorGlobal || null);
    if (body?.vigencia_meses !== undefined) {
      updateData.vigenciaMeses = safeTrim(body.vigencia_meses) ? parseOptionalInt(body.vigencia_meses) : null;
    }
    if (body?.vigencia_inicio !== undefined) updateData.vigenciaInicio = parseDateInputToUTC(body.vigencia_inicio);
    if (body?.vigencia_fim !== undefined) updateData.vigenciaFim = parseDateInputToUTC(body.vigencia_fim);
    if (body?.periodo !== undefined) updateData.periodo = safeTrim(body.periodo) || null;
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
