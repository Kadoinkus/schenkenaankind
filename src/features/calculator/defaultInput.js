import { taxRules2026 } from "../../domain/taxRules2026.js";
import { mortgageTypes } from "../../domain/calculateTransferScenarios.js";

export const defaultTransferInput = {
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
  mortgageInterestReliefRate: taxRules2026.defaultMortgageReliefRate,
  partnerSharePercent: 0,
  selectedScenarioId: "paperGift",
};
