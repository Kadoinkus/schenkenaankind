import { useEffect, useMemo, useState } from "react";
import { termExplainers } from "../../content/copy.js";
import { formatCurrency, formatMinorCurrency } from "../../lib/formatters.js";
import { findOptimalTransferAmount } from "../../domain/calculateTransferScenarios.js";
import AccordionItem from "../../components/ui/AccordionItem.jsx";
import Button from "../../components/ui/Button.jsx";
import Callout from "../../components/ui/Callout.jsx";
import Icon from "../../components/ui/Icon.jsx";
import NumberField from "../../components/ui/NumberField.jsx";
import OptimalTransferChart from "../../components/ui/OptimalTransferChart.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import SegmentedControl from "../../components/ui/SegmentedControl.jsx";
import ScenarioComparison from "./ScenarioComparison.jsx";
import ScenarioDetail from "./ScenarioDetail.jsx";
import { scenarioMetaById } from "./scenarioMeta.js";
import PremiumGate from "../premium/PremiumGate.jsx";
import PremiumReport from "../premium/PremiumReport.jsx";
import { derivePremiumOffer } from "../premium/premiumOffer.js";
import { evaluatePromoCode } from "../premium/premiumPricing.js";

const steps = [
  {
    id: "woning",
    title: "Uw woning en hypotheek",
    subtitle: "Begin met de gegevens die de meeste mensen direct kunnen vinden.",
    icon: "house",
  },
  {
    id: "gezin",
    title: "Uw gezinssituatie",
    subtitle: "Vul daarna in voor wie de berekening ongeveer bedoeld is.",
    icon: "users",
  },
  {
    id: "aannames",
    title: "Aannames en berekenen",
    subtitle: "Laat standaardwaarden staan als u deze onderdelen niet zeker weet.",
    icon: "calculator",
  },
  {
    id: "uitkomst",
    title: "Uw uitkomst",
    subtitle: "U ziet eerst de hoofdlijn. Open daarna de details als u verder wilt kijken.",
    icon: "chart",
  },
];

