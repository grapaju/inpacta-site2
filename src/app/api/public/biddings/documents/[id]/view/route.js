import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';

export const runtime = 'nodejs';

async function getDocumentFileCompat(id) {
  const cols = await prisma.$queryRaw(
    Prisma.sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
    `
  );
  const columnSet = new Set((cols || []).map((c) => c.column_name));

  const safe = (name) => {
    if (!columnSet.has(name)) return null;
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) return null;
    return name;
  };

  const coalesce = (a, b) => {
    if (a && b && a !== b) return Prisma.raw(`COALESCE(\"${a}\", \"${b}\")`);
    if (a) return Prisma.raw(`\"${a}\"`);
    if (b) return Prisma.raw(`\"${b}\"`);
    return Prisma.raw('NULL');
  };

  const fileNameExpr = coalesce(safe('fileName'), safe('file_name') || safe('filename'));
  const filePathExpr = coalesce(safe('filePath'), safe('file_path') || safe('filepath') || safe('path'));
  const fileTypeExpr = coalesce(safe('fileType'), safe('file_type') || safe('mimetype'));
  const statusExpr = coalesce(safe('status'), safe('status_publicacao'));

  const rows = await prisma.$queryRaw(
    Prisma.sql`
      SELECT
        "id",
        ${fileNameExpr} AS "fileName",
        ${filePathExpr} AS "filePath",
        ${fileTypeExpr} AS "fileType",
        ${statusExpr} AS "status"
      FROM "bidding_documents"
      WHERE "id" = ${id}
      LIMIT 1
    `
  );

  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.filePath) return null;
  if (row?.status && String(row.status).toUpperCase() !== 'PUBLISHED') return null;

  return {
    id: row.id,
    fileName: row.fileName || null,
    filePath: row.filePath,
    fileType: row.fileType || 'application/octet-stream',
    hasViewCount: Boolean(safe('viewCount') || safe('view_count')),
  };
}

async function incrementViewCountIfPossible(id) {
  try {
    const cols = await prisma.$queryRaw(
      Prisma.sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'bidding_documents'
          AND column_name IN ('viewCount', 'view_count')
      `
    );
    const names = new Set((cols || []).map((c) => c.column_name));

    if (names.has('viewCount')) {
      await prisma.$executeRaw(
        Prisma.sql`UPDATE "bidding_documents" SET "viewCount" = COALESCE("viewCount", 0) + 1 WHERE "id" = ${id}`
      );
    } else if (names.has('view_count')) {
      await prisma.$executeRaw(
        Prisma.sql`UPDATE "bidding_documents" SET "view_count" = COALESCE("view_count", 0) + 1 WHERE "id" = ${id}`
      );
    }
  } catch {
    // não bloquear
  }
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const doc = await getDocumentFileCompat(id);
    if (!doc) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });

    await incrementViewCountIfPossible(id);

    const rel = doc.filePath.startsWith('/') ? doc.filePath.slice(1) : doc.filePath;
    const absPath = path.join(process.cwd(), 'public', rel);

    try {
      await stat(absPath);
    } catch {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    const stream = createReadStream(absPath);
    const body = Readable.toWeb(stream);

    const headers = new Headers();
    headers.set('Content-Type', doc.fileType || 'application/octet-stream');
    headers.set('Content-Disposition', `inline; filename="${doc.fileName || 'documento'}"`);

    return new NextResponse(body, { status: 200, headers });
  } catch (error) {
    console.error('❌ Erro ao visualizar documento (public):', error);
    return NextResponse.json({ error: 'Erro ao visualizar documento' }, { status: 500 });
  }
}
