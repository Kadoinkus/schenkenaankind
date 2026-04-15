import { formatCurrency } from "./formatters.js";
import { scenarioMetaById } from "../features/calculator/scenarioMeta.js";

const BRAND = "103A63";
const MUTED = "44515F";
const LIGHT_BG = "EAF4FA";
const GREEN = "2E7D32";

// All docx constructors are resolved after dynamic import.
let D;

function heading(text, level) {
  return new D.Paragraph({ heading: level || D.HeadingLevel.HEADING_1, children: [new D.TextRun({ text, color: BRAND })] });
}

function label(text) {
  return new D.TextRun({ text, color: MUTED, size: 18 });
}

function bold(text, color = "000000") {
  return new D.TextRun({ text, bold: true, color, size: 20 });
}

function normal(text) {
  return new D.TextRun({ text, size: 20 });
}

function spacer() {
  return new D.Paragraph({ spacing: { after: 120 }, children: [] });
}

function kvRow(key, value) {
  return new D.Paragraph({
    spacing: { after: 60 },
    children: [label(`${key}:  `), bold(value)],
  });
}

function cell(text, { header = false, shading, alignment } = {}) {
  return new D.TableCell({
    children: [
      new D.Paragraph({
        alignment: alignment || D.AlignmentType.LEFT,
        children: [
          new D.TextRun({
            text,
            bold: header,
            size: header ? 16 : 18,
            color: header ? BRAND : "000000",
          }),
        ],
      }),
    ],
    shading: shading ? { type: D.ShadingType.SOLID, color: shading } : undefined,
    borders: {
      top: { style: D.BorderStyle.SINGLE, size: 1, color: "D8E0E7" },
      bottom: { style: D.BorderStyle.SINGLE, size: 1, color: "D8E0E7" },
      left: { style: D.BorderStyle.NONE },
      right: { style: D.BorderStyle.NONE },
    },
  });
}

function buildInputSection(inputs, overview) {
  return [
    heading("Uw invoergegevens", D.HeadingLevel.HEADING_2),
    kvRow("WOZ-waarde 2026", formatCurrency(inputs.homeValue)),
    kvRow("Resterende hypotheek", formatCurrency(inputs.mortgageBalance)),
    kvRow("Hypotheekrente", `${inputs.mortgageInterestRate}%`),
    kvRow("Hypotheekvorm", inputs.mortgageType === "interest-only" ? "Aflossingsvrij" : "Annuiteit"),
    kvRow("Aantal kinderen", String(inputs.childrenCount)),
    kvRow("Verdeling", inputs.childShares.map((s, i) => `Kind ${i + 1}: ${s}%`).join("  \u00b7  ")),
    kvRow("Partner", inputs.hasPartner ? `Ja (${inputs.partnerSharePercent}%)` : "Nee"),
    kvRow("Waardestijging per jaar", `${inputs.annualGrowthRate}%`),
    kvRow("Periode", `${inputs.baseYear} \u2013 ${inputs.lastReviewYear} (${inputs.yearsToReview} jaar)`),
    spacer(),
    kvRow("Huidige overwaarde", formatCurrency(overview.currentEquity)),
    kvRow("Geschatte overwaarde op peilmoment", formatCurrency(overview.reviewEquity)),
    kvRow("Geschatte woningwaarde op peilmoment", formatCurrency(overview.projectedHomeValue)),
    spacer(),
  ];
}

