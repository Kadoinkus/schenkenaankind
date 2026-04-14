import { scenarioGuides } from "../../content/copy.js";

export const scenarioMeta = [
  {
    id: "doNothing",
    tone: "blue",
    icon: "house",
    shortLabel: scenarioGuides.doNothing.label,
    ...scenarioGuides.doNothing,
  },
  {
    id: "stak",
    tone: "amber",
    icon: "balance",
    shortLabel: scenarioGuides.stak.label,
    ...scenarioGuides.stak,
  },
  {
    id: "paperGift",
    tone: "green",
    icon: "family",
    shortLabel: scenarioGuides.paperGift.label,
    ...scenarioGuides.paperGift,
  },
];

export const scenarioMetaById = Object.fromEntries(
  scenarioMeta.map((item) => [item.id, item]),
);
