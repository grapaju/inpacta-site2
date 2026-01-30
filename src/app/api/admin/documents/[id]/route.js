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
  } catch (error) {
    throw new Error('Token inválido');
  }
}

/**
 * GET /api/admin/documents/[id]
 * Buscar documento específico
 */
export async function GET(request, { params }) {
  try {
    const decoded = verifyToken(request);
    
    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        area: true,
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
        bidding: true,
        versions: {
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        history: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão (não-ADMIN só pode ver seus próprios docs)
    if (decoded.role !== 'ADMIN' && document.createdById !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para visualizar este documento' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar documento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar documento' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/documents/[id]
 * Atualizar documento
 */
export async function PATCH(request, { params }) {
  try {
    const decoded = verifyToken(request);
    
    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Buscar documento atual
    const currentDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!currentDocument) {
      return NextResponse.json(
        { success: false, error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (decoded.role !== 'ADMIN' && currentDocument.createdById !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para editar este documento' },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      identifier,
      approvalDate,
      issuingBody,
      shortDescription,
      transparencyStatus,
      subcategory,
      areaId,
      categoryId,
      module,
      phase,
      order,
      scheduledPublishAt,
      publishedAt,
      referenceDate,
      year,
      fileName,
      filePath,
      fileUrl,
      fileSize,
      fileType,
      publishDate,
      biddingId,
      status,
    } = body;

    // Preparar dados de atualização
    const updateData = {
      updatedById: decoded.userId,
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (identifier !== undefined) updateData.identifier = identifier || null;
    if (approvalDate !== undefined) {
      if (approvalDate) {
        const parsedApprovalDate = parseDateInputToUTC(approvalDate);
        if (!parsedApprovalDate) {
          return NextResponse.json(
            { success: false, error: 'approvalDate inválida. Use YYYY-MM-DD (input date) ou DD/MM/AAAA.' },
            { status: 400 }
          );
        }
        updateData.approvalDate = parsedApprovalDate;
      } else {
        updateData.approvalDate = null;
      }
    }
    if (issuingBody !== undefined) updateData.issuingBody = issuingBody || null;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription || null;
    if (transparencyStatus !== undefined) updateData.transparencyStatus = transparencyStatus;
    if (subcategory !== undefined) updateData.subcategory = subcategory || null;
    if (areaId !== undefined) updateData.areaId = areaId;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (module !== undefined) updateData.module = module;
    if (phase !== undefined) updateData.phase = phase || null;
    if (order !== undefined) updateData.order = order === null || order === '' ? 0 : parseInt(order, 10);
    if (scheduledPublishAt !== undefined) {
      updateData.scheduledPublishAt = scheduledPublishAt ? new Date(scheduledPublishAt) : null;
    }
    if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
    }
    if (referenceDate !== undefined) {
      updateData.referenceDate = referenceDate ? new Date(referenceDate) : null;
    }
    if (year !== undefined) updateData.year = year ? parseInt(year, 10) : currentDocument.year;
    if (fileName !== undefined) updateData.fileName = fileName;
    if (filePath !== undefined) updateData.filePath = filePath;
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
    if (fileSize !== undefined) updateData.fileSize = fileSize ? parseInt(fileSize, 10) : null;
    if (fileType !== undefined) updateData.fileType = fileType;
    if (publishDate !== undefined) updateData.publishedAt = new Date(publishDate);
    if (biddingId !== undefined) updateData.biddingId = biddingId || null;

    // Módulos não-LICITACAO: exige PDF
    const effectiveModule = module || currentDocument.module;
    const effectiveFileType = fileType !== undefined ? fileType : currentDocument.fileType;
    if (effectiveModule !== 'LICITACAO' && effectiveFileType && effectiveFileType !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Para este módulo, o arquivo deve ser PDF' },
        { status: 400 }
      );
    }
    
    // Mudança de status (apenas ADMIN pode publicar diretamente)
    if (status !== undefined) {
      if (status === 'PUBLISHED' && decoded.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Apenas ADMIN pode publicar documentos diretamente' },
          { status: 403 }
        );
      }
      updateData.status = status;
    }

    // Se mudou o arquivo, criar nova versão
    if (filePath && filePath !== currentDocument.filePath) {
      updateData.version = currentDocument.version + 1;
      
      // Salvar versão anterior como histórico
      await prisma.documentVersion.create({
        data: {
          documentId: currentDocument.id,
          version: currentDocument.version,
          fileName: currentDocument.fileName,
          filePath: currentDocument.filePath,
          fileSize: currentDocument.fileSize,
          fileType: currentDocument.fileType,
          changes: `Arquivo substituído - nova versão ${currentDocument.version + 1}`,
          createdById: decoded.userId,
        },
      });
    }

    // Atualizar documento
    const document = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        area: true,
        category: true,
        createdBy: {
          select: { id: true, name: true },
        },
        updatedBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Registrar no histórico com detalhes das mudanças
    const changes = {};
    const changesDetail = [];
    
    Object.keys(body).forEach(key => {
      if (currentDocument[key] !== body[key]) {
        changes[key] = {
          from: currentDocument[key],
          to: body[key],
        };
        
        // Criar descrição legível
        if (key === 'status') {
          changesDetail.push(`Status: ${currentDocument[key]} → ${body[key]}`);
        } else if (key === 'title') {
          changesDetail.push(`Título alterado`);
        } else if (key === 'filePath') {
          changesDetail.push(`Arquivo atualizado (versão ${updateData.version || currentDocument.version})`);
        } else {
          changesDetail.push(`${key} alterado`);
        }
      }
    });

    // Determinar ação específica baseada nas mudanças
    let action = 'UPDATED';
    if (body.status && body.status !== currentDocument.status) {
      if (body.status === 'ARCHIVED') {
        action = 'ARCHIVED';
      } else if (body.status === 'PUBLISHED' && currentDocument.status !== 'PUBLISHED') {
        action = 'PUBLISHED';
      }
    }

    await prisma.documentHistory.create({
      data: {
        documentId: document.id,
        action,
        userId: decoded.userId,
        changes,
      },
    });

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Documento atualizado com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar documento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar documento' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/documents/[id]
 * Deletar documento
 */
export async function DELETE(request, { params }) {
  try {
    const decoded = verifyToken(request);
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Apenas ADMIN pode deletar documentos' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        history: {
          where: {
            action: 'PUBLISHED',
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    // Bloquear exclusão de documentos que já foram publicados
    if (document.status === 'PUBLISHED' || document.history.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Documentos publicados não podem ser deletados. Arquive-os ao invés de deletar.',
        },
        { status: 403 }
      );
    }

    // Registrar deleção no histórico antes de deletar
    await prisma.documentHistory.create({
      data: {
        documentId: document.id,
        action: 'DELETED',
        userId: decoded.userId,
        changes: {
          title: document.title,
          status: document.status,
          deletedAt: new Date().toISOString(),
        },
      },
    });

    // Deletar documento (cascade vai deletar versões e histórico)
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Documento deletado com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao deletar documento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar documento' },
      { status: 500 }
    );
  }
}
