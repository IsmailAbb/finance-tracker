-- Reassign every category's color from the redesigned (more-distinct) palettes.
-- We first NULL all colors so the partial unique index doesn't fight us, then
-- walk each (user, type) bucket in id order and pick the first available color
-- from the new palette.

DO $$
DECLARE
  expense_colors TEXT[] := ARRAY[
    '#991b1b', '#9a3412', '#854d0e', '#3f6212', '#166534',
    '#065f46', '#115e59', '#155e75', '#075985', '#1e40af',
    '#4338ca', '#6d28d9', '#86198f', '#9d174d', '#1e293b',
    '#7f1d1d', '#7c2d12', '#713f12', '#365314', '#14532d',
    '#064e3b', '#134e4a', '#164e63', '#0c4a6e', '#1e3a8a',
    '#312e81', '#4c1d95', '#581c87', '#831843', '#422006'
  ];
  income_colors TEXT[] := ARRAY[
    '#fca5a5', '#fdba74', '#fcd34d', '#fde047', '#bef264',
    '#86efac', '#6ee7b7', '#5eead4', '#67e8f9', '#7dd3fc',
    '#93c5fd', '#a5b4fc', '#c4b5fd', '#f0abfc', '#f9a8d4',
    '#fecaca', '#fed7aa', '#fde68a', '#fef08a', '#d9f99d',
    '#bbf7d0', '#a7f3d0', '#99f6e4', '#a5f3fc', '#bae6fd',
    '#bfdbfe', '#c7d2fe', '#ddd6fe', '#f5d0fe', '#fbcfe8'
  ];
  rec RECORD;
  palette TEXT[];
  candidate TEXT;
  i INT;
BEGIN
  -- Wipe colors so we can re-assign without bumping into the unique index.
  UPDATE "Category" SET color = NULL;

  FOR rec IN
    SELECT id, "userId", "type"
    FROM "Category"
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
