-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "researchId" TEXT;

-- AlterTable
ALTER TABLE "Protocol" ADD COLUMN     "researchId" TEXT;

-- CreateIndex
CREATE INDEX "Protocol_researchId_idx" ON "Protocol"("researchId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;
