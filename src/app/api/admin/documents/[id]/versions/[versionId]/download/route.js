import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const JWT_SECRET = 'inpacta-jwt-secret-2024';

function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido');
  }
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET);
}

/**
 * GET /api/admin/documents/[id]/versions/[versionId]/download
 * Baixar versão específica de um documento
 */
export async function GET(request, { params }) {
  try {
    verifyToken(request);

    const { id, versionId } = await params;

    // Buscar versão
    const version = await prisma.documentVersion.findFirst({
      where: {
        id: versionId,
        documentId: id,
      },
    });

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Versão não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o arquivo existe
    const filePath = path.join(process.cwd(), 'public', version.filePath);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Arquivo não encontrado no servidor' },
        { status: 404 }
      );
    }

    // Ler arquivo
    const fileBuffer = fs.readFileSync(filePath);
    
    // Retornar arquivo
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': version.fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${version.fileName}"`,
        'Content-Length': version.fileSize?.toString() || fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('❌ Erro ao baixar versão:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao baixar versão' },
      { status: 500 }
    );
  }
}
