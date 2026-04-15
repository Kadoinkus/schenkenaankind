import { useMemo, useState } from "react";
import {
  calculateTransferScenarios,
  mortgageTypes,
  normalizeShares,
} from "../../domain/calculateTransferScenarios.js";
import { clamp, coerceNumber } from "../../lib/formatters.js";
import { taxRules2026 } from "../../domain/taxRules2026.js";
import { defaultTransferInput } from "./defaultInput.js";

function redistributeShares(currentShares, targetIndex, nextValue, childrenCount) {
  if (childrenCount === 1) {
    return [100];
  }

  const shares = [...normalizeShares(childrenCount, currentShares)];
  const clampedValue = clamp(nextValue, 0, 100);
  shares[targetIndex] = clampedValue;

  const othersTotal = shares.reduce(
    (sum, share, index) => (index === targetIndex ? sum : sum + share),
    0,
  );
  const remainder = 100 - clampedValue;

  shares.forEach((share, index) => {
    if (index === targetIndex) {
      return;
    }

    shares[index] =
      othersTotal > 0
        ? Math.round((share / othersTotal) * remainder)
        : Math.round(remainder / (childrenCount - 1));
  });

  const normalizedTotal = shares.reduce((sum, share) => sum + share, 0);
  if (normalizedTotal !== 100) {
    shares[shares.length - 1] += 100 - normalizedTotal;
  }

  return shares;
}

export function useTransferCalculator() {
  const [state, setState] = useState(defaultTransferInput);

  const model = useMemo(() => calculateTransferScenarios(state), [state]);

  const actions = {
    setNumericField(key, rawValue, { min = 0, max = Infinity } = {}) {
      const parsedValue = clamp(coerceNumber(rawValue, 0), min, max);
      setState((current) => {
        const nextState = {
          ...current,
          [key]: parsedValue,
        };

        if (key === "yearsToReview") {
          const maxCalendarYear = taxRules2026.year + parsedValue - 1;
          nextState.oneTimeTransferYear = clamp(
            current.oneTimeTransferYear,
            taxRules2026.year,
            maxCalendarYear,
          );
        }

        return nextState;
      });
    },
    setSelectedScenario(selectedScenarioId) {
      setState((current) => ({
        ...current,
        selectedScenarioId,
      }));
    },
    setEnumField(key, nextValue) {
      setState((current) => ({
        ...current,
        [key]: nextValue,
      }));
    },
    setBooleanField(key, nextValue) {
      setState((current) => ({
        ...current,
        [key]: Boolean(nextValue),
      }));
    },
    setMortgageType(mortgageType) {
      setState((current) => ({
        ...current,
        mortgageType,
      }));
    },
    setHasPartner(hasPartner) {
      setState((current) => ({
        ...current,
        hasPartner,
        partnerSharePercent: hasPartner ? current.partnerSharePercent : 0,
      }));
    },
    setPartnerMode(mode) {
      setState((current) => ({
        ...current,
        partnerSharePercent: mode === "auto" ? 0 : current.partnerSharePercent || 50,
      }));
    },
    setChildrenCount(rawValue) {
      const digitsOnly = String(rawValue ?? "").replace(/\D/g, "");
      // On mobile, typing over an existing single-digit value often appends
      // instead of replacing (for example 2 -> 23). Keep only the last digit
      // here so the field behaves like a simple 1-8 picker.
      const normalizedValue =
        digitsOnly.length > 1 ? digitsOnly.at(-1) : digitsOnly || "1";
      const childrenCount = clamp(Math.round(coerceNumber(normalizedValue, 1)), 1, 8);
      setState((current) => ({
        ...current,
        childrenCount,
        childShares: Array.from(
          { length: childrenCount },
          () => Math.round(100 / childrenCount),
        ),
        childLivesInHome: Array.from(
          { length: childrenCount },
          (_, i) => (current.childLivesInHome || [])[i] || false,
        ),
        childPriorGifts: Array.from(
          { length: childrenCount },
          (_, i) => (current.childPriorGifts || [])[i] || null,
        ),
      }));
    },
    setHasMortgage(hasMortgage) {
      setState((current) => ({
        ...current,
        hasMortgage,
        ...(hasMortgage
          ? {}
          : {
              mortgageBalance: 0,
              mortgageInterestRate: 0,
              monthlyMortgageCost: 0,
            }),
      }));
    },
    setChildLivesInHome(index, value) {
      setState((current) => {
        const next = [...(current.childLivesInHome || [])];
        next[index] = Boolean(value);
        return { ...current, childLivesInHome: next };
      });
    },
    setChildPriorGift(index, gift) {
      setState((current) => {
        const next = [...(current.childPriorGifts || [])];
        next[index] = gift; // { amount, year, usedOneOff } or null
        return { ...current, childPriorGifts: next };
      });
    },
    setChildShare(index, rawValue) {
      const nextValue = clamp(coerceNumber(rawValue, 0), 0, 100);
      setState((current) => ({
        ...current,
        childShares: redistributeShares(
          current.childShares,
          index,
          nextValue,
          current.childrenCount,
        ),
      }));
    },
    reset() {
      setState(defaultTransferInput);
    },
  };

  return {
    state,
    model,
    actions,
    mortgageTypes,
  };
}
