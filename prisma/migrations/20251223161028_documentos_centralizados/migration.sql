/*
  Warnings:

  - You are about to drop the `document_areas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CategoriaMacroDocumento" AS ENUM ('RELATORIOS_FINANCEIROS', 'RELATORIOS_GESTAO', 'DOCUMENTOS_OFICIAIS', 'LICITACOES_E_REGULAMENTOS');

-- CreateEnum
CREATE TYPE "DocumentoStatusPublicacao" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentoApareceEm" AS ENUM ('TRANSPARENCIA', 'LICITACOES');

-- DropForeignKey
ALTER TABLE "public"."document_categories" DROP CONSTRAINT "document_categories_areaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_categories" DROP CONSTRAINT "document_categories_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_history" DROP CONSTRAINT "document_history_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_history" DROP CONSTRAINT "document_history_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_versions" DROP CONSTRAINT "document_versions_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_versions" DROP CONSTRAINT "document_versions_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_areaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_biddingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_updatedById_fkey";

-- DropTable
DROP TABLE "public"."document_areas";

-- DropTable
DROP TABLE "public"."document_categories";

-- DropTable
DROP TABLE "public"."document_history";

-- DropTable
DROP TABLE "public"."document_versions";

-- DropTable
DROP TABLE "public"."documents";

-- DropEnum
DROP TYPE "public"."DisplayType";

-- DropEnum
DROP TYPE "public"."DocumentModule";

-- DropEnum
DROP TYPE "public"."DocumentStatus";

-- DropEnum
DROP TYPE "public"."HistoryAction";

-- DropEnum
DROP TYPE "public"."TransparencyDocumentStatus";

-- CreateTable
CREATE TABLE "documentos" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoria_macro" "CategoriaMacroDocumento" NOT NULL,
    "subcategoria" TEXT NOT NULL,
    "descricao_curta" TEXT NOT NULL,
    "orgao_emissor" TEXT NOT NULL,
    "aparece_em" "DocumentoApareceEm"[],
    "status" "DocumentoStatusPublicacao" NOT NULL DEFAULT 'DRAFT',
    "ordem_exibicao" INTEGER NOT NULL DEFAULT 0,
    "versao_vigente_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "versoes_documento" (
    "id" UUID NOT NULL,
    "documento_id" UUID NOT NULL,
    "numero_identificacao" TEXT NOT NULL,
    "versao" INTEGER NOT NULL,
    "data_aprovacao" TIMESTAMP(3) NOT NULL,
    "descricao_alteracao" TEXT,
    "arquivo_pdf" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_hash" TEXT NOT NULL,
    "is_vigente" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "versoes_documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentos_slug_key" ON "documentos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "documentos_versao_vigente_id_key" ON "documentos"("versao_vigente_id");

-- CreateIndex
CREATE INDEX "documentos_categoria_macro_status_ordem_exibicao_idx" ON "documentos"("categoria_macro", "status", "ordem_exibicao");

-- CreateIndex
CREATE INDEX "documentos_status_updated_at_idx" ON "documentos"("status", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "versoes_documento_file_hash_key" ON "versoes_documento"("file_hash");

-- CreateIndex
CREATE INDEX "versoes_documento_documento_id_is_vigente_idx" ON "versoes_documento"("documento_id", "is_vigente");

-- CreateIndex
CREATE INDEX "versoes_documento_data_aprovacao_idx" ON "versoes_documento"("data_aprovacao");

-- CreateIndex
CREATE UNIQUE INDEX "versoes_documento_documento_id_versao_key" ON "versoes_documento"("documento_id", "versao");

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_versao_vigente_id_fkey" FOREIGN KEY ("versao_vigente_id") REFERENCES "versoes_documento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versoes_documento" ADD CONSTRAINT "versoes_documento_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versoes_documento" ADD CONSTRAINT "versoes_documento_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
