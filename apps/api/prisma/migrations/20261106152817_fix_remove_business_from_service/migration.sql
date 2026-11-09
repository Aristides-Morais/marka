/*
  Warnings:

  - You are about to drop the column `businessId` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `businessId` on the `services` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "reservations_businessId_startTime_idx";

-- DropIndex
DROP INDEX "services_businessId_idx";

-- AlterTable
ALTER TABLE "reservations" DROP COLUMN "businessId";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "businessId";

-- CreateIndex
CREATE INDEX "reservations_startTime_idx" ON "reservations"("startTime");
