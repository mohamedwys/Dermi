-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN "rating" INTEGER,
ADD COLUMN "ratingComment" TEXT,
ADD COLUMN "ratedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ChatSession_shop_ratedAt_idx" ON "ChatSession"("shop", "ratedAt");
