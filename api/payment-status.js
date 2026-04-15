import { fetchMolliePayment, sendJson } from "./_lib/premiumCheckout.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const paymentId = String(req.query.paymentId || "").trim();
  const checkoutToken = String(req.query.checkoutToken || "").trim();

  if (!paymentId || !checkoutToken) {
    return sendJson(res, 400, {
      error: "paymentId en checkoutToken zijn verplicht.",
    });
  }

  try {
    const payment = await fetchMolliePayment(paymentId);
    const tokenMatches = payment.metadata?.checkoutToken === checkoutToken;

    if (!tokenMatches) {
      return sendJson(res, 403, {
        paid: false,
        error: "De terugkeer van de checkout kon niet veilig worden gekoppeld.",
      });
    }

    return sendJson(res, 200, {
      paid: payment.status === "paid",
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
    });
  } catch (error) {
    return sendJson(res, 500, {
      paid: false,
      error: error.message || "Betaalstatus kon niet worden gecontroleerd.",
    });
  }
}
