ALTER TABLE "Category" ADD COLUMN "color" TEXT;

-- Partial unique index: only enforce uniqueness when color is not null,
-- so existing categories with NULL color don't violate the constraint.
CREATE UNIQUE INDEX "Category_userId_type_color_key"
  ON "Category"("userId", "type", "color")
  WHERE "color" IS NOT NULL;
