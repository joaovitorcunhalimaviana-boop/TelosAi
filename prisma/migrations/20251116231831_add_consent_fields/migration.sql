-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "consentTermDate" TIMESTAMP(3),
ADD COLUMN     "consentTermFileUrl" TEXT,
ADD COLUMN     "consentTermSigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappConsent" BOOLEAN NOT NULL DEFAULT false;
