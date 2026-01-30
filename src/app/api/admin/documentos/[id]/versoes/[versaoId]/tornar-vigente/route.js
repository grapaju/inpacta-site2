import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

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
 * PATCH /api/admin/documentos/[id]/versoes/[versaoId]/tornar-vigente
 */
export async function PATCH(request, { params }) {
  try {
    const decoded = verifyToken(request);

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { id, versaoId } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const version = await tx.versaoDocumento.findUnique({ where: { id: versaoId } });
      if (!version || version.documentoId !== id) {
        return { error: { status: 404, message: 'Versão não encontrada' } };
      }

      await tx.versaoDocumento.updateMany({
        where: { documentoId: id, isVigente: true },
        data: { isVigente: false },
      });

      const updated = await tx.versaoDocumento.update({
        where: { id: versaoId },
        data: { isVigente: true },
      });

      await tx.documento.update({
        where: { id },
        data: { versaoVigenteId: versaoId },
      });

      return { data: updated };
    });

    if (result?.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: result.error.status });
    }

    return NextResponse.json({ success: true, data: result.data, message: 'Versão definida como vigente' });
  } catch (error) {
    console.error('❌ Erro ao tornar versão vigente:', error);

    if (error?.status === 401 || error?.message === 'Token não fornecido') {
      return NextResponse.json(
        { success: false, error: error?.message || 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: false, error: 'Erro ao tornar versão vigente' }, { status: 500 });
  }
}
