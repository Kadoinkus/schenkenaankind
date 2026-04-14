import { formatCurrency } from "../../lib/formatters.js";
import Badge from "../../components/ui/Badge.jsx";
import Callout from "../../components/ui/Callout.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Icon from "../../components/ui/Icon.jsx";
import KeyValueList from "../../components/ui/KeyValueList.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import { scenarioMetaById } from "./scenarioMeta.js";

function buildTimelineConfig(scenarioId, model) {
  if (scenarioId === "doNothing") {
    return {
      columns: [
        { key: "year", label: "Jaar" },
        { key: "futureHomeValue", label: "WOZ-waarde" },
        { key: "futureMortgageBalance", label: "Hypotheek" },
        { key: "futureEquity", label: "Overwaarde" },
        { key: "annualMortgageRelief", label: "HRA per jaar", tone: "green" },
        { key: "childBox3PerYear", label: "Box 3 kinderen", tone: "blue" },
        { key: "inheritanceTaxAtDeath", label: "Erfbelasting", tone: "red" },
      ],
      rows: model.scenarios.doNothing.timeline.map((row) => ({
        ...row,
        futureHomeValue: formatCurrency(row.futureHomeValue),
        futureMortgageBalance: formatCurrency(row.futureMortgageBalance),
        futureEquity: formatCurrency(row.futureEquity),
        annualMortgageRelief: formatCurrency(row.annualMortgageRelief),
        childBox3PerYear: formatCurrency(row.childBox3PerYear),
        inheritanceTaxAtDeath: formatCurrency(row.inheritanceTaxAtDeath),
      })),
      footer: (
        <>
          Totale hypotheekrenteaftrek in deze periode:{" "}
          <strong>{formatCurrency(model.scenarios.doNothing.extraCashFlows.cumulativeMortgageRelief)}</strong>.
          Kinderen hebben in dit scenario geen box 3-positie uit de woning.
        </>
      ),
    };
  }

  if (scenarioId === "stak") {
    return {
      columns: [
        { key: "year", label: "Jaar" },
        { key: "futureHomeValue", label: "WOZ-waarde" },
        { key: "giftedNominal", label: "Nominaal overgedragen" },
        { key: "annualMortgageReliefLoss", label: "Verlies HRA", tone: "red" },
        { key: "box3PerYear", label: "Box 3 per jaar", tone: "blue" },
        { key: "directBurdenAtDeath", label: "Directe lasten", tone: "amber" },
      ],
      rows: model.scenarios.stak.timeline.map((row) => ({
        ...row,
        futureHomeValue: formatCurrency(row.futureHomeValue),
        giftedNominal: formatCurrency(row.giftedNominal),
        annualMortgageReliefLoss: formatCurrency(row.annualMortgageReliefLoss),
        box3PerYear: formatCurrency(row.box3PerYear),
        directBurdenAtDeath: formatCurrency(row.directBurdenAtDeath),
      })),
      footer: (
        <>
          Totaal verlies hypotheekrenteaftrek:{" "}
          <strong>{formatCurrency(model.scenarios.stak.extraCashFlows.cumulativeMortgageReliefLoss)}</strong>{" "}
          · Totaal box 3 kinderen:{" "}
          <strong>{formatCurrency(model.scenarios.stak.extraCashFlows.cumulativeBox3)}</strong>.
        </>
      ),
    };
  }

  return {
    columns: [
      { key: "year", label: "Jaar" },
      { key: "futureHomeValue", label: "WOZ-waarde" },
      { key: "giftedNominal", label: "Papieren schuld" },
      { key: "annualInterest", label: "Rente per jaar", tone: "amber" },
      { key: "monthlyInterest", label: "Rente per maand", tone: "amber" },
      { key: "box3PerYear", label: "Box 3 per jaar", tone: "blue" },
      { key: "annualMortgageRelief", label: "HRA per jaar", tone: "green" },
      { key: "directBurdenAtDeath", label: "Directe lasten", tone: "green" },
      { key: "savingVsDoNothing", label: "Besparing t.o.v. niets doen", tone: "green" },
    ],
    rows: model.scenarios.paperGift.timeline.map((row) => ({
      ...row,
      futureHomeValue: formatCurrency(row.futureHomeValue),
      giftedNominal: formatCurrency(row.giftedNominal),
      annualInterest: formatCurrency(row.annualInterest),
      monthlyInterest: formatCurrency(row.monthlyInterest),
      box3PerYear: formatCurrency(row.box3PerYear),
      annualMortgageRelief: formatCurrency(row.annualMortgageRelief),
      directBurdenAtDeath: formatCurrency(row.directBurdenAtDeath),
      savingVsDoNothing: formatCurrency(row.savingVsDoNothing),
      savingVsDoNothingEmphasis: true,
    })),
    footer: (
      <>
        Totaal rente ouder naar kinderen:{" "}
        <strong>{formatCurrency(model.scenarios.paperGift.extraCashFlows.cumulativeInterest)}</strong>{" "}
        · Totaal box 3 kinderen:{" "}
        <strong>{formatCurrency(model.scenarios.paperGift.extraCashFlows.cumulativeBox3)}</strong>.
      </>
    ),
  };
}

