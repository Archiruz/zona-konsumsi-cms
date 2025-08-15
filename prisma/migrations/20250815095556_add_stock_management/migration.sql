/*
  Warnings:

  - Made the column `purchaseDate` on table `ConsumptionItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ConsumptionItem" DROP CONSTRAINT "ConsumptionItem_consumptionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConsumptionRecord" DROP CONSTRAINT "ConsumptionRecord_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConsumptionRecord" DROP CONSTRAINT "ConsumptionRecord_userId_fkey";

-- AlterTable
ALTER TABLE "public"."ConsumptionItem" ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "purchaseDate" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."StockAdjustment" (
    "id" TEXT NOT NULL,
    "change" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockAdjustment_itemId_idx" ON "public"."StockAdjustment"("itemId");

-- CreateIndex
CREATE INDEX "StockAdjustment_userId_idx" ON "public"."StockAdjustment"("userId");

-- AddForeignKey
ALTER TABLE "public"."ConsumptionItem" ADD CONSTRAINT "ConsumptionItem_consumptionTypeId_fkey" FOREIGN KEY ("consumptionTypeId") REFERENCES "public"."ConsumptionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsumptionRecord" ADD CONSTRAINT "ConsumptionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsumptionRecord" ADD CONSTRAINT "ConsumptionRecord_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."ConsumptionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockAdjustment" ADD CONSTRAINT "StockAdjustment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."ConsumptionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockAdjustment" ADD CONSTRAINT "StockAdjustment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
