-- Add transparency-specific metadata fields to documents

-- Create enum for transparency status
CREATE TYPE "TransparencyDocumentStatus" AS ENUM ('PUBLICADO', 'EM_BREVE');

ALTER TABLE "documents"
ADD COLUMN "identifier" TEXT,
ADD COLUMN "approvalDate" TIMESTAMP(3),
ADD COLUMN "issuingBody" TEXT,
ADD COLUMN "shortDescription" TEXT,
ADD COLUMN "transparencyStatus" "TransparencyDocumentStatus" NOT NULL DEFAULT 'PUBLICADO';