function buildScenarioSection(scenarioId, scenario) {
  const meta = scenarioMetaById[scenarioId];
  const out = [];

  out.push(heading(meta.title, D.HeadingLevel.HEADING_2));
  out.push(new D.Paragraph({ spacing: { after: 80 }, children: [normal(meta.summary)] }));

  out.push(kvRow("Directe lasten totaal", formatCurrency(scenario.directBurden)));
  out.push(kvRow("Erfbelasting op restant", formatCurrency(scenario.inheritanceTaxOnly)));

  if (scenarioId !== "doNothing") {
    out.push(kvRow("Overdrachtsbelasting", formatCurrency(scenario.extraCashFlows.cumulativeTransferTax)));
    out.push(kvRow("Schenkbelasting", formatCurrency(scenario.extraCashFlows.cumulativeGiftTax)));
    out.push(kvRow("Notariskosten", formatCurrency(scenario.extraCashFlows.cumulativeNotaryCosts)));
    out.push(kvRow("Box 3 kinderen (cumulatief)", formatCurrency(scenario.extraCashFlows.cumulativeBox3)));
    out.push(kvRow("Verlies hypotheekrenteaftrek", formatCurrency(scenario.extraCashFlows.cumulativeMortgageReliefLoss)));
  }

  out.push(spacer());

  if (scenario.partnerDetailAtReview) {
    const p = scenario.partnerDetailAtReview;
    out.push(heading("Partner", D.HeadingLevel.HEADING_3));
    out.push(kvRow("Bruto aandeel", formatCurrency(p.grossShare)));
    out.push(kvRow("Belastbare grondslag", formatCurrency(p.taxableShare)));
    out.push(kvRow("Erfbelasting partner", formatCurrency(p.tax)));
    out.push(spacer());
  }

  out.push(heading("Per kind", D.HeadingLevel.HEADING_3));
  for (const child of scenario.children) {
    const suffix = child.livesInHome ? " (woont in woning)" : "";
    out.push(
      new D.Paragraph({
        spacing: { before: 120, after: 60 },
        children: [bold(`${child.label}${suffix} \u2014 ${child.sharePercent}%`, BRAND)],
      }),
    );
    out.push(kvRow("Eerder geschonken woningdeel", formatCurrency(child.giftedValueAtReview)));
    out.push(kvRow("Nog uit nalatenschap", formatCurrency(child.inheritedGrossAtReview)));
    out.push(kvRow("Erfbelasting over restant", formatCurrency(child.inheritanceTax)));
    out.push(kvRow("Overdrachtsbelasting", formatCurrency(child.transferTax)));
    out.push(kvRow("Box 3 in periode", formatCurrency(child.box3)));
    out.push(kvRow("Netto in vergelijking", formatCurrency(child.projectedNetOutcome)));
  }

  out.push(spacer());

  // Timeline table
  out.push(heading("Tijdlijn per jaar", D.HeadingLevel.HEADING_3));
  const timeline = scenario.timeline;
  if (timeline && timeline.length > 0) {
    const simple = scenarioId === "doNothing";
    const headers = simple
      ? ["Jaar", "WOZ-waarde", "Hypotheek", "Overwaarde", "HRA", "Erfbelasting"]
      : ["Jaar", "WOZ-waarde", "Geschonken", "% overdragen", "Box 3", "Directe lasten"];

    const headerRow = new D.TableRow({
      children: headers.map((t) => cell(t, { header: true, shading: LIGHT_BG })),
    });

    const dataRows = timeline.map((row) => {
      const vals = simple
        ? [
            String(row.year),
            formatCurrency(row.futureHomeValue),
            formatCurrency(row.futureMortgageBalance),
            formatCurrency(row.futureEquity),
            formatCurrency(row.annualMortgageRelief),
            formatCurrency(row.inheritanceTaxAtDeath),
          ]
        : [
            String(row.year),
            formatCurrency(row.futureHomeValue),
            formatCurrency(row.giftedValueAtYear),
            `${(row.transferredSharePercent || 0).toFixed(1)}%`,
            formatCurrency(row.box3PerYear),
            formatCurrency(row.directBurdenAtDeath),
          ];

      return new D.TableRow({
        children: vals.map((t, i) =>
          cell(t, { alignment: i === 0 ? D.AlignmentType.LEFT : D.AlignmentType.RIGHT }),
        ),
      });
    });

    out.push(
      new D.Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: D.WidthType.PERCENTAGE },
      }),
    );
  }

  out.push(spacer());
  return out;
}

