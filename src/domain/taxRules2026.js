export const taxRules2026 = {
  year: 2026,
  childInheritanceExemption: 26230,
  partnerInheritanceExemption: 828035,
  annualChildGiftExemption: 6908,
  oneOffChildGiftExemption: 33129,
  inheritanceRate1: 0.1,
  inheritanceRate2: 0.2,
  inheritanceRateThreshold: 158669,
  giftRate1: 0.1,
  giftRate2: 0.2,
  giftRateThreshold: 158669,
  transferTaxRate: 0.104,
  residentTransferTaxRate: 0.02,
  box3DeemedReturnOtherAssets: 0.06,
  box3TaxRate: 0.36,
  box3ExemptionPerPerson: 59357,
  imputedRentalRate: 0.0035,
  defaultMortgageReliefRate: 36.93,
  notaryEstimatePropertyTransfer: 1300,
};

function calculateProgressiveTax(taxableAmount, threshold, rate1, rate2) {
  if (taxableAmount <= 0) {
    return 0;
  }

  if (taxableAmount <= threshold) {
    return taxableAmount * rate1;
  }

  return threshold * rate1 + (taxableAmount - threshold) * rate2;
}

export function calculateInheritanceTax(taxableAmount, rules = taxRules2026) {
  return calculateProgressiveTax(
    taxableAmount,
    rules.inheritanceRateThreshold,
    rules.inheritanceRate1,
    rules.inheritanceRate2,
  );
}

export function calculateGiftTax(taxableAmount, rules = taxRules2026) {
  return calculateProgressiveTax(
    taxableAmount,
    rules.giftRateThreshold,
    rules.giftRate1,
    rules.giftRate2,
  );
}
