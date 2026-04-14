import { formatCurrency } from "../../lib/formatters.js";
import AccordionItem from "./AccordionItem.jsx";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import Callout from "./Callout.jsx";
import Icon from "./Icon.jsx";
import KeyValueList from "./KeyValueList.jsx";
import NumberField from "./NumberField.jsx";
import SectionCard from "./SectionCard.jsx";
import StatTile from "./StatTile.jsx";

export default function LibraryShowcase() {
  return (
    <div className="page-stack">
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
              De iconen zijn bewust eenvoudig, met een consistente lijnvoering. Het systeem
              ondersteunt een rustige publieke uitstraling zonder op een overheidsmerk te lijken.
            </p>
          </div>

          <div className="library-panel">
            <h3>Stat-tiles</h3>
            <div className="stat-grid">
              <StatTile label="Verwachte overwaarde" value={formatCurrency(761000)} />
              <StatTile label="Papieren rente per jaar" value={formatCurrency(9580)} tone="amber" />
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
                  { label: "Jaarlijkse rente", value: formatCurrency(9540), tone: "amber" },
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
