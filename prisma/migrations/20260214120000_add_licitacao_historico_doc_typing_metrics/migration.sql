-- AlterTable
ALTER TABLE "bidding_documents" ADD COLUMN IF NOT EXISTS "tipoDocumento" TEXT;
ALTER TABLE "bidding_documents" ADD COLUMN IF NOT EXISTS "numeroAnexo" INTEGER;
ALTER TABLE "bidding_documents" ADD COLUMN IF NOT EXISTS "tituloExibicao" TEXT;
ALTER TABLE "bidding_documents" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "bidding_documents" ADD COLUMN IF NOT EXISTS "downloadCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "licitacao_historico" (
    "id" TEXT NOT NULL,
    "licitacao_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "usuario_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "licitacao_historico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "licitacao_historico_licitacao_id_created_at_idx" ON "licitacao_historico"("licitacao_id", "created_at");
CREATE INDEX IF NOT EXISTS "licitacao_historico_acao_idx" ON "licitacao_historico"("acao");

-- AddForeignKey (tolerante a reexecução)
DO $$ BEGIN
    ALTER TABLE "licitacao_historico"
    ADD CONSTRAINT "licitacao_historico_licitacao_id_fkey" FOREIGN KEY ("licitacao_id")
    REFERENCES "biddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "licitacao_historico"
    ADD CONSTRAINT "licitacao_historico_usuario_id_fkey" FOREIGN KEY ("usuario_id")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
