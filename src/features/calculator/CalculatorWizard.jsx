import { useMemo, useState } from "react";
import { termExplainers } from "../../content/copy.js";
import { formatCurrency } from "../../lib/formatters.js";
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

export default function CalculatorWizard({ calculator }) {
  const { state, model, actions, mortgageTypes } = calculator;
  const [stepIndex, setStepIndex] = useState(0);
  const annualFamilyExemption = state.annualGiftExemptionPerChild * state.childrenCount;
  const oneTimeExemptionPerChild = state.useOneOffGiftExemption
    ? state.oneOffGiftExemptionPerChild
    : state.annualGiftExemptionPerChild;
  const oneTimeFamilyExemption = oneTimeExemptionPerChild * state.childrenCount;

  const optimisation = useMemo(
    () => findOptimalTransferAmount(state),
    [state],
  );

  const bestScenarioId = useMemo(() => {
    return Object.values(model.scenarios).sort((a, b) => a.directBurden - b.directBurden)[0].id;
  }, [model.scenarios]);

  const bestScenario = scenarioMetaById[bestScenarioId];
  const selectedScenario = scenarioMetaById[state.selectedScenarioId];

  return (
    <div className="page-stack" id="berekening">
      <section className="wizard-intro">
        <div>
          <p className="intro-band__eyebrow">Berekening</p>
          <h1>Stap voor stap naar een eerste vergelijking</h1>
          <p className="hero__lead">
            U hoeft niet alles tegelijk te begrijpen. Vul per stap alleen in wat u weet.
          </p>
        </div>
      </section>

      <Stepper stepIndex={stepIndex} onStepClick={setStepIndex} />

      {stepIndex === 0 ? (
        <SectionCard
          eyebrow="Stap 1 van 4"
          title={steps[0].title}
          subtitle="De tool gaat uit van nu, dus van 2026. Gebruik daarom hier uw WOZ-waarde 2026 als startpunt."
          tone="blue"
        >
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

          <details className="advanced-panel">
            <summary>Verdeling kinderen aanpassen</summary>
            <p className="muted-copy">{termExplainers.childShares.body}</p>
            <div className="distribution-editor">
              {model.inputs.childShares.map((share, index) => (
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
                </div>
              ))}
            </div>
            <p className="muted-copy">{termExplainers.childLivesInHome.body}</p>
          </details>

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
            <>
              <Callout title="Wat is het gunstigste bedrag?" tone="info" icon="chart">
                <p>
                  De grafiek hieronder toont de <strong>totale last</strong> (erfbelasting +
                  directe kosten + box 3 + verlies hypotheekrenteaftrek) bij verschillende
                  schenkbedragen. Het groene punt markeert het bedrag met de laagste totale last.
                </p>
                {optimisation.optimum ? (
                  <p className="muted-copy">
                    In deze invoer is het gunstigste eenmalige schenkbedrag circa{" "}
                    <strong>{formatCurrency(optimisation.optimum.amount)}</strong> met een totale
                    last van{" "}
                    <strong>{formatCurrency(optimisation.optimum.totalBurden)}</strong>.
                  </p>
                ) : null}
              </Callout>

              <OptimalTransferChart
                points={optimisation.points}
                optimum={optimisation.optimum}
                onSelect={(amount) => actions.setNumericField("targetTransferValue", amount)}
              />

              <NumberField
                id="targetTransferValue"
                label="Zelf gekozen bedrag voor 1 keer schenken"
                hint="Kies zelf een bedrag of klik op de grafiek om een bedrag over te nemen."
                value={state.targetTransferValue}
                step={1000}
                suffix="EUR"
                explanation={termExplainers.targetTransferValue.body}
                explanationTitle={termExplainers.targetTransferValue.title}
                onChange={(value) => actions.setNumericField("targetTransferValue", value)}
              />
            </>
          ) : (
            <Callout title="Automatisch berekend bedrag" tone="success" icon="check">
              <p>
                De tool vult hier automatisch{" "}
                <strong>{formatCurrency(model.overview.oneTimeTaxFreeCapacity)}</strong> in.
              </p>
              <p className="muted-copy">
                Dat is in deze invoer{" "}
                <strong>
                  {state.childrenCount} x {formatCurrency(oneTimeExemptionPerChild)}
                </strong>
                : de optelsom van de vrijstelling <strong>per kind</strong>. Dit geldt alleen als
                ieder kind afzonderlijk aan de voorwaarden voldoet.
              </p>
            </Callout>
          )}

          <NumberField
            id="oneTimeTransferYear"
            label="Jaar van de eenmalige schenking"
            hint="Voor de route 'in 1 keer schenken'. Gebruikt u de eenmalig hogere vrijstelling, dan gebruikt de tool dit jaar ook in de jaarlijkse route."
            value={state.oneTimeTransferYear}
            min={model.overview.baseYear}
            max={model.overview.lastReviewYear}
            step={1}
            explanation={termExplainers.oneTimeTransferYear.body}
            explanationTitle={termExplainers.oneTimeTransferYear.title}
            onChange={(value) =>
              actions.setNumericField("oneTimeTransferYear", value, {
                min: model.overview.baseYear,
                max: model.overview.lastReviewYear,
              })
            }
          />

          <Callout title="Wat mag meestal belastingvrij in 2026?" tone="info" icon="help">
            <p>
              Ouders samen tellen voor de schenkbelasting als <strong>1 schenker</strong>. Bij{" "}
              {state.childrenCount} {state.childrenCount === 1 ? "kind" : "kinderen"} is de gewone
              jaarlijkse ruimte daarom meestal{" "}
              <strong>{formatCurrency(annualFamilyExemption)}</strong> totaal per kalenderjaar.
            </p>
            {state.useOneOffGiftExemption ? (
              <p className="muted-copy">
                Gebruikt u de eenmalig hogere vrijstelling, dan rekent de tool in jaar{" "}
                <strong>{state.oneTimeTransferYear}</strong> met{" "}
                <strong>{formatCurrency(state.oneOffGiftExemptionPerChild)}</strong> per kind. Bij{" "}
                {state.childrenCount} {state.childrenCount === 1 ? "kind" : "kinderen"} is dat{" "}
                <strong>{formatCurrency(oneTimeFamilyExemption)}</strong> totaal, als ieder kind
                afzonderlijk aan de voorwaarden voldoet. Die hogere vrijstelling vervangt dan de
                gewone jaarlijkse vrijstelling van dat jaar.
              </p>
            ) : (
              <p className="muted-copy">
                Zonder eenmalig hogere vrijstelling rekent de tool in jaar{" "}
                <strong>{state.oneTimeTransferYear}</strong> met{" "}
                <strong>{formatCurrency(state.annualGiftExemptionPerChild)}</strong> per kind. Bij{" "}
                {state.childrenCount} {state.childrenCount === 1 ? "kind" : "kinderen"} is dat{" "}
                <strong>{formatCurrency(annualFamilyExemption)}</strong> totaal in dat kalenderjaar.
              </p>
            )}
            <p className="muted-copy">
              Schenkt u meer woningwaarde dan deze ruimte, dan kan{" "}
              <strong>schenkbelasting</strong> ontstaan over het meerdere. Bij een woning kan
              daarnaast ook nog <strong>overdrachtsbelasting</strong> spelen.
            </p>
          </Callout>

          <Callout title="Wilt u 1 keer binnen de vrijstelling vergelijken?" tone="success" icon="check">
            <p>
              Kies dan als doelbedrag maximaal{" "}
              <strong>{formatCurrency(oneTimeFamilyExemption)}</strong> voor jaar{" "}
              <strong>{state.oneTimeTransferYear}</strong>.
            </p>
            <p className="muted-copy">
              Dan rekent de tool die eenmalige schenking binnen de schenkbelastingvrijstelling.
              Let op: overdrachtsbelasting, notaris en hypotheekgevolgen kunnen dan nog steeds
              meespelen.
            </p>
          </Callout>

          <Callout title="Wat vergelijkt de tool nu precies?" tone="info" icon="book">
            <p>
              De route <strong>in 1 keer schenken</strong> gebruikt{" "}
              <strong>{formatCurrency(model.overview.plannedTransferValueTotal)}</strong> aan
              woningwaarde in <strong>jaar {state.oneTimeTransferYear}</strong> in 1 akte.
            </p>
            <p className="muted-copy">
              De route <strong>jaarlijks een deel schenken</strong> kan binnen de gekozen{" "}
              {state.yearsToReview} jaar ongeveer{" "}
              <strong>{formatCurrency(model.overview.annualTransferCapacity)}</strong> overdragen.
              {model.overview.annualTransferShortfall > 0
                ? ` Dat is dus minder dan uw gekozen doelbedrag van ${formatCurrency(
                    model.overview.plannedTransferValueTotal,
                  )}.`
                : " In deze invoer haalt de jaarlijkse route het gekozen doelbedrag."}
            </p>
            <p className="muted-copy">
              Van dat gekozen doelbedrag kijkt de tool eerst welk deel binnen de ingevulde
              schenkruimte past. Alleen over het meerdere kan schenkbelasting ontstaan. De tool
              rekent die dan mee.
              {state.useOneOffGiftExemption
                ? ` In jaar ${state.oneTimeTransferYear} gebruikt deze berekening in plaats daarvan ${formatCurrency(
                    state.oneOffGiftExemptionPerChild,
                  )} per kind, dus ${formatCurrency(oneTimeFamilyExemption)} totaal bij ${state.childrenCount} ${
                    state.childrenCount === 1 ? "kind" : "kinderen"
                  }, als ieder kind afzonderlijk aan de voorwaarden voldoet.`
                : ""}
            </p>
          </Callout>

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
        <>
          <SectionCard
            eyebrow="Stap 4 van 4"
            title="Hoofduitkomst"
            subtitle="Dit is geen advies, maar wel een duidelijke eerste richting voor het schenken van woningeigendom binnen deze vereenvoudigde vergelijking."
            tone="green"
          >
            <Callout
              title={`Laagste directe lasten in deze berekening: ${bestScenario.title}`}
              tone="success"
              icon={bestScenario.icon}
            >
              <p>
                In deze invoer komt <strong>{bestScenario.title.toLowerCase()}</strong> uit op de
                laagste directe lasten: <strong>{formatCurrency(model.scenarios[bestScenarioId].directBurden)}</strong>.
              </p>
              <p className="muted-copy">
                U bekijkt nu <strong>{selectedScenario.title.toLowerCase()}</strong>. Kies hieronder
                gerust een andere route om te vergelijken.
              </p>
              <p className="muted-copy">
                Deze vergelijking gebruikt een doelbedrag van{" "}
                <strong>{formatCurrency(model.overview.plannedTransferValueTotal)}</strong> aan
                woningwaarde.
              </p>
            </Callout>

            <div className="wizard-actions wizard-actions--spread">
              <Button onClick={() => setStepIndex(2)}>
                <Icon name="chevronLeft" size={16} />
                <span>Gegevens aanpassen</span>
              </Button>
            </div>
          </SectionCard>

          <ScenarioComparison
            state={state}
            model={model}
            actions={actions}
          />

          <ScenarioDetail
            selectedScenarioId={state.selectedScenarioId}
            model={model}
          />

          <SectionCard
            eyebrow="Begrippen uitgelegd"
            title="Open alleen de uitleg die u nodig hebt"
          >
            <div className="faq-list">
              {[
                termExplainers.mortgageInterestReliefRate,
                termExplainers.oneTimeTransfer,
                termExplainers.annualTransfer,
                termExplainers.transferTaxRate,
                termExplainers.notaryCostPerTransfer,
                termExplainers.box3,
              ].map((item) => (
                <AccordionItem key={item.title} title={item.title}>
                  <p>{item.body}</p>
                </AccordionItem>
              ))}
            </div>
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
