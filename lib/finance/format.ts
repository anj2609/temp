const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactRupeeFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatRupees(value: number): string {
  if (!Number.isFinite(value)) return "₹0";
  return rupeeFormatter.format(Math.round(value));
}

export function formatRupeesPlain(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return compactRupeeFormatter.format(Math.round(value));
}

export function formatPercent(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatMonths(value: number): string {
  const months = Math.max(0, Math.round(value));
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}
