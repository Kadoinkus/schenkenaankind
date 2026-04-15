import { sendJson } from "./_lib/premiumCheckout.js";

export default async function handler(req, res) {
  return sendJson(res, 200, { received: true });
}
