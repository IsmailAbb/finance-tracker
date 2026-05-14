-- Add currency to User
ALTER TABLE "User" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

-- Rename Account.balance to Account.initialBalance (preserves existing values)
ALTER TABLE "Account" RENAME COLUMN "balance" TO "initialBalance";

-- Backfill any null userId on Category before making it required.
-- (If there are any orphan categories, delete them; they cannot belong to a user.)
DELETE FROM "Category" WHERE "userId" IS NULL;
ALTER TABLE "Category" ALTER COLUMN "userId" SET NOT NULL;

-- Replace foreign keys with cascade behavior.
ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
ALTER TABLE "Account"
  ADD CONSTRAINT "Account_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_userId_fkey";
ALTER TABLE "Category"
  ADD CONSTRAINT "Category_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_userId_fkey";
ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_accountId_fkey";
ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_categoryId_fkey";
ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for the common transactions-by-user-by-date query.
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");
