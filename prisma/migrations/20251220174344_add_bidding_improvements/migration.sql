-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentModule" AS ENUM ('LICITACAO', 'TRANSPARENCIA');

-- CreateEnum
CREATE TYPE "BiddingPhase" AS ENUM ('ABERTURA', 'QUESTIONAMENTOS', 'JULGAMENTO', 'RECURSO', 'HOMOLOGACAO', 'CONTRATACAO', 'EXECUCAO', 'ENCERRAMENTO');

-- CreateEnum
CREATE TYPE "DisplayType" AS ENUM ('TABLE', 'CARDS', 'PAGE_WITH_DOCS');

-- CreateEnum
CREATE TYPE "BiddingModality" AS ENUM ('PREGAO_ELETRONICO', 'PREGAO_PRESENCIAL', 'CONCORRENCIA', 'TOMADA_PRECOS', 'CONVITE', 'DISPENSA', 'INEXIGIBILIDADE');

-- CreateEnum
CREATE TYPE "BiddingType" AS ENUM ('MENOR_PRECO', 'MELHOR_TECNICA', 'TECNICA_PRECO');

-- CreateEnum
CREATE TYPE "BiddingStatus" AS ENUM ('PLANEJAMENTO', 'PUBLICADO', 'EM_ANDAMENTO', 'SUSPENSA', 'HOMOLOGADO', 'ADJUDICADO', 'REVOGADO', 'ANULADO', 'DESERTO', 'FRACASSADO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "HistoryAction" AS ENUM ('CREATED', 'UPDATED', 'PUBLISHED', 'UNPUBLISHED', 'APPROVED', 'REJECTED', 'ARCHIVED', 'RESTORED', 'DELETED', 'SCHEDULED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'APPROVER';

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organization" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_areas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "areaId" TEXT NOT NULL,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "displayType" "DisplayType" NOT NULL DEFAULT 'TABLE',
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "module" "DocumentModule" NOT NULL DEFAULT 'TRANSPARENCIA',
    "areaId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategory" TEXT,
    "phase" "BiddingPhase",
    "order" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "referenceDate" TIMESTAMP(3),
    "scheduledPublishAt" TIMESTAMP(3),
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "biddingId" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biddings" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "modality" "BiddingModality" NOT NULL,
    "type" "BiddingType" NOT NULL,
    "status" "BiddingStatus" NOT NULL,
    "legalBasis" TEXT,
    "srp" BOOLEAN NOT NULL DEFAULT false,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "openingDate" TIMESTAMP(3),
    "closingDate" TIMESTAMP(3),
    "estimatedValue" DECIMAL(15,2),
    "finalValue" DECIMAL(15,2),
    "winner" TEXT,
    "winnerDocument" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bidding_movements" (
    "id" TEXT NOT NULL,
    "biddingId" TEXT NOT NULL,
    "phase" "BiddingPhase" NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bidding_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "changes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_history" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "action" "HistoryAction" NOT NULL,
    "changes" JSONB,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_submissions_ip_createdAt_idx" ON "contact_submissions"("ip", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "document_areas_slug_key" ON "document_areas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "document_categories_slug_key" ON "document_categories"("slug");

-- CreateIndex
CREATE INDEX "document_categories_areaId_active_order_idx" ON "document_categories"("areaId", "active", "order");

-- CreateIndex
CREATE INDEX "documents_areaId_categoryId_status_idx" ON "documents"("areaId", "categoryId", "status");

-- CreateIndex
CREATE INDEX "documents_biddingId_idx" ON "documents"("biddingId");

-- CreateIndex
CREATE INDEX "documents_year_publishedAt_idx" ON "documents"("year", "publishedAt");

-- CreateIndex
CREATE INDEX "documents_status_publishedAt_idx" ON "documents"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "biddings_number_key" ON "biddings"("number");

-- CreateIndex
CREATE INDEX "biddings_status_openingDate_idx" ON "biddings"("status", "openingDate");

-- CreateIndex
CREATE INDEX "biddings_number_idx" ON "biddings"("number");

-- CreateIndex
CREATE INDEX "bidding_movements_biddingId_date_idx" ON "bidding_movements"("biddingId", "date");

-- CreateIndex
CREATE INDEX "document_versions_documentId_idx" ON "document_versions"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_documentId_version_key" ON "document_versions"("documentId", "version");

-- CreateIndex
CREATE INDEX "document_history_documentId_createdAt_idx" ON "document_history"("documentId", "createdAt");

-- AddForeignKey
ALTER TABLE "document_categories" ADD CONSTRAINT "document_categories_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "document_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_categories" ADD CONSTRAINT "document_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "document_categories"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "document_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "document_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_biddingId_fkey" FOREIGN KEY ("biddingId") REFERENCES "biddings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bidding_movements" ADD CONSTRAINT "bidding_movements_biddingId_fkey" FOREIGN KEY ("biddingId") REFERENCES "biddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bidding_movements" ADD CONSTRAINT "bidding_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_history" ADD CONSTRAINT "document_history_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_history" ADD CONSTRAINT "document_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
