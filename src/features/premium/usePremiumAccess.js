import { useEffect, useState } from "react";
import {
  PREMIUM_ACCESS_STORAGE_KEY,
  PREMIUM_PENDING_STORAGE_KEY,
} from "./premiumPricing.js";

function readJsonStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write errors in private mode or constrained browsers.
  }
}

function cleanupCheckoutQuery() {
  const url = new URL(window.location.href);
  url.searchParams.delete("checkout");
  url.searchParams.delete("checkoutToken");
  url.searchParams.delete("free");
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, document.title, nextUrl);
}

export function usePremiumAccess() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedAccess = readJsonStorage(PREMIUM_ACCESS_STORAGE_KEY, {
      unlocked: false,
    });
    if (storedAccess.unlocked) {
      setIsUnlocked(true);
    }

    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    const checkoutToken = params.get("checkoutToken");
    const freeUnlock = params.get("free") === "1";

    if (!checkoutStatus || !checkoutToken) {
      return;
    }

    if (checkoutStatus === "cancel") {
      setStatus("cancelled");
      setMessage({
        tone: "warning",
        title: "Betaling niet afgerond",
        body: "Uw uitgebreide rapport is nog niet vrijgeschakeld. U kunt later opnieuw verdergaan.",
      });
      cleanupCheckoutQuery();
      return;
    }

    if (freeUnlock) {
      writeJsonStorage(PREMIUM_ACCESS_STORAGE_KEY, {
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        source: "promo",
      });
      setIsUnlocked(true);
      setStatus("unlocked");
      setMessage({
        tone: "success",
        title: "Uitgebreid rapport vrijgeschakeld",
        body: "De kortingscode is verwerkt. Het uitgebreide rapport staat nu voor u open op dit apparaat.",
      });
      cleanupCheckoutQuery();
      return;
    }

    const pendingCheckouts = readJsonStorage(PREMIUM_PENDING_STORAGE_KEY, {});
    const pendingCheckout = pendingCheckouts[checkoutToken];

    if (!pendingCheckout?.paymentId) {
      setStatus("error");
      setMessage({
        tone: "warning",
        title: "Controleer de betaling",
        body: "We konden de terugkeer van de checkout niet volledig koppelen. Start de betaling opnieuw vanaf de berekening.",
      });
      cleanupCheckoutQuery();
      return;
    }

    const controller = new AbortController();

    async function verifyPayment() {
      setStatus("verifying");

      try {
        const response = await fetch(
          `/api/payment-status?paymentId=${encodeURIComponent(
            pendingCheckout.paymentId,
          )}&checkoutToken=${encodeURIComponent(checkoutToken)}`,
          {
            signal: controller.signal,
          },
        );
        const payload = await response.json();

        if (!response.ok || !payload.paid) {
          throw new Error(payload.error || "De betaling is nog niet bevestigd.");
        }

        writeJsonStorage(PREMIUM_ACCESS_STORAGE_KEY, {
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          paymentId: pendingCheckout.paymentId,
          source: "payment",
        });
        setIsUnlocked(true);
        setStatus("unlocked");
        setMessage({
          tone: "success",
          title: "Betaling bevestigd",
          body: "Uw uitgebreide rapport is vrijgeschakeld op dit apparaat.",
        });

        delete pendingCheckouts[checkoutToken];
        writeJsonStorage(PREMIUM_PENDING_STORAGE_KEY, pendingCheckouts);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setStatus("error");
        setMessage({
          tone: "warning",
          title: "Betaling nog niet bevestigd",
          body:
            error.message ||
            "We konden de betaling nog niet bevestigen. Probeer het over enkele ogenblikken opnieuw.",
        });
      } finally {
        cleanupCheckoutQuery();
      }
    }

    verifyPayment();

    return () => controller.abort();
  }, []);

  function rememberPendingCheckout(checkoutToken, paymentId) {
    if (typeof window === "undefined") {
      return;
    }

    const pendingCheckouts = readJsonStorage(PREMIUM_PENDING_STORAGE_KEY, {});
    pendingCheckouts[checkoutToken] = {
      paymentId,
      createdAt: new Date().toISOString(),
    };
    writeJsonStorage(PREMIUM_PENDING_STORAGE_KEY, pendingCheckouts);
  }

  function unlockForCurrentBrowser(source = "manual") {
    if (typeof window === "undefined") {
      return;
    }

    writeJsonStorage(PREMIUM_ACCESS_STORAGE_KEY, {
      unlocked: true,
      unlockedAt: new Date().toISOString(),
      source,
    });
    setIsUnlocked(true);
    setStatus("unlocked");
  }

  return {
    isUnlocked,
    status,
    message,
    rememberPendingCheckout,
    unlockForCurrentBrowser,
  };
}
