import { useMemo, useState } from "react";
import { termExplainers } from "../../content/copy.js";
import { formatCurrency } from "../../lib/formatters.js";
import AccordionItem from "../../components/ui/AccordionItem.jsx";
import Button from "../../components/ui/Button.jsx";
import Callout from "../../components/ui/Callout.jsx";
import Icon from "../../components/ui/Icon.jsx";
import NumberField from "../../components/ui/NumberField.jsx";
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
          subtitle={steps[0].subtitle}
          tone="blue"
        >
          <div className="field-grid">
            <NumberField
              id="homeValue"
              label="WOZ-waarde"
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
                <label
                  className="distribution-editor__item"
                  key={`child-share-${index + 1}`}
                >
                  <span className="distribution-editor__label">Kind {index + 1}</span>
                  <div className="distribution-editor__control">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={share}
                      onChange={(event) => actions.setChildShare(index, event.target.value)}
                    />
                    <span>{share}%</span>
                  </div>
                </label>
              ))}
            </div>
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
          subtitle={steps[2].subtitle}
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

          <details className="advanced-panel">
            <summary>Geavanceerde aannames tonen</summary>
            <div className="field-grid field-grid--family">
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
            </div>
          </details>

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
            subtitle="Dit is geen advies, maar wel een duidelijke eerste richting binnen deze vereenvoudigde vergelijking."
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
                termExplainers.stak,
                termExplainers.paperGift,
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
