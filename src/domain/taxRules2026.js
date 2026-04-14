export const taxRules2026 = {
  year: 2026,
  childInheritanceExemption: 26230,
  partnerInheritanceExemption: 828035,
  annualChildGiftExemption: 6908,
  oneOffChildGiftExemption: 33129,
  inheritanceRate1: 0.1,
  inheritanceRate2: 0.2,
  inheritanceRateThreshold: 158669,
  transferTaxRate: 0.08,
  promissoryGiftInterestRate: 0.06,
  box3DeemedReturnOtherAssets: 0.06,
  box3TaxRate: 0.36,
  box3ExemptionPerPerson: 59357,
  annualDebtThresholdBox3: 3800,
  imputedRentalRate: 0.0035,
  defaultMortgageReliefRate: 37.56,
  notaryEstimateStak: 4000,
  notaryEstimatePaperGift: 750,
};

export function calculateInheritanceTax(taxableAmount, rules = taxRules2026) {
  if (taxableAmount <= 0) {
    return 0;
  }

  if (taxableAmount <= rules.inheritanceRateThreshold) {
    return taxableAmount * rules.inheritanceRate1;
  }

  return (
    rules.inheritanceRateThreshold * rules.inheritanceRate1 +
    (taxableAmount - rules.inheritanceRateThreshold) * rules.inheritanceRate2
  );
}
