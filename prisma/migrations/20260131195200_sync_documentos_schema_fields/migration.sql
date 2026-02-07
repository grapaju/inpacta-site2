-- Sync DB schema with prisma/schema.prisma for documentos/versoes_documento
-- This migration is intentionally additive/safe for existing data.

-- Ensure enum CategoriaMacroDocumento supports the values used in Prisma schema
ALTER TYPE "CategoriaMacroDocumento" ADD VALUE IF NOT EXISTS 'INSTITUCIONAL';
ALTER TYPE "CategoriaMacroDocumento" ADD VALUE IF NOT EXISTS 'GOVERNANCA_GESTAO';
ALTER TYPE "CategoriaMacroDocumento" ADD VALUE IF NOT EXISTS 'NORMATIVOS_INTERNOS';
ALTER TYPE "CategoriaMacroDocumento" ADD VALUE IF NOT EXISTS 'CONTRATOS_PARCERIAS';
ALTER TYPE "CategoriaMacroDocumento" ADD VALUE IF NOT EXISTS 'PRESTACAO_CONTAS';

-- Add missing base fields to documentos
ALTER TABLE "documentos"
ADD COLUMN IF NOT EXISTS "ano" INTEGER,
ADD COLUMN IF NOT EXISTS "data_documento" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "numero_documento" TEXT,
ADD COLUMN IF NOT EXISTS "contratada_parceiro" TEXT,
ADD COLUMN IF NOT EXISTS "valor_global" DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS "vigencia_meses" INTEGER,
ADD COLUMN IF NOT EXISTS "vigencia_inicio" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "vigencia_fim" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "periodo" TEXT;

-- Make orgao_emissor optional (Prisma schema uses String?)
ALTER TABLE "documentos"
ALTER COLUMN "orgao_emissor" DROP NOT NULL;

-- Backfill required fields for existing rows (if any)
UPDATE "documentos"
SET
  "ano" = COALESCE("ano", EXTRACT(YEAR FROM COALESCE("data_documento", "created_at"))::INTEGER),
  "data_documento" = COALESCE("data_documento", "created_at")
WHERE "ano" IS NULL OR "data_documento" IS NULL;

-- Enforce NOT NULL for required fields
ALTER TABLE "documentos"
ALTER COLUMN "ano" SET NOT NULL,
ALTER COLUMN "data_documento" SET NOT NULL;

-- Prisma list field should not be NULL; keep default as empty array
ALTER TABLE "documentos"
ALTER COLUMN "aparece_em" SET DEFAULT ARRAY[]::"DocumentoApareceEm"[];

UPDATE "documentos"
SET "aparece_em" = ARRAY[]::"DocumentoApareceEm"[]
WHERE "aparece_em" IS NULL;

ALTER TABLE "documentos"
ALTER COLUMN "aparece_em" SET NOT NULL;

-- Enums needed for versoes_documento optional status fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StatusNormativo') THEN
    CREATE TYPE "StatusNormativo" AS ENUM ('VIGENTE', 'REVOGADO');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StatusContrato') THEN
    CREATE TYPE "StatusContrato" AS ENUM ('VIGENTE', 'ENCERRADO');
  END IF;
END $$;

ALTER TABLE "versoes_documento"
ADD COLUMN IF NOT EXISTS "status_normativo" "StatusNormativo",
ADD COLUMN IF NOT EXISTS "status_contrato" "StatusContrato";
