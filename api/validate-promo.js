import { getPricingPreview, parseJsonBody, sendJson } from "./_lib/premiumCheckout.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const body = await parseJsonBody(req);
    const pricing = getPricingPreview(body.promoCode, process.env);

    return sendJson(res, 200, {
      basePriceMinor: pricing.basePriceMinor,
      finalPriceMinor: pricing.promo.finalPriceMinor,
      discountMinor: pricing.promo.discountMinor,
      normalizedCode: pricing.promo.normalizedCode,
      valid: pricing.promo.valid,
      label: pricing.promo.label,
      message: pricing.promo.message,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error.message || "Kortingscode kon niet worden gecontroleerd.",
    });
  }
}
