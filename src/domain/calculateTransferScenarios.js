import { clamp } from "../lib/formatters.js";
import { calculateInheritanceTax, taxRules2026 } from "./taxRules2026.js";

export const mortgageTypes = {
  interestOnly: "interest-only",
  annuity: "annuity",
};

export function normalizeShares(childrenCount, shares = []) {
  const safeCount = Math.max(1, childrenCount);
  const baseShares =
    shares.length === safeCount
      ? [...shares]
      : Array.from({ length: safeCount }, (_, index) =>
          index < shares.length ? shares[index] : Math.round(100 / safeCount),
        );

  const total = baseShares.reduce((sum, value) => sum + value, 0);
  if (total !== 100) {
    baseShares[baseShares.length - 1] += 100 - total;
  }

  return baseShares;
}

function rebalanceBox3(totalAllocated, shares, rules) {
  return shares.reduce((sum, sharePercent) => {
    const assetValue = (totalAllocated * sharePercent) / 100;
    const taxableBase = Math.max(0, assetValue - rules.box3ExemptionPerPerson);
    return sum + taxableBase * rules.box3DeemedReturnOtherAssets * rules.box3TaxRate;
  }, 0);
}

function calculateFutureMortgageBalance({
  mortgageBalance,
  annualPrincipalRepayment,
  mortgageType,
  year,
}) {
  if (mortgageType === mortgageTypes.interestOnly) {
    return mortgageBalance;
  }

  return Math.max(0, mortgageBalance - annualPrincipalRepayment * year);
}

function calculatePartnerDetail({
  equityAtReview,
  partnerSharePercent,
  rules,
}) {
  const grossShare = (equityAtReview * partnerSharePercent) / 100;
  const taxableShare = Math.max(0, grossShare - rules.partnerInheritanceExemption);
  const tax = calculateInheritanceTax(taxableShare, rules);

  return {
    sharePercent: partnerSharePercent,
    grossShare,
    taxableShare,
    tax,
    netShare: grossShare - tax,
  };
}

function calculateChildrenBreakdown({
  scenarioId,
  childShares,
  equityAtReview,
  childrenPoolAtReview,
  giftReductionTotal,
  directCostTotal,
  rules,
}) {
  return childShares.map((sharePercent, index) => {
    const grossShareAtReview = (childrenPoolAtReview * sharePercent) / 100;
    const giftedNominal = (giftReductionTotal * sharePercent) / 100;
    const remainingTaxableBase = Math.max(0, grossShareAtReview - giftedNominal);
    const inheritanceTax = calculateInheritanceTax(
      Math.max(0, remainingTaxableBase - rules.childInheritanceExemption),
      rules,
    );
    const directCostShare = (directCostTotal * sharePercent) / 100;
    const totalTaxAndCosts = inheritanceTax + directCostShare;

    return {
      id: `${scenarioId}-child-${index + 1}`,
      label: `Kind ${index + 1}`,
      sharePercent,
      grossShareAtReview,
      giftedNominal,
      remainingTaxableBase,
      inheritanceTax,
      directCostShare,
      totalTaxAndCosts,
      projectedNetOutcome: grossShareAtReview - totalTaxAndCosts,
      projectedFamilyShare: (equityAtReview * sharePercent) / 100,
    };
  });
}

