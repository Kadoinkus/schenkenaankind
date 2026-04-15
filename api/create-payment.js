import {
  buildCheckoutUrls,
  createMolliePayment,
  getPricingPreview,
  parseJsonBody,
  sendJson,
} from "./_lib/premiumCheckout.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const body = await parseJsonBody(req);
    const checkoutToken = String(body.checkoutToken || "").trim();

    if (!checkoutToken) {
      return sendJson(res, 400, { error: "checkoutToken ontbreekt." });
    }

    const pricing = getPricingPreview(body.promoCode, process.env);

    if (pricing.promo.finalPriceMinor === 0) {
      const { successUrl } = buildCheckoutUrls(req, checkoutToken);
      return sendJson(res, 200, {
        mode: "free",
        redirectUrl: `${successUrl}&free=1`,
        finalPriceMinor: 0,
        discountMinor: pricing.promo.discountMinor,
        normalizedCode: pricing.promo.normalizedCode,
      });
    }

    const payment = await createMolliePayment({
      req,
      checkoutToken,
      finalPriceMinor: pricing.promo.finalPriceMinor,
      promoCode: pricing.promo.normalizedCode,
      offer: body.offer,
    });

    return sendJson(res, 200, {
      mode: "payment",
      checkoutUrl: payment.checkoutUrl,
      paymentId: payment.paymentId,
      providerStatus: payment.providerStatus,
      finalPriceMinor: pricing.promo.finalPriceMinor,
      discountMinor: pricing.promo.discountMinor,
      normalizedCode: pricing.promo.normalizedCode,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error.message || "Checkout kon niet worden voorbereid.",
    });
  }
}
