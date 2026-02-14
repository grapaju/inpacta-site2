DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bidding_documents'
      AND column_name = 'fileName'
  ) THEN
    ALTER TABLE "bidding_documents" ADD COLUMN "fileName" TEXT;

    -- Tentar preencher a partir de variantes comuns
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'file_name'
    ) THEN
      UPDATE "bidding_documents"
      SET "fileName" = file_name
      WHERE "fileName" IS NULL;
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'filename'
    ) THEN
      UPDATE "bidding_documents"
      SET "fileName" = filename
      WHERE "fileName" IS NULL;
    END IF;

    -- Garantir NOT NULL
    UPDATE "bidding_documents"
    SET "fileName" = 'arquivo'
    WHERE "fileName" IS NULL;

    ALTER TABLE "bidding_documents" ALTER COLUMN "fileName" SET NOT NULL;
  END IF;
END $$;
