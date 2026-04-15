import {
  PREMIUM_REPORT_CURRENCY,
  PREMIUM_REPORT_NAME,
  PREMIUM_REPORT_PRICE_MINOR,
  evaluatePromoCode,
  getPromoConfig,
} from "../../src/features/premium/premiumPricing.js";

function buildOrigin(req) {
  if (process.env.PUBLIC_APP_ORIGIN) {
    return process.env.PUBLIC_APP_ORIGIN.replace(/\/$/, "");
  }

  const forwardedProtocol = req.headers["x-forwarded-proto"] || "https";
  const forwardedHost = req.headers["x-forwarded-host"] || req.headers.host;
  return `${forwardedProtocol}://${forwardedHost}`;
}

export function buildCheckoutUrls(req, checkoutToken) {
  const origin = buildOrigin(req);

  return {
    origin,
    successUrl: `${origin}/?checkout=success&checkoutToken=${encodeURIComponent(
      checkoutToken,
    )}#berekening`,
    cancelUrl: `${origin}/?checkout=cancel&checkoutToken=${encodeURIComponent(
      checkoutToken,
    )}#berekening`,
    webhookUrl: `${origin}/api/payment-webhook`,
  };
}

export function getPricingPreview(promoCode, env = process.env) {
  const promoConfig = getPromoConfig(env);
  const promoResult = evaluatePromoCode(promoCode, {
    basePriceMinor: PREMIUM_REPORT_PRICE_MINOR,
    promoConfig,
  });

  return {
    basePriceMinor: PREMIUM_REPORT_PRICE_MINOR,
    currency: PREMIUM_REPORT_CURRENCY,
    promo: promoResult,
  };
}

export async function parseJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

export function sendJson(res, statusCode, payload) {
  res.status(statusCode).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function toMollieAmount(minor) {
  return (minor / 100).toFixed(2);
}

export async function createMolliePayment({
  req,
  checkoutToken,
  finalPriceMinor,
  promoCode,
  offer,
}) {
  if (!process.env.MOLLIE_API_KEY) {
    throw new Error("MOLLIE_API_KEY ontbreekt. Voeg eerst de Mollie API-sleutel toe in Vercel.");
  }

  const { successUrl, webhookUrl } = buildCheckoutUrls(req, checkoutToken);
  const response = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: {
        currency: PREMIUM_REPORT_CURRENCY,
        value: toMollieAmount(finalPriceMinor),
      },
      description: PREMIUM_REPORT_NAME,
      redirectUrl: successUrl,
      webhookUrl,
      metadata: {
        checkoutToken,
        product: "premium_report",
        promoCode: promoCode || "",
        bestPaidScenarioId: offer?.bestPaidScenarioId || "",
        estimatedSaving: offer?.estimatedSaving || 0,
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.detail || payload.title || "Mollie checkout kon niet worden aangemaakt.");
  }

  return {
    paymentId: payload.id,
    checkoutUrl: payload._links?.checkout?.href,
    providerStatus: payload.status,
  };
}

export async function fetchMolliePayment(paymentId) {
  if (!process.env.MOLLIE_API_KEY) {
    throw new Error("MOLLIE_API_KEY ontbreekt.");
  }

  const response = await fetch(
    `https://api.mollie.com/v2/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
      },
    },
  );
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.detail || payload.title || "Betaalstatus kon niet worden opgehaald.");
  }

  return payload;
}
