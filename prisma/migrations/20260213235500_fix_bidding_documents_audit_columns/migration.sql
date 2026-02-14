DO $$
DECLARE
  fallback_user_id TEXT;
BEGIN
  -- pega um usuário qualquer para fallback (normalmente existe admin)
  SELECT id INTO fallback_user_id FROM "users" ORDER BY id LIMIT 1;

  -- createdById
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bidding_documents'
      AND column_name = 'createdById'
  ) THEN
    ALTER TABLE "bidding_documents" ADD COLUMN "createdById" TEXT;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'created_by'
    ) THEN
      UPDATE "bidding_documents"
      SET "createdById" = created_by
      WHERE "createdById" IS NULL;
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'created_by_id'
    ) THEN
      UPDATE "bidding_documents"
      SET "createdById" = created_by_id
      WHERE "createdById" IS NULL;
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'user_id'
    ) THEN
      UPDATE "bidding_documents"
      SET "createdById" = user_id
      WHERE "createdById" IS NULL;
    END IF;

    IF fallback_user_id IS NOT NULL THEN
      UPDATE "bidding_documents"
      SET "createdById" = fallback_user_id
      WHERE "createdById" IS NULL;
    END IF;

    -- só força NOT NULL se conseguimos preencher tudo
    IF NOT EXISTS (
      SELECT 1 FROM "bidding_documents" WHERE "createdById" IS NULL
    ) THEN
      ALTER TABLE "bidding_documents" ALTER COLUMN "createdById" SET NOT NULL;
    END IF;
  END IF;

  -- createdAt
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bidding_documents'
      AND column_name = 'createdAt'
  ) THEN
    ALTER TABLE "bidding_documents" ADD COLUMN "createdAt" TIMESTAMP(3);

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'created_at'
    ) THEN
      UPDATE "bidding_documents"
      SET "createdAt" = created_at
      WHERE "createdAt" IS NULL;
    END IF;

    UPDATE "bidding_documents"
    SET "createdAt" = CURRENT_TIMESTAMP
    WHERE "createdAt" IS NULL;

    ALTER TABLE "bidding_documents" ALTER COLUMN "createdAt" SET NOT NULL;
    ALTER TABLE "bidding_documents" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- updatedById
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bidding_documents'
      AND column_name = 'updatedById'
  ) THEN
    ALTER TABLE "bidding_documents" ADD COLUMN "updatedById" TEXT;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'updated_by'
    ) THEN
      UPDATE "bidding_documents"
      SET "updatedById" = updated_by
      WHERE "updatedById" IS NULL;
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'updated_by_id'
    ) THEN
      UPDATE "bidding_documents"
      SET "updatedById" = updated_by_id
      WHERE "updatedById" IS NULL;
    END IF;
  END IF;

  -- updatedAt
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bidding_documents'
      AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "bidding_documents" ADD COLUMN "updatedAt" TIMESTAMP(3);

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bidding_documents'
        AND column_name = 'updated_at'
    ) THEN
      UPDATE "bidding_documents"
      SET "updatedAt" = updated_at
      WHERE "updatedAt" IS NULL;
    END IF;

    UPDATE "bidding_documents"
    SET "updatedAt" = CURRENT_TIMESTAMP
    WHERE "updatedAt" IS NULL;

    ALTER TABLE "bidding_documents" ALTER COLUMN "updatedAt" SET NOT NULL;
    ALTER TABLE "bidding_documents" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;