export function calculateTransferScenarios(input, rules = taxRules2026) {
  const childrenCount = clamp(Math.round(input.childrenCount || 2), 1, 8);
  const childShares = normalizeShares(childrenCount, input.childShares);
  const yearsToReview = clamp(Math.round(input.yearsToReview || 10), 1, 40);
  const homeValue = Math.max(0, input.homeValue || 0);
  const mortgageBalance = Math.max(0, input.mortgageBalance || 0);
  const mortgageInterestRate = clamp(input.mortgageInterestRate || 0, 0, 25);
  const monthlyMortgageCost = Math.max(0, input.monthlyMortgageCost || 0);
  const annualGrowthRate = clamp(input.annualGrowthRate || 0, -10, 15);
  const mortgageInterestReliefRate = clamp(
    input.mortgageInterestReliefRate ?? rules.defaultMortgageReliefRate,
    0,
    100,
  );
  const hasPartner = Boolean(input.hasPartner);
  const mortgageType =
    input.mortgageType === mortgageTypes.annuity
      ? mortgageTypes.annuity
      : mortgageTypes.interestOnly;

  const normalizedPartnerSharePercent = hasPartner
    ? input.partnerSharePercent === 0
      ? 100 / (childrenCount + 1)
      : clamp(input.partnerSharePercent || 0, 0, 100)
    : 0;

  const childrenSharePercent = 100 - normalizedPartnerSharePercent;
  const monthlyMortgageInterest = mortgageBalance * (mortgageInterestRate / 100) / 12;
  const monthlyPrincipalRepayment =
    mortgageType === mortgageTypes.interestOnly
      ? 0
      : Math.max(0, monthlyMortgageCost - monthlyMortgageInterest);
  const annualPrincipalRepayment = monthlyPrincipalRepayment * 12;
  const currentEquity = Math.max(0, homeValue - mortgageBalance);
  const currentImputedRental = homeValue * rules.imputedRentalRate;
  const currentAnnualMortgageRelief =
    Math.max(0, monthlyMortgageInterest * 12 - currentImputedRental) *
    (mortgageInterestReliefRate / 100);

  const timeline = {
    doNothing: [],
    stak: [],
    paperGift: [],
  };

  let cumulativeGiftedStak = 0;
  let cumulativeGiftedPaper = 0;
  let cumulativeDebtPaper = 0;
  let cumulativePaperInterest = 0;
  let cumulativeStakBox3 = 0;
  let cumulativePaperBox3 = 0;
  let cumulativeMortgageReliefDoNothing = 0;
  let cumulativeMortgageReliefPaper = 0;

  const directCostStak =
    homeValue * rules.transferTaxRate + rules.notaryEstimateStak;
  const directCostPaper = rules.notaryEstimatePaperGift;
  const firstYearPaperGiftBonus = rules.oneOffChildGiftExemption * childrenCount;

  for (let year = 1; year <= yearsToReview; year += 1) {
    const futureMortgageBalance = calculateFutureMortgageBalance({
      mortgageBalance,
      annualPrincipalRepayment,
      mortgageType,
      year,
    });
    const futureHomeValue = homeValue * Math.pow(1 + annualGrowthRate / 100, year);
    const futureEquity = Math.max(0, futureHomeValue - futureMortgageBalance);
    const annualMortgageInterest =
      futureMortgageBalance * (mortgageInterestRate / 100);
    const imputedRental = futureHomeValue * rules.imputedRentalRate;
    const annualMortgageRelief =
      Math.max(0, annualMortgageInterest - imputedRental) *
      (mortgageInterestReliefRate / 100);

    const partnerDetailForYear = hasPartner
      ? calculatePartnerDetail({
          equityAtReview: futureEquity,
          partnerSharePercent: normalizedPartnerSharePercent,
          rules,
        })
      : null;

    const childrenPoolAtReview = hasPartner
      ? (futureEquity * childrenSharePercent) / 100
      : futureEquity;

    const doNothingInheritanceTax = childShares.reduce((sum, sharePercent) => {
      const grossShare = (childrenPoolAtReview * sharePercent) / 100;
      const taxableShare = Math.max(0, grossShare - rules.childInheritanceExemption);
      return sum + calculateInheritanceTax(taxableShare, rules);
    }, partnerDetailForYear?.tax || 0);

    cumulativeMortgageReliefDoNothing += annualMortgageRelief;
    timeline.doNothing.push({
      year,
      futureHomeValue,
      futureMortgageBalance,
      futureEquity,
      annualMortgageRelief,
      inheritanceTaxAtDeath: doNothingInheritanceTax,
      childBox3PerYear: 0,
    });

    cumulativeGiftedStak += rules.annualChildGiftExemption * childrenCount;
    const stakRemainingBase = Math.max(0, childrenPoolAtReview - cumulativeGiftedStak);
    const stakInheritanceTax = childShares.reduce((sum, sharePercent) => {
      const grossShare = (stakRemainingBase * sharePercent) / 100;
      const taxableShare = Math.max(0, grossShare - rules.childInheritanceExemption);
      return sum + calculateInheritanceTax(taxableShare, rules);
    }, partnerDetailForYear?.tax || 0);

    const stakBox3PerYear = rebalanceBox3(cumulativeGiftedStak, childShares, rules);
    cumulativeStakBox3 += stakBox3PerYear;
    timeline.stak.push({
      year,
      futureHomeValue,
      futureMortgageBalance,
      annualMortgageReliefLoss: annualMortgageRelief,
      giftedNominal: cumulativeGiftedStak,
      box3PerYear: stakBox3PerYear,
      cumulativeBox3: cumulativeStakBox3,
      directBurdenAtDeath: stakInheritanceTax + directCostStak,
    });

    const paperGiftThisYear =
      rules.annualChildGiftExemption * childrenCount +
      (year === 1 ? firstYearPaperGiftBonus : 0);
    cumulativeDebtPaper += paperGiftThisYear;
    cumulativeGiftedPaper += paperGiftThisYear;
    const annualPaperInterest =
      cumulativeDebtPaper * rules.promissoryGiftInterestRate;
    cumulativePaperInterest += annualPaperInterest;

    const paperRemainingBase = Math.max(0, childrenPoolAtReview - cumulativeGiftedPaper);
    const paperInheritanceTax = childShares.reduce((sum, sharePercent) => {
      const grossShare = (paperRemainingBase * sharePercent) / 100;
      const taxableShare = Math.max(0, grossShare - rules.childInheritanceExemption);
      return sum + calculateInheritanceTax(taxableShare, rules);
    }, (partnerDetailForYear?.tax || 0) + directCostPaper);

    const paperBox3PerYear = rebalanceBox3(cumulativeGiftedPaper, childShares, rules);
    cumulativePaperBox3 += paperBox3PerYear;
    cumulativeMortgageReliefPaper += annualMortgageRelief;
    timeline.paperGift.push({
      year,
      futureHomeValue,
      futureMortgageBalance,
      giftedNominal: cumulativeGiftedPaper,
      annualInterest: annualPaperInterest,
      monthlyInterest: annualPaperInterest / 12,
      box3PerYear: paperBox3PerYear,
      annualMortgageRelief,
      directBurdenAtDeath: paperInheritanceTax,
      savingVsDoNothing: doNothingInheritanceTax - paperInheritanceTax,
    });
  }

  const finalDoNothing = timeline.doNothing.at(-1);
  const finalStak = timeline.stak.at(-1);
  const finalPaper = timeline.paperGift.at(-1);
  const reviewEquity = finalDoNothing?.futureEquity || currentEquity;

  const partnerDetailAtReview = hasPartner
    ? calculatePartnerDetail({
        equityAtReview: reviewEquity,
        partnerSharePercent: normalizedPartnerSharePercent,
        rules,
      })
    : null;

  const childrenPoolAtReview = hasPartner
    ? (reviewEquity * childrenSharePercent) / 100
    : reviewEquity;

  const scenarios = {
    doNothing: {
      id: "doNothing",
      directBurden: finalDoNothing?.inheritanceTaxAtDeath || 0,
      directCosts: 0,
      inheritanceTaxOnly: finalDoNothing?.inheritanceTaxAtDeath || 0,
      extraCashFlows: {
        cumulativeMortgageRelief: cumulativeMortgageReliefDoNothing,
        cumulativeBox3: 0,
        cumulativeInterest: 0,
      },
      children: calculateChildrenBreakdown({
        scenarioId: "doNothing",
        childShares,
        equityAtReview: reviewEquity,
        childrenPoolAtReview,
        giftReductionTotal: 0,
        directCostTotal: 0,
        rules,
      }),
      timeline: timeline.doNothing,
    },
    stak: {
      id: "stak",
      directBurden: finalStak?.directBurdenAtDeath || 0,
      directCosts: directCostStak,
      inheritanceTaxOnly: Math.max(0, (finalStak?.directBurdenAtDeath || 0) - directCostStak),
      extraCashFlows: {
        cumulativeMortgageReliefLoss: cumulativeMortgageReliefDoNothing,
        cumulativeBox3: cumulativeStakBox3,
        cumulativeInterest: 0,
      },
      children: calculateChildrenBreakdown({
        scenarioId: "stak",
        childShares,
        equityAtReview: reviewEquity,
        childrenPoolAtReview,
        giftReductionTotal: cumulativeGiftedStak,
        directCostTotal: directCostStak,
        rules,
      }),
      timeline: timeline.stak,
      giftedNominal: cumulativeGiftedStak,
    },
    paperGift: {
      id: "paperGift",
      directBurden: finalPaper?.directBurdenAtDeath || 0,
      directCosts: directCostPaper,
      inheritanceTaxOnly: Math.max(0, (finalPaper?.directBurdenAtDeath || 0) - directCostPaper),
      extraCashFlows: {
        cumulativeMortgageRelief: cumulativeMortgageReliefPaper,
        cumulativeBox3: cumulativePaperBox3,
        cumulativeInterest: cumulativePaperInterest,
      },
      children: calculateChildrenBreakdown({
        scenarioId: "paperGift",
        childShares,
        equityAtReview: reviewEquity,
        childrenPoolAtReview,
        giftReductionTotal: cumulativeGiftedPaper,
        directCostTotal: directCostPaper,
        rules,
      }),
      timeline: timeline.paperGift,
      giftedNominal: cumulativeGiftedPaper,
    },
  };

  const comparisonMax = Math.max(
    scenarios.doNothing.directBurden,
    scenarios.stak.directBurden,
    scenarios.paperGift.directBurden,
    1,
  );

  return {
    inputs: {
      childrenCount,
      childShares,
      yearsToReview,
      homeValue,
      mortgageBalance,
      mortgageInterestRate,
      monthlyMortgageCost,
      annualGrowthRate,
      mortgageInterestReliefRate,
      hasPartner,
      partnerSharePercent: normalizedPartnerSharePercent,
      childrenSharePercent,
      mortgageType,
    },
    overview: {
      currentEquity,
      reviewEquity,
      projectedHomeValue: finalDoNothing?.futureHomeValue || homeValue,
      projectedMortgageBalance: finalDoNothing?.futureMortgageBalance || mortgageBalance,
      annualMortgageRelief: currentAnnualMortgageRelief,
      monthlyMortgageInterest,
      annualPrincipalRepayment,
      comparisonMax,
      partnerDetailAtReview,
      childrenPoolAtReview,
    },
    scenarios,
  };
}
