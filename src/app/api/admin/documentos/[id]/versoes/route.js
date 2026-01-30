import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { parseDateInputToUTC } from '@/lib/dateOnly';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

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
 * GET /api/admin/documentos/[id]/versoes
 */
export async function GET(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const versoes = await prisma.versaoDocumento.findMany({
      where: { documentoId: id },
      orderBy: { versao: 'desc' },
    });

    return NextResponse.json({ success: true, data: versoes });
  } catch (error) {
    console.error('❌ Erro ao listar versões (admin):', error);

    if (error?.status === 401 || error?.message === 'Token não fornecido') {
      return NextResponse.json(
        { success: false, error: error?.message || 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: false, error: 'Erro ao listar versões' }, { status: 500 });
  }
}

/**
 * POST /api/admin/documentos/[id]/versoes
 *
 * Cria nova versão e a torna vigente (desativa a anterior automaticamente).
 */
export async function POST(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const numeroIdentificacao = body?.numero_identificacao;
    const dataAprovacao = body?.data_aprovacao;
    const descricaoAlteracao = body?.descricao_alteracao;
    const arquivoPdf = body?.arquivo_pdf;
    const fileSize = body?.file_size;
    const fileHash = body?.file_hash;

    if (!numeroIdentificacao) {
      return NextResponse.json({ success: false, error: 'numero_identificacao é obrigatório' }, { status: 400 });
    }
    if (!dataAprovacao) {
      return NextResponse.json({ success: false, error: 'data_aprovacao é obrigatório' }, { status: 400 });
    }

    const parsedDataAprovacao = parseDateInputToUTC(dataAprovacao);
    if (!parsedDataAprovacao) {
      return NextResponse.json(
        { success: false, error: 'data_aprovacao inválida. Use YYYY-MM-DD (input date) ou DD/MM/AAAA.' },
        { status: 400 }
      );
    }
    if (!arquivoPdf) {
      return NextResponse.json({ success: false, error: 'arquivo_pdf é obrigatório' }, { status: 400 });
    }
    if (!fileSize || Number.isNaN(parseInt(String(fileSize), 10))) {
      return NextResponse.json({ success: false, error: 'file_size é obrigatório' }, { status: 400 });
    }
    if (!fileHash) {
      return NextResponse.json({ success: false, error: 'file_hash é obrigatório' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const documento = await tx.documento.findUnique({ where: { id } });
      if (!documento) {
        return { error: { status: 404, message: 'Documento não encontrado' } };
      }

      const max = await tx.versaoDocumento.aggregate({
        where: { documentoId: id },
        _max: { versao: true },
      });

      const nextVersion = (max?._max?.versao || 0) + 1;

      await tx.versaoDocumento.updateMany({
        where: { documentoId: id, isVigente: true },
        data: { isVigente: false },
      });

      const created = await tx.versaoDocumento.create({
        data: {
          documentoId: id,
          numeroIdentificacao,
          versao: nextVersion,
          dataAprovacao: parsedDataAprovacao,
          descricaoAlteracao: descricaoAlteracao || null,
          arquivoPdf,
          fileSize: parseInt(String(fileSize), 10),
          fileHash,
          isVigente: true,
          createdById: decoded.userId,
        },
      });

      await tx.documento.update({
        where: { id },
        data: { versaoVigenteId: created.id },
      });

      return { data: created };
    });

    if (result?.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: result.error.status });
    }

    return NextResponse.json({ success: true, data: result.data, message: 'Versão adicionada e definida como vigente' });
  } catch (error) {
    console.error('❌ Erro ao criar versão (admin):', error);

    if (error?.status === 401 || error?.message === 'Token não fornecido') {
      return NextResponse.json(
        { success: false, error: error?.message || 'Não autorizado' },
        { status: 401 }
      );
    }

    if (String(error?.code) === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Este PDF já foi enviado anteriormente (upload duplicado).' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: false, error: 'Erro ao criar versão' }, { status: 500 });
  }
}
