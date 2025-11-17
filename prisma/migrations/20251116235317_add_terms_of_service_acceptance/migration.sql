-- AlterTable
ALTER TABLE "User" ADD COLUMN     "acceptedTermsOfService" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "termsOfServiceAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "termsOfServiceAcceptedFromIP" TEXT,
ADD COLUMN     "termsOfServiceVersion" TEXT;
