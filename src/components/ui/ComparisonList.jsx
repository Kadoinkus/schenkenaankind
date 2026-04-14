import { formatCurrency } from "../../lib/formatters.js";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";

export default function ComparisonList({
  items,
  selectedId,
  maxValue,
  onSelect,
}) {
  return (
    <div className="comparison-list">
      {items.map((item) => {
        const width = `${Math.max(8, (item.value / maxValue) * 100)}%`;
        return (
          <Button
            key={item.id}
            className="comparison-list__item"
            active={selectedId === item.id}
            onClick={() => onSelect(item.id)}
          >
            <div className="comparison-list__content">
              <div className="comparison-list__heading">
                <span>{item.title}</span>
                <Badge tone={item.tone}>{item.shortLabel}</Badge>
              </div>
              <p className="comparison-list__summary">{item.summary}</p>
              <div className="comparison-list__track" aria-hidden="true">
                <div
                  className={`comparison-list__fill comparison-list__fill--${item.tone}`}
                  style={{ width }}
                >
                  {formatCurrency(item.value)}
                </div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
