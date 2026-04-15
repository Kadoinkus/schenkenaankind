import Callout from "../../components/ui/Callout.jsx";
import Button from "../../components/ui/Button.jsx";
import Icon from "../../components/ui/Icon.jsx";
import PricingCard from "./PricingCard.jsx";
import PromoCodeField from "./PromoCodeField.jsx";

export default function PremiumGate({
  offer,
  originalPriceMinor,
  finalPriceMinor,
  discountLabel,
  promoCode,
  onPromoCodeChange,
  onApplyPromoCode,
  promoFeedback,
  isApplyingPromo,
  onCheckout,
  isProcessingCheckout,
  statusMessage,
  onEditInputs,
}) {
  return (
    <section className="premium-gate premium-modal" role="dialog" aria-modal="true" aria-label="Premium rapport">
      <p className="premium-modal__eyebrow">Berekening klaar</p>

      <Callout
        title={offer.hasEstimatedSaving ? "Goed nieuws" : "Uw berekening staat klaar"}
        tone="success"
        icon="check"
      >
        {offer.hasEstimatedSaving ? (
          <>
            <p>
              U kunt in deze berekening ongeveer <strong>{offer.estimatedSavingText}</strong>{" "}
              besparen ten opzichte van niets doen en de woning pas later laten erven na uw
              overlijden.
            </p>
            <p className="muted-copy">
              Wilt u zien waar dat verschil vandaan komt? Ontgrendel dan hieronder de volledige
              berekening met alle bedragen, toelichtingen en jaarschijven.
            </p>
          </>
        ) : (
          <>
            <p>
              De berekening staat klaar. Ontgrendel hieronder de volledige uitwerking om precies te
              zien hoe de bedragen zijn opgebouwd.
            </p>
          </>
        )}
      </Callout>

      {statusMessage ? (
        <Callout title={statusMessage.title} tone={statusMessage.tone} icon="alert">
          <p>{statusMessage.body}</p>
        </Callout>
      ) : null}

      <div className="premium-gate__layout">
        <PricingCard
          title="Volledig rapport met alle details"
          subtitle="Direct beschikbaar na betaling. U ziet dan de volledige berekening met kostenopbouw, tijdlijn en uitleg per bedrag."
          originalPriceMinor={originalPriceMinor}
          finalPriceMinor={finalPriceMinor}
          discountLabel={discountLabel}
          bullets={offer.summaryBullets}
        />

        <div className="premium-gate__actions">
          <p className="premium-modal__hint">
            Koop direct of vul eerst een kortingscode in.
          </p>

          <PromoCodeField
            code={promoCode}
            onCodeChange={onPromoCodeChange}
            onApply={onApplyPromoCode}
            isApplying={isApplyingPromo}
            feedback={promoFeedback}
          />

          <Button
            tone="primary"
            className="premium-gate__checkout"
            onClick={onCheckout}
            disabled={isProcessingCheckout}
          >
            <Icon name="arrow" size={16} />
            <span>
              {isProcessingCheckout
                ? "Checkout voorbereiden..."
                : `Ontgrendel voor ${offer.finalPriceText}`}
            </span>
          </Button>

          <Button onClick={onEditInputs}>
            <Icon name="chevronLeft" size={16} />
            <span>Gegevens aanpassen</span>
          </Button>

          <p className="premium-gate__legal">
            U ontvangt directe digitale toegang. Dit product is een online rapport op basis van uw
            eigen invoer en geen persoonlijk notarieel of fiscaal maatwerkadvies.
          </p>
        </div>
      </div>
    </section>
  );
}
