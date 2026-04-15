import { formatCurrency } from "../../lib/formatters.js";
import {
  AccordionItem,
  Badge,
  Button,
  Callout,
  Checklist,
  EditorialSplit,
  FeatureGrid,
  HeroBanner,
  Icon,
  KeyValueList,
  NumberField,
  PageSection,
  SectionCard,
  StatTile,
  TimelineSteps,
  TrustBar,
} from "./index.js";

export default function LibraryShowcase() {
  return (
    <div className="page-stack">
      <HeroBanner
        eyebrow="Componentbibliotheek"
        title="Landingscomponenten met meer ritme"
        description="Deze route laat de herbruikbare bouwstenen zien die de publieke pagina rustiger, rijker en beter schaalbaar maken."
        image="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1400&q=80"
        imageAlt=""
        signals={[
          "Hero met beeld en inhoudelijke focus",
          "Visueel afwisselende secties",
          "Gebouwd om later verder uit te breiden",
        ]}
        panelTitle="Nieuwe publieke laag"
        panelItems={[
          {
            icon: "shield",
            title: "HeroBanner",
            text: "Voor de eerste indruk zonder generieke kaart-opmaak.",
          },
          {
            icon: "family",
            title: "EditorialSplit",
            text: "Voor rijke inhoud met beeld, uitleg en ruimte voor context.",
          },
          {
            icon: "chart",
            title: "TimelineSteps",
            text: "Voor een rustige uitleg van het proces naar de berekening.",
          },
        ]}
        actions={
          <a href="#berekening" className="button button--primary">
            Bekijk in de app
          </a>
        }
      />

      <TrustBar
        items={[
          { title: "TrustBar", text: "Voor compacte vertrouwensteksten zonder kartonnen kaartjes." },
          { title: "EditorialSplit", text: "Voor inhoud met meer ruimte, beeld en hiërarchie." },
          { title: "TimelineSteps", text: "Voor stappen die kalm en leesbaar blijven op mobiel." },
        ]}
      />

      <EditorialSplit
        eyebrow="Nieuwe secties"
        title="Bouwstenen voor een landingspagina met meer karakter"
        description="De publieke pagina gebruikt nu inhoudsblokken met een eigen rol, in plaats van steeds hetzelfde kaartpatroon te herhalen."
        body={[
          "Dat maakt de pagina rustiger, leesbaarder en beter te onderhouden.",
          "Dezelfde bouwstenen kunnen later ook voor SEO-pagina's, uitlegpagina's en premium-secties worden hergebruikt.",
        ]}
        points={[
          {
            icon: "book",
            title: "Meer hiërarchie",
            text: "Elke sectie kan nu anders voelen zonder een nieuw patroon te hoeven verzinnen.",
          },
          {
            icon: "check",
            title: "Beter te beheren",
            text: "De landingspagina blijft opgebouwd uit losse componenten met duidelijke verantwoordelijkheden.",
          },
        ]}
        image="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1400&q=80"
        imageAlt=""
      />

      <TimelineSteps
        eyebrow="Procescomponent"
        title="Rustige procesuitleg"
        description="Deze component maakt een stappenplan duidelijk zonder dat het op mobiel in elkaar schuift."
        steps={[
          { icon: "house", title: "Invoer", text: "Gebruik de basisgegevens die bezoekers meestal zo kunnen pakken." },
          { icon: "users", title: "Gezin", text: "Maak de berekening passend voor partner, kinderen en periode." },
          { icon: "chart", title: "Vergelijking", text: "Laat daarna pas het verschil tussen de routes zien." },
        ]}
        image="https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?auto=format&fit=crop&w=1400&q=80"
        imageAlt=""
        panelTitle="Doel"
        panelBody="De bezoeker hoeft niet eerst te begrijpen hoe de hele app werkt."
        panelPoints={[
          "Minder scrollmoeheid",
          "Heldere volgorde",
          "Sterke mobiele leesbaarheid",
        ]}
      />

      <PageSection
        eyebrow="Aanvullende componenten"
        title="Bestaande UI-laag"
        subtitle="Naast de nieuwe landingscomponenten blijven ook de compacte bouwstenen beschikbaar."
      >
        <FeatureGrid
          items={[
            {
              icon: "shield",
              title: "Feature grid",
              text: "Voor compacte voordelen of toelichtingen in herhaalbaar formaat.",
            },
            {
              icon: "calculator",
              title: "Checklist",
              text: "Voor voorwaarden, aandachtspunten en vervolgstappen.",
            },
            {
              icon: "check",
              title: "Page section",
              text: "Voor eenvoudige informatiesecties zonder extra sjabloonwerk.",
            },
          ]}
        />
        <Checklist
          items={[
            "Nieuwe landingscomponenten en bestaande rekentool-componenten leven naast elkaar",
            "Componenten blijven klein genoeg om los te testen en door te ontwikkelen",
            "Imports lopen via 1 centrale ui-index",
          ]}
        />
      </PageSection>

      <SectionCard
        eyebrow="Componentbibliotheek"
        title="Herbruikbare bouwstenen"
        subtitle="Deze route is bedoeld voor onderhoud en doorontwikkeling. Alle hoofdcomponenten uit de rekentool komen hier in compacte vorm samen."
      >
        <div className="library-grid">
          <div className="library-panel">
            <h3>Knoppen en badges</h3>
            <div className="library-inline">
              <Button active>Actieve knop</Button>
              <Button>Standaardknop</Button>
              <Badge tone="blue">Primair</Badge>
              <Badge tone="green">Positief</Badge>
              <Badge tone="amber">Aandacht</Badge>
            </div>
          </div>

          <div className="library-panel">
            <h3>Typografie en iconen</h3>
            <div className="library-inline">
              <Icon name="calculator" />
              <Icon name="house" />
              <Icon name="family" />
              <Icon name="balance" />
              <Icon name="shield" />
            </div>
            <p className="library-copy">
              De iconen zijn bewust eenvoudig, met een consistente lijnvoering. Daardoor blijft de
              uitstraling rustig, zakelijk en goed leesbaar naast de inhoud.
            </p>
          </div>

          <div className="library-panel">
            <h3>Stat-tiles</h3>
            <div className="stat-grid">
              <StatTile label="Verwachte overwaarde" value={formatCurrency(761000)} />
              <StatTile label="Aktekosten route" value={formatCurrency(3900)} tone="amber" />
              <StatTile label="Verlies HRA" value={formatCurrency(16740)} tone="red" />
            </div>
          </div>

          <div className="library-panel">
            <h3>Formuliercomponent</h3>
            <NumberField
              id="library-woz"
              label="WOZ-waarde"
              hint="Voorbeeldveld uit de rekentool"
              value={700000}
              step={1000}
              suffix="EUR"
              onChange={() => {}}
            />
          </div>

          <div className="library-panel library-panel--full">
            <h3>Callout en sleutelwaarden</h3>
            <div className="library-two-column">
              <Callout title="Gebruik als gespreksbasis" tone="info" icon="book">
                Een scenariovergelijking helpt vooral om het goede gesprek te voeren met uw
                notaris of adviseur.
              </Callout>
              <KeyValueList
                rows={[
                  { label: "Directe lasten", value: formatCurrency(62100) },
                  { label: "Overdrachtsbelasting", value: formatCurrency(9540), tone: "amber" },
                  {
                    label: "Verwachte netto uitkomst",
                    value: formatCurrency(314000),
                    tone: "green",
                    emphasis: true,
                  },
                ]}
              />
            </div>
          </div>

          <div className="library-panel library-panel--full">
            <h3>Veelgestelde vraag</h3>
            <AccordionItem title="Waarom is een componentbibliotheek nuttig in dit project?">
              Dezelfde kaarten, velden en meldingen worden op meerdere plekken gebruikt. Door ze als
              losse componenten op te bouwen blijft het gedrag consistent en is latere uitbreiding
              minder risicovol.
            </AccordionItem>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
