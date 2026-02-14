DO $$
BEGIN
  -- filePath
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bidding_documents'
      AND column_name = 'filePath'
  ) THEN
    ALTER TABLE "bidding_documents" ADD COLUMN "filePath" TEXT;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'file_path'
    ) THEN
      UPDATE "bidding_documents"
      SET "filePath" = file_path
      WHERE "filePath" IS NULL;
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'filepath'
    ) THEN
      UPDATE "bidding_documents"
      SET "filePath" = filepath
      WHERE "filePath" IS NULL;
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'path'
    ) THEN
      UPDATE "bidding_documents"
      SET "filePath" = path
      WHERE "filePath" IS NULL;
    END IF;

    UPDATE "bidding_documents"
    SET "filePath" = '/uploads/licitacoes/arquivo'
    WHERE "filePath" IS NULL;

    ALTER TABLE "bidding_documents" ALTER COLUMN "filePath" SET NOT NULL;
  END IF;

  -- fileType
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bidding_documents'
      AND column_name = 'fileType'
  ) THEN
    ALTER TABLE "bidding_documents" ADD COLUMN "fileType" TEXT;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'file_type'
    ) THEN
      UPDATE "bidding_documents"
      SET "fileType" = file_type
      WHERE "fileType" IS NULL;
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'mimetype'
    ) THEN
      UPDATE "bidding_documents"
      SET "fileType" = mimetype
      WHERE "fileType" IS NULL;
    END IF;

    UPDATE "bidding_documents"
    SET "fileType" = 'application/pdf'
    WHERE "fileType" IS NULL;

    ALTER TABLE "bidding_documents" ALTER COLUMN "fileType" SET NOT NULL;
  END IF;

  -- fileSize
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bidding_documents'
      AND column_name = 'fileSize'
  ) THEN
    ALTER TABLE "bidding_documents" ADD COLUMN "fileSize" INTEGER;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'file_size'
    ) THEN
      UPDATE "bidding_documents"
      SET "fileSize" = file_size
      WHERE "fileSize" IS NULL;
    END IF;

    UPDATE "bidding_documents"
    SET "fileSize" = 0
    WHERE "fileSize" IS NULL;

    ALTER TABLE "bidding_documents" ALTER COLUMN "fileSize" SET NOT NULL;
    ALTER TABLE "bidding_documents" ALTER COLUMN "fileSize" SET DEFAULT 0;
  END IF;

  -- fileHash
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bidding_documents'
      AND column_name = 'fileHash'
  ) THEN
    ALTER TABLE "bidding_documents" ADD COLUMN "fileHash" TEXT;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'file_hash'
    ) THEN
      UPDATE "bidding_documents"
      SET "fileHash" = file_hash
      WHERE "fileHash" IS NULL;
    END IF;
  END IF;
END $$;
