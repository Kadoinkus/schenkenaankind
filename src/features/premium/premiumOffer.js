import { scenarioMetaById } from "../calculator/scenarioMeta.js";
import { PREMIUM_REPORT_PRICE_MINOR } from "./premiumPricing.js";

export function derivePremiumOffer(model) {
  const baselineScenario = model.scenarios.doNothing;
  const paidScenarioIds = ["oneTimeTransfer", "annualTransfer"];
  const bestPaidScenarioId = paidScenarioIds.sort(
    (left, right) => model.scenarios[left].directBurden - model.scenarios[right].directBurden,
  )[0];
  const bestPaidScenario = model.scenarios[bestPaidScenarioId];
  const bestOverallScenarioId = Object.values(model.scenarios).sort(
    (left, right) => left.directBurden - right.directBurden,
  )[0].id;
  const estimatedSaving = Math.max(
    0,
    baselineScenario.directBurden - bestPaidScenario.directBurden,
  );

  return {
    basePriceMinor: PREMIUM_REPORT_PRICE_MINOR,
    baselineScenarioId: "doNothing",
    baselineScenarioTitle: scenarioMetaById.doNothing.title,
    bestPaidScenarioId,
    bestPaidScenarioTitle: scenarioMetaById[bestPaidScenarioId].title,
    bestOverallScenarioId,
    bestOverallScenarioTitle: scenarioMetaById[bestOverallScenarioId].title,
    estimatedSaving,
    hasEstimatedSaving: estimatedSaving > 0,
    plannedTransferValueTotal: model.overview.plannedTransferValueTotal,
    annualTransferCapacity: model.overview.annualTransferCapacity,
    annualTransferShortfall: model.overview.annualTransferShortfall,
    summaryBullets: [
      "volledige kostenopbouw per route",
      "uitgebreide tijdlijn met uitleg per bedrag",
      "downloadbaar rapport voor gesprek met notaris of adviseur",
    ],
  };
}
