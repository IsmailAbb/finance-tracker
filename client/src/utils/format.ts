export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Splits a formatted currency string into the part before the decimal and the decimal+cents. */
export function splitCurrency(amount: number, currency = "USD"): { whole: string; fraction: string } {
  const formatted = formatCurrency(amount, currency);
  // Find the decimal separator (locale-aware): the last group of non-digit chars before the last digits.
  const match = formatted.match(/^(.*)([.,]\d{2})([^\d]*)$/);
  if (!match) return { whole: formatted, fraction: "" };
  return { whole: match[1], fraction: match[2] + match[3] };
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
