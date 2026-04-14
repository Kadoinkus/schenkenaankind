import assert from "node:assert/strict";
import {
  calculateTransferScenarios,
  mortgageTypes,
} from "../src/domain/calculateTransferScenarios.js";

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
    mortgageInterestReliefRate: 37.56,
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
    mortgageInterestReliefRate: 37.56,
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
    mortgageInterestReliefRate: 37.56,
    partnerSharePercent: 0,
  });

  assert.ok(
    annuity.overview.projectedMortgageBalance < interestOnly.overview.projectedMortgageBalance,
  );
});

run("paper gift lowers direct burden versus doing nothing in the default scenario", () => {
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
    mortgageInterestReliefRate: 37.56,
    partnerSharePercent: 0,
  });

  assert.ok(
    result.scenarios.paperGift.directBurden < result.scenarios.doNothing.directBurden,
  );
});
