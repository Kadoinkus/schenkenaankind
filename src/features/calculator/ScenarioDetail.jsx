import { formatCurrency } from "../../lib/formatters.js";
import Badge from "../../components/ui/Badge.jsx";
import Callout from "../../components/ui/Callout.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Icon from "../../components/ui/Icon.jsx";
import KeyValueList from "../../components/ui/KeyValueList.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import ExplainedLabel from "../../components/ui/ExplainedLabel.jsx";
import { termExplainers } from "../../content/copy.js";
import { scenarioMetaById } from "./scenarioMeta.js";

function buildDirectBreakdownRows(scenarioId, scenario) {
  const rows = [
    {
      label: "Erfbelasting op resterende nalatenschap",
      value: formatCurrency(scenario.inheritanceTaxOnly),
      tone: scenario.inheritanceTaxOnly > 0 ? "red" : "green",
      explanation: termExplainers.inheritanceTaxOnly.body,
      explanationTitle: termExplainers.inheritanceTaxOnly.title,
    },
  ];

  if (scenarioId !== "doNothing") {
    rows.unshift(
      {
        label: "Notariskosten",
        value: formatCurrency(scenario.extraCashFlows.cumulativeNotaryCosts),
        tone: "amber",
        explanation: termExplainers.notaryCostsTotal.body,
        explanationTitle: termExplainers.notaryCostsTotal.title,
      },
      {
        label: "Schenkbelasting",
        value: formatCurrency(scenario.extraCashFlows.cumulativeGiftTax),
        tone: scenario.extraCashFlows.cumulativeGiftTax > 0 ? "red" : "green",
        explanation: termExplainers.giftTaxTotal.body,
        explanationTitle: termExplainers.giftTaxTotal.title,
      },
      {
        label: "Overdrachtsbelasting",
        value: formatCurrency(scenario.extraCashFlows.cumulativeTransferTax),
        tone: scenario.extraCashFlows.cumulativeTransferTax > 0 ? "amber" : "green",
        explanation: termExplainers.transferTaxTotal.body,
        explanationTitle: termExplainers.transferTaxTotal.title,
      },
    );
  }

  rows.push({
    label: "Totaal directe lasten",
    value: formatCurrency(scenario.directBurden),
    emphasis: true,
    explanation: termExplainers.directBurden.body,
    explanationTitle: termExplainers.directBurden.title,
  });

  return rows;
}

function buildSideEffectRows(scenarioId, scenario) {
  if (scenarioId === "doNothing") {
    return [
      {
        label: "Box 3 bij kinderen in deze periode",
        value: formatCurrency(0),
        tone: "green",
        explanation: termExplainers.box3.body,
        explanationTitle: termExplainers.box3.title,
      },
      {
        label: "Hypotheekrenteaftrek in deze periode",
        value: formatCurrency(scenario.extraCashFlows.cumulativeMortgageRelief),
        tone: "blue",
        explanation: termExplainers.mortgageReliefKept.body,
        explanationTitle: termExplainers.mortgageReliefKept.title,
      },
    ];
  }

  return [
    {
      label: "Box 3 bij kinderen in deze periode",
      value: formatCurrency(scenario.extraCashFlows.cumulativeBox3),
      tone: "blue",
      explanation: termExplainers.box3.body,
      explanationTitle: termExplainers.box3.title,
    },
    {
      label: "Verlies hypotheekrenteaftrek in deze periode",
      value: formatCurrency(scenario.extraCashFlows.cumulativeMortgageReliefLoss),
      tone: "red",
      explanation: termExplainers.mortgageReliefImpact.body,
      explanationTitle: termExplainers.mortgageReliefImpact.title,
    },
  ];
}

