import AccordionItem from "../../components/ui/AccordionItem.jsx";
import Button from "../../components/ui/Button.jsx";
import Callout from "../../components/ui/Callout.jsx";
import Icon from "../../components/ui/Icon.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import ScenarioDetail from "../calculator/ScenarioDetail.jsx";
import { termExplainers } from "../../content/copy.js";

export default function PremiumReport({ state, model }) {
  return (
    <>
      <ScenarioDetail selectedScenarioId={state.selectedScenarioId} model={model} />

      <SectionCard
        eyebrow="Bewaren"
        title="Rapport opslaan als PDF"
        subtitle="Gebruik de knop hieronder om dit scherm als PDF te bewaren voor uw vervolggesprek met een notaris of adviseur."
      >
        <div className="wizard-actions wizard-actions--spread">
          <Button tone="primary" onClick={() => window.print()}>
            <Icon name="fileText" size={16} />
            <span>Bewaar als PDF</span>
          </Button>
        </div>
      </SectionCard>

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
  );
}
