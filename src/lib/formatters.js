export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function coerceNumber(value, fallback = 0) {
  if (typeof value === "string") {
    const compactValue = value.trim().replace(/\s+/g, "");

    if (!compactValue) {
      return fallback;
    }

    const groupedThousandsPattern = /^-?\d{1,3}([.,]\d{3})+$/;
    const normalizedValue = groupedThousandsPattern.test(compactValue)
      ? compactValue.replace(/[.,]/g, "")
      : compactValue.replace(",", ".");
    const parsed = Number(normalizedValue);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatMinorCurrency(valueInMinor) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format((Number(valueInMinor) || 0) / 100);
}

export function formatPercent(value, digits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}
