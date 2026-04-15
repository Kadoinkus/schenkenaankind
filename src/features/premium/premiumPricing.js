export const PREMIUM_REPORT_PRICE_MINOR = 1499;
export const PREMIUM_REPORT_CURRENCY = "EUR";
export const PREMIUM_REPORT_NAME = "Uitgebreid woningoverdrachtrapport";
export const PREMIUM_ACCESS_STORAGE_KEY = "huisoverdracht-premium-access-v1";
export const PREMIUM_PENDING_STORAGE_KEY = "huisoverdracht-premium-pending-v1";
export const DEFAULT_ALWAYS_WORKS_PROMO_CODE = "HUIS2026";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function normalizePromoCode(code) {
  return String(code || "").trim().toUpperCase();
}

export function getPromoConfig(env = {}) {
  const normalizedCode = normalizePromoCode(
    env.MASTER_PROMO_CODE || DEFAULT_ALWAYS_WORKS_PROMO_CODE,
  );
  const discountType = env.MASTER_PROMO_TYPE === "fixed" ? "fixed" : "percent";
  const fallbackValue = discountType === "fixed" ? PREMIUM_REPORT_PRICE_MINOR : 100;
  const rawValue = Number(env.MASTER_PROMO_VALUE ?? fallbackValue);

  return {
    code: normalizedCode,
    discountType,
    discountValue: Number.isFinite(rawValue) ? rawValue : fallbackValue,
  };
}

export function evaluatePromoCode(
  code,
  {
    basePriceMinor = PREMIUM_REPORT_PRICE_MINOR,
    promoConfig = getPromoConfig(),
  } = {},
) {
  const normalizedCode = normalizePromoCode(code);

  if (!normalizedCode) {
    return {
      normalizedCode,
      valid: false,
      matchedAlwaysOnCode: false,
      discountMinor: 0,
      finalPriceMinor: basePriceMinor,
      label: "",
      message: "",
    };
  }

  if (normalizedCode !== promoConfig.code) {
    return {
      normalizedCode,
      valid: false,
      matchedAlwaysOnCode: false,
      discountMinor: 0,
      finalPriceMinor: basePriceMinor,
      label: "",
      message: "Deze kortingscode is niet geldig.",
    };
  }

  const discountMinor =
    promoConfig.discountType === "fixed"
      ? clamp(Math.round(promoConfig.discountValue), 0, basePriceMinor)
      : Math.round(basePriceMinor * (clamp(promoConfig.discountValue, 0, 100) / 100));
  const finalPriceMinor = Math.max(0, basePriceMinor - discountMinor);
  const label =
    promoConfig.discountType === "fixed"
      ? `-${(discountMinor / 100).toFixed(2).replace(".", ",")} korting`
      : `${clamp(promoConfig.discountValue, 0, 100)}% korting`;

  return {
    normalizedCode,
    valid: true,
    matchedAlwaysOnCode: true,
    discountMinor,
    finalPriceMinor,
    label,
    message:
      finalPriceMinor === 0
        ? "Kortingscode toegepast. Het volledige rapport wordt gratis vrijgeschakeld."
        : "Kortingscode toegepast.",
  };
}
