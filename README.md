# Huisoverdrachtgids

Framework-based rekentool voor het vergelijken van drie routes bij woningoverdracht aan kinderen:

- niets doen
- STAK-constructie
- papieren schenking

## Stack

- Vite
- React
- browser-native CSS met design tokens

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Structuur

```text
src/
  app/                    app-shell en paginarouter
  components/ui/          herbruikbare componenten en bibliotheekroute
  content/                vaste copy, FAQ en bronnen
  domain/                 fiscale regels en rekenlogica
  features/calculator/    calculator-state en scenario-weergave
  lib/                    formatters en helpers
  styles/                 tokens en globale stijlregels
legacy/                   oude vanilla/JSX implementatie
```

## Inhoudelijke noot

De tool gebruikt vereenvoudigde aannames. Vooral box 3, notariële kosten en partnerverdeling zijn
alleen bedoeld voor scenariovergelijking en niet voor definitief advies.
