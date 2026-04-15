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
      subtitle="Kies hieronder een route. U ziet per paneel de directe lasten en opent daarna de details met de opbouw uit erfbelasting, overdrachtsbelasting, schenkbelasting en notariskosten."
    >
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
