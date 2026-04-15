import { useState } from "react";
import AccordionItem from "../../components/ui/AccordionItem.jsx";
import Button from "../../components/ui/Button.jsx";
import Icon from "../../components/ui/Icon.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import ScenarioDetail from "../calculator/ScenarioDetail.jsx";
import { termExplainers } from "../../content/copy.js";
import { generateWordReport } from "../../lib/generateReport.js";

export default function PremiumReport({ state, model }) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      await generateWordReport(state, model);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <ScenarioDetail selectedScenarioId={state.selectedScenarioId} model={model} />

      <SectionCard
        eyebrow="Bewaren"
        title="Rapport downloaden"
        subtitle="Download een opgemaakt Word-document met alle scenario's, per-kind uitsplitsing en tijdlijnen. Handig als voorbereiding op een gesprek met uw notaris of adviseur."
      >
        <div className="wizard-actions wizard-actions--spread">
          <Button tone="primary" onClick={handleDownload} disabled={isGenerating}>
            <Icon name="fileText" size={16} />
            <span>{isGenerating ? "Document wordt aangemaakt..." : "Download als Word-document"}</span>
          </Button>
          <Button onClick={() => window.print()}>
            <Icon name="fileText" size={16} />
            <span>Of bewaar dit scherm als PDF</span>
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
