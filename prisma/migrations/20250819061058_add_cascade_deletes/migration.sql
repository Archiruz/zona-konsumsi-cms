-- DropForeignKey
ALTER TABLE "public"."ConsumptionItem" DROP CONSTRAINT "ConsumptionItem_consumptionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConsumptionRecord" DROP CONSTRAINT "ConsumptionRecord_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StockAdjustment" DROP CONSTRAINT "StockAdjustment_itemId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ConsumptionItem" ADD CONSTRAINT "ConsumptionItem_consumptionTypeId_fkey" FOREIGN KEY ("consumptionTypeId") REFERENCES "public"."ConsumptionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsumptionRecord" ADD CONSTRAINT "ConsumptionRecord_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."ConsumptionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockAdjustment" ADD CONSTRAINT "StockAdjustment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."ConsumptionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
