/*
  Warnings:

  - A unique constraint covering the columns `[userId,name,type]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Category_userId_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_name_type_key" ON "public"."Category"("userId", "name", "type");
