# Huisoverdrachtgids

Framework-based rekentool voor het vergelijken van drie routes bij woningoverdracht aan kinderen:

- niets doen
- in 1 keer schenken
- stapsgewijs eigendom overdragen

## Stack

- Vite
- React
- browser-native CSS met design tokens
- Vercel Functions voor promo-validatie en checkout

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
  features/premium/       premium offer, paywall en unlock-flow
  lib/                    formatters en helpers
  styles/                 tokens en globale stijlregels
api/                      Vercel serverless routes voor promo en betaling
legacy/                   oude vanilla/JSX implementatie
```

## Premium rapport

De app toont eerst gratis een hoofduitkomst. Daarna kan een uitgebreid rapport worden
vrijgeschakeld voor een eenmalig bedrag. In de huidige implementatie:

- valideert `/api/validate-promo` de kortingscode server-side
- maakt `/api/create-payment` een Mollie-checkout aan of geeft direct gratis toegang bij 100% korting
- controleert `/api/payment-status` de terugkerende betaling

De standaard altijd werkende code is via `.env` configureerbaar. In `.env.example` staat nu
`HUIS2026` als voorbeeld en als veilige start voor testwerk. Verander die code voor livegang als
u die niet publiek wilt laten gelden.

## Environment variables

Maak voor lokaal of op Vercel de volgende variabelen aan:

```bash
PUBLIC_APP_ORIGIN=https://schenkenaankind.vercel.app
MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MASTER_PROMO_CODE=HUIS2026
MASTER_PROMO_TYPE=percent
MASTER_PROMO_VALUE=100
```

## Inhoudelijke noot

De tool gebruikt vereenvoudigde aannames. Vooral box 3, notariële kosten en partnerverdeling zijn
alleen bedoeld voor scenariovergelijking en niet voor definitief advies.
