import { clamp } from "../lib/formatters.js";
import {
  calculateGiftTax,
  calculateInheritanceTax,
  taxRules2026,
} from "./taxRules2026.js";

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

function rebalanceBox3(totalAllocated, shares, childLivesInHome, rules) {
  return shares.reduce((sum, sharePercent, index) => {
    // A child living in the home has the share as "eigen woning" (box 1), not box 3.
    if (childLivesInHome[index]) return sum;
    const assetValue = (totalAllocated * sharePercent) / 100;
    const taxableBase = Math.max(0, assetValue - rules.box3ExemptionPerPerson);
    return sum + taxableBase * rules.box3DeemedReturnOtherAssets * rules.box3TaxRate;
  }, 0);
}

function calculateFutureMortgageBalance({
  mortgageBalance,
  monthlyMortgageCost,
  monthlyInterestRate,
  mortgageType,
  months,
}) {
  if (mortgageType === mortgageTypes.interestOnly) {
    return mortgageBalance;
  }

  // Simulate month-by-month annuity amortization so that the increasing
  // principal repayment is properly reflected.
  let balance = mortgageBalance;
  for (let m = 0; m < months; m += 1) {
    const interest = balance * monthlyInterestRate;
    const principal = Math.max(0, monthlyMortgageCost - interest);
    balance = Math.max(0, balance - principal);
  }
  return balance;
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

function calculateFamilyInheritanceAtYear({
  estateEquity,
  hasPartner,
  normalizedPartnerSharePercent,
  childShares,
  rules,
}) {
  const partnerDetailForYear = hasPartner
    ? calculatePartnerDetail({
        equityAtReview: estateEquity,
        partnerSharePercent: normalizedPartnerSharePercent,
        rules,
      })
    : null;

  const childrenPoolAtReview = hasPartner
    ? (estateEquity * (100 - normalizedPartnerSharePercent)) / 100
    : estateEquity;

  const childrenInheritanceTax = childShares.reduce((sum, sharePercent) => {
    const grossShare = (childrenPoolAtReview * sharePercent) / 100;
    const taxableShare = Math.max(0, grossShare - rules.childInheritanceExemption);
    return sum + calculateInheritanceTax(taxableShare, rules);
  }, 0);

  return {
    partnerDetailForYear,
    childrenPoolAtReview,
    inheritanceTax: childrenInheritanceTax + (partnerDetailForYear?.tax || 0),
  };
}

function calculateTransferTaxes({
  transferValue,
  availableExemption,
  transferTaxRate,
  childShares,
  childLivesInHome,
  residentTransferTaxRate,
  rules,
}) {
  const giftTax = calculateGiftTax(
    Math.max(0, transferValue - availableExemption),
    rules,
  );
  // Transfer tax is calculated per child: residents pay the lower eigen-woning rate (2%).
  const transferTax = childShares.reduce((sum, sharePercent, index) => {
    const childValue = (transferValue * sharePercent) / 100;
    const rate = childLivesInHome[index] ? residentTransferTaxRate : transferTaxRate;
    return sum + childValue * (rate / 100);
  }, 0);

  return {
    giftTax,
    transferTax,
    effectiveTax: Math.max(giftTax, transferTax),
  };
}

function calculateChildrenBreakdown({
  scenarioId,
  childShares,
  childLivesInHome,
  giftedValueAtReview,
  giftedValueNominal,
  childrenPoolAtReview,
  notaryCostTotal,
  transferTaxRate,
  residentTransferTaxRate,
  cumulativeBox3,
  rules,
}) {
  return childShares.map((sharePercent, index) => {
    const livesInHome = childLivesInHome[index];
    const giftedShareAtReview = (giftedValueAtReview * sharePercent) / 100;
    const inheritedGrossAtReview = (childrenPoolAtReview * sharePercent) / 100;
    const remainingTaxableBase = Math.max(0, inheritedGrossAtReview);
    const inheritanceTax = calculateInheritanceTax(
      Math.max(0, remainingTaxableBase - rules.childInheritanceExemption),
      rules,
    );

    // Per-child transfer tax based on their own rate (resident vs non-resident).
    const childGiftedNominal = (giftedValueNominal * sharePercent) / 100;
    const childRate = livesInHome ? residentTransferTaxRate : transferTaxRate;
    const childTransferTax = childGiftedNominal * (childRate / 100);
    const childNotaryCost = (notaryCostTotal * sharePercent) / 100;
    // Per-child box 3: residents have the share in box 1, not box 3.
    const childBox3 = livesInHome ? 0 : (cumulativeBox3 * sharePercent) / 100;
    const directCostShare = childTransferTax + childNotaryCost;

    const totalGrossAtReview = giftedShareAtReview + inheritedGrossAtReview;

    return {
      id: `${scenarioId}-child-${index + 1}`,
      label: `Kind ${index + 1}`,
      sharePercent,
      livesInHome,
      grossShareAtReview: totalGrossAtReview,
      giftedValueAtReview: giftedShareAtReview,
      inheritedGrossAtReview,
      giftedNominal: childGiftedNominal,
      remainingTaxableBase,
      inheritanceTax,
      transferTax: childTransferTax,
      box3: childBox3,
      directCostShare,
      totalTaxAndCosts: inheritanceTax + directCostShare,
      projectedNetOutcome: totalGrossAtReview - inheritanceTax - directCostShare,
      projectedFamilyShare: totalGrossAtReview,
    };
  });
}

function buildAnnualTransferSchedule({
  startYear,
  yearsToReview,
  childrenCount,
  childrenEligibleForOneOff,
  annualGiftExemptionPerChild,
  oneOffGiftExemptionPerChild,
  useOneOffGiftExemption,
  higherExemptionYear,
  targetTransferValue,
}) {
  const schedule = [];
  let remainingTargetValue = Math.max(0, targetTransferValue);
  const childrenWithOneOffUsed = childrenCount - childrenEligibleForOneOff;

  for (let index = 0; index < yearsToReview; index += 1) {
    const year = startYear + index;
    const isOneOffYear = year === higherExemptionYear && useOneOffGiftExemption;
    const exemptionPerChild = isOneOffYear
      ? oneOffGiftExemptionPerChild
      : annualGiftExemptionPerChild;
    // In the one-off year, children who already used it get only the annual exemption.
    const availableExemptionTotal = isOneOffYear
      ? oneOffGiftExemptionPerChild * childrenEligibleForOneOff +
        annualGiftExemptionPerChild * childrenWithOneOffUsed
      : exemptionPerChild * childrenCount;
    const transferValueTotal = Math.min(remainingTargetValue, availableExemptionTotal);

    schedule.push({
      year,
      exemptionPerChild,
      availableExemptionTotal,
      transferValueTotal,
    });

    remainingTargetValue = Math.max(0, remainingTargetValue - transferValueTotal);
  }

  return schedule;
}

export function calculateTransferScenarios(input, rules = taxRules2026) {
  const baseYear = rules.year;
  const childrenCount = clamp(Math.round(input.childrenCount || 2), 1, 10);
  const childShares = normalizeShares(childrenCount, input.childShares);
  const yearsToReview = clamp(Math.round(input.yearsToReview || 10), 1, 40);
  const lastReviewYear = baseYear + yearsToReview - 1;
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
  const annualGiftExemptionPerChild = Math.max(
    0,
    input.annualGiftExemptionPerChild ?? rules.annualChildGiftExemption,
  );
  const oneOffGiftExemptionPerChild = Math.max(
    0,
    input.oneOffGiftExemptionPerChild ?? rules.oneOffChildGiftExemption,
  );
  const useOneOffGiftExemption = Boolean(input.useOneOffGiftExemption);
  const childPriorGifts = Array.from(
    { length: childrenCount },
    (_, i) => (input.childPriorGifts || [])[i] || null,
  );
  // Count how many children have already used the one-off exemption.
  const childrenWithOneOffUsed = childPriorGifts.filter((g) => g?.usedOneOff).length;
  // Effective number of children eligible for the one-off exemption.
  const childrenEligibleForOneOff = childrenCount - childrenWithOneOffUsed;
  const targetTransferMode = input.targetTransferMode === "custom" ? "custom" : "maxTaxFree";
  const oneTimeTransferYear = clamp(
    Math.round(input.oneTimeTransferYear || baseYear),
    baseYear,
    lastReviewYear,
  );
  // One-off capacity accounts for children who already used the one-off exemption.
  const oneTimeTaxFreeCapacity = useOneOffGiftExemption
    ? oneOffGiftExemptionPerChild * childrenEligibleForOneOff +
      annualGiftExemptionPerChild * childrenWithOneOffUsed
    : annualGiftExemptionPerChild * childrenCount;
  // Cumulative tax-free capacity across all review years:
  // one-off year uses the (possibly higher) one-off exemption for eligible children,
  // remaining years use the annual exemption for all children.
  const cumulativeTaxFreeCapacity =
    oneTimeTaxFreeCapacity +
    annualGiftExemptionPerChild * childrenCount * (yearsToReview - 1);
  const rawTargetTransferValue = Math.max(
    0,
    targetTransferMode === "custom"
      ? input.targetTransferValue ?? cumulativeTaxFreeCapacity
      : cumulativeTaxFreeCapacity,
  );
  const targetTransferValue = Math.min(homeValue, rawTargetTransferValue);
  const transferTaxRate = clamp(input.transferTaxRate ?? rules.transferTaxRate * 100, 0, 20);
  const residentTransferTaxRate = clamp(
    input.residentTransferTaxRate ?? rules.residentTransferTaxRate * 100,
    0,
    20,
  );
  const childLivesInHome = Array.from(
    { length: childrenCount },
    (_, i) => Boolean((input.childLivesInHome || [])[i]),
  );
  const notaryCostPerTransfer = Math.max(
    0,
    input.notaryCostPerTransfer ?? rules.notaryEstimatePropertyTransfer,
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
  const monthlyInterestRate = mortgageInterestRate / 100 / 12;
  const monthlyMortgageInterest = mortgageBalance * monthlyInterestRate;
  const currentEquity = Math.max(0, homeValue - mortgageBalance);
  const currentImputedRental = homeValue * rules.imputedRentalRate;
  const currentAnnualMortgageRelief =
    Math.max(0, monthlyMortgageInterest * 12 - currentImputedRental) *
    (mortgageInterestReliefRate / 100);

  const annualSchedule = buildAnnualTransferSchedule({
    startYear: baseYear,
    yearsToReview,
    childrenCount,
    childrenEligibleForOneOff,
    annualGiftExemptionPerChild,
    oneOffGiftExemptionPerChild,
    useOneOffGiftExemption,
    higherExemptionYear: oneTimeTransferYear,
    targetTransferValue,
  });

  const annualGiftRoomTotal = annualSchedule.reduce(
    (sum, item) => sum + item.availableExemptionTotal,
    0,
  );
  const annualTransferCapacity = annualSchedule.reduce(
    (sum, item) => sum + item.transferValueTotal,
    0,
  );
  const annualTransferShortfall = Math.max(0, targetTransferValue - annualTransferCapacity);

  const oneTimeTransferOffset = oneTimeTransferYear - baseYear;
  const oneTimeTransferYearHomeValue =
    homeValue * Math.pow(1 + annualGrowthRate / 100, oneTimeTransferOffset);
  const plannedTransferValueTotal = targetTransferValue;
  const oneTimeTransferValue = Math.min(targetTransferValue, oneTimeTransferYearHomeValue);
  const oneTimeAvailableExemption = oneTimeTaxFreeCapacity;
  const oneTimeShare =
    oneTimeTransferYearHomeValue > 0
      ? Math.min(1, oneTimeTransferValue / oneTimeTransferYearHomeValue)
      : 0;
  const oneTimeTaxes = calculateTransferTaxes({
    transferValue: oneTimeTransferValue,
    availableExemption: oneTimeAvailableExemption,
    transferTaxRate,
    childShares,
    childLivesInHome,
    residentTransferTaxRate,
    rules,
  });
  const oneTimeDirectCosts =
    oneTimeTransferValue > 0
      ? oneTimeTaxes.effectiveTax + notaryCostPerTransfer
      : 0;

  const timeline = {
    doNothing: [],
    oneTimeTransfer: [],
    annualTransfer: [],
  };

  let cumulativeMortgageReliefDoNothing = 0;
  let cumulativeOneTimeBox3 = 0;
  let cumulativeOneTimeMortgageReliefLoss = 0;

  let cumulativeAnnualTransferShare = 0;
  let cumulativeAnnualDirectCosts = 0;
  let cumulativeAnnualTransferTax = 0;
  let cumulativeAnnualGiftTax = 0;
  let cumulativeAnnualNotaryCosts = 0;
  let cumulativeAnnualBox3 = 0;
  let cumulativeAnnualMortgageReliefLoss = 0;

  for (let offset = 0; offset < yearsToReview; offset += 1) {
    const calendarYear = baseYear + offset;
    const projectionYear = offset + 1;
    const transferYearHomeValue = homeValue * Math.pow(1 + annualGrowthRate / 100, projectionYear - 1);
    const futureMortgageBalance = calculateFutureMortgageBalance({
      mortgageBalance,
      monthlyMortgageCost,
      monthlyInterestRate,
      mortgageType,
      months: projectionYear * 12,
    });
    const futureHomeValue = homeValue * Math.pow(1 + annualGrowthRate / 100, projectionYear);
    const futureEquity = Math.max(0, futureHomeValue - futureMortgageBalance);
    const annualMortgageInterest =
      futureMortgageBalance * (mortgageInterestRate / 100);
    const imputedRental = futureHomeValue * rules.imputedRentalRate;
    const annualMortgageRelief =
      Math.max(0, annualMortgageInterest - imputedRental) *
      (mortgageInterestReliefRate / 100);

    const doNothingFamily = calculateFamilyInheritanceAtYear({
      estateEquity: futureEquity,
      hasPartner,
      normalizedPartnerSharePercent,
      childShares,
      rules,
    });

    cumulativeMortgageReliefDoNothing += annualMortgageRelief;
    timeline.doNothing.push({
      year: calendarYear,
      futureHomeValue,
      futureMortgageBalance,
      futureEquity,
      annualMortgageRelief,
      childBox3PerYear: 0,
      inheritanceTaxAtDeath: doNothingFamily.inheritanceTax,
    });

    const oneTimeTransferDone = calendarYear >= oneTimeTransferYear;
    const oneTimeGiftedValueAtYear = oneTimeTransferDone ? futureHomeValue * oneTimeShare : 0;
    const oneTimeEstateEquity = oneTimeTransferDone
      ? Math.max(0, futureHomeValue * (1 - oneTimeShare) - futureMortgageBalance)
      : futureEquity;
    const oneTimeFamily = calculateFamilyInheritanceAtYear({
      estateEquity: oneTimeEstateEquity,
      hasPartner,
      normalizedPartnerSharePercent,
      childShares,
      rules,
    });
    const oneTimeBox3PerYear = oneTimeTransferDone
      ? rebalanceBox3(oneTimeGiftedValueAtYear, childShares, childLivesInHome, rules)
      : 0;
    const oneTimeAnnualMortgageReliefLoss = oneTimeTransferDone
      ? annualMortgageRelief * oneTimeShare
      : 0;
    cumulativeOneTimeBox3 += oneTimeBox3PerYear;
    cumulativeOneTimeMortgageReliefLoss += oneTimeAnnualMortgageReliefLoss;
    timeline.oneTimeTransfer.push({
      year: calendarYear,
      futureHomeValue,
      futureMortgageBalance,
      giftedValueAtYear: oneTimeGiftedValueAtYear,
      transferredSharePercent: oneTimeTransferDone ? oneTimeShare * 100 : 0,
      annualMortgageReliefLoss: oneTimeAnnualMortgageReliefLoss,
      box3PerYear: oneTimeBox3PerYear,
      directCostsToDate: oneTimeTransferDone ? oneTimeDirectCosts : 0,
      directBurdenAtDeath: (oneTimeTransferDone ? oneTimeDirectCosts : 0) + oneTimeFamily.inheritanceTax,
      savingVsDoNothing:
        doNothingFamily.inheritanceTax -
        ((oneTimeTransferDone ? oneTimeDirectCosts : 0) + oneTimeFamily.inheritanceTax +
          cumulativeOneTimeBox3 + cumulativeOneTimeMortgageReliefLoss),
    });

    const scheduleItem = annualSchedule[offset];
    const remainingShare = Math.max(0, 1 - cumulativeAnnualTransferShare);
    const maxTransferValueThisYear = transferYearHomeValue * remainingShare;
    const transferValueThisYear = Math.min(
      scheduleItem.transferValueTotal,
      maxTransferValueThisYear,
    );
    const transferShareThisYear =
      transferYearHomeValue > 0 ? transferValueThisYear / transferYearHomeValue : 0;
    cumulativeAnnualTransferShare = Math.min(
      1,
      cumulativeAnnualTransferShare + transferShareThisYear,
    );

    let transferTaxThisYear = 0;
    let giftTaxThisYear = 0;
    let actCostThisYear = 0;

    if (transferValueThisYear > 0) {
      const annualTaxes = calculateTransferTaxes({
        transferValue: transferValueThisYear,
        availableExemption: scheduleItem.availableExemptionTotal,
        transferTaxRate,
        childShares,
        childLivesInHome,
        residentTransferTaxRate,
        rules,
      });

      transferTaxThisYear = annualTaxes.transferTax;
      giftTaxThisYear = annualTaxes.giftTax;
      actCostThisYear = notaryCostPerTransfer;
      cumulativeAnnualTransferTax += transferTaxThisYear;
      cumulativeAnnualGiftTax += giftTaxThisYear;
      cumulativeAnnualNotaryCosts += actCostThisYear;
      cumulativeAnnualDirectCosts += annualTaxes.effectiveTax + actCostThisYear;
    }

    const annualGiftedValueAtYear = futureHomeValue * cumulativeAnnualTransferShare;
    const annualEstateEquity = Math.max(
      0,
      futureHomeValue * (1 - cumulativeAnnualTransferShare) - futureMortgageBalance,
    );
    const annualFamily = calculateFamilyInheritanceAtYear({
      estateEquity: annualEstateEquity,
      hasPartner,
      normalizedPartnerSharePercent,
      childShares,
      rules,
    });
    const annualBox3PerYear = rebalanceBox3(
      annualGiftedValueAtYear,
      childShares,
      childLivesInHome,
      rules,
    );
    const annualMortgageReliefLoss = annualMortgageRelief * cumulativeAnnualTransferShare;
    cumulativeAnnualBox3 += annualBox3PerYear;
    cumulativeAnnualMortgageReliefLoss += annualMortgageReliefLoss;
    timeline.annualTransfer.push({
      year: calendarYear,
      futureHomeValue,
      futureMortgageBalance,
      transferredThisYear: transferValueThisYear,
      giftedValueAtYear: annualGiftedValueAtYear,
      transferredSharePercent: cumulativeAnnualTransferShare * 100,
      transferTaxThisYear,
      giftTaxThisYear,
      actCostThisYear,
      annualMortgageReliefLoss,
      box3PerYear: annualBox3PerYear,
      directCostsToDate: cumulativeAnnualDirectCosts,
      directBurdenAtDeath: cumulativeAnnualDirectCosts + annualFamily.inheritanceTax,
      savingVsDoNothing:
        doNothingFamily.inheritanceTax -
        (cumulativeAnnualDirectCosts + annualFamily.inheritanceTax +
          cumulativeAnnualBox3 + cumulativeAnnualMortgageReliefLoss),
    });
  }

  const finalDoNothing = timeline.doNothing.at(-1);
  const finalOneTime = timeline.oneTimeTransfer.at(-1);
  const finalAnnual = timeline.annualTransfer.at(-1);

  const finalDoNothingFamily = calculateFamilyInheritanceAtYear({
    estateEquity: finalDoNothing?.futureEquity || currentEquity,
    hasPartner,
    normalizedPartnerSharePercent,
    childShares,
    rules,
  });

  const finalOneTimeEstateEquity = Math.max(
    0,
    (finalDoNothing?.futureHomeValue || homeValue) * (1 - oneTimeShare) -
      (finalDoNothing?.futureMortgageBalance || mortgageBalance),
  );
  const finalOneTimeFamily = calculateFamilyInheritanceAtYear({
    estateEquity: finalOneTimeEstateEquity,
    hasPartner,
    normalizedPartnerSharePercent,
    childShares,
    rules,
  });

  const finalAnnualEstateEquity = Math.max(
    0,
    (finalDoNothing?.futureHomeValue || homeValue) *
      (1 - (finalAnnual?.transferredSharePercent || 0) / 100) -
      (finalDoNothing?.futureMortgageBalance || mortgageBalance),
  );
  const finalAnnualFamily = calculateFamilyInheritanceAtYear({
    estateEquity: finalAnnualEstateEquity,
    hasPartner,
    normalizedPartnerSharePercent,
    childShares,
    rules,
  });

  const scenarios = {
    doNothing: {
      id: "doNothing",
      directBurden: finalDoNothing?.inheritanceTaxAtDeath || 0,
      directCosts: 0,
      inheritanceTaxOnly: finalDoNothing?.inheritanceTaxAtDeath || 0,
      extraCashFlows: {
        cumulativeMortgageRelief: cumulativeMortgageReliefDoNothing,
        cumulativeMortgageReliefLoss: 0,
        cumulativeBox3: 0,
        cumulativeTransferTax: 0,
        cumulativeGiftTax: 0,
        cumulativeNotaryCosts: 0,
      },
      children: calculateChildrenBreakdown({
        scenarioId: "doNothing",
        childShares,
        childLivesInHome,
        giftedValueAtReview: 0,
        giftedValueNominal: 0,
        childrenPoolAtReview: finalDoNothingFamily.childrenPoolAtReview,
        notaryCostTotal: 0,
        transferTaxRate,
        residentTransferTaxRate,
        cumulativeBox3: 0,
        rules,
      }),
      timeline: timeline.doNothing,
      giftedValueAtReview: 0,
      transferredSharePercent: 0,
      partnerDetailAtReview: finalDoNothingFamily.partnerDetailForYear,
    },
    oneTimeTransfer: {
      id: "oneTimeTransfer",
      directBurden: finalOneTime?.directBurdenAtDeath || 0,
      directCosts: oneTimeDirectCosts,
      inheritanceTaxOnly: Math.max(
        0,
        (finalOneTime?.directBurdenAtDeath || 0) - oneTimeDirectCosts,
      ),
      extraCashFlows: {
        cumulativeMortgageReliefLoss: cumulativeOneTimeMortgageReliefLoss,
        cumulativeBox3: cumulativeOneTimeBox3,
        cumulativeTransferTax: oneTimeTaxes.transferTax,
        cumulativeGiftTax: oneTimeTaxes.giftTax,
        cumulativeNotaryCosts: oneTimeTransferValue > 0 ? notaryCostPerTransfer : 0,
      },
      children: calculateChildrenBreakdown({
        scenarioId: "oneTimeTransfer",
        childShares,
        childLivesInHome,
        giftedValueAtReview: finalOneTime?.giftedValueAtYear || 0,
        giftedValueNominal: oneTimeTransferValue,
        childrenPoolAtReview: finalOneTimeFamily.childrenPoolAtReview,
        notaryCostTotal: oneTimeTransferValue > 0 ? notaryCostPerTransfer : 0,
        transferTaxRate,
        residentTransferTaxRate,
        cumulativeBox3: cumulativeOneTimeBox3,
        rules,
      }),
      timeline: timeline.oneTimeTransfer,
      giftedValueAtReview: finalOneTime?.giftedValueAtYear || 0,
      transferredSharePercent: finalOneTime?.transferredSharePercent || 0,
      partnerDetailAtReview: finalOneTimeFamily.partnerDetailForYear,
    },
    annualTransfer: {
      id: "annualTransfer",
      directBurden: finalAnnual?.directBurdenAtDeath || 0,
      directCosts: cumulativeAnnualDirectCosts,
      inheritanceTaxOnly: Math.max(
        0,
        (finalAnnual?.directBurdenAtDeath || 0) - cumulativeAnnualDirectCosts,
      ),
      extraCashFlows: {
        cumulativeMortgageReliefLoss: cumulativeAnnualMortgageReliefLoss,
        cumulativeBox3: cumulativeAnnualBox3,
        cumulativeTransferTax: cumulativeAnnualTransferTax,
        cumulativeGiftTax: cumulativeAnnualGiftTax,
        cumulativeNotaryCosts: cumulativeAnnualNotaryCosts,
      },
      children: calculateChildrenBreakdown({
        scenarioId: "annualTransfer",
        childShares,
        childLivesInHome,
        giftedValueAtReview: finalAnnual?.giftedValueAtYear || 0,
        giftedValueNominal: finalAnnual
          ? (finalAnnual.transferredSharePercent / 100) * homeValue
          : 0,
        childrenPoolAtReview: finalAnnualFamily.childrenPoolAtReview,
        notaryCostTotal: cumulativeAnnualNotaryCosts,
        transferTaxRate,
        residentTransferTaxRate,
        cumulativeBox3: cumulativeAnnualBox3,
        rules,
      }),
      timeline: timeline.annualTransfer,
      giftedValueAtReview: finalAnnual?.giftedValueAtYear || 0,
      transferredSharePercent: finalAnnual?.transferredSharePercent || 0,
      partnerDetailAtReview: finalAnnualFamily.partnerDetailForYear,
    },
  };

  const comparisonMax = Math.max(
    scenarios.doNothing.directBurden,
    scenarios.oneTimeTransfer.directBurden,
    scenarios.annualTransfer.directBurden,
    1,
  );

  return {
    inputs: {
      childrenCount,
      childShares,
      yearsToReview,
      baseYear,
      lastReviewYear,
      homeValue,
      mortgageBalance,
      mortgageInterestRate,
      monthlyMortgageCost,
      annualGrowthRate,
      mortgageInterestReliefRate,
      annualGiftExemptionPerChild,
      oneOffGiftExemptionPerChild,
      useOneOffGiftExemption,
      targetTransferMode,
      oneTimeTransferYear,
      targetTransferValue,
      transferTaxRate,
      residentTransferTaxRate,
      childLivesInHome,
      childPriorGifts,
      childrenEligibleForOneOff,
      notaryCostPerTransfer,
      hasPartner,
      partnerSharePercent: normalizedPartnerSharePercent,
      childrenSharePercent,
      mortgageType,
    },
    overview: {
      currentEquity,
      reviewEquity: finalDoNothing?.futureEquity || currentEquity,
      projectedHomeValue: finalDoNothing?.futureHomeValue || homeValue,
      projectedMortgageBalance: finalDoNothing?.futureMortgageBalance || mortgageBalance,
      baseYear,
      lastReviewYear,
      annualMortgageRelief: currentAnnualMortgageRelief,
      monthlyMortgageInterest,
      annualPrincipalRepayment:
        mortgageType === mortgageTypes.interestOnly
          ? 0
          : (mortgageBalance - (finalDoNothing?.futureMortgageBalance || mortgageBalance)) / yearsToReview,
      comparisonMax,
      partnerDetailAtReview: finalDoNothingFamily.partnerDetailForYear,
      childrenPoolAtReview: finalDoNothingFamily.childrenPoolAtReview,
      annualGiftRoomTotal,
      oneTimeTaxFreeCapacity,
      cumulativeTaxFreeCapacity,
      oneTimeTransferYear,
      plannedTransferValueTotal,
      annualTransferCapacity,
      annualTransferShortfall,
    },
    scenarios,
  };
}

/**
 * Sweep targetTransferValue from 0 to maxValue and return the total burden
 * (directBurden + cumulative box3 + cumulative mortgage relief loss) for
 * both the one-time and annual scenarios at each sample point.
 * Returns { points, optimum } where optimum is the point with the lowest
 * total burden for the one-time scenario.
 */
export function findOptimalTransferAmount(input, rules = taxRules2026, { samples = 50 } = {}) {
  const homeValue = Math.max(0, input.homeValue || 0);
  const maxValue = homeValue;
  const step = Math.max(1000, Math.round(maxValue / samples));
  const points = [];
  let optimum = null;

  for (let amount = 0; amount <= maxValue; amount += step) {
    const result = calculateTransferScenarios(
      { ...input, targetTransferMode: "custom", targetTransferValue: amount },
      rules,
    );
    const oneTime = result.scenarios.oneTimeTransfer;
    const totalBurden =
      oneTime.directBurden +
      oneTime.extraCashFlows.cumulativeBox3 +
      oneTime.extraCashFlows.cumulativeMortgageReliefLoss;

    const point = {
      amount,
      totalBurden,
      directBurden: oneTime.directBurden,
      giftTax: oneTime.extraCashFlows.cumulativeGiftTax,
      transferTax: oneTime.extraCashFlows.cumulativeTransferTax,
      notaryCosts: oneTime.extraCashFlows.cumulativeNotaryCosts,
      inheritanceTax: oneTime.inheritanceTaxOnly,
      transferYear: result.inputs.oneTimeTransferYear,
    };
    points.push(point);

    if (optimum === null || totalBurden < optimum.totalBurden) {
      optimum = point;
    }
  }

  return { points, optimum };
}
