-- AlterTable
ALTER TABLE "User" ADD COLUMN     "collectiveIntelligenceDate" TIMESTAMP(3),
ADD COLUMN     "collectiveIntelligenceOptIn" BOOLEAN NOT NULL DEFAULT false;
