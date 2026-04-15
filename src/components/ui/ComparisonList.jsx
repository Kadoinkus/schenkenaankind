import { formatCurrency } from "../../lib/formatters.js";
import Badge from "./Badge.jsx";
import Icon from "./Icon.jsx";

export default function ComparisonList({
  items,
  selectedId,
  bestId,
  bestValue,
  onSelect,
}) {
  return (
    <div className="comparison-list comparison-list--panels">
      {items.map((item) => {
        const difference = item.value - bestValue;
        const isBest = item.id === bestId;
        const isSelected = selectedId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`comparison-card ${isSelected ? "is-selected" : ""}`.trim()}
            aria-pressed={isSelected}
            onClick={() => onSelect(item.id)}
          >
            <div className="comparison-card__top">
              <div className="comparison-card__icon">
                <Icon name={item.icon} size={18} />
              </div>
              <Badge tone="blue">{item.shortLabel}</Badge>
            </div>

            <div className="comparison-card__body">
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </div>

            <div className="comparison-card__value-block">
              <span>Directe lasten</span>
              <strong>{formatCurrency(item.value)}</strong>
            </div>

            <div className="comparison-card__meta">
              {isBest ? (
                <span className="comparison-card__best">Laagste in deze berekening</span>
              ) : (
                <span className="comparison-card__difference">
                  {formatCurrency(difference)} hoger dan de laagste uitkomst
                </span>
              )}
            </div>

            <div className="comparison-card__footer">
              <span>Bekijk details</span>
              <Icon name="chevronRight" size={16} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
