-- CreateTable
CREATE TABLE "RedFlagView" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "followUpResponseId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedFlagView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RedFlagView_userId_viewedAt_idx" ON "RedFlagView"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "RedFlagView_followUpResponseId_idx" ON "RedFlagView"("followUpResponseId");

-- AddForeignKey
ALTER TABLE "RedFlagView" ADD CONSTRAINT "RedFlagView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedFlagView" ADD CONSTRAINT "RedFlagView_followUpResponseId_fkey" FOREIGN KEY ("followUpResponseId") REFERENCES "FollowUpResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
