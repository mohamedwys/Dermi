-- AlterTable
ALTER TABLE "WidgetSettings" ADD COLUMN "ratingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "ratingCustomTitle" TEXT,
ADD COLUMN "ratingCustomThankYou" TEXT;
