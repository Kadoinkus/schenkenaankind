import assert from "node:assert/strict";
import {
  calculateTransferScenarios,
  mortgageTypes,
} from "../src/domain/calculateTransferScenarios.js";
import { taxRules2026 } from "../src/domain/taxRules2026.js";
import { evaluatePromoCode } from "../src/features/premium/premiumPricing.js";
import { derivePremiumOffer } from "../src/features/premium/premiumOffer.js";

function run(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("partner detail is based on projected review equity", () => {
  const result = calculateTransferScenarios({
    homeValue: 500000,
    mortgageBalance: 100000,
    mortgageInterestRate: 3.5,
    monthlyMortgageCost: 900,
    mortgageType: mortgageTypes.interestOnly,
    childrenCount: 2,
    yearsToReview: 10,
    hasPartner: true,
    childShares: [50, 50],
    annualGrowthRate: 3,
    mortgageInterestReliefRate: 36.93,
    partnerSharePercent: 0,
  });

  const expectedPartnerShare = result.overview.reviewEquity / 3;
  assert.equal(result.overview.partnerDetailAtReview.grossShare, expectedPartnerShare);
  assert.ok(result.overview.reviewEquity > result.overview.currentEquity);
});

run("annuity mortgage lowers the projected mortgage balance", () => {
  const interestOnly = calculateTransferScenarios({
    homeValue: 450000,
    mortgageBalance: 220000,
    mortgageInterestRate: 4,
    monthlyMortgageCost: 1200,
    mortgageType: mortgageTypes.interestOnly,
    childrenCount: 1,
    yearsToReview: 8,
    hasPartner: false,
    childShares: [100],
    annualGrowthRate: 2,
    mortgageInterestReliefRate: 36.93,
    partnerSharePercent: 0,
  });

  const annuity = calculateTransferScenarios({
    homeValue: 450000,
    mortgageBalance: 220000,
    mortgageInterestRate: 4,
    monthlyMortgageCost: 1200,
    mortgageType: mortgageTypes.annuity,
    childrenCount: 1,
    yearsToReview: 8,
    hasPartner: false,
    childShares: [100],
    annualGrowthRate: 2,
    mortgageInterestReliefRate: 36.93,
    partnerSharePercent: 0,
  });

  assert.ok(
    annuity.overview.projectedMortgageBalance < interestOnly.overview.projectedMortgageBalance,
  );
});

run("1 grote overdracht schuift eerder woningwaarde naar kinderen dan jaarlijkse overdracht", () => {
  const result = calculateTransferScenarios({
    homeValue: 700000,
    mortgageBalance: 175000,
    mortgageInterestRate: 3.5,
    monthlyMortgageCost: 900,
    mortgageType: mortgageTypes.interestOnly,
    childrenCount: 2,
    yearsToReview: 10,
    hasPartner: false,
    childShares: [50, 50],
    annualGrowthRate: 3,
    mortgageInterestReliefRate: 36.93,
    partnerSharePercent: 0,
    targetTransferMode: "custom",
    targetTransferValue: 50000,
  });

  assert.ok(
    result.scenarios.oneTimeTransfer.giftedValueAtReview >
      result.scenarios.annualTransfer.giftedValueAtReview,
  );
});

run("jaarlijks schenken telt meer aktekosten op dan 1 overdracht nu", () => {
  const result = calculateTransferScenarios({
    homeValue: 700000,
    mortgageBalance: 175000,
    mortgageInterestRate: 3.5,
    monthlyMortgageCost: 900,
    mortgageType: mortgageTypes.interestOnly,
    childrenCount: 2,
    yearsToReview: 10,
    hasPartner: false,
    childShares: [50, 50],
    annualGrowthRate: 3,
    mortgageInterestReliefRate: 36.93,
    partnerSharePercent: 0,
    targetTransferMode: "custom",
    targetTransferValue: 50000,
  });

  assert.ok(
    result.scenarios.annualTransfer.directCosts >
      result.scenarios.oneTimeTransfer.directCosts,
  );
});

run("doelbedrag voor schenking wordt expliciet begrensd in de jaarlijkse route", () => {
  const result = calculateTransferScenarios({
    homeValue: 700000,
    mortgageBalance: 175000,
    mortgageInterestRate: 3.5,
    monthlyMortgageCost: 900,
    mortgageType: mortgageTypes.interestOnly,
    childrenCount: 2,
    yearsToReview: 10,
    hasPartner: false,
    childShares: [50, 50],
    annualGrowthRate: 3,
    mortgageInterestReliefRate: 36.93,
    partnerSharePercent: 0,
    targetTransferMode: "custom",
    targetTransferValue: 300000,
  });

  assert.equal(result.overview.plannedTransferValueTotal, 300000);
  assert.ok(result.overview.annualTransferCapacity < result.overview.plannedTransferValueTotal);
  assert.ok(result.overview.annualTransferShortfall > 0);
});

run("eenmalige schenking gebeurt pas in het gekozen jaar", () => {
  const result = calculateTransferScenarios({
    homeValue: 700000,
    mortgageBalance: 175000,
    mortgageInterestRate: 3.5,
    monthlyMortgageCost: 900,
    mortgageType: mortgageTypes.interestOnly,
    childrenCount: 2,
    yearsToReview: 10,
    hasPartner: false,
    childShares: [50, 50],
    annualGrowthRate: 3,
    mortgageInterestReliefRate: 36.93,
    partnerSharePercent: 0,
    oneTimeTransferYear: taxRules2026.year + 3,
    targetTransferValue: 50000,
  });

  assert.equal(result.scenarios.oneTimeTransfer.timeline[2].giftedValueAtYear, 0);
  assert.ok(result.scenarios.oneTimeTransfer.timeline[3].giftedValueAtYear > 0);
});

run("altijd werkende kortingscode kan het premium rapport gratis maken", () => {
  const result = evaluatePromoCode("huis2026");

  assert.equal(result.valid, true);
  assert.equal(result.finalPriceMinor, 0);
  assert.ok(result.discountMinor > 0);
});

run("premium offer berekent besparing ten opzichte van niets doen", () => {
  const model = calculateTransferScenarios({
    homeValue: 700000,
    mortgageBalance: 175000,
    mortgageInterestRate: 3.5,
    monthlyMortgageCost: 900,
    mortgageType: mortgageTypes.interestOnly,
    childrenCount: 2,
    yearsToReview: 10,
    hasPartner: false,
    childShares: [50, 50],
    annualGrowthRate: 3,
    mortgageInterestReliefRate: 36.93,
    partnerSharePercent: 0,
    targetTransferMode: "custom",
    targetTransferValue: 50000,
  });

  const offer = derivePremiumOffer(model);

  assert.equal(offer.baselineScenarioId, "doNothing");
  assert.ok(offer.estimatedSaving >= 0);
  assert.equal(offer.summaryBullets.length, 3);
});
