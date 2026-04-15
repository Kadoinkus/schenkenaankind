import { formatCurrency } from "../../lib/formatters.js";
import Callout from "../../components/ui/Callout.jsx";
import ComparisonList from "../../components/ui/ComparisonList.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import { scenarioMeta } from "./scenarioMeta.js";

export default function ScenarioComparison({ state, model, actions }) {
  const comparisonItems = scenarioMeta.map((meta) => {
    const summary =
      meta.id === "oneTimeTransfer"
        ? `${meta.summary} In deze berekening gebeurt dat in jaar ${model.inputs.oneTimeTransferYear}.`
        : meta.summary;

    return {
      id: meta.id,
      title: meta.title,
      tone: meta.tone,
      icon: meta.icon,
      shortLabel: meta.shortLabel,
      summary,
      value: model.scenarios[meta.id].directBurden,
    };
  });

  const annualAdvantage =
    model.scenarios.doNothing.directBurden - model.scenarios.annualTransfer.directBurden;
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
  const bestItem = comparisonItems.reduce((best, current) =>
    current.value < best.value ? current : best,
  );

  return (
    <SectionCard
      eyebrow="Vergelijk routes"
      title="Vergelijking"
      subtitle="Kies hieronder een route. Eerst ziet u de hoofdlijn; daarna opent u de details met de volledige kostenopbouw."
    >
      <div className="summary-grid">
        <article className="summary-card summary-card--default">
          <p className="summary-card__eyebrow">Peilmoment</p>
          <h3 className="summary-card__title">Laatste jaar in de vergelijking</h3>
          <strong className="summary-card__value">{model.overview.lastReviewYear}</strong>
          <p className="summary-card__note">De tool rekent vanaf {model.overview.baseYear} naar dit jaar toe.</p>
        </article>
        <article className="summary-card summary-card--info">
          <p className="summary-card__eyebrow">Doelbedrag</p>
          <h3 className="summary-card__title">Woningwaarde om te schenken</h3>
          <strong className="summary-card__value">
            {formatCurrency(model.overview.plannedTransferValueTotal)}
          </strong>
          <p className="summary-card__note">Dit bedrag gebruikt de tool als vergelijkingsbasis.</p>
        </article>
        <article className="summary-card summary-card--success">
          <p className="summary-card__eyebrow">Beste eerste richting</p>
          <h3 className="summary-card__title">{bestItem.title}</h3>
          <strong className="summary-card__value">{formatCurrency(bestItem.value)}</strong>
          <p className="summary-card__note">Laagste directe lasten binnen deze invoer.</p>
        </article>
      </div>

      <ComparisonList
        items={comparisonItems}
        selectedId={state.selectedScenarioId}
        bestId={bestItem.id}
        bestValue={bestItem.value}
        onSelect={actions.setSelectedScenario}
      />

      {annualMatchesOneTimeInPractice ? (
        <Callout title="Waarom 2 routes hier gelijk uitkomen" tone="info" icon="help">
          In deze invoer draagt de jaarlijkse route het hele doelbedrag van{" "}
          <strong>{formatCurrency(model.overview.plannedTransferValueTotal)}</strong> al over in{" "}
          <strong>{annualTransferMoments[0].year}</strong>. Daardoor rekent de tool daar met{" "}
          <strong>1 akte</strong>, dezelfde overdrachtsbelasting en geen extra schenkbelasting.
          In de praktijk lijkt deze route hier dus op <strong>in 1 keer schenken</strong>.
        </Callout>
      ) : null}

      {annualAdvantage > 0 ? (
        <Callout title="Kort samengevat" tone="info" icon="check">
          In deze invoer komt jaarlijks eigendom schenken{" "}
          {formatCurrency(annualAdvantage)} lager uit in directe lasten dan niets doen.
        </Callout>
      ) : null}
    </SectionCard>
  );
}
