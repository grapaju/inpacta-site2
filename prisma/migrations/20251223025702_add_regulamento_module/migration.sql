-- This migration was already applied in the local database but was missing from the repo.
-- It adds the REGULAMENTO variant to the DocumentModule enum.

ALTER TYPE "DocumentModule" ADD VALUE 'REGULAMENTO';
