import { formatMinorCurrency } from "../../lib/formatters.js";
import Icon from "../../components/ui/Icon.jsx";

export default function PricingCard({
  title,
  subtitle,
  originalPriceMinor,
  finalPriceMinor,
  bullets,
  discountLabel,
}) {
  const discounted = finalPriceMinor < originalPriceMinor;

  return (
    <div className="pricing-card">
      <div className="pricing-card__eyebrow">Uitgebreid rapport</div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <div className="pricing-card__price-row">
        {discounted ? (
          <span className="pricing-card__price-old">
            {formatMinorCurrency(originalPriceMinor)}
          </span>
        ) : null}
        <strong className="pricing-card__price-current">
          {formatMinorCurrency(finalPriceMinor)}
        </strong>
        <span className="pricing-card__price-note">eenmalig</span>
      </div>
      {discountLabel ? <p className="pricing-card__discount">{discountLabel}</p> : null}
      <ul className="pricing-card__list">
        {bullets.map((bullet) => (
          <li key={bullet}>
            <Icon name="check" size={16} />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
