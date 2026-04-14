import { formatCurrency } from "../../lib/formatters.js";
import Callout from "../../components/ui/Callout.jsx";
import ComparisonList from "../../components/ui/ComparisonList.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import { scenarioMeta } from "./scenarioMeta.js";

export default function ScenarioComparison({ state, model, actions }) {
  const comparisonItems = scenarioMeta.map((meta) => ({
    id: meta.id,
    title: meta.title,
    tone: meta.tone,
    icon: meta.icon,
    shortLabel: meta.shortLabel,
    summary: meta.summary,
    value: model.scenarios[meta.id].directBurden,
  }));

  const paperAdvantage =
    model.scenarios.doNothing.directBurden - model.scenarios.paperGift.directBurden;
  const bestItem = comparisonItems.reduce((best, current) =>
    current.value < best.value ? current : best,
  );

  return (
    <SectionCard
      eyebrow="Vergelijk routes"
      title="Vergelijking"
      subtitle="Kies hieronder een route. U ziet per paneel de directe lasten en opent daarna de details van de route die u wilt bekijken."
    >
      <ComparisonList
        items={comparisonItems}
        selectedId={state.selectedScenarioId}
        bestId={bestItem.id}
        bestValue={bestItem.value}
        onSelect={actions.setSelectedScenario}
      />

      {paperAdvantage > 0 ? (
        <Callout title="Kort samengevat" tone="info" icon="check">
          In deze invoer komt papieren schenking {formatCurrency(paperAdvantage)} lager uit in
          directe lasten dan niets doen.
        </Callout>
      ) : null}
    </SectionCard>
  );
}
