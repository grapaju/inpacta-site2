-- CreateTable
CREATE TABLE "bidding_documents" (
    "id" TEXT NOT NULL,
    "biddingId" TEXT NOT NULL,
    "phase" "BiddingPhase" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "fileType" TEXT NOT NULL DEFAULT 'application/pdf',
    "fileHash" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bidding_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bidding_documents_biddingId_phase_order_idx" ON "bidding_documents"("biddingId", "phase", "order");

-- CreateIndex
CREATE INDEX "bidding_documents_createdAt_idx" ON "bidding_documents"("createdAt");

-- AddForeignKey
ALTER TABLE "bidding_documents" ADD CONSTRAINT "bidding_documents_biddingId_fkey" FOREIGN KEY ("biddingId") REFERENCES "biddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bidding_documents" ADD CONSTRAINT "bidding_documents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bidding_documents" ADD CONSTRAINT "bidding_documents_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