function buildTimelineConfig(scenarioId, model) {
  if (scenarioId === "doNothing") {
    return {
      columns: [
        { key: "year", label: "Jaar" },
        {
          key: "futureHomeValue",
          label: "WOZ-waarde",
          explanation: termExplainers.timelineFutureHomeValue.body,
          explanationTitle: termExplainers.timelineFutureHomeValue.title,
        },
        {
          key: "futureMortgageBalance",
          label: "Hypotheek",
          explanation: termExplainers.timelineFutureMortgageBalance.body,
          explanationTitle: termExplainers.timelineFutureMortgageBalance.title,
        },
        {
          key: "futureEquity",
          label: "Overwaarde",
          explanation: termExplainers.timelineFutureEquity.body,
          explanationTitle: termExplainers.timelineFutureEquity.title,
        },
        {
          key: "annualMortgageRelief",
          label: "HRA per jaar",
          tone: "green",
          explanation: termExplainers.timelineAnnualMortgageRelief.body,
          explanationTitle: termExplainers.timelineAnnualMortgageRelief.title,
        },
        {
          key: "childBox3PerYear",
          label: "Box 3 kinderen",
          tone: "blue",
          explanation: termExplainers.timelineChildBox3PerYear.body,
          explanationTitle: termExplainers.timelineChildBox3PerYear.title,
        },
        {
          key: "inheritanceTaxAtDeath",
          label: "Erfbelasting",
          tone: "red",
          explanation: termExplainers.timelineInheritanceTaxAtDeath.body,
          explanationTitle: termExplainers.timelineInheritanceTaxAtDeath.title,
        },
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
          Kinderen hebben in dit scenario nog geen box 3-positie uit de woning.
        </>
      ),
    };
  }

  if (scenarioId === "oneTimeTransfer") {
    return {
      columns: [
        { key: "year", label: "Jaar" },
        {
          key: "futureHomeValue",
          label: "WOZ-waarde",
          explanation: termExplainers.timelineFutureHomeValue.body,
          explanationTitle: termExplainers.timelineFutureHomeValue.title,
        },
        {
          key: "giftedValueAtYear",
          label: "Waarde al geschonken deel",
          explanation: termExplainers.timelineGiftedValueAtYear.body,
          explanationTitle: termExplainers.timelineGiftedValueAtYear.title,
        },
        {
          key: "transferredSharePercent",
          label: "% overgedragen",
          explanation: termExplainers.timelineTransferredSharePercent.body,
          explanationTitle: termExplainers.timelineTransferredSharePercent.title,
        },
        {
          key: "annualMortgageReliefLoss",
          label: "Verlies HRA",
          tone: "red",
          explanation: termExplainers.timelineAnnualMortgageReliefLoss.body,
          explanationTitle: termExplainers.timelineAnnualMortgageReliefLoss.title,
        },
        {
          key: "box3PerYear",
          label: "Box 3 per jaar",
          tone: "blue",
          explanation: termExplainers.timelineBox3PerYear.body,
          explanationTitle: termExplainers.timelineBox3PerYear.title,
        },
        {
          key: "directBurdenAtDeath",
          label: "Directe lasten",
          tone: "amber",
          explanation: termExplainers.timelineDirectBurdenAtDeath.body,
          explanationTitle: termExplainers.timelineDirectBurdenAtDeath.title,
        },
      ],
      rows: model.scenarios.oneTimeTransfer.timeline.map((row) => ({
        ...row,
        futureHomeValue: formatCurrency(row.futureHomeValue),
        giftedValueAtYear: formatCurrency(row.giftedValueAtYear),
        transferredSharePercent: `${row.transferredSharePercent.toFixed(1)}%`,
        annualMortgageReliefLoss: formatCurrency(row.annualMortgageReliefLoss),
        box3PerYear: formatCurrency(row.box3PerYear),
        directBurdenAtDeath: formatCurrency(row.directBurdenAtDeath),
      })),
      footer: (
        <>
          Overdrachtsbelasting in deze route:{" "}
          <strong>{formatCurrency(model.scenarios.oneTimeTransfer.extraCashFlows.cumulativeTransferTax)}</strong>{" "}
          · Schenkbelasting in deze route:{" "}
          <strong>{formatCurrency(model.scenarios.oneTimeTransfer.extraCashFlows.cumulativeGiftTax)}</strong>{" "}
          · Aktekosten:{" "}
          <strong>{formatCurrency(model.scenarios.oneTimeTransfer.extraCashFlows.cumulativeNotaryCosts)}</strong>{" "}
          · Erfbelasting op het resterende deel:{" "}
          <strong>{formatCurrency(model.scenarios.oneTimeTransfer.inheritanceTaxOnly)}</strong>.
        </>
      ),
    };
  }

  return {
    columns: [
      { key: "year", label: "Jaar" },
      {
        key: "futureHomeValue",
        label: "WOZ-waarde",
        explanation: termExplainers.timelineFutureHomeValue.body,
        explanationTitle: termExplainers.timelineFutureHomeValue.title,
      },
      {
        key: "transferredThisYear",
        label: "Nieuw overgedragen deel",
        explanation: termExplainers.timelineTransferredThisYear.body,
        explanationTitle: termExplainers.timelineTransferredThisYear.title,
      },
      {
        key: "giftedValueAtYear",
        label: "Waarde al geschonken deel",
        explanation: termExplainers.timelineGiftedValueAtYear.body,
        explanationTitle: termExplainers.timelineGiftedValueAtYear.title,
      },
      {
        key: "actCostThisYear",
        label: "Aktekosten",
        tone: "amber",
        explanation: termExplainers.timelineActCostThisYear.body,
        explanationTitle: termExplainers.timelineActCostThisYear.title,
      },
      {
        key: "transferTaxThisYear",
        label: "Overdrachtsbelasting",
        tone: "amber",
        explanation: termExplainers.timelineTransferTaxThisYear.body,
        explanationTitle: termExplainers.timelineTransferTaxThisYear.title,
      },
      {
        key: "box3PerYear",
        label: "Box 3 per jaar",
        tone: "blue",
        explanation: termExplainers.timelineBox3PerYear.body,
        explanationTitle: termExplainers.timelineBox3PerYear.title,
      },
      {
        key: "directBurdenAtDeath",
        label: "Directe lasten",
        tone: "green",
        explanation: termExplainers.timelineDirectBurdenAtDeath.body,
        explanationTitle: termExplainers.timelineDirectBurdenAtDeath.title,
      },
      {
        key: "savingVsDoNothing",
        label: "Verschil met niets doen",
        tone: "green",
        explanation: termExplainers.timelineSavingVsDoNothing.body,
        explanationTitle: termExplainers.timelineSavingVsDoNothing.title,
      },
    ],
    rows: model.scenarios.annualTransfer.timeline.map((row) => ({
      ...row,
      futureHomeValue: formatCurrency(row.futureHomeValue),
      transferredThisYear: formatCurrency(row.transferredThisYear),
      giftedValueAtYear: formatCurrency(row.giftedValueAtYear),
      actCostThisYear: formatCurrency(row.actCostThisYear),
      transferTaxThisYear: formatCurrency(row.transferTaxThisYear),
      box3PerYear: formatCurrency(row.box3PerYear),
      directBurdenAtDeath: formatCurrency(row.directBurdenAtDeath),
      savingVsDoNothing: formatCurrency(row.savingVsDoNothing),
      savingVsDoNothingEmphasis: true,
    })),
    footer: (
      <>
        Totaal overdrachtsbelasting:{" "}
        <strong>{formatCurrency(model.scenarios.annualTransfer.extraCashFlows.cumulativeTransferTax)}</strong>{" "}
        · Totaal schenkbelasting:{" "}
        <strong>{formatCurrency(model.scenarios.annualTransfer.extraCashFlows.cumulativeGiftTax)}</strong>{" "}
        · Totaal aktekosten:{" "}
        <strong>{formatCurrency(model.scenarios.annualTransfer.extraCashFlows.cumulativeNotaryCosts)}</strong>{" "}
        · Erfbelasting op het resterende deel:{" "}
        <strong>{formatCurrency(model.scenarios.annualTransfer.inheritanceTaxOnly)}</strong>.
      </>
    ),
  };
}

