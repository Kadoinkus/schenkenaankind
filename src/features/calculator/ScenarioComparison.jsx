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
    shortLabel: meta.shortLabel,
    summary: meta.summary,
    value: model.scenarios[meta.id].directBurden,
  }));

  const paperAdvantage =
    model.scenarios.doNothing.directBurden - model.scenarios.paperGift.directBurden;

  return (
    <SectionCard
      eyebrow="Stap 2"
      title="Vergelijking"
      subtitle="De balken hieronder vergelijken de directe lasten in deze vereenvoudigde rekenmethode. Jaarlijkse neveneffecten staan in de scenario-details."
    >
      <ComparisonList
        items={comparisonItems}
        selectedId={state.selectedScenarioId}
        maxValue={model.overview.comparisonMax}
        onSelect={actions.setSelectedScenario}
      />

      {paperAdvantage > 0 ? (
        <Callout title="Snel inzicht" tone="success" icon="check">
          In deze invoer is een papieren schenking {formatCurrency(paperAdvantage)} lager in
          directe lasten dan niets doen.
        </Callout>
      ) : null}
    </SectionCard>
  );
}
