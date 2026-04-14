import { useEffect, useState } from "react";
import {
  appCopy,
  contextBlocks,
  faqItems,
  professionalTriggers,
  quickGuidance,
  sourceLinks,
} from "../content/copy.js";
import { formatDate } from "../lib/formatters.js";
import AccordionItem from "../components/ui/AccordionItem.jsx";
import Callout from "../components/ui/Callout.jsx";
import Icon from "../components/ui/Icon.jsx";
import LibraryShowcase from "../components/ui/LibraryShowcase.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import CalculatorControls from "../features/calculator/CalculatorControls.jsx";
import ScenarioComparison from "../features/calculator/ScenarioComparison.jsx";
import ScenarioDetail from "../features/calculator/ScenarioDetail.jsx";
import { useTransferCalculator } from "../features/calculator/useTransferCalculator.js";

function useHashRoute() {
  const getRoute = () =>
    window.location.hash === "#bibliotheek" ? "library" : "calculator";

  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

export default function App() {
  const route = useHashRoute();
  const calculator = useTransferCalculator();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <a className="brand-mark" href="#">
            <span className="brand-mark__block" aria-hidden="true" />
            <span>
              <strong>{appCopy.brand}</strong>
              <small>{appCopy.eyebrow}</small>
            </span>
          </a>
          <nav className="site-nav" aria-label="Hoofdnavigatie">
            <a href="#" className={route === "calculator" ? "is-active" : ""}>
              Rekentool
            </a>
            <a href="#bibliotheek" className={route === "library" ? "is-active" : ""}>
              Componentbibliotheek
            </a>
          </nav>
        </div>
      </header>

      <main className="site-main">
        {route === "library" ? (
          <LibraryShowcase />
        ) : (
          <div className="page-stack">
            <section className="intro-band">
              <div className="intro-band__content">
                <p className="intro-band__eyebrow">{appCopy.eyebrow}</p>
                <h1>{appCopy.title}</h1>
                <p className="intro-band__lead">{appCopy.lead}</p>
              </div>
              <Callout title="Belangrijk om te weten" tone="warning" icon="alert">
                <p>{appCopy.disclaimer}</p>
                <p className="muted-copy">
                  Laatst inhoudelijk gecontroleerd op {formatDate(appCopy.reviewedOn)}.
                </p>
              </Callout>
            </section>

            <section className="guidance-grid" aria-label="Korte uitleg">
              {quickGuidance.map((item) => (
                <article className="guidance-card" key={item.title}>
                  <div className="guidance-card__icon">
                    <Icon name="arrow" size={18} />
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </article>
              ))}
            </section>

            <CalculatorControls
              state={calculator.state}
              model={calculator.model}
              actions={calculator.actions}
              mortgageTypes={calculator.mortgageTypes}
            />

            <ScenarioComparison
              state={calculator.state}
              model={calculator.model}
              actions={calculator.actions}
            />

            <ScenarioDetail
              selectedScenarioId={calculator.state.selectedScenarioId}
              model={calculator.model}
            />

            <SectionCard
              eyebrow="Meer context"
              title="Zo leest u de uitkomst"
              subtitle="De tool is bewust eenvoudig gehouden. Gebruik de uitkomst daarom als richting, niet als definitieve beslissing."
            >
              <div className="info-grid">
                {contextBlocks.map((block) => (
                  <article className="info-card" key={block.title}>
                    <h3>{block.title}</h3>
                    <p>{block.text}</p>
                  </article>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Wanneer doorvragen"
              title="Momenten waarop professioneel advies verstandig is"
              subtitle="Deze punten vergroten de kans dat een standaardberekening afwijkt van de praktijk."
            >
              <div className="trigger-list" role="list">
                {professionalTriggers.map((item) => (
                  <div className="trigger-list__item" key={item} role="listitem">
                    <Icon name="check" size={18} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard eyebrow="Veelgestelde vragen" title="Korte uitleg bij de aannames">
              <div className="faq-list">
                {faqItems.map((item) => (
                  <AccordionItem key={item.title} title={item.title}>
                    <p>{item.body}</p>
                  </AccordionItem>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Bronnen"
              title="Officiële verwijzingen"
              subtitle="De tarieven en vrijstellingen in deze tool zijn gecontroleerd aan de hand van publieke bronnen van Belastingdienst en Rijksoverheid."
            >
              <ul className="source-list">
                {sourceLinks.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}
      </main>
    </div>
  );
}