export default function ScenarioDetail({ selectedScenarioId, model }) {
  const meta = scenarioMetaById[selectedScenarioId];
  const scenario = model.scenarios[selectedScenarioId];
  const timelineConfig = buildTimelineConfig(selectedScenarioId, model);
  const annualTransferMoments = model.scenarios.annualTransfer.timeline.filter(
    (row) => row.transferredThisYear > 0,
  );
  const annualMatchesOneTimeInPractice =
    annualTransferMoments.length === 1 &&
    Math.abs(
      annualTransferMoments[0].transferredThisYear - model.overview.plannedTransferValueTotal,
    ) < 1 &&
    Math.abs(
      model.scenarios.oneTimeTransfer.directBurden - model.scenarios.annualTransfer.directBurden,
    ) < 1;

  return (
    <SectionCard
      eyebrow="Detail per route"
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
            <ExplainedLabel
              label="Directe lasten"
              explanation={termExplainers.directBurden.body}
              explanationTitle={termExplainers.directBurden.title}
            />
            <strong>{formatCurrency(scenario.directBurden)}</strong>
          </div>
          <div>
            <ExplainedLabel
              label="Waarvan akten en belastingen nu"
              explanation={termExplainers.directCosts.body}
              explanationTitle={termExplainers.directCosts.title}
            />
            <strong>{formatCurrency(scenario.directCosts)}</strong>
          </div>
        </div>
      </div>

      {selectedScenarioId === "oneTimeTransfer" ? (
        <Callout title="Extra aandacht" tone="warning" icon="alert">
          In deze route rekent de tool met 1 grotere eigendomsoverdracht in jaar{" "}
          <strong>{model.inputs.oneTimeTransferYear}</strong>. Daardoor kunnen schenkbelasting,
          overdrachtsbelasting, aktekosten en gevolgen voor de hypotheek in dat jaar direct
          bepalend zijn.
        </Callout>
      ) : null}

      {selectedScenarioId === "annualTransfer" ? (
        <Callout title="Jaarlijkse uitvoering" tone="success" icon="check">
          {annualMatchesOneTimeInPractice ? (
            <>
              In deze invoer past het hele doelbedrag al in <strong>1 overdracht</strong> in{" "}
              <strong>{annualTransferMoments[0].year}</strong>. Daarom rekent deze route hier met{" "}
              <strong>1 akte</strong> en kan de uitkomst gelijk zijn aan{" "}
              <strong>in 1 keer schenken</strong>.
            </>
          ) : (
            <>
              Voor elk nieuw eigendomsdeel gaat de tool uit van een nieuwe akte en nieuwe
              notariële kosten. Juist daar zit in deze vergelijking het verschil met 1 keer
              schenken.
            </>
          )}
        </Callout>
      ) : null}

      <div className="detail-section">
        <div className="detail-section__header">
          <h3>Kosten en neveneffecten</h3>
          <p>Hier ziet u eerst de opbouw van het totaal en daaronder de bedragen die apart blijven staan.</p>
        </div>
      <div className="detail-grid">
        <article className="detail-card">
          <div className="detail-card__header">
            <h3>Opbouw van het totaal</h3>
          </div>
          <KeyValueList rows={buildDirectBreakdownRows(selectedScenarioId, scenario)} />
        </article>
        <article className="detail-card">
          <div className="detail-card__header">
            <h3>Apart weergegeven in de periode</h3>
          </div>
          <KeyValueList rows={buildSideEffectRows(selectedScenarioId, scenario)} />
        </article>
      </div>
      </div>

      {scenario.partnerDetailAtReview ? (
        <div className="detail-grid detail-grid--partner">
          <article className="detail-card detail-card--partner">
            <h3>Partner</h3>
            <KeyValueList
              rows={[
                {
                  label: "Bruto aandeel uit resterende nalatenschap",
                  value: formatCurrency(scenario.partnerDetailAtReview.grossShare),
                  explanation: termExplainers.partnerGrossShare.body,
                  explanationTitle: termExplainers.partnerGrossShare.title,
                },
                {
                  label: "Belastbare grondslag",
                  value: formatCurrency(scenario.partnerDetailAtReview.taxableShare),
                  explanation: termExplainers.taxableShare.body,
                  explanationTitle: termExplainers.taxableShare.title,
                },
                {
                  label: "Erfbelasting partner",
                  value: formatCurrency(scenario.partnerDetailAtReview.tax),
                  tone: scenario.partnerDetailAtReview.tax > 0 ? "red" : "green",
                  emphasis: true,
                  explanation: termExplainers.partnerInheritanceTax.body,
                  explanationTitle: termExplainers.partnerInheritanceTax.title,
                },
              ]}
            />
          </article>
        </div>
      ) : null}

      <div className="detail-section">
        <div className="detail-section__header">
          <h3>Uitsplitsing per kind</h3>
          <p>Per kind ziet u wat al is geschonken, wat later nog uit de nalatenschap komt en welke lasten daarbij horen.</p>
        </div>
      <div className="detail-grid">
        {scenario.children.map((child) => (
          <article className="detail-card" key={child.id}>
            <div className="detail-card__header">
              <h3>
                {child.livesInHome ? <Icon name="house" size={16} /> : null}
                {" "}{child.label}
              </h3>
              <div className="detail-card__badges">
                <Badge tone="blue">{child.sharePercent}%</Badge>
                {child.livesInHome ? (
                  <Badge tone="green">woont in woning</Badge>
                ) : null}
              </div>
            </div>
            <KeyValueList
              rows={[
                {
                  label: "Al eerder geschonken woningdeel",
                  value: formatCurrency(child.giftedValueAtReview),
                  explanation: termExplainers.childGiftedValueAtReview.body,
                  explanationTitle: termExplainers.childGiftedValueAtReview.title,
                },
                {
                  label: "Nog uit nalatenschap",
                  value: formatCurrency(child.inheritedGrossAtReview),
                  explanation: termExplainers.childInheritedGrossAtReview.body,
                  explanationTitle: termExplainers.childInheritedGrossAtReview.title,
                },
                {
                  label: "Erfbelasting over restant",
                  value: formatCurrency(child.inheritanceTax),
                  tone: "red",
                  explanation: termExplainers.childInheritanceTax.body,
                  explanationTitle: termExplainers.childInheritanceTax.title,
                },
                {
                  label: `Overdrachtsbelasting (${child.livesInHome ? "2%" : model.inputs.transferTaxRate + "%"})`,
                  value: formatCurrency(child.transferTax),
                  tone: "amber",
                  explanation: child.livesInHome
                    ? "Dit kind woont (of gaat wonen) in de woning. Daardoor geldt het lagere eigen-woningtarief van 2% overdrachtsbelasting."
                    : termExplainers.transferTaxTotal.body,
                  explanationTitle: termExplainers.transferTaxTotal.title,
                },
                ...(selectedScenarioId !== "doNothing"
                  ? [
                      {
                        label: child.livesInHome ? "Box 3 (n.v.t. — eigen woning)" : "Box 3 in deze periode",
                        value: formatCurrency(child.box3),
                        tone: child.livesInHome ? "green" : "blue",
                        explanation: child.livesInHome
                          ? "Dit kind woont in de woning. Het woningdeel valt daardoor in box 1, niet in box 3."
                          : termExplainers.box3.body,
                        explanationTitle: termExplainers.box3.title,
                      },
                    ]
                  : []),
                {
                  label: "Aandeel in directe kosten",
                  value: formatCurrency(child.directCostShare),
                  tone: "amber",
                  explanation: termExplainers.childDirectCostShare.body,
                  explanationTitle: termExplainers.childDirectCostShare.title,
                },
                {
                  label: "Netto in deze vergelijking",
                  value: formatCurrency(child.projectedNetOutcome),
                  tone: "green",
                  emphasis: true,
                  explanation: termExplainers.childProjectedNetOutcome.body,
                  explanationTitle: termExplainers.childProjectedNetOutcome.title,
                },
              ]}
            />
          </article>
        ))}
      </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__header">
          <h3>Tijdlijn per jaar</h3>
          <p>Gebruik deze tabel als u wilt zien hoe de uitkomst opschuift wanneer het peilmoment later valt.</p>
        </div>
      <DataTable
        title="Tijdlijn per jaar"
        columns={timelineConfig.columns}
        rows={timelineConfig.rows}
        footer={timelineConfig.footer}
      />
      </div>
    </SectionCard>
  );
}
