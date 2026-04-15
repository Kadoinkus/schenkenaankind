import { taxRules2026 } from "../../domain/taxRules2026.js";
import { mortgageTypes } from "../../domain/calculateTransferScenarios.js";

export const defaultTransferInput = {
  homeValue: 700000,
  hasMortgage: true,
  mortgageBalance: 175000,
  mortgageInterestRate: 3.5,
  monthlyMortgageCost: 900,
  mortgageType: mortgageTypes.interestOnly,
  childrenCount: 2,
  yearsToReview: 10,
  hasPartner: false,
  childShares: [50, 50],
  childLivesInHome: [false, false],
  childPriorGifts: [null, null], // { amount, year, usedOneOff } or null
  annualGrowthRate: 3,
  mortgageInterestReliefRate: taxRules2026.defaultMortgageReliefRate, // 36.93%
  annualGiftExemptionPerChild: taxRules2026.annualChildGiftExemption,
  oneOffGiftExemptionPerChild: taxRules2026.oneOffChildGiftExemption,
  useOneOffGiftExemption: true,
  targetTransferMode: "maxTaxFree",
  targetTransferValue: taxRules2026.oneOffChildGiftExemption * 2,
  oneTimeTransferYear: taxRules2026.year,
  transferTaxRate: taxRules2026.transferTaxRate * 100,
  notaryCostPerTransfer: taxRules2026.notaryEstimatePropertyTransfer,
  partnerSharePercent: 0,
  selectedScenarioId: "annualTransfer",
};