export default function ScenarioDetail({ selectedScenarioId, model }) {
  const meta = scenarioMetaById[selectedScenarioId];
  const scenario = model.scenarios[selectedScenarioId];
  const timelineConfig = buildTimelineConfig(selectedScenarioId, model);

  return (
    <SectionCard
      eyebrow="Stap 3"
      title={meta.title}
      subtitle={meta.summary}
      tone={meta.tone}
      actions={<Badge tone={meta.tone}>{meta.shortLabel}</Badge>}
    >
      <div className="scenario-header">
        <div className="scenario-header__lead">
          <Icon name={meta.icon} size={22} />
          <div>
            <p>{meta.suitableFor}</p>
            <p className="muted-copy">{meta.watchout}</p>
          </div>
        </div>
        <div className="scenario-header__stats">
          <div>
            <span>Directe lasten</span>
            <strong>{formatCurrency(scenario.directBurden)}</strong>
          </div>
          <div>
            <span>Waarvan directe kosten</span>
            <strong>{formatCurrency(scenario.directCosts)}</strong>
          </div>
        </div>
      </div>

      {selectedScenarioId === "stak" ? (
        <Callout title="Extra aandacht" tone="warning" icon="alert">
          In dit scenario is de combinatie van overdrachtsbelasting, notariële kosten, box 3 en het
          verlies van hypotheekrenteaftrek vaak bepalend voor de uitkomst.
        </Callout>
      ) : null}

      {selectedScenarioId === "paperGift" ? (
        <Callout title="Jaarlijkse verplichting" tone="success" icon="check">
          Een papieren schenking werkt alleen zoals bedoeld als de jaarlijkse rente ook echt wordt
          betaald en goed wordt vastgelegd.
        </Callout>
      ) : null}

      {model.overview.partnerDetailAtReview ? (
        <div className="detail-grid detail-grid--partner">
          <article className="detail-card detail-card--partner">
            <h3>Partner</h3>
            <KeyValueList
              rows={[
                {
                  label: "Bruto aandeel na de gekozen periode",
                  value: formatCurrency(model.overview.partnerDetailAtReview.grossShare),
                },
                {
                  label: "Belastbare grondslag",
                  value: formatCurrency(model.overview.partnerDetailAtReview.taxableShare),
                },
                {
                  label: "Erfbelasting partner",
                  value: formatCurrency(model.overview.partnerDetailAtReview.tax),
                  tone: model.overview.partnerDetailAtReview.tax > 0 ? "red" : "green",
                  emphasis: true,
                },
              ]}
            />
          </article>
        </div>
      ) : null}

      <div className="detail-grid">
        {scenario.children.map((child) => (
          <article className="detail-card" key={child.id}>
            <div className="detail-card__header">
              <h3>{child.label}</h3>
              <Badge tone="blue">{child.sharePercent}%</Badge>
            </div>
            <KeyValueList
              rows={[
                {
                  label: "Bruto aandeel na de gekozen periode",
                  value: formatCurrency(child.grossShareAtReview),
                },
                {
                  label: "Al eerder overgedragen",
                  value: formatCurrency(child.giftedNominal),
                },
                {
                  label: "Erfbelasting",
                  value: formatCurrency(child.inheritanceTax),
                  tone: "red",
                },
                {
                  label: "Directe kosten",
                  value: formatCurrency(child.directCostShare),
                  tone: "amber",
                },
                {
                  label: "Netto in deze vergelijking",
                  value: formatCurrency(child.projectedNetOutcome),
                  tone: "green",
                  emphasis: true,
                },
              ]}
            />
          </article>
        ))}
      </div>

      <div className="stat-grid">
        <div className="metric-banner metric-banner--blue">
          <span>Directe lasten in de vergelijking</span>
          <strong>{formatCurrency(scenario.directBurden)}</strong>
        </div>
        <div className="metric-banner metric-banner--neutral">
          <span>Alleen erfbelasting in dit scenario</span>
          <strong>{formatCurrency(scenario.inheritanceTaxOnly)}</strong>
        </div>
      </div>

      <DataTable
        title="Tijdlijn per jaar"
        columns={timelineConfig.columns}
        rows={timelineConfig.rows}
        footer={timelineConfig.footer}
      />
    </SectionCard>
  );
}
