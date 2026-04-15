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
    id: "oneTimeTransfer",
    tone: "amber",
    icon: "fileText",
    shortLabel: scenarioGuides.oneTimeTransfer.label,
    ...scenarioGuides.oneTimeTransfer,
  },
  {
    id: "annualTransfer",
    tone: "green",
    icon: "users",
    shortLabel: scenarioGuides.annualTransfer.label,
    ...scenarioGuides.annualTransfer,
  },
];

export const scenarioMetaById = Object.fromEntries(
  scenarioMeta.map((item) => [item.id, item]),
);
