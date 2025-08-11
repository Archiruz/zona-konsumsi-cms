-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "public"."Period" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConsumptionType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "period" "public"."Period" NOT NULL DEFAULT 'WEEKLY',
    "limit" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsumptionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConsumptionItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photo" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "consumptionTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsumptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConsumptionRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsumptionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumptionType_name_key" ON "public"."ConsumptionType"("name");

-- CreateIndex
CREATE INDEX "ConsumptionItem_consumptionTypeId_idx" ON "public"."ConsumptionItem"("consumptionTypeId");

-- CreateIndex
CREATE INDEX "ConsumptionRecord_userId_idx" ON "public"."ConsumptionRecord"("userId");

-- CreateIndex
CREATE INDEX "ConsumptionRecord_itemId_idx" ON "public"."ConsumptionRecord"("itemId");

-- AddForeignKey
ALTER TABLE "public"."ConsumptionItem" ADD CONSTRAINT "ConsumptionItem_consumptionTypeId_fkey" FOREIGN KEY ("consumptionTypeId") REFERENCES "public"."ConsumptionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsumptionRecord" ADD CONSTRAINT "ConsumptionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsumptionRecord" ADD CONSTRAINT "ConsumptionRecord_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."ConsumptionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
