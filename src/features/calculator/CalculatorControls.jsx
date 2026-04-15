import { formatCurrency, formatPercent } from "../../lib/formatters.js";
import Callout from "../../components/ui/Callout.jsx";
import NumberField from "../../components/ui/NumberField.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import SegmentedControl from "../../components/ui/SegmentedControl.jsx";
import StatTile from "../../components/ui/StatTile.jsx";

export default function CalculatorControls({
  state,
  model,
  actions,
  mortgageTypes,
}) {
  const { inputs, overview } = model;
  const partnerIsAuto = state.partnerSharePercent === 0;

  return (
    <SectionCard
      eyebrow="Stap 1"
      title="Uw situatie"
      subtitle="Vul de aannames in die u wilt vergelijken. Alle uitkomsten hieronder bewegen direct mee."
      actions={
        <button type="button" className="link-button" onClick={actions.reset}>
          Herstel standaardwaarden
        </button>
      }
    >
      <div className="field-grid">
        <NumberField
          id="homeValue"
          label="WOZ-waarde"
          value={state.homeValue}
          step={1000}
          suffix="EUR"
          onChange={(value) => actions.setNumericField("homeValue", value)}
        />
        <NumberField
          id="mortgageBalance"
          label="Resterende hypotheek"
          value={state.mortgageBalance}
          step={1000}
          suffix="EUR"
          onChange={(value) => actions.setNumericField("mortgageBalance", value)}
        />
        <NumberField
          id="mortgageInterestRate"
          label="Hypotheekrente"
          value={state.mortgageInterestRate}
          step={0.1}
          suffix="%"
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
          onChange={(value) => actions.setNumericField("monthlyMortgageCost", value)}
        />
        <NumberField
          id="annualGrowthRate"
          label="Waardestijging per jaar"
          value={state.annualGrowthRate}
          step={0.25}
          suffix="%"
          onChange={(value) =>
            actions.setNumericField("annualGrowthRate", value, {
              min: -10,
              max: 15,
            })
          }
        />
        <NumberField
          id="mortgageInterestReliefRate"
          label="Maximaal HRA-tarief"
          hint="Standaard staat dit op het tarief uit 2026."
          value={state.mortgageInterestReliefRate}
          step={0.01}
          suffix="%"
          onChange={(value) =>
            actions.setNumericField("mortgageInterestReliefRate", value, {
              min: 0,
              max: 100,
            })
          }
        />
      </div>

      <div className="controls-row">
        <SegmentedControl
          label="Hypotheekvorm"
          value={state.mortgageType}
          options={[
            { label: "Aflossingsvrij", value: mortgageTypes.interestOnly },
            { label: "Annuiteit", value: mortgageTypes.annuity },
          ]}
          onChange={actions.setMortgageType}
        />
        <SegmentedControl
          label="Partner meenemen"
          value={String(state.hasPartner)}
          options={[
            { label: "Nee", value: "false" },
            { label: "Ja", value: "true" },
          ]}
          onChange={(value) => actions.setHasPartner(value === "true")}
        />
      </div>

      {state.hasPartner ? (
        <Callout title="Verdeling met partner" tone="info" icon="shield">
          <div className="callout-stack">
            <div className="controls-row controls-row--tight">
              <SegmentedControl
                label="Verdelingsmodus"
                value={partnerIsAuto ? "auto" : "custom"}
                options={[
                  {
                    label: `Wettelijke verdeling (${Math.round(
                      100 / (inputs.childrenCount + 1),
                    )}%)`,
                    value: "auto",
                  },
                  { label: "Zelf instellen", value: "custom" },
                ]}
                onChange={actions.setPartnerMode}
              />
              {!partnerIsAuto ? (
                <NumberField
                  id="partnerSharePercent"
                  label="Aandeel partner"
                  value={state.partnerSharePercent}
                  min={0}
                  max={100}
                  step={1}
                  suffix="%"
                  onChange={(value) =>
                    actions.setNumericField("partnerSharePercent", value, {
                      min: 0,
                      max: 100,
                    })
                  }
                />
              ) : null}
            </div>
            <p className="muted-copy">
              Partner: {formatPercent(inputs.partnerSharePercent)}% (
              {formatCurrency(overview.partnerDetailAtReview?.grossShare || 0)}) · Kinderen
              samen: {formatPercent(inputs.childrenSharePercent)}% (
              {formatCurrency(overview.childrenPoolAtReview)})
            </p>
          </div>
        </Callout>
      ) : null}

      <div className="field-grid field-grid--family">
        <NumberField
          id="childrenCount"
          label="Aantal kinderen"
          value={state.childrenCount}
          min={1}
          max={10}
          step={1}
          onChange={actions.setChildrenCount}
        />
        <NumberField
          id="yearsToReview"
          label="Aantal jaren vooruit"
          value={state.yearsToReview}
          min={1}
          max={40}
          step={1}
          onChange={(value) =>
            actions.setNumericField("yearsToReview", value, { min: 1, max: 40 })
          }
        />
      </div>

      <div className="distribution-editor">
        {inputs.childShares.map((share, index) => (
          <label className="distribution-editor__item" key={`child-share-${index + 1}`}>
            <span className="distribution-editor__label">Kind {index + 1}</span>
            <div className="distribution-editor__control">
              <input
                type="range"
                min="0"
                max="100"
                value={share}
                onChange={(event) => actions.setChildShare(index, event.target.value)}
              />
              <span>{formatPercent(share)}%</span>
            </div>
          </label>
        ))}
      </div>

      <div className="stat-grid">
        <StatTile label="Overwaarde nu" value={formatCurrency(overview.currentEquity)} />
        <StatTile
          label={`Overwaarde na ${inputs.yearsToReview} jaar`}
          value={formatCurrency(overview.reviewEquity)}
          tone="blue"
        />
        <StatTile
          label="Hypotheekrenteaftrek per jaar"
          value={formatCurrency(overview.annualMortgageRelief)}
          tone="green"
        />
        <StatTile
          label="Verdeling kinderen"
          value={inputs.childShares.map((share) => `${formatPercent(share)}%`).join(" / ")}
          tone="neutral"
        />
      </div>
    </SectionCard>
  );
}