function Stepper({ stepIndex, onStepClick }) {
  return (
    <nav className="stepper" aria-label="Stappen">
      {steps.map((step, index) => (
        <button
          key={step.id}
          type="button"
          className={`stepper__item ${
            index === stepIndex ? "is-active" : index < stepIndex ? "is-done" : ""
          }`.trim()}
          onClick={() => {
            if (index <= stepIndex) {
              onStepClick(index);
            }
          }}
          disabled={index > stepIndex}
        >
          <span className="stepper__index">{index + 1}</span>
          <span className="stepper__text">
            <span className="stepper__title">{step.title}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}

function SupportCard({ eyebrow, title, children, tone = "default" }) {
  return (
    <article className={`support-card support-card--${tone}`.trim()}>
      {eyebrow ? <p className="support-card__eyebrow">{eyebrow}</p> : null}
      {title ? <h3 className="support-card__title">{title}</h3> : null}
      <div className="support-card__body">{children}</div>
    </article>
  );
}

function SummaryCard({ eyebrow, title, value, note, tone = "default" }) {
  return (
    <article className={`summary-card summary-card--${tone}`.trim()}>
      {eyebrow ? <p className="summary-card__eyebrow">{eyebrow}</p> : null}
      {title ? <h3 className="summary-card__title">{title}</h3> : null}
      {value ? <strong className="summary-card__value">{value}</strong> : null}
      {note ? <p className="summary-card__note">{note}</p> : null}
    </article>
  );
}

export default function CalculatorWizard({ calculator, premiumAccess }) {
  const { state, model, actions, mortgageTypes } = calculator;
  const [stepIndex, setStepIndex] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState(null);
  const [promoFeedback, setPromoFeedback] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState(null);
  const annualFamilyExemption = state.annualGiftExemptionPerChild * state.childrenCount;
  const oneTimeExemptionPerChild = state.useOneOffGiftExemption
    ? state.oneOffGiftExemptionPerChild
    : state.annualGiftExemptionPerChild;
  const oneTimeFamilyExemption = oneTimeExemptionPerChild * state.childrenCount;
  const premiumOffer = useMemo(() => derivePremiumOffer(model), [model]);

  const optimisation = useMemo(
    () => findOptimalTransferAmount(state),
    [state],
  );

  const bestScenarioId = useMemo(() => {
    return Object.values(model.scenarios).sort((a, b) => a.directBurden - b.directBurden)[0].id;
  }, [model.scenarios]);

  const bestScenario = scenarioMetaById[bestScenarioId];
  const selectedScenario = scenarioMetaById[state.selectedScenarioId];
  const finalPriceMinor = promoResult?.finalPriceMinor ?? premiumOffer.basePriceMinor;
  const baseYear = model.overview.baseYear;
  const reviewYear = model.overview.lastReviewYear;
  const gateOffer = {
    ...premiumOffer,
    estimatedSavingText: formatCurrency(premiumOffer.estimatedSaving),
    finalPriceText: formatMinorCurrency(finalPriceMinor),
  };
  const isPremiumLocked = stepIndex === 3 && !premiumAccess.isUnlocked;

  useEffect(() => {
    if (!isPremiumLocked) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPremiumLocked]);

  async function readApiPayload(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();
    return {
      error: text || "De server gaf geen JSON-respons terug.",
    };
  }

  async function applyPromoCode() {
    if (!promoCode.trim()) {
      setPromoResult(null);
      setPromoFeedback(null);
      return;
    }

    setIsApplyingPromo(true);
    setCheckoutMessage(null);

    try {
      const response = await fetch("/api/validate-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promoCode }),
      });
      const payload = await readApiPayload(response);

      if (!response.ok) {
        throw new Error(payload.error || "Kortingscode kon niet worden gecontroleerd.");
      }

      setPromoResult(payload.valid ? payload : null);
      setPromoFeedback({
        tone: payload.valid ? "green" : "red",
        message:
          payload.message ||
          (payload.valid ? "Kortingscode toegepast." : "Deze kortingscode is niet geldig."),
      });
    } catch (error) {
      const fallbackPromo = evaluatePromoCode(promoCode);

      if (fallbackPromo.valid) {
        setPromoResult({
          valid: true,
          finalPriceMinor: fallbackPromo.finalPriceMinor,
          discountMinor: fallbackPromo.discountMinor,
          normalizedCode: fallbackPromo.normalizedCode,
          label: fallbackPromo.label,
          message: fallbackPromo.message,
        });
        setPromoFeedback({
          tone: "green",
          message: fallbackPromo.message || "Kortingscode toegepast.",
        });
      } else {
        setPromoResult(null);
        setPromoFeedback({
          tone: "red",
          message: error.message || "Kortingscode kon niet worden gecontroleerd.",
        });
      }
    } finally {
      setIsApplyingPromo(false);
    }
  }

  async function startPremiumCheckout() {
    setIsProcessingCheckout(true);
    setCheckoutMessage(null);

    try {
      const checkoutToken =
        typeof window !== "undefined" && window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : `checkout-${Date.now()}`;
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkoutToken,
          promoCode: promoCode.trim(),
          offer: {
            baselineScenarioId: premiumOffer.baselineScenarioId,
            bestPaidScenarioId: premiumOffer.bestPaidScenarioId,
            estimatedSaving: premiumOffer.estimatedSaving,
          },
        }),
      });
      const payload = await readApiPayload(response);

      if (!response.ok) {
        throw new Error(payload.error || "Checkout kon niet worden gestart.");
      }

      if (payload.mode === "payment") {
        premiumAccess.rememberPendingCheckout(checkoutToken, payload.paymentId);
        window.location.assign(payload.checkoutUrl);
        return;
      }

      if (payload.mode === "free") {
        window.location.assign(payload.redirectUrl);
        return;
      }

      throw new Error("Onbekend checkoutantwoord ontvangen.");
    } catch (error) {
      const fallbackPromo = evaluatePromoCode(promoCode);

      if (fallbackPromo.valid && fallbackPromo.finalPriceMinor === 0) {
        premiumAccess.unlockForCurrentBrowser("promo");
        setCheckoutMessage({
          tone: "success",
          title: "Kortingscode verwerkt",
          body: "De volledige berekening is vrijgeschakeld op dit apparaat.",
        });
        return;
      }

      setCheckoutMessage({
        tone: "warning",
        title: "Checkout kon niet worden gestart",
        body: error.message || "Controleer de betaalinstellingen en probeer het opnieuw.",
      });
    } finally {
      setIsProcessingCheckout(false);
    }
  }

  return (
    <div className="page-stack" id="berekening">
      <section className="wizard-intro wizard-intro--panel">
        <div className="wizard-intro__main">
          <p className="intro-band__eyebrow">Berekening</p>
          <h1>Rustig stap voor stap door uw situatie</h1>
          <p className="wizard-intro__lead">
            U hoeft niet alles tegelijk te begrijpen. Per stap vult u alleen in wat u nu weet.
            De rest kunt u later verfijnen.
          </p>
        </div>
        <aside className="wizard-intro__aside">
          <SupportCard eyebrow="Voor u klaarleggen" title="Wat u meestal nodig hebt" tone="soft">
            <ul className="support-list">
              <li>WOZ-beschikking 2026</li>
              <li>Overzicht van uw resterende hypotheek en maandlast</li>
              <li>Een grove inschatting van partner, kinderen en de periode vooruit</li>
            </ul>
          </SupportCard>
        </aside>
      </section>

      <Stepper stepIndex={stepIndex} onStepClick={setStepIndex} />

      {stepIndex === 0 ? (
        <SectionCard
          eyebrow="Stap 1 van 4"
          title={steps[0].title}
          subtitle="De tool gaat uit van nu, dus van 2026. Gebruik daarom hier uw WOZ-waarde 2026 als startpunt."
          tone="blue"
        >
          <div className="step-layout">
            <div className="step-layout__main">
              <section className="step-block">
                <div className="step-block__header">
                  <h3>Woning</h3>
                  <p>
                    Vul de WOZ-waarde in die u op uw WOZ-beschikking 2026 kunt vinden.
                  </p>
                </div>
                <div className="field-grid">
                  <NumberField
                    id="homeValue"
                    label="WOZ-waarde 2026"
                    value={state.homeValue}
                    step={1000}
                    suffix="EUR"
                    explanation={termExplainers.homeValue.body}
                    explanationTitle={termExplainers.homeValue.title}
                    onChange={(value) => actions.setNumericField("homeValue", value)}
                  />
                </div>
              </section>

              <section className="step-block">
                <div className="step-block__header">
                  <h3>Hypotheek</h3>
                </div>
                <SegmentedControl
                  label="Heeft u nog een hypotheek?"
                  value={String(state.hasMortgage)}
                  options={[
                    { label: "Ja", value: "true" },
                    { label: "Nee, hypotheekvrij", value: "false" },
                  ]}
                  explanation={termExplainers.hasMortgage.body}
                  explanationTitle={termExplainers.hasMortgage.title}
                  onChange={(value) => actions.setHasMortgage(value === "true")}
                />

                {state.hasMortgage ? (
                  <>
                    <div className="field-grid">
                      <NumberField
                        id="mortgageBalance"
                        label="Resterende hypotheek"
                        value={state.mortgageBalance}
                        step={1000}
                        suffix="EUR"
                        explanation={termExplainers.mortgageBalance.body}
                        explanationTitle={termExplainers.mortgageBalance.title}
                        onChange={(value) => actions.setNumericField("mortgageBalance", value)}
                      />
                      <NumberField
                        id="mortgageInterestRate"
                        label="Hypotheekrente"
                        value={state.mortgageInterestRate}
                        step={0.1}
                        suffix="%"
                        explanation={termExplainers.mortgageInterestRate.body}
                        explanationTitle={termExplainers.mortgageInterestRate.title}
                        onChange={(value) =>
                          actions.setNumericField("mortgageInterestRate", value, { max: 25 })
                        }
                      />
                      <NumberField
                        id="monthlyMortgageCost"
                        label="Maandlast bank"
                        value={state.monthlyMortgageCost}
                        step={25}
                        suffix="EUR"
                        explanation={termExplainers.monthlyMortgageCost.body}
                        explanationTitle={termExplainers.monthlyMortgageCost.title}
                        onChange={(value) => actions.setNumericField("monthlyMortgageCost", value)}
                      />
                    </div>

                    <SegmentedControl
                      label="Hypotheekvorm"
                      value={state.mortgageType}
                      options={[
                        { label: "Aflossingsvrij", value: mortgageTypes.interestOnly },
                        { label: "Annuiteit", value: mortgageTypes.annuity },
                      ]}
                      explanation={termExplainers.mortgageType.body}
                      explanationTitle={termExplainers.mortgageType.title}
                      onChange={actions.setMortgageType}
                    />
                  </>
                ) : null}
              </section>
            </div>

            <aside className="step-layout__aside">
              <SupportCard eyebrow="Snel starten" title="Waar kijkt deze stap naar?">
                <ul className="support-list">
                  <li>De huidige waarde van uw woning in 2026</li>
                  <li>Het deel dat nog bij de bank openstaat</li>
                  <li>De maandlast en hypotheekvorm voor een eenvoudige projectie</li>
                </ul>
              </SupportCard>
              <SupportCard title="Niet alles zeker?" tone="soft">
                <p>
                  Geen probleem. Gebruik een realistische benadering en laat moeilijke details
                  voorlopig op de standaardlijn staan.
                </p>
              </SupportCard>
            </aside>
          </div>

          <div className="wizard-actions">
            <Button tone="primary" onClick={() => setStepIndex(1)}>
              <span>Volgende stap</span>
              <Icon name="chevronRight" size={16} />
            </Button>
          </div>
        </SectionCard>
      ) : null}

      {stepIndex === 1 ? (
        <SectionCard
          eyebrow="Stap 2 van 4"
          title={steps[1].title}
          subtitle={steps[1].subtitle}
          tone="blue"
        >
          <div className="step-layout">
            <div className="step-layout__main">
              <section className="step-block">
                <div className="step-block__header">
                  <h3>Gezin en nalatenschap</h3>
                  <p>
                    Kies eerst de gezinssituatie die het dichtst bij uw werkelijkheid ligt.
                    Fijnslijpen kan later.
                  </p>
                </div>
                <SegmentedControl
                  label="Partner meenemen"
                  value={String(state.hasPartner)}
                  options={[
                    { label: "Nee", value: "false" },
                    { label: "Ja", value: "true" },
                  ]}
                  explanation={termExplainers.partner.body}
                  explanationTitle={termExplainers.partner.title}
                  onChange={(value) => actions.setHasPartner(value === "true")}
                />

                {state.hasPartner ? (
                  <div className="wizard-subsection">
                    <SegmentedControl
                      label="Verdeling met partner"
                      value={state.partnerSharePercent === 0 ? "auto" : "custom"}
                      options={[
                        {
                          label: `Wettelijke verdeling (${Math.round(
                            100 / (state.childrenCount + 1),
                          )}%)`,
                          value: "auto",
                        },
                        { label: "Zelf instellen", value: "custom" },
                      ]}
                      explanation={termExplainers.partnerShare.body}
                      explanationTitle={termExplainers.partnerShare.title}
                      onChange={actions.setPartnerMode}
                    />

                    {state.partnerSharePercent > 0 ? (
                      <NumberField
                        id="partnerSharePercent"
                        label="Aandeel partner"
                        value={state.partnerSharePercent}
                        min={0}
                        max={100}
                        step={1}
                        suffix="%"
                        explanation={termExplainers.partnerShare.body}
                        explanationTitle={termExplainers.partnerShare.title}
                        onChange={(value) =>
                          actions.setNumericField("partnerSharePercent", value, {
                            min: 0,
                            max: 100,
                          })
                        }
                      />
                    ) : null}
                  </div>
                ) : null}
              </section>

              <section className="step-block">
                <div className="step-block__header">
                  <h3>Vooruitkijken</h3>
                  <p>
                    Hiermee bepaalt u hoeveel kinderen meedoen en tot welk jaar de vergelijking
                    doorrekent.
                  </p>
                </div>
                <div className="field-grid field-grid--family">
                  <NumberField
                    id="childrenCount"
                    label="Aantal kinderen"
                    value={state.childrenCount}
                    min={1}
                    max={8}
                    step={1}
                    explanation={termExplainers.childrenCount.body}
                    explanationTitle={termExplainers.childrenCount.title}
                    onChange={actions.setChildrenCount}
                  />
                  <NumberField
                    id="yearsToReview"
                    label="Aantal jaren vooruit"
                    value={state.yearsToReview}
                    min={1}
                    max={40}
                    step={1}
                    explanation={termExplainers.yearsToReview.body}
                    explanationTitle={termExplainers.yearsToReview.title}
                    onChange={(value) =>
                      actions.setNumericField("yearsToReview", value, { min: 1, max: 40 })
                    }
                  />
                </div>
              </section>

              <details className="advanced-panel">
                <summary>Verdeling kinderen aanpassen</summary>
                <p className="muted-copy">{termExplainers.childShares.body}</p>
                <div className="distribution-editor">
                  {model.inputs.childShares.map((share, index) => {
                    const priorGift = state.childPriorGifts?.[index] || null;
                    const hasPriorGift = priorGift !== null && priorGift !== undefined;
                    return (
                      <div
                        className="distribution-editor__item"
                        key={`child-share-${index + 1}`}
                      >
                        <label className="distribution-editor__label" htmlFor={`child-share-${index}`}>
                          Kind {index + 1}
                        </label>
                        <div className="distribution-editor__control">
                          <input
                            id={`child-share-${index}`}
                            type="range"
                            min="0"
                            max="100"
                            value={share}
                            onChange={(event) => actions.setChildShare(index, event.target.value)}
                          />
                          <span>{share}%</span>
                        </div>
                        <label className="distribution-editor__checkbox">
                          <input
                            type="checkbox"
                            checked={state.childLivesInHome?.[index] || false}
                            onChange={(event) => actions.setChildLivesInHome(index, event.target.checked)}
                          />
                          <span>Woont (of gaat wonen) in de woning</span>
                        </label>
                        <label className="distribution-editor__checkbox">
                          <input
                            type="checkbox"
                            checked={hasPriorGift}
                            onChange={(event) =>
                              actions.setChildPriorGift(
                                index,
                                event.target.checked
                                  ? { amount: 0, year: 2025, usedOneOff: false }
                                  : null,
                              )
                            }
                          />
                          <span>Eerder al geschonken aan dit kind</span>
                        </label>
                        {hasPriorGift ? (
                          <div className="prior-gift-fields">
                            <div className="prior-gift-fields__row">
                              <label>
                                <span className="prior-gift-fields__label">Bedrag</span>
                                <input
                                  type="number"
                                  className="prior-gift-fields__input"
                                  value={priorGift.amount || ""}
                                  placeholder="0"
                                  min="0"
                                  step="1000"
                                  onChange={(event) =>
                                    actions.setChildPriorGift(index, {
                                      ...priorGift,
                                      amount: Math.max(0, Number(event.target.value) || 0),
                                    })
                                  }
                                />
                              </label>
                              <label>
                                <span className="prior-gift-fields__label">Jaar</span>
                                <input
                                  type="number"
                                  className="prior-gift-fields__input"
                                  value={priorGift.year || ""}
                                  min="2000"
                                  max="2026"
                                  step="1"
                                  onChange={(event) =>
                                    actions.setChildPriorGift(index, {
                                      ...priorGift,
                                      year: Number(event.target.value) || 2025,
                                    })
                                  }
                                />
                              </label>
                            </div>
                            <label className="distribution-editor__checkbox">
                              <input
                                type="checkbox"
                                checked={priorGift.usedOneOff || false}
                                onChange={(event) =>
                                  actions.setChildPriorGift(index, {
                                    ...priorGift,
                                    usedOneOff: event.target.checked,
                                  })
                                }
                              />
                              <span>Eenmalige verhoogde vrijstelling al gebruikt</span>
                            </label>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <p className="muted-copy">{termExplainers.childLivesInHome.body}</p>
                <p className="muted-copy">{termExplainers.childPriorGifts.body}</p>
              </details>
            </div>

            <aside className="step-layout__aside">
              <SupportCard eyebrow="Uw invoer nu" title="Kort overzicht">
                <dl className="mini-summary">
                  <div>
                    <dt>Partner</dt>
                    <dd>{state.hasPartner ? "Ja" : "Nee"}</dd>
                  </div>
                  <div>
                    <dt>Kinderen</dt>
                    <dd>{state.childrenCount}</dd>
                  </div>
                  <div>
                    <dt>Peilmoment</dt>
                    <dd>{reviewYear}</dd>
                  </div>
                </dl>
              </SupportCard>
              <SupportCard title="Later nog verfijnen" tone="soft">
                <p>
                  De verdeling tussen kinderen en de woonsituatie per kind kunt u hieronder
                  aanpassen, maar voor een eerste vergelijking hoeft dat niet meteen.
                </p>
              </SupportCard>
            </aside>
          </div>

          <div className="wizard-actions">
            <Button onClick={() => setStepIndex(0)}>
              <Icon name="chevronLeft" size={16} />
              <span>Vorige stap</span>
            </Button>
            <Button tone="primary" onClick={() => setStepIndex(2)}>
              <span>Volgende stap</span>
              <Icon name="chevronRight" size={16} />
            </Button>
          </div>
        </SectionCard>
      ) : null}

      {stepIndex === 2 ? (
        <SectionCard
          eyebrow="Stap 3 van 4"
          title={steps[2].title}
          subtitle="Hier bepaalt u vooral de 2026-aannames voor vrijstellingen, aktekosten en belasting bij eigendomsoverdracht."
          tone="blue"
        >
          <div className="step-layout">
            <div className="step-layout__main">
              <section className="step-block">
                <div className="step-block__header">
                  <h3>Periode en uitgangspunten</h3>
                  <p>
                    Hiermee legt u vast hoe de woningwaarde ongeveer groeit en in welk jaar de
                    eenmalige overdracht wordt vergeleken.
                  </p>
                </div>
                <div className="field-grid field-grid--family">
                  <NumberField
                    id="annualGrowthRate"
                    label="Waardestijging per jaar"
                    value={state.annualGrowthRate}
                    step={0.25}
                    suffix="%"
                    explanation={termExplainers.annualGrowthRate.body}
                    explanationTitle={termExplainers.annualGrowthRate.title}
                    onChange={(value) =>
                      actions.setNumericField("annualGrowthRate", value, {
                        min: -10,
                        max: 15,
                      })
                    }
                  />
                  <NumberField
                    id="oneTimeTransferYear"
                    label="Jaar van de eenmalige schenking"
                    hint="Voor de route 'in 1 keer schenken'."
                    value={state.oneTimeTransferYear}
                    min={baseYear}
                    max={reviewYear}
                    step={1}
                    explanation={termExplainers.oneTimeTransferYear.body}
                    explanationTitle={termExplainers.oneTimeTransferYear.title}
                    onChange={(value) =>
                      actions.setNumericField("oneTimeTransferYear", value, {
                        min: baseYear,
                        max: reviewYear,
                      })
                    }
                  />
                </div>
              </section>

              <section className="step-block">
                <div className="step-block__header">
                  <h3>Bedrag om te vergelijken</h3>
                  <p>
                    Kies of de tool automatisch de vrijgestelde ruimte invult, of dat u zelf een
                    bedrag wilt testen.
                  </p>
                </div>
                <SegmentedControl
                  label="Bedrag voor 1 keer schenken"
                  value={state.targetTransferMode}
                  options={[
                    { label: "Automatisch invullen", value: "maxTaxFree" },
                    { label: "Zelf bedrag kiezen", value: "custom" },
                  ]}
                  explanation={termExplainers.targetTransferMode.body}
                  explanationTitle={termExplainers.targetTransferMode.title}
                  onChange={(value) => actions.setEnumField("targetTransferMode", value)}
                />

                {state.targetTransferMode === "custom" ? (
                  <div className="step-block step-block--soft">
                    <div className="step-block__header">
                      <h3>Zelf een bedrag kiezen</h3>
                      <p>
                        De grafiek laat de totale last zien bij verschillende schenkbedragen. Klik
                        een bedrag aan of vul het handmatig in.
                      </p>
                    </div>
                    {optimisation.optimum ? (
                      <p className="muted-copy">
                        In deze invoer ligt het gunstigste eenmalige schenkbedrag rond{" "}
                        <strong>{formatCurrency(optimisation.optimum.amount)}</strong>.
                      </p>
                    ) : null}
                    <OptimalTransferChart
                      points={optimisation.points}
                      optimum={optimisation.optimum}
                      onSelect={(amount) => actions.setNumericField("targetTransferValue", amount)}
                    />
                    <NumberField
                      id="targetTransferValue"
                      label="Zelf gekozen bedrag voor 1 keer schenken"
                      hint="Kies zelf een bedrag of neem een bedrag over uit de grafiek."
                      value={state.targetTransferValue}
                      step={1000}
                      suffix="EUR"
                      explanation={termExplainers.targetTransferValue.body}
                      explanationTitle={termExplainers.targetTransferValue.title}
                      onChange={(value) => actions.setNumericField("targetTransferValue", value)}
                    />
                  </div>
                ) : (
                  <SupportCard title="Automatisch bedrag actief" tone="success">
                    <p>
                      De tool vult automatisch{" "}
                      <strong>{formatCurrency(model.overview.oneTimeTaxFreeCapacity)}</strong> in.
                    </p>
                    <p className="muted-copy">
                      Dat is de optelsom van de vrijstelling <strong>per kind</strong> in het
                      gekozen jaar, voor zover ieder kind afzonderlijk aan de voorwaarden voldoet.
                    </p>
                  </SupportCard>
                )}
              </section>

              <div className="summary-grid">
                <SummaryCard
                  eyebrow="Doelbedrag in deze vergelijking"
                  title="Woningwaarde om te schenken"
                  value={formatCurrency(model.overview.plannedTransferValueTotal)}
                  note={`Route 'in 1 keer schenken' vergelijkt dit bedrag in ${state.oneTimeTransferYear}.`}
                  tone="default"
                />
                <SummaryCard
                  eyebrow="Jaarlijkse route"
                  title="Wat past binnen de gekozen jaren"
                  value={formatCurrency(model.overview.annualTransferCapacity)}
                  note={
                    model.overview.annualTransferShortfall > 0
                      ? `Dat is ${formatCurrency(
                          model.overview.annualTransferShortfall,
                        )} minder dan het doelbedrag.`
                      : "In deze invoer haalt de jaarlijkse route het doelbedrag."
                  }
                  tone="info"
                />
                <SummaryCard
                  eyebrow="Belastingvrije ruimte in het gekozen jaar"
                  title={
                    state.useOneOffGiftExemption
                      ? "Eenmalig hogere vrijstelling"
                      : "Gewone jaarlijkse vrijstelling"
                  }
                  value={formatCurrency(oneTimeFamilyExemption)}
                  note={`Bij ${state.childrenCount} ${state.childrenCount === 1 ? "kind" : "kinderen"} samen.`}
                  tone="success"
                />
              </div>

              <details className="advanced-panel">
            <summary>Geavanceerde aannames tonen</summary>
            <div className="field-grid">
              <NumberField
                id="mortgageInterestReliefRate"
                label="Maximaal HRA-tarief"
                hint="Laat dit staan als u niet precies weet welk tarief van toepassing is."
                value={state.mortgageInterestReliefRate}
                step={0.01}
                suffix="%"
                explanation={termExplainers.mortgageInterestReliefRate.body}
                explanationTitle={termExplainers.mortgageInterestReliefRate.title}
                onChange={(value) =>
                  actions.setNumericField("mortgageInterestReliefRate", value, {
                    min: 0,
                    max: 100,
                  })
                }
              />
              <NumberField
                id="annualGiftExemptionPerChild"
                label="Jaarlijkse vrijstelling per kind"
                value={state.annualGiftExemptionPerChild}
                step={1}
                suffix="EUR"
                explanation={termExplainers.annualGiftExemption.body}
                explanationTitle={termExplainers.annualGiftExemption.title}
                onChange={(value) =>
                  actions.setNumericField("annualGiftExemptionPerChild", value)
                }
              />
              <NumberField
                id="oneOffGiftExemptionPerChild"
                label="Eenmalig hogere vrijstelling per kind"
                value={state.oneOffGiftExemptionPerChild}
                step={1}
                suffix="EUR"
                explanation={termExplainers.oneOffGiftExemption.body}
                explanationTitle={termExplainers.oneOffGiftExemption.title}
                onChange={(value) =>
                  actions.setNumericField("oneOffGiftExemptionPerChild", value)
                }
              />
              <NumberField
                id="transferTaxRate"
                label="Overdrachtsbelasting"
                hint="Standaard 10,4% als kinderen de woning niet zelf gaan bewonen. Woont het kind er wel, dan rekent de tool met 2%."
                value={state.transferTaxRate}
                step={0.1}
                suffix="%"
                explanation={termExplainers.transferTaxRate.body}
                explanationTitle={termExplainers.transferTaxRate.title}
                onChange={(value) =>
                  actions.setNumericField("transferTaxRate", value, {
                    min: 0,
                    max: 20,
                  })
                }
              />
              <NumberField
                id="notaryCostPerTransfer"
                label="Notariskosten per overdrachtsakte"
                hint="Aanpasbare werkhypothese. Vraag voor een echte overdracht altijd een offerte op."
                value={state.notaryCostPerTransfer}
                step={50}
                suffix="EUR"
                explanation={termExplainers.notaryCostPerTransfer.body}
                explanationTitle={termExplainers.notaryCostPerTransfer.title}
                onChange={(value) =>
                  actions.setNumericField("notaryCostPerTransfer", value)
                }
              />
            </div>

            <SegmentedControl
              label={`Eenmalig hogere vrijstelling gebruiken in jaar ${state.oneTimeTransferYear}`}
              value={String(state.useOneOffGiftExemption)}
              options={[
                { label: "Nee", value: "false" },
                { label: "Ja", value: "true" },
              ]}
              explanation={termExplainers.useOneOffGiftExemption.body}
              explanationTitle={termExplainers.useOneOffGiftExemption.title}
              onChange={(value) =>
                actions.setBooleanField("useOneOffGiftExemption", value === "true")
              }
            />
          </details>

          {state.mortgageBalance > 0 ? (
            <Callout title="Let op bij een lopende hypotheek" tone="warning" icon="alert">
              Bij echte eigendomsoverdracht van een woning met hypotheek is vaak ook de bank aan
              zet. Deze tool rekent dat niet juridisch uit, maar laat alleen een eerste financiële
              vergelijking zien.
            </Callout>
          ) : null}

          <Callout title="Twijfelt u over een veld?" tone="info" icon="help">
            Laat onzekere geavanceerde aannames op de standaardwaarde staan. De tool is vooral
            bedoeld voor een eerste vergelijking, niet voor een definitieve aangifte of akte.
          </Callout>

            </div>

            <aside className="step-layout__aside">
              <SupportCard eyebrow="2026" title="Belastingvrije ruimte in deze invoer">
                <dl className="mini-summary">
                  <div>
                    <dt>Per kind per jaar</dt>
                    <dd>{formatCurrency(state.annualGiftExemptionPerChild)}</dd>
                  </div>
                  <div>
                    <dt>Gezin samen per jaar</dt>
                    <dd>{formatCurrency(annualFamilyExemption)}</dd>
                  </div>
                  <div>
                    <dt>Eenmalig hoger per kind</dt>
                    <dd>{formatCurrency(state.oneOffGiftExemptionPerChild)}</dd>
                  </div>
                </dl>
              </SupportCard>
              <SupportCard title="Belangrijk om te onthouden" tone="soft">
                <ul className="support-list">
                  <li>Bij een woning kan naast schenkbelasting ook overdrachtsbelasting spelen.</li>
                  <li>Jaarlijks schenken betekent meestal ook vaker een notariële akte.</li>
                  <li>De tool vergelijkt alleen de woning en rekent met vereenvoudigde aannames.</li>
                </ul>
              </SupportCard>
            </aside>
          </div>

          <div className="wizard-actions">
            <Button onClick={() => setStepIndex(1)}>
              <Icon name="chevronLeft" size={16} />
              <span>Vorige stap</span>
            </Button>
            <Button tone="primary" onClick={() => setStepIndex(3)}>
              <Icon name="calculator" size={16} />
              <span>Berekening maken</span>
            </Button>
          </div>
        </SectionCard>
      ) : null}

      {stepIndex === 3 ? (
        <div className="premium-modal-stage">
          <div
            className={`premium-modal-stage__content ${
              isPremiumLocked ? "is-blurred" : ""
            }`.trim()}
            aria-hidden={isPremiumLocked}
          >
            <section className="results-spotlight">
              <div className="results-spotlight__main">
                <p className="intro-band__eyebrow">Stap 4 van 4</p>
                <h2>Uw eerste vergelijking staat klaar</h2>
                <p>
                  U ziet hieronder eerst de hoofdlijn. Daarna kunt u per route rustig openen waar
                  de bedragen vandaan komen.
                </p>
              </div>
              <div className="summary-grid">
                <SummaryCard
                  eyebrow="Laagste directe lasten"
                  title={bestScenario.title}
                  value={formatCurrency(model.scenarios[bestScenarioId].directBurden)}
                  note={`Peilmoment ${reviewYear}.`}
                  tone="success"
                />
                <SummaryCard
                  eyebrow="Mogelijke besparing"
                  title="Ten opzichte van niets doen"
                  value={
                    premiumOffer.hasEstimatedSaving
                      ? formatCurrency(premiumOffer.estimatedSaving)
                      : "Geen"
                  }
                  note={
                    premiumOffer.hasEstimatedSaving
                      ? "Zichtbaar zonder meteen de volledige verdieping te openen."
                      : "In deze invoer ligt er geen lagere route dan niets doen."
                  }
                  tone="info"
                />
                <SummaryCard
                  eyebrow="Vergelijking gebruikt"
                  title="Woningwaarde om te schenken"
                  value={formatCurrency(model.overview.plannedTransferValueTotal)}
                  note={`U bekijkt nu ${selectedScenario.title.toLowerCase()}.`}
                  tone="default"
                />
              </div>
            </section>

            <SectionCard
              eyebrow="Hoofduitkomst"
              title="Kies een route en open daarna de opbouw"
              subtitle="Directe lasten bestaan hier uit erfbelasting op het resterende deel plus, als u tijdens leven overdraagt, overdrachtsbelasting, schenkbelasting en notariskosten."
              tone="green"
            >
              {premiumAccess.message ? (
                <Callout
                  title={premiumAccess.message.title}
                  tone={premiumAccess.message.tone}
                  icon={premiumAccess.message.tone === "success" ? "check" : "alert"}
                >
                  <p>{premiumAccess.message.body}</p>
                </Callout>
              ) : null}

              {premiumAccess.isUnlocked ? (
                <Callout title="Uitgebreid rapport actief" tone="success" icon="check">
                  <p>
                    Uw uitgebreide rapport is al vrijgeschakeld op dit apparaat. U kunt hieronder de
                    volledige details openen en als PDF bewaren.
                  </p>
                </Callout>
              ) : null}

              <div className="wizard-actions wizard-actions--spread">
                <Button onClick={() => setStepIndex(2)}>
                  <Icon name="chevronLeft" size={16} />
                  <span>Gegevens aanpassen</span>
                </Button>
              </div>
            </SectionCard>

            <ScenarioComparison state={state} model={model} actions={actions} />

            {premiumAccess.isUnlocked ? (
              <PremiumReport state={state} model={model} />
            ) : (
              <ScenarioDetail selectedScenarioId={state.selectedScenarioId} model={model} />
            )}
          </div>

          {isPremiumLocked ? (
            <div className="premium-modal-stage__overlay">
              <PremiumGate
                offer={gateOffer}
                originalPriceMinor={premiumOffer.basePriceMinor}
                finalPriceMinor={finalPriceMinor}
                discountLabel={promoResult?.label || ""}
                promoCode={promoCode}
                onPromoCodeChange={setPromoCode}
                onApplyPromoCode={applyPromoCode}
                promoFeedback={promoFeedback}
                isApplyingPromo={isApplyingPromo}
                onCheckout={startPremiumCheckout}
                isProcessingCheckout={isProcessingCheckout}
                statusMessage={checkoutMessage}
                onEditInputs={() => setStepIndex(2)}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