export async function generateWordReport(state, model) {
  // Lazy-load heavy dependencies only when the user clicks download.
  [D] = await Promise.all([import("docx")]);
  const { saveAs } = await import("file-saver");

  const { inputs, overview, scenarios } = model;
  const today = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const bestScenarioId = Object.values(scenarios)
    .sort((a, b) => a.directBurden - b.directBurden)[0].id;
  const bestScenario = scenarios[bestScenarioId];
  const bestMeta = scenarioMetaById[bestScenarioId];

  const children = [];

  // Title
  children.push(
    new D.Paragraph({
      spacing: { after: 200 },
      children: [new D.TextRun({ text: "Woningoverdracht aan kinderen", bold: true, size: 36, color: BRAND })],
    }),
    new D.Paragraph({
      spacing: { after: 100 },
      children: [new D.TextRun({ text: "Eerste vergelijking op basis van uw invoer", size: 24, color: MUTED })],
    }),
    new D.Paragraph({
      spacing: { after: 300 },
      children: [label(`Aangemaakt op ${today} via schenkenaankind.nl`)],
    }),
  );

  // Summary
  children.push(
    heading("Samenvatting"),
    new D.Paragraph({
      spacing: { after: 100 },
      children: [
        normal("In deze invoer komen de laagste directe lasten uit bij "),
        bold(bestMeta.title, GREEN),
        normal(": "),
        bold(formatCurrency(bestScenario.directBurden)),
        normal("."),
      ],
    }),
    spacer(),
  );

  // Comparison table
  children.push(heading("Vergelijking drie routes", D.HeadingLevel.HEADING_2));
  const compHeader = new D.TableRow({
    children: ["Route", "Directe lasten", "Erfbelasting", "Directe kosten"].map((t) =>
      cell(t, { header: true, shading: LIGHT_BG }),
    ),
  });
  const compRows = ["doNothing", "oneTimeTransfer", "annualTransfer"].map((id) => {
    const s = scenarios[id];
    const m = scenarioMetaById[id];
    return new D.TableRow({
      children: [
        cell(m.title),
        cell(formatCurrency(s.directBurden), { alignment: D.AlignmentType.RIGHT }),
        cell(formatCurrency(s.inheritanceTaxOnly), { alignment: D.AlignmentType.RIGHT }),
        cell(formatCurrency(s.directCosts), { alignment: D.AlignmentType.RIGHT }),
      ],
    });
  });
  children.push(
    new D.Table({
      rows: [compHeader, ...compRows],
      width: { size: 100, type: D.WidthType.PERCENTAGE },
    }),
    spacer(),
  );

  // Inputs
  children.push(...buildInputSection(inputs, overview));

  // Scenario details
  for (const id of ["doNothing", "oneTimeTransfer", "annualTransfer"]) {
    children.push(...buildScenarioSection(id, scenarios[id]));
  }

  // Disclaimer
  children.push(
    heading("Disclaimer", D.HeadingLevel.HEADING_2),
    new D.Paragraph({
      spacing: { after: 100 },
      children: [
        new D.TextRun({
          text: "Dit document is een indicatieve berekening op basis van vereenvoudigde aannames en vaste 2026-tarieven. De uitkomst vervangt geen advies van een notaris, fiscalist of hypotheekverstrekker. Raadpleeg altijd een professional voordat u beslissingen neemt over woningoverdracht.",
          size: 18,
          color: MUTED,
          italics: true,
        }),
      ],
    }),
  );

  const doc = new D.Document({
    styles: {
      default: {
        document: {
          run: { font: "Segoe UI", size: 20 },
        },
      },
    },
    sections: [{ children }],
  });

  const blob = await D.Packer.toBlob(doc);
  saveAs(blob, `woningoverdracht-vergelijking-${inputs.baseYear}.docx`);
}
