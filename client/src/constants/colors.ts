// Palettes for category colors. 30 colors each, intentionally chosen to be
// perceptually distinct so users can tell categories apart at a glance.
//
// Strategy: the first 15 in each palette walk every major hue family (red,
// orange, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet,
// fuchsia, pink, plus a neutral). The next 15 are darker (expense) or paler
// (income) variations of the same hues, used as fall-backs once the first 15
// slots are taken.

export const EXPENSE_PALETTE = [
  // ── Row 1: max-distinct vivid darks, one per hue ──
  "#991b1b", // red
  "#9a3412", // orange
  "#854d0e", // yellow / gold
  "#3f6212", // lime
  "#166534", // green
  "#065f46", // emerald
  "#115e59", // teal
  "#155e75", // cyan
  "#075985", // sky
  "#1e40af", // blue
  "#4338ca", // indigo
  "#6d28d9", // violet
  "#86198f", // fuchsia
  "#9d174d", // pink
  "#1e293b", // slate (neutral)
  // ── Row 2: deeper/secondary variations ──
  "#7f1d1d", // deep red / maroon
  "#7c2d12", // burnt orange
  "#713f12", // olive yellow
  "#365314", // dark lime
  "#14532d", // forest green
  "#064e3b", // deep emerald
  "#134e4a", // dark teal
  "#164e63", // dark cyan
  "#0c4a6e", // deep sky
  "#1e3a8a", // navy
  "#312e81", // deep indigo
  "#4c1d95", // deep violet
  "#581c87", // deep purple
  "#831843", // wine
  "#422006", // dark brown
] as const;

export const INCOME_PALETTE = [
  // ── Row 1: vivid pastels, one per hue ──
  "#fca5a5", // coral red
  "#fdba74", // peach
  "#fcd34d", // gold
  "#fde047", // lemon yellow
  "#bef264", // vivid lime
  "#86efac", // mint green
  "#6ee7b7", // mint emerald
  "#5eead4", // bright teal
  "#67e8f9", // cyan
  "#7dd3fc", // sky
  "#93c5fd", // soft blue
  "#a5b4fc", // lavender indigo
  "#c4b5fd", // lavender violet
  "#f0abfc", // lilac
  "#f9a8d4", // pink
  // ── Row 2: paler variations of the same hues ──
  "#fecaca", // pale red
  "#fed7aa", // pale peach
  "#fde68a", // pale gold
  "#fef08a", // pale yellow
  "#d9f99d", // pale lime
  "#bbf7d0", // pale mint
  "#a7f3d0", // pale emerald
  "#99f6e4", // pale teal
  "#a5f3fc", // pale cyan
  "#bae6fd", // pale sky
  "#bfdbfe", // pale blue
  "#c7d2fe", // pale indigo
  "#ddd6fe", // pale violet
  "#f5d0fe", // pale fuchsia
  "#fbcfe8", // pale pink
] as const;

export function paletteFor(type: "income" | "expense"): readonly string[] {
  return type === "income" ? INCOME_PALETTE : EXPENSE_PALETTE;
}

/** Fallback color when a category has no color assigned. */
export const FALLBACK_COLOR = "#9ca3af";
