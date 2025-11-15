-- CreateTable
CREATE TABLE "Protocol" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "surgeryType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dayRangeStart" INTEGER NOT NULL,
    "dayRangeEnd" INTEGER,
    "content" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Protocol_userId_idx" ON "Protocol"("userId");

-- CreateIndex
CREATE INDEX "Protocol_surgeryType_idx" ON "Protocol"("surgeryType");

-- CreateIndex
CREATE INDEX "Protocol_category_idx" ON "Protocol"("category");

-- CreateIndex
CREATE INDEX "Protocol_dayRangeStart_idx" ON "Protocol"("dayRangeStart");

-- CreateIndex
CREATE INDEX "Protocol_isActive_idx" ON "Protocol"("isActive");

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
