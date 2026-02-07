import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

function devErrorPayload(error) {
  if (process.env.NODE_ENV === 'production') return undefined;
  return {
    name: error?.name,
    message: error?.message,
    code: error?.code,
  };
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
 * GET /api/admin/documentos/ordem-sugerida?categoria_macro=...
 *
 * Retorna uma sugestão (max + 1) de ordem_exibicao dentro da categoria_macro.
 */
export async function GET(request) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoriaMacro = searchParams.get('categoria_macro');

    if (!categoriaMacro) {
      return NextResponse.json(
        { success: false, error: 'categoria_macro é obrigatório' },
        { status: 400 }
      );
    }

    const aggregate = await prisma.documento.aggregate({
      where: { categoriaMacro },
      _max: { ordemExibicao: true },
    });

    const suggested = (aggregate?._max?.ordemExibicao ?? -1) + 1;

    return NextResponse.json({
      success: true,
      data: {
        categoria_macro: categoriaMacro,
        suggested_ordem_exibicao: suggested,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao sugerir ordem_exibicao (admin):', error);

    if (error?.status === 401 || error?.message === 'Token não fornecido') {
      return NextResponse.json(
        { success: false, error: error?.message || 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao sugerir ordem de exibição', debug: devErrorPayload(error) },
      { status: 500 }
    );
  }
}
