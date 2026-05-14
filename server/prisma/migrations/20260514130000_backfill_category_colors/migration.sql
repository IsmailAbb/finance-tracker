-- Backfill colors for any pre-existing categories that still have NULL color.
-- Walks each user's categories of each type in id order and assigns the next
-- color from the palette, skipping any color already taken by that user+type.

DO $$
DECLARE
  expense_colors TEXT[] := ARRAY[
    '#0f766e', '#134e4a', '#115e59', '#155e75', '#0c4a6e',
    '#14532d', '#166534', '#047857', '#064e3b', '#3f6212', '#365314',
    '#1e3a8a', '#312e81', '#1e293b', '#374151',
    '#581c87', '#6b21a8', '#4c1d95', '#86198f', '#4a044e',
    '#9f1239', '#831843', '#881337', '#7f1d1d',
    '#7c2d12', '#9a3412', '#92400e', '#78350f', '#854d0e',
    '#1f2937'
  ];
  income_colors TEXT[] := ARRAY[
    '#99dfcb', '#5eead4', '#99f6e4', '#a7f3d0', '#6ee7b7', '#d1fae5',
    '#86efac', '#bef264', '#d9f99d',
    '#fef08a', '#fde68a', '#fef3c7',
    '#fed7aa', '#fdba74',
    '#fecaca', '#fda4af', '#fbcfe8', '#f9a8d4',
    '#f5d0fe', '#e9d5ff', '#c4b5fd', '#ddd6fe',
    '#c7d2fe', '#bfdbfe', '#93c5fd', '#bae6fd', '#7dd3fc',
    '#cffafe', '#a5f3fc', '#67e8f9'
  ];
  rec RECORD;
  palette TEXT[];
  candidate TEXT;
  i INT;
BEGIN
  FOR rec IN
    SELECT id, "userId", "type"
    FROM "Category"
    WHERE color IS NULL
    ORDER BY "userId", "type", "id"
  LOOP
    IF rec."type" = 'expense' THEN palette := expense_colors;
    ELSE palette := income_colors;
    END IF;

    candidate := NULL;
    FOR i IN 1..array_length(palette, 1) LOOP
      IF NOT EXISTS (
        SELECT 1 FROM "Category"
        WHERE "userId" = rec."userId" AND "type" = rec."type" AND color = palette[i]
      ) THEN
        candidate := palette[i];
        EXIT;
      END IF;
    END LOOP;

    IF candidate IS NOT NULL THEN
      UPDATE "Category" SET color = candidate WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;
